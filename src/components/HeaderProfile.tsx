import { fetchUser } from '@/api';
import { auth } from '@/firebase';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';

export default function HeaderProfile() {

  const { data: user } = useQuery('me', () => fetchUser(auth.currentUser!.uid), {
    enabled: !!auth.currentUser,
  });

  const router = useRouter();

  function handleClick() {
    router.push({
      pathname: '/profile',
    });
  }

  if (!user || !auth.currentUser) return <></>;

  return (
    <div className="absolute top-6 left-4">
      <div className="bg-slate-700 rounded-full h-10 w-10" onClick={handleClick}>
        <picture>
          <source srcSet={user!.profilePhotoUrl!} type="image/webp" />
          <img
            className="rounded-full h-10 w-10 hover:opacity-90 hover:cursor-pointer"
            src={user!.profilePhotoUrl!}
            alt={`profile photo for ${user!.name}`}
          />
        </picture>
      </div>
    </div>
  );
}
