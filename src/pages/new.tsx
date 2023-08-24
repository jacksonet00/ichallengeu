import { createChallenge, createParticipant, fetchUser } from '@/api';
import Loading from '@/components/Loading';
import LogoutButton from '@/components/LogoutButton';
import { auth, getAnalyticsSafely } from '@/firebase';
import { dateToTimestamp, stringToTimestamp, timestampToDate } from '@/util';
import { logEvent } from 'firebase/analytics';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

export default function NewChallengeForm() {
  const router = useRouter();

  const {
    data: user,
    isLoading: isLoadingUser,
  } = useQuery('me', () => fetchUser(auth.currentUser!.uid), {
    enabled: !!auth.currentUser,
  });

  const {
    mutate: _createChallenge,
  } = useMutation({
    mutationFn: createChallenge,
    onSuccess: async (challengeId) => {
      await createParticipant({
        challengeId,
        daysCompleted: [],
        name: user!.name,
        userId: auth.currentUser!.uid,
        profilePhotoUrl: user!.profilePhotoUrl,
      });

      router.push({
        pathname: '/leaderboard',
        query: {
          challengeId,
        },
      });
    }
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [challengeName, setChallengeName] = useState('');
  const [dayCount, setDayCount] = useState(30);
  // const [startDate, setStartDate] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(true);
        router.push({
          pathname: '/login',
          query: { next: '/new' },
        });
      }
      else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [router]);

  async function onSubmitChallengeForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // const _startDate = new Date(startDate);
    // _startDate.setHours(0, 0, 0, 0);

    if (dayCount < 3) {
      setErrorMessage('Challenge must be at least 3 days long.');
      return;
    }
    else {
      setErrorMessage(null);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    _createChallenge({
      ownerId: auth.currentUser!.uid,
      name: challengeName,
      dayCount,
      startDate: dateToTimestamp(today)!,
      users: [auth.currentUser!.uid],
    });
  }

  if (!auth.currentUser || loading || isLoadingUser) {
    return <Loading />;
  }

  if (auth.currentUser && !user) {
    router.push({
      pathname: '/signup/username',
      query: {
        next: '/new',
      }
    });
    return <Loading />;
  }

  const analytics = getAnalyticsSafely();
  if (analytics) {
    logEvent(analytics!, 'page_view', {
      page_title: 'create challenge',
      page_path: '/new',
    });
  }

  return (
    <div>
      <LogoutButton />
      <form
        className="flex flex-col items-center justify-center"
        onSubmit={onSubmitChallengeForm}
      >
        <h1 className="text-2xl font-semibold mb-4">{user!.name}, it starts today!</h1>
        <h1 className="text-lg font-bold mb-2">challenge name</h1>
        <input
          type="text"
          placeholder={`${user!.name}'s fitness challenge`}
          value={challengeName}
          onChange={(e) => setChallengeName(e.target.value)}
          className="mb-4 w-48 text-center p-2 border border-slate-200 rounded"
        />
        <h1 className="text-lg font-bold mb-2">{dayCount} day challenge</h1>
        <input
          type="range"
          placeholder="dayCount"
          value={dayCount}
          min={3}
          max={365}
          onChange={(e) => setDayCount(parseInt(e.target.value))}
          className="text-center mb-8 w-72"
        />
        <button
          type="submit"
          className="bg-sky-200 hover:bg-sky-400 text-slate-900 font-bold py-2 px-4 rounded inline-flex items-center text-center justify-center w-48"
        >begin</button>
        {errorMessage && <h1>{errorMessage}</h1>}
      </form>
    </div>
  );
}