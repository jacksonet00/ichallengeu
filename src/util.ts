import { Timestamp } from 'firebase/firestore';
import { v4 } from "uuid";

export function genKey() {
  return v4();
}

// date functions

export function daysBetween(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function stringToTimestamp(date: string | null): Timestamp | null {
  if (!date) {
    return null;
  }
  return Timestamp.fromDate(new Date(date));
}

export function dateToTimestamp(date: Date | null): Timestamp | null {
  if (!date) {
    return null;
  }
  return Timestamp.fromDate(date);
}

export function timestampToDate(timestamp: Timestamp | null): Date | null {
  if (!timestamp) {
    return null;
  }
  return new Date(timestamp.seconds * 1000);
}