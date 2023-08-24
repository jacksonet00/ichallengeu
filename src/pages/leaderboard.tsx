import { createInvite, fetchChallenge, fetchLeaderboardData, fetchParticipant, updateParticipant } from '@/api';
import CompletionToggle from '@/components/CompletionToggle';
import IconExplainer from '@/components/IconExplainer';
import LeaderboardEntry from '@/components/LeaderboardEntry';
import Loading from '@/components/Loading';
import LogoutButton from '@/components/LogoutButton';
import PhoneInviteForm from '@/components/PhoneInviteForm';
import ShareSheet from '@/components/ShareSheet';
import TrophyCase from '@/components/TrophyCase';
import { auth, getAnalyticsSafely } from '@/firebase';
import { logEvent } from 'firebase/analytics';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export default function Leaderboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { challengeId } = router.query as { challengeId: string; };

  const [loading, setLoading] = useState(false);

  const {
    data: challenge,
    isLoading: isLoadingChallenge,
  } = useQuery(['challenges', challengeId], () => fetchChallenge(challengeId));

  const {
    data: participant,
    isLoading: isLoadingParticipant,
    refetch: refetchParticipant,
  } = useQuery(['participants', challengeId], () => fetchParticipant(challengeId, auth.currentUser?.uid || ''), {
    enabled: !!challengeId && !!auth.currentUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['leaderboard', challengeId]);
      setLoading(false);
    }
  });

  const {
    data: leaderboard,
    isLoading: isLoadingLeaderboard,
  } = useQuery(['leaderboard', challengeId], () => fetchLeaderboardData(challengeId!), {
    enabled: !!challengeId,
  });

  const {
    mutate: _updateParticipant,
  } = useMutation({
    mutationFn: updateParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries(['leaderboard', challengeId]);
      queryClient.invalidateQueries(['participants', challengeId]);
    },
  })

  async function toggleCompletion() {
    setLoading(true);
    if (participant!.daysCompleted.includes(challenge!.currentDay() - 1)) {
      _updateParticipant({
        challengeId: challenge!.id,
        userId: auth.currentUser!.uid,
        participant: {
          daysCompleted: participant!.daysCompleted.filter(day => day !== challenge!.currentDay() - 1),
        },
      });
    }
    else {
      _updateParticipant({
        challengeId: challenge!.id,
        userId: auth.currentUser!.uid,
        participant: {
          daysCompleted: [...participant!.daysCompleted, challenge!.currentDay() - 1],
        },
      });
    }
  }



  if (!participant && !isLoadingParticipant) {
    refetchParticipant();
  }

  if (loading || isLoadingLeaderboard || isLoadingChallenge || isLoadingParticipant || !challenge || !leaderboard || !participant) {
    return <Loading />;
  }

  const analytics = getAnalyticsSafely();
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title: `${challenge!.name} leaderboard`,
      page_path: `/leaderboard/${challenge!.id}`
    });
  }

  return (
    <div className="flex items-center justify-center flex-col">
      <LogoutButton />
      <h1 className="font-bold mb-8">{challenge!.name}: Day #{`${challenge!.currentDay()} of ${challenge!.dayCount}`}{`${challenge!.isCompleted() ? ' ✅' : ''}`}</h1>
      <div className="mb-8">
        {challenge!.ownerId === auth.currentUser!.uid && <ShareSheet sender={participant} challenge={challenge} />}
      </div>
      <div className="w-80 flex flex-col justify-start items-center mb-8">
        {challenge!.isCompleted() ? <TrophyCase winners={leaderboard!.slice(0, 3)} /> : <IconExplainer />}
      </div>
      <div className="w-80 flex flex-col justify-start mb-10">
        {leaderboard.map((leaderboardData, index) => (
          <LeaderboardEntry
            key={leaderboardData.participant.id}
            crown={index === 0}
            leaderboardData={leaderboardData}
          />
        ))}
      </div>
    </div>
  );
}