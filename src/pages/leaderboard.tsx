import { createInvite, fetchChallenge, fetchParticipants, updateParticipant } from '@/api';
import CompletionToggle from '@/components/CompletionToggle';
import IconExplainer from '@/components/IconExplainer';
import LeaderboardEntry from '@/components/LeaderboardEntry';
import Loading from '@/components/Loading';
import LogoutButton from '@/components/LogoutButton';
import PhoneInviteForm from '@/components/PhoneInviteForm';
import TrophyCase from '@/components/TrophyCase';
import { LeaderboardData } from '@/data';
import { auth, getAnalyticsSafely } from '@/firebase';
import { genKey } from '@/util';
import { logEvent } from 'firebase/analytics';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

function renderLeaderboard(leaderboard: LeaderboardData[]) {
  return leaderboard.map((leaderboardData, index) => (
    <LeaderboardEntry
      key={genKey()}
      crown={index === 0}
      leaderboardData={leaderboardData}
    />
  ));
}

export default function Leaderboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { challengeId } = router.query as { challengeId: string; };

  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    data: challenge,
    isLoading: isLoadingChallenge,
  } = useQuery(['challenges', challengeId], () => fetchChallenge(challengeId));

  const {
    data: participants,
    isLoading: isLoadingParticipants,
  } = useQuery(['participants', challengeId], () => fetchParticipants(challengeId!));

  const {
    mutate: _updateParticipant,
  } = useMutation({
    mutationFn: updateParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries(['participants', challengeId]);
    }
  })

  const analytics = getAnalyticsSafely();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user && challenge && participants) {
        setIsMember(challenge!.users.includes(user.uid));
        setIsOwner(challenge!.ownerId === user.uid);

        const participant = participants!.findLast(participant => participant.userId === user.uid && participant.challengeId === challengeId)!;

        if (!participant) {
          setIsCompleted(false);
        }
        else {
          setIsCompleted(participant.daysCompleted.includes(challenge!.currentDay()));
        }
      }
    });
  }, [challenge, challengeId, participants]);

  if (isLoadingChallenge || isLoadingParticipants) {
    return <Loading />;
  }

  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title: `${challenge!.name} leaderboard`,
      page_path: `/leaderboard/${challenge!.id}`
    });
  }

  async function toggleCompletion() {
    const participant = participants!.findLast(participant => participant.userId === auth.currentUser!.uid && participant.challengeId === challengeId)!;

    if (participant.daysCompleted.includes(challenge!.currentDay())) {
      _updateParticipant({
        challengeId: challenge!.id,
        userId: auth.currentUser!.uid,
        participant: {
          daysCompleted: participant.daysCompleted.filter(day => day !== challenge!.currentDay()),
        },
      });
    }
    else {
      _updateParticipant({
        challengeId: challenge!.id,
        userId: auth.currentUser!.uid,
        participant: {
          daysCompleted: [...participant.daysCompleted, challenge!.currentDay()],
        },
      });
    }
  }

  async function copyInviteLink(e: React.MouseEvent<HTMLButtonElement>) {
    const inviteId = await createInvite({
      challengeId: challenge!.id,
      senderId: auth.currentUser!.uid,
      senderName: auth.currentUser!.displayName!,
    });

    navigator.clipboard.writeText(`${window.location.origin}/join?inviteId=${inviteId}`);
  }

  const leaderboard = participants!
    .map(participant => new LeaderboardData(participant, challenge!))
    .sort(LeaderboardData.compare);

  const winners = leaderboard.slice(0, 3);

  return (
    <div className="flex items-center justify-center flex-col">
      <LogoutButton />
      {isOwner && <button onClick={copyInviteLink}>Copy Invite Link</button>}
      {isOwner && <PhoneInviteForm
        challengeId={challenge!.id}
        senderName={auth.currentUser!.displayName!}
      />}
      {isMember && <CompletionToggle
        completed={isCompleted}
        onToggle={toggleCompletion}
      />}
      <h1 className="font-bold mb-8">{challenge!.name}: Day #{challenge!.currentDay()}{`${challenge!.isCompleted() ? ' ✅' : ''}`}</h1>
      <div className="w-80 flex flex-col justify-start items-center mb-10">
        {challenge!.isCompleted() ? <TrophyCase winners={winners} /> : <IconExplainer />}
      </div>
      <div className="w-80 flex flex-col justify-start mb-10">
        {renderLeaderboard(leaderboard)}
      </div>
    </div>
  );
}