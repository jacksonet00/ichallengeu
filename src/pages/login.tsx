import { fetchUser } from '@/api';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import Loading from '@/components/Loading';

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

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'PHONE' | 'CODE'>('PHONE');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [code, setCode] = useState('');

  useEffect(mountRecaptchaVerifier, []);

  async function validatePhone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    setLoading(true);

    // todo regex check phone number

    await window.recaptchaVerifier.verify();
    // todo: handle bad phone number error
    const _confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
    setConfirmationResult(_confirmationResult);

    setStep('CODE');
    setErrorMessage(null);
    setLoading(false);
  }

  async function validateCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    // if (code.match(/^[0-9]{6}$/)) {
    //   setErrorMessage("Code must be 6 digits.");
    //   setLoading(false);
    //   return;
    // }

    const userCredential = await confirmationResult!.confirm(code);

    if (!userCredential) {
      setErrorMessage("Incorrect code!");
      setLoading(false);
      return;
    }

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

  function handleBack() {
    setLoading(true);
    setCode('');
    setConfirmationResult(null);
    setStep('PHONE');
    setErrorMessage(null);
    setLoading(false);
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1>Login</h1>
      {step === 'PHONE' && <form onSubmit={validatePhone}>
        <input
          type="tel"
          name="phone"
          placeholder="Phone number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <button type="submit">next</button>
        {errorMessage && <h1>{errorMessage}</h1>}
      </form>}
      {confirmationResult && step === 'CODE' && (
        <form onSubmit={validateCode}>
          <input
            type="text"
            name="code"
            placeholder="Verification code"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button onClick={handleBack}>back</button>
          <button type="submit">verify</button>
          {errorMessage && <h1>{errorMessage}</h1>}
        </form>
      )}
    </div>
  );
}