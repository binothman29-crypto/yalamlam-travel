import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import OtpInput from '../components/OtpInput';

const RESEND_COOLDOWN_SECONDS = 60;

// Custom, self-contained password reset: request-password-reset emails a
// 6-digit code (via Resend, sent directly from the Edge Function) and
// confirm-password-reset checks it and sets the new password via the Admin
// API. This bypasses Supabase Auth's native resetPasswordForEmail() +
// Send Email Hook path entirely, so there's no click-through link, no
// redirect-URL allow-list to configure, and no PASSWORD_RECOVERY session
// listener needed.
export default function ForgotPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState('email'); // 'email' | 'reset' | 'done'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [sendingCode, setSendingCode] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
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

  const requestCode = async () => {
    const { error: invokeError } = await supabase.functions.invoke('request-password-reset', {
      body: { email },
    });
    // The function always replies with a generic success (even for an
    // unregistered email, to avoid leaking which emails exist) -- a thrown
    // error here means the request itself failed to reach it.
    if (invokeError) {
      setError(t('resetLinkError'));
      return false;
    }
    return true;
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSendingCode(true);
    const ok = await requestCode();
    setSendingCode(false);
    if (!ok) return;
    setOtp('');
    setStep('reset');
    startCooldown();
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || sendingCode) return;
    setError('');
    setSendingCode(true);
    const ok = await requestCode();
    setSendingCode(false);
    if (!ok) return;
    setOtp('');
    startCooldown();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError(t('invalidCode'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }

    setResetting(true);
    const { data, error: invokeError } = await supabase.functions.invoke('confirm-password-reset', {
      body: { email, code: otp, newPassword },
    });
    setResetting(false);

    // The function returns { error: '<translationKey>' } from a known,
    // fixed set -- only ever translate a key we actually recognize, so a
    // malformed/unexpected response can never render as raw text.
    const KNOWN_ERROR_KEYS = ['invalidCode', 'passwordTooShort', 'resetLinkError'];
    if (invokeError || !data?.success) {
      const key = data?.error && KNOWN_ERROR_KEYS.includes(data.error) ? data.error : 'resetLinkError';
      setError(t(key));
      setOtp('');
      return;
    }

    setStep('done');
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen bg-safari-sand flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {step === 'done' ? (
          <div className="text-center">
            <p className="text-green-700 font-medium">{t('resetPasswordSuccess')}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-heading font-bold text-safari-green">{t('forgotPasswordTitle')}</h1>
              <p className="text-gray-500 mt-2">
                {step === 'email' ? t('forgotPasswordSubtitle') : t('resetPasswordSubtitle')}
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleSendCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendingCode}
                  className="w-full bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50"
                >
                  {sendingCode ? t('sendingResetLink') : t('sendResetLink')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <p className="text-sm text-gray-600 text-center">
                  {t('codeSentTo')} <span className="font-semibold text-safari-green">{email}</span>
                </p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">{t('enterCode')}</label>
                  <OtpInput value={otp} onChange={setOtp} disabled={resetting} autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('newPassword')}</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('confirmNewPassword')}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetting || otp.length !== 6}
                  className="w-full bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50"
                >
                  {resetting ? t('resettingPassword') : t('resetPasswordButton')}
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
                      setStep('email');
                      setOtp('');
                      setError('');
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

            <div className="text-center mt-6">
              <Link to="/login" className="text-sm font-medium text-safari-green hover:text-safari-teal">
                {t('backToLogin')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
