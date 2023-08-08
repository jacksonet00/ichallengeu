import { fetchUser } from '@/api';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth } from '../../firebase';

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
    window.recaptchaVerifier.verify();

    const appVerifier = await window.recaptchaVerifier;
    const _confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);

    setConfirmationResult(_confirmationResult);
  }

  async function validateCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    confirmationResult?.confirm(code).then(async (userCredential) => {

      const user = await fetchUser(userCredential.user.uid);

      if (!user) {
        router.push({
          pathname: '/signup',
          query: {
            next: router.query.next || '/',
          }
        });
        return;
      }

      if (router.query.next) {
        router.push(router.query.next as string);
        return;
      }

      router.push('/');
    });
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