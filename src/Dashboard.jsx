import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      fetchBookings(session.user.id);
    };
    checkUser();
  }, [navigate]);

  const fetchBookings = async (userId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setBookings(data);
  };

  return (
    <div className="min-h-screen bg-safari-sand py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-safari-green mb-6">My Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome back, {user?.user_metadata?.full_name || user?.email}!</p>

        <h2 className="text-xl font-bold text-gray-800 mb-4">My Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">You haven't made any bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-safari-green">{booking.destination}</h3>
                    <p className="text-sm text-gray-500">Ref: #YAL-{booking.id.substring(0, 8)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <p><strong>Dates:</strong> {booking.start_date} to {booking.end_date}</p>
                  <p><strong>Guests:</strong> {booking.guests}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}