import { fetchUser, updateUser } from '@/api';
import Loading from '@/components/Loading';
import PhotoUploader from '@/components/PhotoUploader';
import { auth, getAnalyticsSafely } from '@/firebase';
import { push, pushNext } from '@/routing';
import { genKey } from '@/util';
import { logEvent } from 'firebase/analytics';
import { onAuthStateChanged } from 'firebase/auth';
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
    onSuccess: async () => {
      queryClient.invalidateQueries('me');

      const analytics = getAnalyticsSafely();
      if (analytics) {
        logEvent(analytics, 'sign_up', {
          method: 'phone',
        });
      }

      pushNext(router, '/');
      return;
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(true);

        push(router, '/login');
        return;
      }
      else {
        const userDoc = await fetchUser(user.uid);
        if (!userDoc && !loading) {
          push(router, "/signup/username");
        }
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [router, loading]);

  async function onSubmitPhoto(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    e.preventDefault();

    if (!photoUrl) {
      return;
    }

    _updateUser({
      uid: auth.currentUser!.uid,
      user: {
        profilePhotoUrl: photoUrl,
      }
    });

    setLoading(false);

    const analytics = getAnalyticsSafely();
    if (analytics) {
      logEvent(analytics!, 'upload_photo');
    }
  }

  if (loading || !auth.currentUser) {
    return <Loading />;
  }

  const analytics = getAnalyticsSafely();
  if (analytics) {
    logEvent(analytics!, 'page_view', {
      page_title: 'create profile photo',
      page_path: '/signup/profile-photo',
    });
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1
        className="text-2xl font-semibold mb-6"
      >
        {photoUrl ? 'hello, beautiful' : 'say cheese 📸'}
      </h1>
      <form className="flex flex-col items-center justify-center" onSubmit={onSubmitPhoto}>
        <PhotoUploader
          directory={`profile-photos/${auth.currentUser.uid}`}
          filename={genKey()}
          onUpload={(url) => setPhotoUrl(url)}
        />
        <button
          type="submit"
          className="w-60 mb-2 bg-sky-200 hover:bg-sky-400 text-slate-900 font-bold py-2 px-4 rounded inline-flex items-center text-center justify-center disabled:bg-slate-200"
          disabled={!photoUrl}
        >
          next
        </button>
      </form>
    </div>
  );
}