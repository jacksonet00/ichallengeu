import { DocumentReference, addDoc, collection, doc, getDoc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore';
import { Challenge, ChallengeDocument, ICUser, Invite, Participant, ParticipantDocument } from './data';
import { auth, db } from './firebase';
import { genKey } from './util';
import { updateProfile } from 'firebase/auth';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

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
  if (user.name && auth.currentUser!.displayName !== user.name) {
    await updateProfile(auth.currentUser!, {
      displayName: user.name,
    });
  }

  if (user.profilePhotoUrl && auth.currentUser!.photoURL !== user.profilePhotoUrl) {
    await updateProfile(auth.currentUser!, {
      photoURL: user.profilePhotoUrl,
    });
  }

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
export async function createChallenge(challenge: ChallengeDocument): Promise<string> {
  const ref = await addDoc(collection(db, 'challenges'), challenge);
  return ref.id;
}

export async function joinChallenge(challenge: Challenge, user: ICUser): Promise<void> {
  const batch = writeBatch(db);

  batch.set(doc(db, 'challenges', challenge.id), {
    users: [...challenge.users, user.id]
  }, { merge: true });

  batch.set(doc(db, 'participants', genKey()), {
    challengeId: challenge.id,
    userId: user.id,
    name: user.name,
    daysCompleted: [],
  });

  batch.set(doc(db, 'users', user.id), {
    challenges: [...user.challenges, challenge.id],
  }, { merge: true });

  await batch.commit();
}

export async function fetchParticipants(challengeId: string): Promise<Participant[]> {
  const snapshot = await getDocs(
    query(collection(db, 'participants'),
      where('challengeId', '==', challengeId)));
  return snapshot.docs.map(doc => new Participant(doc));
}

export interface ParticipantMutationQuery {
  userId: string;
  challengeId: string;
  participant: Partial<Participant>;
}

/** Merges provided fields with existing fields. */
export async function updateParticipant({ userId, challengeId, participant }: ParticipantMutationQuery): Promise<void> {
  const snapshot = await getDocs(query(collection(db, 'participants'), where('userId', '==', userId), where('challengeId', '==', challengeId)));

  if (snapshot.empty || snapshot.docs.length > 1) {
    throw new Error('Participant not found');
  }

  const ref = snapshot.docs[0].ref;
  setDoc(ref, participant, { merge: true });
}

export async function createParticipant(participant: ParticipantDocument): Promise<string> {
  const ref = await addDoc(collection(db, 'participants'), participant);
  return ref.id;
}

export async function fetchInvite(inviteId: string): Promise<Invite | null> {
  const snapshot = await getDoc(doc(db, 'invites', inviteId));
  if (!snapshot.exists()) {
    return null;
  }
  return new Invite(snapshot);
}

export async function createInvite(invite: PartialBy<Invite, 'id' | 'expires' | 'expiresAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'invites'), invite);
  return ref.id;
}

export async function sendText(to: string, body: string): Promise<DocumentReference> {
  // log this in a database so you cannot send more than 3 texts per day
  return addDoc(collection(db, 'messages'), {
    to,
    body,
  });
}
