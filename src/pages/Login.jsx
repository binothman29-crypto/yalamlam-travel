import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import OtpInput from '../components/OtpInput';

const RESEND_COOLDOWN_SECONDS = 60;

// Escape % and _ so an email address can be matched safely with ilike.
const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');

export default function Login() {
  const { t } = useLanguage();
  // t() returns the key itself when a translation is missing, so new strings
  // fall back to English until they are added to LanguageContext.
  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'code'

  // Password tab state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email code tab state
  const [codeEmail, setCodeEmail] = useState('');
  const [codeStep, setCodeStep] = useState('email'); // 'email' | 'code'
  const [otp, setOtp] = useState('');
  const [codeError, setCodeError] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(cooldownRef.current);
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  // After any successful sign-in (password or code), route staff to /admin
  // and everyone else to /dashboard. Always pass the email of the SIGNED-IN
  // account (from the auth response), not what was typed: Auth lowercases
  // emails, so a typed "Admin@..." would otherwise miss the staff row.
  const routeAfterLogin = async (signedInEmail) => {
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('email')
      .ilike('email', escapeLike(signedInEmail))
      .maybeSingle();

    if (staffError) console.error('Staff lookup failed:', staffError);

    navigate(staffData ? '/admin' : '/dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (error || !data?.user) {
      setError(t('invalidCredentials'));
      setLoading(false);
      return;
    }

    await routeAfterLogin(data.user.email);
  };

  // Same wording whether or not the address has an account, so this form
  // cannot be used to find out which emails are registered.
  const describeSendError = (err) => {
    if (err?.status === 429 || /rate limit|too many|seconds/i.test(err?.message || '')) {
      return tr('tooManyRequests', 'Too many attempts. Please wait a minute and try again.');
    }
    return tr('codeSendError', 'We could not send a code to that address. Check the email, or sign up first.');
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setCodeError('');
    setSendingCode(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: codeEmail.trim().toLowerCase(),
      options: {
        // Only existing accounts may sign in this way; this never creates one.
        shouldCreateUser: false,
      },
    });

    setSendingCode(false);

    if (error) {
      setCodeError(describeSendError(error));
      return;
    }

    setOtp('');
    setCodeStep('code');
    startCooldown();
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || sendingCode) return;
    setCodeError('');
    setSendingCode(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: codeEmail.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    });
    setSendingCode(false);
    if (error) {
      setCodeError(describeSendError(error));
      return;
    }
    setOtp('');
    startCooldown();
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setCodeError('');
    setVerifyingCode(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: codeEmail.trim().toLowerCase(),
      token: otp,
      type: 'email',
    });

    setVerifyingCode(false);

    if (error || !data?.user) {
      setCodeError(t('invalidCode'));
      setOtp('');
      return;
    }

    await routeAfterLogin(data.user.email);
  };

  return (
    <div className="min-h-screen bg-safari-sand flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-heading font-bold text-safari-green">{t('login')}</h1>
          <p className="text-gray-500 mt-2">{t('loginSubtitle')}</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition ${
              activeTab === 'password' ? 'bg-safari-green text-white shadow' : 'text-gray-600'
            }`}
          >
            {t('loginWithPassword')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition ${
              activeTab === 'code' ? 'bg-safari-green text-white shadow' : 'text-gray-600'
            }`}
          >
            {t('loginWithEmailCode')}
          </button>
        </div>

        {activeTab === 'password' ? (
          <>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('email')}</label>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">{t('password')}</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-safari-green hover:text-safari-teal">
                    {t('forgotPassword')}
                  </Link>
                </div>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50"
              >
                {loading ? t('loggingIn') : t('login')}
              </button>
            </form>
          </>
        ) : (
          <>
            {codeError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {codeError}
              </div>
            )}

            {codeStep === 'email' ? (
              <form onSubmit={handleSendCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('email')}</label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={codeEmail}
                    onChange={(e) => setCodeEmail(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendingCode}
                  className="w-full bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50"
                >
                  {sendingCode ? t('sendingCode') : t('sendCode')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <p className="text-sm text-gray-600 text-center">
                  {t('codeSentTo')} <span className="font-semibold text-safari-green">{codeEmail}</span>
                </p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">{t('enterCode')}</label>
                  <OtpInput value={otp} onChange={setOtp} disabled={verifyingCode} autoFocus />
                </div>
                <button
                  type="submit"
                  disabled={verifyingCode || otp.length !== 6}
                  className="w-full bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50"
                >
                  {verifyingCode ? t('verifyingCode') : t('verifyAndLogin')}
                </button>
                <div className="text-center text-sm text-gray-600 space-y-1">
                  <p>
                    {t('didntGetCode')}{' '}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={cooldown > 0 || sendingCode}
                      className="font-medium text-safari-green hover:text-safari-teal disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {cooldown > 0 ? `${t('resendCodeIn')} ${cooldown}s` : t('resendCode')}
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCodeStep('email');
                      setOtp('');
                      setCodeError('');
                      clearInterval(cooldownRef.current);
                      setCooldown(0);
                    }}
                    className="text-gray-500 hover:text-safari-green underline"
                  >
                    {t('useDifferentEmail')}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t('noAccount')}{' '}
            <Link to="/register" className="font-medium text-safari-green hover:text-safari-teal">
              {t('signUpHere')}
            </Link>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('staffHint')}
          </p>
        </div>
      </div>
    </div>
  );
}
