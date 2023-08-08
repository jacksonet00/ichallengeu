import { fetchChallenge, fetchUser } from '@/api';
import Loading from '@/components/Loading';
import { Invite } from '@/data';
import { auth, db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from 'react-query';

async function fetchInvite(inviteId: string): Promise<Invite | null> {
  const snapshot = await getDoc(doc(db, 'invites', inviteId));
  if (!snapshot.exists()) {
    return null;
  }
  return new Invite(snapshot);
}

export default function Join() {
  const router = useRouter();

  const {
    data: user,
    isLoading: isLoadingUser,
  } = useQuery('me', () => fetchUser(auth.currentUser!.uid));

  const {
    data: invite,
    isLoading: isLoadingInvite,
  } = useQuery(['invite', router.query.inviteId], () => fetchInvite(router.query.inviteId! as string));

  const {
    data: challenge,
    isLoading: isLoadingChallenge,
  } = useQuery(['challenges', invite?.challengeId], () => fetchChallenge(invite!.challengeId), {
    enabled: !!invite,
  });

  async function joinChallenge() {
    await setDoc(doc(db, 'challenges', challenge!.id), {
      users: [...challenge!.users, auth.currentUser!.uid],
    }, { merge: true });
    await setDoc(doc(db, 'participants', auth.currentUser!.uid), {
      challengeId: challenge!.id,
      daysCompleted: [],
      name: user!.name,
      userId: auth.currentUser!.uid,
    });
    await setDoc(doc(db, 'users', auth.currentUser!.uid), {
      challenges: [...user!.challenges, challenge!.id],
    }, { merge: true });
  }

  useEffect(() => {
    if (!router || !invite || !challenge) {
      return;
    }

    if (!auth.currentUser) {
      router.push({
        pathname: '/login',
      });
    }

    if (challenge.users.includes(auth.currentUser!.uid)) {
      router.push({
        pathname: '/leaderboard',
        query: {
          challengeId: challenge.id,
        },
      });
    }
    else {
      if (!user) {
        return;
      }

      joinChallenge().then(() => {
        router.push({
          pathname: '/leaderboard',
          query: {
            challengeId: challenge.id,
          },
        });
      });
    }

  }, [router, invite, challenge, user]);

  if (isLoadingInvite || isLoadingChallenge || isLoadingUser) {
    return <Loading />;
  }

  return (
    <div>
      <h1>Join</h1>
      <pre>{JSON.stringify(invite, null, 2)}</pre>
      <pre>{JSON.stringify(challenge, null, 2)}</pre>
    </div>
  );
}