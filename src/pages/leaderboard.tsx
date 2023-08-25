import { fetchChallenge, fetchLeaderboardData, fetchParticipant, updateParticipant } from '@/api';
import CompletionTracker from '@/components/CompletionTracker';
import IconDescription from '@/components/IconDescription';
import LeaderboardEntry from '@/components/LeaderboardEntry';
import Loading from '@/components/Loading';
import HeaderProfile from '@/components/HeaderProfile';
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
    onSuccess: (participant) => {
      if (!participant) {
        router.push({
          pathname: '/',
        });
      }

      queryClient.invalidateQueries(['leaderboard', challengeId]);
      setLoading(false);
    },
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
      page_path: `/leaderboard/${challenge!.id}`,
      is_completed: challenge!.isCompleted(),
      challenge_day: challenge!.currentDay(),
    });
  }

  return (
    <div className="flex items-center justify-center flex-col">
      <HeaderProfile />
      <h1 className="font-bold mb-8">{challenge!.name}: Day #{`${challenge!.currentDay()} of ${challenge!.dayCount}`}{`${challenge!.isCompleted() ? ' ✅' : ''}`}</h1>
      <div className='mb-8'>
        {challenge!.users.includes(auth.currentUser!.uid) && (
          <CompletionTracker
            completed={participant.daysCompleted.includes(challenge!.currentDay() - 1)}
            toggleCompletion={toggleCompletion}
            challenge={challenge}
          />
        )}
      </div>
      {challenge!.ownerId === auth.currentUser!.uid && <div className="mb-8">
        <ShareSheet sender={participant} challenge={challenge} />
      </div>}
      <div className="w-80 flex flex-col justify-start items-center mb-8">
        {challenge!.isCompleted() ? <TrophyCase winners={leaderboard!.slice(0, 3)} /> : <IconDescription />}
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