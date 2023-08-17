import { fetchChallenges, fetchMyChallenges } from '@/api';
import Loading from '@/components/Loading';
import LogoutButton from '@/components/LogoutButton';
import { logEvent } from "firebase/analytics";
import Link from "next/link";
import { useQuery } from 'react-query';
import { Challenge } from "../data";
import { auth, getAnalyticsSafely } from '../firebase';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

function renderChallengeList(challenges: Challenge[]) {
  return challenges.map((challenge) => (
    <div
      className="bg-slate-200 hover:bg-slate-400 text-zinc-900 font-bold py-2 px-4 rounded inline-flex items-center mb-4"
      key={challenge.id}
    >
      <Link href={{
        pathname: '/leaderboard',
        query: { challengeId: challenge.id },
      }}>{challenge.name}</Link>
    </div>
  ));
}

export default function Home() {
  const { data: challenges, isLoading, refetch } = useQuery('challenges', () => fetchMyChallenges(auth.currentUser?.uid || ''), {
    enabled: !!auth.currentUser,
    initialData: [],
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        refetch();
      }
    });
    return unsubscribe();
  }, [refetch]);

  const analytics = getAnalyticsSafely();
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title: 'home',
      page_path: '/',
    });
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-start">
      <LogoutButton />
      <div
        className="bg-sky-200 hover:bg-sky-400 text-slate-900 font-bold py-2 px-4 rounded inline-flex items-center mb-8"
      >
        <Link href={{
          pathname: '/new',
        }}>Start a New Challenge</Link>
      </div>
      {challenges && challenges?.length > 0 && <h1 className="text-2xl font-bold mb-8">My Challenges</h1>}
      {renderChallengeList(challenges!)}
    </div>
  );
}
