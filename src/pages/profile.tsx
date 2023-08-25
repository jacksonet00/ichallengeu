import { fetchUser, updateUser } from '@/api';
import ErrorMessage from '@/components/ErrorMessage';
import PhotoUploader from '@/components/PhotoUploader';
import { auth, getAnalyticsSafely } from '@/firebase';
import { genKey } from '@/util';
import { logEvent } from 'firebase/analytics';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export default function Profile() {
  const [updatedUsername, setUpdatedUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  useQuery('me', () => fetchUser(auth.currentUser!.uid), {
    enabled: !!auth.currentUser,
    onSuccess: (user) => {
      setUpdatedUsername(user!.name);
    }
  });

  const {
    mutate: _updateUser,
  } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries('me');
    }
  });

  async function handleSignOut() {
    await auth.signOut();
    queryClient.invalidateQueries('me');
    queryClient.invalidateQueries('challenges');
    queryClient.invalidateQueries('participants');
    queryClient.invalidateQueries('leaderboard');

    router.push({
      pathname: '/login',
    });
  }

  async function handleUpdateProfilePhoto(profilePhotoUrl: string) {
    _updateUser({
      uid: auth.currentUser!.uid,
      user: {
        profilePhotoUrl,
      },
    });

    const analytics = getAnalyticsSafely();
    if (analytics) {
      logEvent(analytics!, 'update_user', {
        property_updated: 'profile_photo',
      });
    }
  }

  async function handleUpdateUsername(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!updatedUsername.match(/^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/)) {
      setErrorMessage('Invalid username.\nUsername must be between 3 and 20 characters long.\nUsername can only contain letters, numbers, underscores, and periods.');
      return;
    }

    setErrorMessage(null);

    _updateUser({
      uid: auth.currentUser!.uid,
      user: {
        name: updatedUsername,
      },
    });

    const analytics = getAnalyticsSafely();
    if (analytics) {
      logEvent(analytics!, 'update_user', {
        property_updated: 'name',
      });
    }
  }

  if (!auth.currentUser) return <></>;

  const analytics = getAnalyticsSafely();
  if (analytics) {
    logEvent(analytics!, 'page_view', {
      page_title: 'profile',
      page_path: '/profile',
      user_id: auth.currentUser.uid,
      user_name: auth.currentUser.displayName,
    });
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-8">
        <PhotoUploader
          directory={`profile-photos/${auth.currentUser.uid}`}
          filename={genKey()}
          onUpload={handleUpdateProfilePhoto}
          defaultUrl={auth.currentUser.photoURL}
        />
      </div>
      <form
        onSubmit={handleUpdateUsername}
        className="flex flex-col items-center justify-center"
      >
        <input
          type="text"
          value={updatedUsername}
          onChange={(e) => setUpdatedUsername(e.target.value)}
          className="p-2 border border-slate-200 rounded w-60 mb-2"
        />
        <button
          type="submit"
          className="w-60 mt-4 mb-2 bg-sky-200 hover:bg-sky-400 text-slate-900 font-bold py-2 px-4 rounded inline-flex items-center text-center justify-center disabled:bg-slate-200"
          disabled={!updatedUsername || updatedUsername === auth.currentUser.displayName}
        >
          update name
        </button>
        {errorMessage && <ErrorMessage message={errorMessage} />}
      </form>
      <button
        onClick={handleSignOut}
        className="w-60 mt-4 mb-2 bg-red-200 hover:bg-red-400 text-slate-900 font-bold py-2 px-4 rounded inline-flex items-center text-center justify-center disabled:bg-slate-200"
      >
        sign out
      </button>
    </div>
  );
}