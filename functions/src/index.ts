/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp();
const db = getFirestore();

export const helloWorld = onRequest(
  { timeoutSeconds: 15, cors: true, maxInstances: 10 },
  (request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
  }
);

export const updateParticipants = onDocumentUpdated("users/{userId}", async (event) => {
  if (!event.data) {
    return;
  }

  const before = event.data.before.data()!;
  const after = event.data.after.data()!;

  const diff: { name?: string, profilePhotoUrl?: string; } = {};
  let update = false;

  if (before.name !== after.name) {
    diff.name = after.name;
    update = true;
  }

  if (before.profilePhotoUrl !== after.profilePhotoUrl) {
    diff.profilePhotoUrl = after.profilePhotoUrl;
    update = true;
  }

  if (!update) {
    return;
  }

  const participantRecords = await db
    .collection("participants")
    .where("userId", "==", event.params.userId)
    .get();

  if (participantRecords.empty) {
    return;
  }

  const batch = db.batch();
  participantRecords.forEach((doc) => {
    batch.set(doc.ref, diff, { merge: true });
  });
  batch.commit();
});
