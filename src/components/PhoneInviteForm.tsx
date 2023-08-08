import { sendText } from '@/api';
import { auth, db } from '@/firebase';
import { Timestamp, addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';

interface PhoneInviteFormProps {
  challengeId: string;
  senderName: string;
  expires?: boolean;
  expiresAt?: Timestamp | null;
}

export default function PhoneInviteForm({
  challengeId,
  senderName,
  expires = false,
  expiresAt = null,
}: PhoneInviteFormProps) {
  const [phone, setPhone] = useState('');

  async function genInviteLink() {
    const invite = await addDoc(collection(db, 'invites'), {
      challengeId,
      senderId: auth.currentUser!.uid,
      expires,
      expiresAt,
    });

    return `${window.location.origin}/join?inviteId=${invite.id}`;
  }

  async function sendInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    sendText({
      to: phone,
      body: `${senderName} invited you to join their competition on iChallenge U! Let's go!! ${await genInviteLink()}}`
    });
  }

  return (
    <form onSubmit={sendInvite}>
      <input
        type="text"
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button type="submit">Send Invite</button>
    </form>
  );
}