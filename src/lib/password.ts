import "server-only";
import { randomBytes } from "crypto";

/** 12-char random password — only ever seen by the client, in an email. */
export function generatePassword() {
  return randomBytes(9).toString("base64url");
}
