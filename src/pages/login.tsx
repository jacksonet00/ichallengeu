import { fetchUser } from '@/api';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth } from '../firebase';

function mountRecaptchaVerifier() {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      },
    );
  }
};

export default function Login() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [code, setCode] = useState('');

  useEffect(mountRecaptchaVerifier, []);

  async function validatePhone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await window.recaptchaVerifier.verify();

    const _confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
    setConfirmationResult(_confirmationResult);
  }

  async function validateCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const userCredential = await confirmationResult!.confirm(code);
    const user = await fetchUser(userCredential.user.uid);

    const next = router.query.next as string || '/';

    if (!user) {
      router.push({
        pathname: '/signup',
        query: {
          next
        }
      });
      return;
    }

    router.push(next);
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={validatePhone}>
        <input
          type="tel"
          name="phone"
          placeholder="Phone number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <button type="submit">next</button>
      </form>
      {confirmationResult && (
        <form onSubmit={validateCode}>
          <input
            type="text"
            name="code"
            placeholder="Verification code"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button type="submit">verify</button>
        </form>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
}