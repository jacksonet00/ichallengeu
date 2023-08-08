import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';

export default function LogoutButton() {
  return (
    <>
      {auth.currentUser && <button onClick={() => signOut(auth)} className="absolute top-8 left-10 bg-sky-600 rounded-md pt-1.5 pb-1.5 pl-2.5 pr-2.5 md:pt-2 md:pb-2 md:pl-3 md:pr-3 text-white font-bold text-xs md:text-sm">logout</button>}
    </>
  );
}