import assert from "node:assert/strict";
import test from "node:test";

import {
  DataEnvelopeAuthenticationError,
  decryptDataEnvelope,
  encryptDataEnvelope,
  type DataEncryptionKey,
  type DataEnvelopeBinding,
  type DataEnvelopeV1,
} from "../../packages/server-security/src/envelope";

const key: DataEncryptionKey = {
  keyBytes: Uint8Array.from({ length: 32 }, (_, index) => index + 1),
  keyRef: "opaque-key-ref",
  keyVersion: "opaque-key-version",
};

const binding: DataEnvelopeBinding = {
  organizationId: "org_01",
  environment: "production",
  entity: "crm_sync_connection",
  field: "oauth_refresh_token",
  recordId: "connection_01",
};

function alterBase64Url(value: string): string {
  return `${value[0] === "A" ? "B" : "A"}${value.slice(1)}`;
}

test("a versioned AES-256-GCM envelope authenticates ciphertext and opaque key identity", () => {
  const plaintext = new TextEncoder().encode("customer-secret");
  const envelope = encryptDataEnvelope(plaintext, key, binding);

  assert.equal(envelope.version, 1);
  assert.equal(envelope.algorithm, "AES-256-GCM");
  assert.equal(envelope.keyRef, "opaque-key-ref");
  assert.equal(envelope.keyVersion, "opaque-key-version");
  assert.deepEqual(decryptDataEnvelope(envelope, key, binding), plaintext);

  const tamperedEnvelopes: DataEnvelopeV1[] = [
    { ...envelope, ciphertext: alterBase64Url(envelope.ciphertext) },
    {
      ...envelope,
      authenticationTag: alterBase64Url(envelope.authenticationTag),
    },
    { ...envelope, nonce: alterBase64Url(envelope.nonce) },
    { ...envelope, keyRef: "different-key-ref" },
    { ...envelope, keyVersion: "different-version" },
  ];
  for (const tamperedEnvelope of tamperedEnvelopes) {
    assert.throws(
      () => decryptDataEnvelope(tamperedEnvelope, key, binding),
      DataEnvelopeAuthenticationError,
    );
  }
  assert.throws(
    () =>
      decryptDataEnvelope(
        envelope,
        {
          ...key,
          keyBytes: Uint8Array.from({ length: 32 }, (_, index) => 255 - index),
        },
        binding,
    ),
    DataEnvelopeAuthenticationError,
  );
});

test("each encryption uses a fresh 96-bit nonce", () => {
  const plaintext = new TextEncoder().encode("same-secret");
  const first = encryptDataEnvelope(plaintext, key, binding);
  const second = encryptDataEnvelope(plaintext, key, binding);

  assert.equal(Buffer.from(first.nonce, "base64url").byteLength, 12);
  assert.equal(Buffer.from(second.nonce, "base64url").byteLength, 12);
  assert.notEqual(first.nonce, second.nonce);
  assert.notEqual(first.ciphertext, second.ciphertext);
});

test("canonical additional data binds organization, environment, entity, field, and record", () => {
  const envelope = encryptDataEnvelope(
    new TextEncoder().encode("bound-secret"),
    key,
    binding,
  );
  const wrongBindings: DataEnvelopeBinding[] = [
    { ...binding, organizationId: "org_02" },
    { ...binding, environment: "preview" },
    { ...binding, entity: "different_entity" },
    { ...binding, field: "different_field" },
    { ...binding, recordId: "record_02" },
  ];

  for (const wrongBinding of wrongBindings) {
    assert.throws(
      () => decryptDataEnvelope(envelope, key, wrongBinding),
      DataEnvelopeAuthenticationError,
    );
  }
});

test("decrypts the fixed AES-256-GCM vector for the canonical envelope AAD", () => {
  const envelope: DataEnvelopeV1 = {
    version: 1,
    algorithm: "AES-256-GCM",
    keyRef: "opaque-key-ref",
    keyVersion: "opaque-key-version",
    nonce: "AAECAwQFBgcICQoL",
    ciphertext: "Gl5u4KbwF25sX90zSeuS7lvyyQ",
    authenticationTag: "x_9suhJWfwWgGlnpwrJ-jw",
  };

  assert.equal(
    new TextDecoder().decode(decryptDataEnvelope(envelope, key, binding)),
    "known-vector-secret",
  );
});

test("arbitrary binary bytes round-trip without text conversion", () => {
  const plaintext = Uint8Array.from({ length: 256 }, (_, index) => index);
  const envelope = encryptDataEnvelope(plaintext, key, binding);

  assert.deepEqual(decryptDataEnvelope(envelope, key, binding), plaintext);
});

test("a short AES-256 key is rejected for encryption and decryption", () => {
  const shortKey: DataEncryptionKey = {
    ...key,
    keyBytes: new Uint8Array(31),
  };
  const plaintext = Uint8Array.of(0, 255, 128);
  const envelope = encryptDataEnvelope(plaintext, key, binding);

  assert.throws(
    () => encryptDataEnvelope(plaintext, shortKey, binding),
    /32-byte key/,
  );
  assert.throws(
    () => decryptDataEnvelope(envelope, shortKey, binding),
    DataEnvelopeAuthenticationError,
  );
});

test("unsupported envelope versions and algorithms fail closed", () => {
  const envelope = encryptDataEnvelope(Uint8Array.of(1, 2, 3), key, binding);
  const unsupportedEnvelopes: DataEnvelopeV1[] = [
    { ...envelope, version: 2 } as unknown as DataEnvelopeV1,
    {
      ...envelope,
      algorithm: "AES-256-CBC",
    } as unknown as DataEnvelopeV1,
  ];

  for (const unsupportedEnvelope of unsupportedEnvelopes) {
    assert.throws(
      () => decryptDataEnvelope(unsupportedEnvelope, key, binding),
      DataEnvelopeAuthenticationError,
    );
  }
});

test("malformed base64url envelope fields fail closed", () => {
  const envelope = encryptDataEnvelope(Uint8Array.of(4, 5, 6), key, binding);
  const malformedEnvelopes: DataEnvelopeV1[] = [
    { ...envelope, nonce: `${envelope.nonce}=` },
    { ...envelope, ciphertext: "not+base64url" },
    { ...envelope, authenticationTag: "A" },
  ];

  for (const malformedEnvelope of malformedEnvelopes) {
    assert.throws(
      () => decryptDataEnvelope(malformedEnvelope, key, binding),
      DataEnvelopeAuthenticationError,
    );
  }
});

test("a failed decryption leaves the original envelope recoverable", () => {
  const plaintext = Uint8Array.of(0, 1, 127, 128, 254, 255);
  const envelope = encryptDataEnvelope(plaintext, key, binding);
  const unchangedEnvelope = { ...envelope };

  assert.throws(
    () =>
      decryptDataEnvelope(
        envelope,
        key,
        { ...binding, recordId: "wrong-record" },
      ),
    DataEnvelopeAuthenticationError,
  );
  assert.deepEqual(envelope, unchangedEnvelope);
  assert.deepEqual(decryptDataEnvelope(envelope, key, binding), plaintext);
});
