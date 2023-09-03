import { fetchChallenge, fetchInvite, fetchUser, joinChallenge } from '@/api';
import HeaderProfile from '@/components/HeaderProfile';
import Loading from '@/components/Loading';
import { auth, getAnalyticsSafely } from '@/firebase';
import { getParams, push } from '@/routing';
import { logEvent } from 'firebase/analytics';
import { onAuthStateChanged } from 'firebase/auth';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

type JoiningStatus = 'Waiting...' | 'Searching...' | 'Joining...' | 'Joined!' | 'Loading...';

export default function Join() {
  const router = useRouter();

  const [status, setStatus] = useState<JoiningStatus | null>('Waiting...');
  const [isJoiningChallenge, setIsJoiningChallenge] = useState(false);

  const { inviteId } = getParams(router);

  const {
    data: invite,
    isLoading: isLoadingInvite,
  } = useQuery(['invite', inviteId], () => fetchInvite(inviteId! as string), {
    enabled: !!inviteId,
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('Loading...');
        push(router, '/login', {
          next: '/join'
        });
      }
    });

    if (!router || !invite || !challenge) {
      setStatus('Waiting...');
      return unsubscribe;
    }

    console.log('reached join with ', router.query);

    setStatus('Searching...');

    // User has already joined the challenge
    if (challenge.users.includes(auth.currentUser!.uid)) {
      setStatus('Joined!');
      push(router, '/leaderboard', {
        challengeId: challenge.id,
      });
      return unsubscribe;
    }

    if (!user) {
      setStatus('Waiting...');
      return unsubscribe;
    }
    return unsubscribe;
  }, [router, invite, challenge, user]);

  async function handleJoinChallenge() {
    setIsJoiningChallenge(true);
    setStatus('Joining...');

    await joinChallenge(challenge!, user!, invite!);

    setStatus('Joined!');

    const analytics = getAnalyticsSafely();
    if (analytics) {
      logEvent(analytics, 'join_challenge', {
        challenge_id: challenge!.id,
        sender_id: invite!.senderId,
        joiner_id: auth.currentUser!.uid,
      });
    }

    push(router, '/leaderboard', {
      challengeId: challenge!.id,
    });
  }

  if (!auth.currentUser || isLoadingInvite || !invite ||
    isLoadingChallenge || isLoadingUser || isJoiningChallenge || status === 'Loading...') {
    return <Loading status={status} />;
  }

  const analytics = getAnalyticsSafely();
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title: 'challenge invite',
      page_path: '/join',
      challenge_id: challenge!.id,
      sender_id: invite!.senderId,
      joiner_id: auth.currentUser!.uid,
    });
  }

  return (
    <>
      <Head>
        <title key="title">{invite.senderName}&aposs invite to {challenge!.name} | iChallenge U</title>
        <meta key="keywords" name="keywords" content="challenge, friends competition app, fitness, learning, motivation," />
        <meta key="description" name="description" content={`${invite!.senderName} invited you to join ${challenge!.name}! Will you accept?`} />
        <meta key="og-title" property="og:title" content={`${invite.senderName}&aposs ${challenge!.name} | iChallenge U`} />
        <meta key="og-description" property="og:description" content={`${invite!.senderName} invited you to join ${challenge!.name}! Will you accept?`} />
        <meta property="og:image" content="https://ichallengeu.app/ichallengeu.png" />
        <meta key="og-url" property="og:url" content={`https://ichallengeu.app/join?inviteId=${invite.id}`} />
        <meta key="twitter-title" name="twitter:title" content={`${invite.senderName}&aposs ${challenge!.name} | iChallenge U`} />
        <meta key="twitter-description" name="twitter:description" content={`${invite!.senderName} invited you to join ${challenge!.name}! Will you accept?`} />
        <meta name="twitter:card" content="summary_large_image" />
        {/* <meta name="twitter:site" content="@ichallengeu_app" /> */}
        <meta name="twitter:image" content={`https://ichallengeu.app/ichallengeu.png`} />
        <link rel="canonical" href={`https://ichallengeu.app/join?inviteId=${invite.id}`} />
      </Head>
      <div className='flex flex-col items-center'>
        <HeaderProfile />
        <h1 className="font-bold text-xl mb-2">{invite!.senderName} invited you to join</h1>
        <h1 className="font-bold text-xl mb-12">{challenge!.name}!</h1>
        <h1 className="font-semibold text-lg mb-4">accept the challenge?</h1>
        <button
          onClick={handleJoinChallenge}
          className="bg-sky-100 hover:bg-sky-200 px-3 py-2 rounded-md w-48 font-bold text-md"
        >{"i'm in"}</button>
      </div>
    </>
  );
}