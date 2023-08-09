import { createInvite, sendText } from '@/api';
import { auth } from '@/firebase';
import { timestampToDate } from '@/util';
import { Timestamp } from 'firebase/firestore';
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
    const inviteId = await createInvite({
      challengeId,
      senderId: auth.currentUser!.uid,
      senderName,
      expires,
      expiresAt: timestampToDate(expiresAt),
    });

    return `${window.location.origin}/join?inviteId=${inviteId}`;
  }

  async function sendInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    sendText(
      phone,
      `${senderName} invited you to join their competition on iChallenge U! Let's go!! ${await genInviteLink()}}`
    );
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