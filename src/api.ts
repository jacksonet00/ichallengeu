import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { Challenge, ICUser, Participant } from './data';
import { db } from './firebase';

export async function fetchUser(uid: string): Promise<ICUser | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) {
    return null;
  }
  return new ICUser(snapshot);;
}

export interface ICUserMutationQuery {
  uid: string;
  user: Partial<ICUser>;
}

/** Merges provided fields with existing fields. */
export async function updateUser({ uid, user }: ICUserMutationQuery): Promise<void> {
  setDoc(doc(db, 'users', uid), user, { merge: true });
}

export async function fetchChallenge(challengeId: string): Promise<Challenge | null> {
  const snapshot = await getDoc(doc(db, 'challenges', challengeId));
  if (!snapshot.exists()) {
    return null;
  }
  return new Challenge(snapshot);
}

export async function fetchChallenges(): Promise<Challenge[]> {
  const snapshot = await getDocs(query(collection(db, 'challenges')));
  return snapshot.docs.map(doc => new Challenge(doc));
}

/** Returns document id. */
export async function createChallenge(challenge: Partial<Challenge>): Promise<string> {
  const ref = await addDoc(collection(db, 'challenges'), challenge);
  return ref.id;
}

export async function fetchParticipants(challengeId: string): Promise<Participant[]> {
  const snapshot = await getDocs(
    query(collection(db, 'participants'),
      where('challengeId', '==', challengeId)));
  return snapshot.docs.map(doc => new Participant(doc));
}
