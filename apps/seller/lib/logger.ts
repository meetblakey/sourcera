import pino from "pino";

export const logger = pino({
  base: undefined,
  redact: {
    paths: ["*.authorization", "*.cookie", "*.password", "*.secret", "*.token"],
    remove: true,
  },
});
