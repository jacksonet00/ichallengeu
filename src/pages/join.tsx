import { fetchChallenge, fetchInvite, fetchUser, joinChallenge } from '@/api';
import Loading from '@/components/Loading';
import { auth } from '@/firebase';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

type JoiningStatus = 'Waiting...' | 'Searching...' | 'Joining...' | 'Joined!';

export default function Join() {
  const router = useRouter();

  const [status, setStatus] = useState<JoiningStatus | null>('Waiting...');
  const [isJoiningChallenge, setIsJoiningChallenge] = useState(false);

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

    // User is not authenticated
    if (!auth.currentUser) { // todo: show some message letting the user know to sign up for an account before they join
      router.push({          // or maybe do this redirect after they choose join
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
  }, [router, invite, challenge, user]);

  function handleJoinChallenge() {
    setIsJoiningChallenge(true);
    setStatus('Joining...');

    joinChallenge(challenge!, user!).then(() => {
      setStatus('Joined!');
      router.push({
        pathname: '/leaderboard',
        query: {
          challengeId: challenge!.id,
        },
      });
    });
  }

  if (isLoadingInvite || !invite || isLoadingChallenge || isLoadingUser || isJoiningChallenge) {
    return <Loading status={status} />;
  }

  return (
    <div className='flex flex-col items-center'>
      <h1>{invite!.senderName} has invited you to join {challenge!.name}!</h1>
      <h1>Would you like to accept?</h1>
      <button onClick={handleJoinChallenge}>Join</button>
    </div>
  );
}