import Loading from '@/components/Loading';
import LogoutButton from '@/components/LogoutButton';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function NewChallengeForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push({
        pathname: '/login',
        query: { next: '/new' },
      });
    }
    else {
      setLoading(false);
    }
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <LogoutButton />
      <h1>New Challenge Form</h1>
    </div>
  );
}