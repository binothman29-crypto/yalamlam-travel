import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Try to log the user in
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(t('invalidCredentials'));
      setLoading(false);
    } else {
      // 2. Check if this user is in the 'staff' table
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('email', email)
        .single();

      // 3. Route them to the correct dashboard
      if (staffData) {
        navigate('/admin'); // Staff/Admin goes here
      } else {
        navigate('/dashboard'); // Regular customer goes here
      }
    }
  };

  return (
    <div className="min-h-screen bg-safari-sand flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-safari-green">{t('login')}</h1>
          <p className="text-gray-500 mt-2">{t('loginSubtitle')}</p>
        </div>

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('password')}</label>
            <input
              type="password"
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
          <div className="text-center mt-4">
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
        </form>
      </div>
    </div>
  );
}
