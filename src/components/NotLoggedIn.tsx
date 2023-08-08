import Link from 'next/link';

export default function NotLoggedIn() {
  return (
    <div>
      <h1 className="text-4xl font-bold">You must be logged in to view this content</h1>
      <Link href="/login">Login</Link>
    </div>
  );
}