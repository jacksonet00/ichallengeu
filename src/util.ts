import { v4 } from "uuid";

export function daysBetween(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function genKey() {
  return v4();
}
