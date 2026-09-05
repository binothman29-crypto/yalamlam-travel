import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    // Show the same success state whether or not an account exists for this
    // email, so the form can't be used to check which emails are registered.
    if (error && error.status !== 400) {
      const message = error.message && error.message.trim() && error.message !== '{}'
        ? error.message
        : t('resetLinkError');
      setError(message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-safari-sand flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {sent ? (
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold text-safari-green mb-3">{t('resetLinkSentTitle')}</h1>
            <p className="text-gray-600 mb-6">{t('resetLinkSentMessage')}</p>
            <Link to="/login" className="font-medium text-safari-green hover:text-safari-teal">
              {t('backToLogin')}
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-heading font-bold text-safari-green">{t('forgotPasswordTitle')}</h1>
              <p className="text-gray-500 mt-2">{t('forgotPasswordSubtitle')}</p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                disabled={loading}
                className="w-full bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50"
              >
                {loading ? t('sendingResetLink') : t('sendResetLink')}
              </button>
            </form>

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
