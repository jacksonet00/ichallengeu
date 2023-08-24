import { createInvite } from '@/api';
import { Challenge, Participant } from '@/data';
import { auth } from '@/firebase';
import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface ShareSheetProps {
  sender: Participant;
  challenge: Challenge;
}

export default function ShareSheet({
  challenge,
}: ShareSheetProps) {

  const [showInviteLink, setShowInviteLink] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  async function copyInviteLink(e: React.MouseEvent<HTMLDivElement | HTMLInputElement>) {
    navigator.clipboard.writeText(inviteLink);
  }

  async function handleClickShare(e: React.MouseEvent<HTMLButtonElement>) {
    const inviteId = await createInvite({
      challengeId: challenge!.id,
      senderId: auth.currentUser!.uid,
      senderName: auth.currentUser!.displayName!,
    });
    setInviteLink(`${window.location.origin}/join?inviteId=${inviteId}`);
    setShowInviteLink(true);
  }

  return (
    <div
      className="bg-slate-600 rounded-md w-60 h-16 flex items-center justify-center"
    >
      {!showInviteLink && <button
        className="bg-slate-700 hover:bg-slate-800 text-white font-semibold py-1 px-3 rounded-md text-md"
        onClick={handleClickShare}
      >
        invite friends
      </button>}
      {showInviteLink && (
        <div
          className="flex items-center justify-center w-48 hover:cursor-pointer"
          onClick={copyInviteLink}
        >
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="bg-slate-700 text-xs text-white font-semibold py-1 px-3 rounded-md text-md mr-2 hover:cursor-pointer hover:bg-sky-300"
            onClick={copyInviteLink}
          />
          <ContentCopyIcon />
        </div>
      )}
    </div>
  );
}
