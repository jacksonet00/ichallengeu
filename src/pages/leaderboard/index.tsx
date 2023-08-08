import IconExplainer from '@/components/IconExplainer';
import LeaderboardEntry from '@/components/LeaderboardEntry';
import Loading from '@/components/Loading';
import LogoutButton from '@/components/LogoutButton';
import TrophyCase from '@/components/TrophyCase';
import { Challenge, LeaderboardData, Participant } from '@/data';
import { db, getAnalyticsSafely } from '@/firebase';
import { genKey } from '@/util';
import { logEvent } from 'firebase/analytics';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';

async function fetchChallenge(challengeId: string): Promise<Challenge> {
  const snapshot = await getDoc(doc(db, 'challenges', challengeId));
  return new Challenge(snapshot);
}

async function fetchParticipants(challengeId: string): Promise<Participant[]> {
  const snapshot = await getDocs(
    query(collection(db, 'participants'),
      where('challengeId', '==', challengeId)));
  return snapshot.docs.map(doc => new Participant(doc));
}

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
  const { challengeId } = router.query as { challengeId: string; };

  const {
    data: challenge,
    isLoading: isLoadingChallenge,
  } = useQuery(['challenges', challengeId], () => fetchChallenge(challengeId));

  const {
    data: participants,
    isLoading: isLoadingParticipants,
  } = useQuery(['participants', challengeId], () => fetchParticipants(challengeId!));

  const analytics = getAnalyticsSafely();

  if (isLoadingChallenge || isLoadingParticipants) {
    return <Loading />;
  }

  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title: `${challenge!.name} leaderboard`,
      page_path: `/leaderboard/${challenge!.id}`
    });
  }

  const leaderboard = participants!
    .map(participant => new LeaderboardData(participant, challenge!.currentDay()))
    .sort(LeaderboardData.compare);

  const winners = leaderboard.slice(0, 3).map(leaderboardData => leaderboardData.serialize());

  return (
    <div className="flex items-center justify-center flex-col">
      <LogoutButton />
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