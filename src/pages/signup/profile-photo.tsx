import { fetchUser, updateUser } from '@/api';
import Loading from '@/components/Loading';
import PhotoUploader from '@/components/PhotoUploader';
import { auth } from '@/firebase';
import { genKey } from '@/util';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

export default function ProfilePhoto() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  const { mutate: _updateUser } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries('me');

      router.push({
        pathname: router.query.next as string || '/',
      });
    }
  });

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(true);
        router.push({
          pathname: '/login',
          query: {
            next: router.query.next || '/',
          },
        });
      }
      else {
        const userDoc = await fetchUser(user.uid);
        if (userDoc?.profilePhotoUrl) {
          router.push({
            pathname: router.query.next as string || '/',
          });
          return;
        }
        setLoading(false);
      }
    });
  }, [router]);

  async function onSubmitPhoto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await updateProfile(auth.currentUser!, {
      photoURL: photoUrl,
    });

    _updateUser({
      uid: auth.currentUser!.uid,
      user: {
        profilePhotoUrl: photoUrl,
      }
    });
  }

  if (loading || !auth.currentUser) {
    return <Loading />;
  }

  return (
    <div>
      <h1>Signup</h1>
      <form className="flex flex-col" onSubmit={onSubmitPhoto}>
        <PhotoUploader
          directory={`profile-photos/${auth.currentUser.uid}`}
          filename={genKey()}
          onUpload={(url) => setPhotoUrl(url)}
        />
        <button type="submit">next</button>
      </form>
    </div>
  );
}