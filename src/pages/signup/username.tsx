import { fetchUser, updateUser } from '@/api';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import { DEFAULT_PROFILE_PHOTO_URL } from '@/constants';
import { auth, getAnalyticsSafely } from '@/firebase';
import { push, pushNext } from '@/routing';
import { logEvent } from 'firebase/analytics';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

export default function Username() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [username, setUsername] = useState('');

  const { mutate: _updateUser } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries('me');

      push(router, '/signup/profile-photo');
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(true);

        push(router, '/login');
      }
      else {
        const userDoc = await fetchUser(user.uid);
        if (userDoc) {
          pushNext(router, '/');
          return;
        }
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [router]);

  function onSubmitUsername(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setLoading(true);

    if (!username.match(/^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/)) {
      const analytics = getAnalyticsSafely();
      if (analytics) {
        logEvent(analytics!, 'exception', {
          description: 'invalid username',
          fatal: false,
        });
      }
      setErrorMessage('Invalid username.');
      setLoading(false);
      return;
    }

    setErrorMessage(null);

    if (!auth.currentUser) {
      push(router, '/login');
      return;
    }

    _updateUser({
      uid: auth.currentUser!.uid,
      user: {
        name: username,
        phone: auth.currentUser!.phoneNumber!,
        profilePhotoUrl: DEFAULT_PROFILE_PHOTO_URL,
        challenges: [],
      }
    });
    const analytics = getAnalyticsSafely();
    if (analytics) {
      logEvent(analytics!, 'add_username');
    }
  }

  if (loading) {
    return <Loading />;
  }

  const analytics = getAnalyticsSafely();
  if (analytics) {
    logEvent(analytics!, 'page_view', {
      page_title: 'create username',
      page_path: '/signup/username',
    });
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1
        className="text-2xl font-semibold mb-6"
      >
        hi there! 👋🏼
      </h1>
      <form
        onSubmit={onSubmitUsername}
      >
        <div className="flex flex-col items-center justify-center">
          <input
            type="text"
            name="username"
            placeholder="what's your name?"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="p-2 border border-slate-200 rounded w-60"
          />
          <button
            type="submit"
            className="w-60 mt-4 mb-2 bg-sky-200 hover:bg-sky-400 text-slate-900 font-bold py-2 px-4 rounded inline-flex items-center text-center justify-center"
          >
            next
          </button>
          {errorMessage && <ErrorMessage message={errorMessage} />}
        </div>
      </form>
    </div>
  );
}