import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "AES-256-GCM" as const;
const AUTHENTICATION_TAG_BYTES = 16;
const NONCE_BYTES = 12;

export interface DataEncryptionKey {
  keyBytes: Uint8Array;
  keyRef: string;
  keyVersion: string;
}

export interface DataEnvelopeBinding {
  organizationId: string;
  environment: string;
  entity: string;
  field: string;
  recordId: string;
}

export interface DataEnvelopeV1 {
  version: 1;
  algorithm: typeof ALGORITHM;
  keyRef: string;
  keyVersion: string;
  nonce: string;
  ciphertext: string;
  authenticationTag: string;
}

export class DataEnvelopeAuthenticationError extends Error {
  constructor() {
    super("Data envelope authentication failed");
    this.name = "DataEnvelopeAuthenticationError";
  }
}

function encryptionKeyBytes(key: DataEncryptionKey): Buffer {
  if (key.keyBytes.byteLength !== 32) {
    throw new Error("AES-256-GCM requires a 32-byte key");
  }
  if (!key.keyRef || !key.keyVersion) {
    throw new Error("Encryption key identity is required");
  }
  return Buffer.from(key.keyBytes);
}

function decodeBase64Url(value: string): Buffer {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) throw new Error("Invalid base64url");
  const decoded = Buffer.from(value, "base64url");
  if (decoded.toString("base64url") !== value) {
    throw new Error("Invalid base64url");
  }
  return decoded;
}

function canonicalAdditionalData(
  binding: DataEnvelopeBinding,
  key: Pick<DataEncryptionKey, "keyRef" | "keyVersion">,
): Buffer {
  const values = [
    binding.organizationId,
    binding.environment,
    binding.entity,
    binding.field,
    binding.recordId,
  ];
  if (values.some((value) => typeof value !== "string" || value.length === 0)) {
    throw new Error("Complete data-envelope binding is required");
  }

  return Buffer.from(
    JSON.stringify({
      purpose: "sourcera.data-envelope",
      version: 1,
      algorithm: ALGORITHM,
      keyRef: key.keyRef,
      keyVersion: key.keyVersion,
      organizationId: binding.organizationId,
      environment: binding.environment,
      entity: binding.entity,
      field: binding.field,
      recordId: binding.recordId,
    }),
    "utf8",
  );
}

export function encryptDataEnvelope(
  plaintext: Uint8Array,
  key: DataEncryptionKey,
  binding: DataEnvelopeBinding,
): DataEnvelopeV1 {
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv("aes-256-gcm", encryptionKeyBytes(key), nonce, {
    authTagLength: AUTHENTICATION_TAG_BYTES,
  });
  cipher.setAAD(canonicalAdditionalData(binding, key));
  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
  ]);

  return {
    version: 1,
    algorithm: ALGORITHM,
    keyRef: key.keyRef,
    keyVersion: key.keyVersion,
    nonce: nonce.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    authenticationTag: cipher.getAuthTag().toString("base64url"),
  };
}

export function decryptDataEnvelope(
  envelope: DataEnvelopeV1,
  key: DataEncryptionKey,
  binding: DataEnvelopeBinding,
): Uint8Array {
  try {
    if (
      envelope.version !== 1 ||
      envelope.algorithm !== ALGORITHM ||
      envelope.keyRef !== key.keyRef ||
      envelope.keyVersion !== key.keyVersion
    ) {
      throw new Error("Envelope metadata mismatch");
    }

    const nonce = decodeBase64Url(envelope.nonce);
    const authenticationTag = decodeBase64Url(envelope.authenticationTag);
    if (
      nonce.byteLength !== NONCE_BYTES ||
      authenticationTag.byteLength !== AUTHENTICATION_TAG_BYTES
    ) {
      throw new Error("Envelope size mismatch");
    }

    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKeyBytes(key),
      nonce,
      { authTagLength: AUTHENTICATION_TAG_BYTES },
    );
    decipher.setAAD(canonicalAdditionalData(binding, key));
    decipher.setAuthTag(authenticationTag);
    return Uint8Array.from(
      Buffer.concat([
        decipher.update(decodeBase64Url(envelope.ciphertext)),
        decipher.final(),
      ]),
    );
  } catch {
    throw new DataEnvelopeAuthenticationError();
  }
}
