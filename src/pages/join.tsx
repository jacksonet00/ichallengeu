import { fetchChallenge, fetchInvite, fetchUser, joinChallenge } from '@/api';
import Loading from '@/components/Loading';
import { Invite } from '@/data';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

type JoiningStatus = 'Waiting...' | 'Searching...' | 'Joining...' | 'Joined!';

export default function Join() {
  const router = useRouter();

  const [status, setStatus] = useState<JoiningStatus | null>('Waiting...');

  const {
    data: invite,
    isLoading: isLoadingInvite,
  } = useQuery(['invite', router.query.inviteId], () => fetchInvite(router.query.inviteId! as string), {
    enabled: !!router.query.inviteId,
  });

  const {
    data: user,
    isLoading: isLoadingUser,
  } = useQuery('me', () => fetchUser(auth.currentUser?.uid || ''), {
    enabled: !!auth.currentUser,
  });

  const {
    data: challenge,
    isLoading: isLoadingChallenge,
  } = useQuery(['challenges', invite?.challengeId], () => fetchChallenge(invite!.challengeId), {
    enabled: !!invite,
  });

  useEffect(() => {
    if (!router || !invite || !challenge) {
      setStatus('Waiting...');
      return;
    }

    setStatus('Searching...');

    if (!auth.currentUser) {
      router.push({
        pathname: '/login',
        query: {
          next: `/join?inviteId=${invite.id}`,
        },
      });
      return;
    }

    // User has already joined the challenge
    if (challenge.users.includes(auth.currentUser!.uid)) {
      setStatus('Joined!');
      router.push({
        pathname: '/leaderboard',
        query: {
          challengeId: challenge.id,
        },
      });
      return;
    }

    if (!user) {
      setStatus('Waiting...');
      return;
    }

    setStatus('Joining...');

    joinChallenge(challenge, user).then(() => {
      setStatus('Joined!');
      router.push({
        pathname: '/leaderboard',
        query: {
          challengeId: challenge.id,
        },
      });
    });
  }, [router, invite, challenge, user]);

  if (isLoadingInvite || isLoadingChallenge || isLoadingUser) {
    return (
      <div className='flex flex-col items-center'>
        <Loading />
        <h1 className="mt-4">{status}</h1>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center'>
      <Loading />
      <h1 className="mt-4">{status}</h1>
    </div>
  );
}