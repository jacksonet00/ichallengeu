import Loading from '@/components/Loading';
import { ICUser } from '@/data';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

interface ICUserMutationQuery {
  uid: string;
  user: Partial<ICUser>;
}

async function updateUser({ uid, user }: ICUserMutationQuery) {
  setDoc(doc(db, 'users', uid), user, { merge: true });
}

export default function ProfilePhoto() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState('');

  const { mutate: _updateUser } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries('me');

      if (router.query.next) {
        router.push(router.query.next as string);
        return;
      }

      router.push('/');
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

  async function onSubmitPhoto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    _updateUser({
      uid: auth.currentUser!.uid,
      user: {
        profilePhotoUrl: photo,
      }
    });
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={onSubmitPhoto}>
        <input
          type="text"
          name="photo"
          placeholder="photo"
          value={photo}
          onChange={e => setPhoto(e.target.value)}
        />
        <button type="submit">next</button>
      </form>
    </div>
  );
}