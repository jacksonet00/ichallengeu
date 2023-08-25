import { createInvite } from '@/api';
import { Challenge, Participant } from '@/data';
import { auth, getAnalyticsSafely } from '@/firebase';
import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Loading from './Loading';
import { logEvent } from 'firebase/analytics';

interface ShareSheetProps {
  sender: Participant;
  challenge: Challenge;
}

const light = '#bae6fd';
const medium = '#e0f2fe';

export default function ShareSheet({
  challenge,
}: ShareSheetProps) {

  const [inviteLink, setInviteLink] = useState('');
  const [hoverCopy, setHoverCopy] = useState(false);
  const [step, setStep] = useState<"DEFAULT" | "LOADING" | "INVITE_LINK" | "COPIED_MESSAGE">("DEFAULT");

  async function copyInviteLink(_: React.MouseEvent<HTMLDivElement | HTMLInputElement>) {
    await navigator.clipboard.writeText(inviteLink);
    setStep("COPIED_MESSAGE");
    const analytics = getAnalyticsSafely();
    if (analytics) {
      logEvent(analytics, 'click', {
        type: 'copy_invite_link',
        challengeId: challenge!.id,
        challengeDay: challenge!.currentDay(),
        challengeName: challenge!.name,
        senderName: auth.currentUser!.displayName!,
        senderId: auth.currentUser!.uid,
      });
    }
    setTimeout(() => setStep("INVITE_LINK"), 2000);
  }

  async function handleClickShare(e: React.MouseEvent<HTMLButtonElement>) {
    setStep("LOADING");
    const inviteId = await createInvite({
      challengeId: challenge!.id,
      senderId: auth.currentUser!.uid,
      senderName: auth.currentUser!.displayName!,
    });
    setInviteLink(`${window.location.origin}/join?inviteId=${inviteId}`);
    setStep("INVITE_LINK");
    const analytics = getAnalyticsSafely();
    if (analytics) {
      logEvent(analytics, 'click', {
        type: 'generate_invite_link',
        challengeId: challenge!.id,
        challengeDay: challenge!.currentDay(),
        challengeName: challenge!.name,
        senderName: auth.currentUser!.displayName!,
        senderId: auth.currentUser!.uid,
      });
    }
  }

  return (
    <div
      className="bg-sky-50 rounded-md w-60 h-16 flex items-center justify-center"
    >
      {step === "DEFAULT" && <button
        className="bg-sky-100 hover:bg-sky-200 text-slate-800 font-semibold py-1 px-3 rounded-md text-md"
        onClick={handleClickShare}
      >
        invite friends
      </button>}
      {step === "LOADING" && <Loading />}
      {step === "INVITE_LINK" && (
        <div
          className="flex items-center justify-center w-48 hover:cursor-pointer"
          onClick={copyInviteLink}
        >
          <input
            type="text"
            value={inviteLink}
            readOnly
            style={{ backgroundColor: !hoverCopy ? medium : light }}
            className="text-xs text-slate-800 font-semibold py-1 px-3 rounded-md text-md mr-2 hover:cursor-pointer"
            onClick={copyInviteLink}
            onMouseEnter={() => setHoverCopy(true)}
            onMouseLeave={() => setHoverCopy(false)}
          />
          <div onMouseEnter={() => setHoverCopy(true)} onMouseLeave={() => setHoverCopy(false)}>
            <ContentCopyIcon style={{ color: !hoverCopy ? medium : light }} />
          </div>
        </div>
      )}
      {step === "COPIED_MESSAGE" && (
        <div
          className="bg-sky-10 text-slate-800 font-semibold py-1 px-3 rounded-md text-sm"
        >
          invite link copied.
        </div>
      )}
    </div>
  );
}
