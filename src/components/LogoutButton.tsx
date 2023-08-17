import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';

export default function LogoutButton() {
  const queryClient = useQueryClient();
  const router = useRouter();

  function login() {
    router.push({
      pathname: '/login',
      query: {
        next: router.pathname,
      }
    });
  }

  function logout() {
    signOut(auth);
    queryClient.invalidateQueries('me');
    queryClient.invalidateQueries('challenges');
    queryClient.invalidateQueries('participants');
    queryClient.invalidateQueries('leaderboard');
    router.push({
      pathname: '/login',
    });
  }

  return (
    <button onClick={auth.currentUser ? logout : login} className="absolute top-8 left-10 bg-sky-600 rounded-md pt-1.5 pb-1.5 pl-2.5 pr-2.5 md:pt-2 md:pb-2 md:pl-3 md:pr-3 text-white font-bold text-xs md:text-sm">{auth.currentUser ? 'logout' : 'login'}</button>
  );
}