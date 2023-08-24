import { fetchUser } from '@/api';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth, getAnalyticsSafely } from '../firebase';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import { logEvent } from 'firebase/analytics';

function mountRecaptchaVerifier(): void {
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

function formatPhone(phone: string): { error: { message: string; } | null, phone: string | null; } {
  if (!phone.match(/^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/) &&
    !phone.match(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/) &&
    !phone.match(/^[0-9]{10}$/) &&
    !phone.match(/^[0-9]{3} [0-9]{3} [0-9]{4}$/) &&
    !phone.match(/^[0-9]{3}\.[0-9]{3}\.[0-9]{4}$/)) {
    return {
      phone: null,
      error: {
        message: 'Invalid phone number.'
      }
    };
  }

  return {
    phone: phone.replace(/\D/g, ''),
    error: null
  };
}

export default function Login() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'PHONE' | 'CODE'>('PHONE');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [countryCode, setCountryCode] = useState('+1');
  const [rawPhoneString, setRawPhoneString] = useState('');

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [code, setCode] = useState('');

  useEffect(mountRecaptchaVerifier, []);

  async function validatePhone(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);

    const { phone, error } = formatPhone(rawPhoneString);
    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }
    const formattedPhone = `${countryCode}${phone}`;

    try {
      await window.recaptchaVerifier.verify();
    }
    catch (e) {
      console.error(e);
    }

    try {
      const _confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(_confirmationResult);

      setStep('CODE');
      setErrorMessage(null);
      setLoading(false);
    }
    catch (e) {
      console.error(e);
      setErrorMessage('Invalid phone number.');
      setLoading(false);
      return;
    }
  }

  async function validateCode(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);

    if (!code.match(/^[0-9]{6}$/)) {
      setErrorMessage("Invalid code.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await confirmationResult!.confirm(code);

      if (!userCredential) {
        setErrorMessage("Incorrect code!");
        setLoading(false);
        return;
      }

      const user = await fetchUser(userCredential.user.uid);

      if (!user) {
        router.push({
          pathname: '/signup/username',
          query: {
            next: router.query.next as string || '/',
          }
        });
        return;
      }
    }
    catch (e) {
      setErrorMessage('Incorrect code!');
      setLoading(false);
      return;
    }

    const analytics = getAnalyticsSafely();
    if (analytics) {
      logEvent(analytics, 'login', {
        method: 'phone',
      });
    }

    router.push(router.query.next as string || '/');
  }

  function handleBack(): void {
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

  const analytics = getAnalyticsSafely();
  if (analytics) {
    logEvent(analytics!, 'page_view', {
      page_title: 'login',
      page_path: '/login',
    });
  }

  return (
    <div>
      {step === 'PHONE' &&
        <form
          onSubmit={validatePhone}
        >
          <div className='flex flex-col justify-center items-center'>
            <div className='flex flex-row justify-center items-center mb-4'>
              <select
                className='mr-4'
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
              >
                <option label="🇺🇸">+1</option>
                <option label="🇨🇦">+61</option>
                {/* todo: bring more countries online */}
              </select>
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={rawPhoneString}
                onChange={e => setRawPhoneString(e.target.value)}

                className="p-2 border border-slate-200 rounded w-full"
              />
            </div>
            <button
              type="submit"
              className="w-full mb-2 bg-sky-200 hover:bg-sky-400 text-slate-900 font-bold py-2 px-4 rounded inline-flex items-center text-center justify-center"
            >
              next
            </button>
            {errorMessage && <ErrorMessage message={errorMessage} />}
          </div>
      </form>}
      {confirmationResult && step === 'CODE' && (
        <form onSubmit={validateCode}>
          <div className='flex flex-col items-center justify-center'>
          <input
            type="text"
            name="code"
            placeholder="Verification code"
            value={code}
            onChange={e => setCode(e.target.value)}
              className="p-2 border border-slate-200 rounded w-60 mb-4"
          />
            <button
              type="submit"
              className="w-60 mb-2 bg-sky-200 hover:bg-sky-400 text-slate-900 font-bold py-2 px-4 rounded inline-flex items-center text-center justify-center"
            >
              verify
            </button>
            <button
              onClick={handleBack}
              className="w-60 bg-slate-200 hover:bg-slate-400 text-zinc-900 font-bold py-2 px-4 rounded inline-flex items-center mb-2 text-center justify-center"
            >
              back
            </button>
            {errorMessage && <ErrorMessage message={errorMessage} />}
          </div>
        </form>
      )}
    </div>
  );
}
