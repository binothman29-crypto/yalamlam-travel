import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
        setChecking(false);
      }
    });

    // The recovery link is consumed by the Supabase client as soon as the
    // page loads, which can happen before the listener above is attached.
    // Fall back to checking for an active session directly.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setError(error.message && error.message !== '{}' ? error.message : t('resetLinkError'));
      return;
    }

    setSuccess(true);
    await supabase.auth.signOut();
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen bg-safari-sand flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {checking ? (
          <p className="text-center text-gray-500">{t('verifyingCode')}</p>
        ) : !ready ? (
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold text-safari-green mb-3">{t('forgotPasswordTitle')}</h1>
            <p className="text-gray-600 mb-6">{t('invalidResetLink')}</p>
            <Link to="/forgot-password" className="font-medium text-safari-green hover:text-safari-teal">
              {t('requestNewResetLink')}
            </Link>
          </div>
        ) : success ? (
          <div className="text-center">
            <p className="text-green-700 font-medium">{t('resetPasswordSuccess')}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-heading font-bold text-safari-green">{t('resetPasswordTitle')}</h1>
              <p className="text-gray-500 mt-2">{t('resetPasswordSubtitle')}</p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                disabled={loading}
                className="w-full bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50"
              >
                {loading ? t('resettingPassword') : t('resetPasswordButton')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
