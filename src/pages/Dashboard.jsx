import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// Same short reference that is shown in the confirmation / reminder emails.
const bookingRef = (id) => `YAL-${String(id).substring(0, 8).toUpperCase()}`;

// Only the columns a customer should ever see. Never select('*') here: staff
// fields on the booking row would be sent to the customer's browser.
const CUSTOMER_COLUMNS = 'id, destination, start_date, end_date, guests, status, payment_status, created_at';

export default function Dashboard() {
  const { t } = useLanguage();
  // t() returns the key itself when a translation is missing, so new strings
  // fall back to English until they are added to LanguageContext.
  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from('bookings')
        .select(CUSTOMER_COLUMNS)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load bookings:', error);
        setLoadError(tr('bookingsLoadError', 'We could not load your bookings. Please refresh the page.'));
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div className="min-h-screen bg-safari-sand py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <h1 className="text-3xl font-bold text-safari-green">{t('myDashboard')}</h1>
          <Link to="/change-password" className="text-sm font-medium text-safari-green hover:text-safari-teal underline">
            {t('changePasswordTitle')}
          </Link>
        </div>
        <p className="text-gray-600 mb-8">{t('welcomeBack')} {user?.user_metadata?.full_name || user?.email}!</p>

        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('myBookings')}</h2>

        {loadError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {loadError}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 bg-white p-6 rounded-xl shadow-md">{tr('loadingBookings', 'Loading your bookings...')}</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-xl shadow-md">
            {t('noBookingsYet')}{' '}
            <Link to="/tours" className="text-safari-green font-bold underline">{t('browseTours')}</Link>
          </p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-safari-green">{booking.destination}</h3>
                    <p className="text-sm text-gray-500">{t('refLabel')} #{bookingRef(booking.id)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <p><strong>{t('datesLabel')}</strong> {booking.start_date} to {booking.end_date}</p>
                  <p><strong>{t('guestsLabel')}</strong> {booking.guests}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
