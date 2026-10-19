import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

const MIN_PASSWORD_LENGTH = 8;

export default function Register() {
  const { t } = useLanguage();
  // t() returns the key itself when a translation is missing, so new strings
  // fall back to English until they are added to LanguageContext.
  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // { type: 'success' | 'error', text } -- success is tracked explicitly
  // instead of guessing from emoji in the translated text.
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFeedback({
        type: 'error',
        text: tr('passwordMin8', `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`),
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim() }
        }
      });

      if (error) throw error;

      // If the email is already registered Supabase answers as if signup
      // worked (so accounts can't be discovered); the same message is right.
      setFeedback({ type: 'success', text: t('registerSuccess') });
      setTimeout(() => navigate('/login'), 2500);
    } catch (error) {
      const raw = typeof error?.message === 'string' ? error.message.trim() : '';
      setFeedback({
        type: 'error',
        text: raw && raw !== '{}' ? raw : tr('registerError', 'We could not create your account. Please try again in a moment.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-safari-green">{t('createAccount')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('joinYalamlam')}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('fullName')}</label>
              <input
                type="text"
                required
                autoComplete="name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-safari-green focus:border-safari-green"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('emailAddress')}</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-safari-green focus:border-safari-green"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
              <input
                type="password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-safari-green focus:border-safari-green"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {feedback && (
            <p
              role={feedback.type === 'error' ? 'alert' : 'status'}
              className={`text-sm text-center ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
            >
              {feedback.type === 'error' ? '⚠️ ' : ''}{feedback.text}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-safari-green hover:bg-safari-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safari-green transition disabled:opacity-50"
            >
              {loading ? t('creatingAccount') : t('signUp')}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="font-medium text-safari-green hover:text-safari-teal">
              {t('logInHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
