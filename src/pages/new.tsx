import { createChallenge, fetchUser } from '@/api';
import Loading from '@/components/Loading';
import LogoutButton from '@/components/LogoutButton';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

export default function NewChallengeForm() {
  const router = useRouter();

  const {
    // data: user,
    isLoading: isLoadingUser,
  } = useQuery('me', () => fetchUser(auth.currentUser!.uid));

  const {
    mutate: _createChallenge,
  } = useMutation({
    mutationFn: createChallenge,
    onSuccess: (challengeId) => {
      router.push({
        pathname: '/leaderboard',
        query: {
          challengeId,
        },
      });
    }
  });

  const [loading, setLoading] = useState(true);
  const [challengeName, setChallengeName] = useState('');
  const [dayCount, setDayCount] = useState(0);
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
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
  }, [router]);

  async function onSubmitChallengeForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    _createChallenge({
      ownerId: auth.currentUser!.uid,
      name: challengeName,
      dayCount,
      startDate: new Date(startDate),
      users: [auth.currentUser!.uid],
    });
  }

  if (!auth.currentUser || loading || isLoadingUser) {
    return <Loading />;
  }

  return (
    <div>
      <LogoutButton />
      <form
        className="flex flex-col"
        onSubmit={onSubmitChallengeForm}
      >
        <input
          type="text"
          placeholder="Challenge name"
          value={challengeName}
          onChange={(e) => setChallengeName(e.target.value)}
        />
        <input
          type="number"
          placeholder="dayCount"
          value={dayCount}
          onChange={(e) => setDayCount(parseInt(e.target.value))}
        />
        <input
          type="date"
          placeholder="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <button
          type="submit"
        >
          Create
        </button>
      </form>
    </div>
  );
}