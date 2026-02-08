import { readFileSync } from "fs";

export function loadKey(path?: string): string {
  if (!path) return "";
  return readFileSync(path, "utf8");
}
