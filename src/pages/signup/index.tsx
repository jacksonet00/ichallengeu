import { updateUser } from '@/api';
import Loading from '@/components/Loading';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

export default function SignUp() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  const { mutate: _updateUser } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries('me');
      router.push({
        pathname: '/signup/profile-photo',
        query: {
          next: router.query.next || '/',
        }
      });
    }
  });

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(true);
        router.push({
          pathname: '/login',
        });
      }
      else {
        setLoading(false);
      }
    });
  }, [router]);

  async function onSubmitUsername(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    _updateUser({
      uid: auth.currentUser!.uid,
      user: {
        name: username,
        phone: auth.currentUser!.phoneNumber!,
        profilePhotoUrl: null,
      }
    });
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={onSubmitUsername}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <button type="submit">next</button>
      </form>
    </div>
  );
}