import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const bookingRef = (id) => `YAL-${String(id).substring(0, 8).toUpperCase()}`;
const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');

const EMPTY_TOUR = {
  title: '', location: '', category: '', price: '', duration: '',
  image_url: '', description: '', included: '', excluded: '', gallery: '', itinerary: '', halal_percentage: 100
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const invokeBookingEmail = async (body) => {
  const { data, error } = await supabase.functions.invoke('send-booking-email', { body });
  if (error || !data?.success) {
    throw new Error(data?.error || error?.message || 'Email request failed');
  }
  return data;
};

export default function Admin() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [reviews, setReviews] = useState([]);

  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [tours, setTours] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]); // NEW

  const [activeTab, setActiveTab] = useState('bookings');
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingForm, setBookingForm] = useState({});

  const [newTour, setNewTour] = useState(EMPTY_TOUR);
  const [editingTour, setEditingTour] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('manager');

  const navigate = useNavigate();

  // --- NEW: Activity Logging Helper ---
  const logActivity = async (action, details = '') => {
    if (!user) return;
    try {
      await supabase.from('activity_logs').insert([{
        user_email: user.email,
        user_name: user.user_metadata?.full_name || user.email.split('@')[0],
        action,
        details,
        user_agent: navigator.userAgent.substring(0, 200) // Truncate for storage
      }]);
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  // 1. Check Authentication & Staff Status
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setUser(user);

        const { data: staffData, error } = await supabase
          .from('staff')
          .select('*')
          .ilike('email', escapeLike(user.email))
          .maybeSingle();
        if (error) console.error('Staff lookup failed:', error);

        if (staffData) {
          setIsStaff(true);
          setUserRole(staffData.role || 'staff');
          fetchData();
          fetchStaff();
          logActivity('Logged in', `User logged into admin dashboard`); // LOG LOGIN
        } else {
          alert("Access Denied: Your account is not authorized to view this dashboard.");
          await supabase.auth.signOut();
          navigate('/login');
        }
      } finally {
        setLoadingAuth(false);
      }
    };
    checkUser();
  }, [navigate]);

  const fetchData = async () => {
    const [toursRes, bookingsRes, notesRes, contactsRes, reviewsRes, logsRes] = await Promise.all([
      supabase.from('tours').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('booking_notes').select('booking_id, notes'),
      supabase.from('contacts').select('*').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*, tours(title)').order('created_at', { ascending: false }),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(200), // NEW
    ]);

    [['tours', toursRes], ['bookings', bookingsRes], ['booking_notes', notesRes], ['contacts', contactsRes], ['reviews', reviewsRes]]
      .forEach(([name, res]) => { if (res.error) console.error(`Failed to load ${name}:`, res.error); });

    setTours(toursRes.data || []);

    const notesById = {};
    (notesRes.data || []).forEach(n => { notesById[n.booking_id] = n.notes; });
    setBookings((bookingsRes.data || []).map(b => ({ ...b, notes: notesById[b.id] || '' })));

    setContacts(contactsRes.data || []);
    setReviews(reviewsRes.data || []);
    setActivityLogs(logsRes.data || []); // NEW
  };

  const fetchStaff = async () => {
    const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    if (error) console.error('Failed to load staff:', error);
    setStaffList(data || []);
  };

  const handleLogout = async () => {
    await logActivity('Logged out', `User logged out of admin dashboard`); // LOG LOGOUT
    await supabase.auth.signOut();
    navigate('/login');
  };

  const sendUpcomingReminders = async () => {
    if (!window.confirm("Send reminder emails to all customers with confirmed tours in the next 48 hours?")) return;
    try {
      const result = await invokeBookingEmail({ type: 'reminders' });
      await logActivity('Sent reminders', `Sent ${result.sent} reminder(s), ${result.failed} failed`);
      if (result.sent === 0 && result.failed === 0) {
        alert("No reminders to send.");
      } else {
        alert(`✅ Sent ${result.sent} reminder(s)${result.failed ? `, ${result.failed} failed.` : '.'}`);
      }
      fetchData();
    } catch (err) {
      alert("Error sending reminders: " + err.message);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const booking = bookings.find(b => b.id === id);
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert("Could not update the booking: " + error.message);
      return;
    }
    await logActivity('Updated booking status', `Booking ${bookingRef(id)} status changed from '${booking?.status}' to '${newStatus}' for ${booking?.first_name} ${booking?.last_name}`);

    if (newStatus === 'confirmed') {
      try {
        await invokeBookingEmail({ type: 'confirmation', booking_id: id });
        alert("✅ Booking confirmed and email sent!");
      } catch (err) {
        alert("Booking confirmed, but the email could not be sent: " + err.message);
      }
    } else {
      alert("Status updated!");
    }
    fetchData();
  };

  const updatePaymentStatus = async (id, newPaymentStatus) => {
    const booking = bookings.find(b => b.id === id);
    const { error } = await supabase.from('bookings').update({ payment_status: newPaymentStatus }).eq('id', id);
    if (error) {
      alert("Could not update the payment status: " + error.message);
      return;
    }
    await logActivity('Updated payment status', `Booking ${bookingRef(id)} payment changed to '${newPaymentStatus}' for ${booking?.first_name} ${booking?.last_name}`);
    fetchData();
  };

  const openEditBooking = (booking) => {
    setEditingBooking(booking);
    setBookingForm({
      status: booking.status,
      payment_status: booking.payment_status || 'unpaid',
      special_requests: booking.special_requests || '',
      notes: booking.notes || ''
    });
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const saveBookingEdits = async (e) => {
    e.preventDefault();
    const previousStatus = editingBooking.status;

    const { error } = await supabase.from('bookings').update({
      status: bookingForm.status,
      payment_status: bookingForm.payment_status,
      special_requests: bookingForm.special_requests
    }).eq('id', editingBooking.id);

    if (error) {
      alert("Could not save the booking: " + error.message);
      return;
    }

    const { error: notesError } = await supabase.from('booking_notes').upsert({
      booking_id: editingBooking.id,
      notes: bookingForm.notes,
      updated_by: user?.email || null,
      updated_at: new Date().toISOString()
    });

    await logActivity('Edited booking', `Booking ${bookingRef(editingBooking.id)} updated. Status: ${bookingForm.status}, Payment: ${bookingForm.payment_status}`);

    let message = "Booking updated successfully!";
    if (notesError) {
      console.error('Notes save failed:', notesError);
      message = "Booking saved, but the internal notes could not be saved: " + notesError.message;
    } else if (bookingForm.status === 'confirmed' && previousStatus !== 'confirmed') {
      try {
        await invokeBookingEmail({ type: 'confirmation', booking_id: editingBooking.id });
        message = "Booking updated and confirmation email sent!";
      } catch (err) {
        message = "Booking updated, but the confirmation email could not be sent: " + err.message;
      }
    }

    setEditingBooking(null);
    fetchData();
    alert(message);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-staff', {
        body: { 
          email: newStaffEmail.trim().toLowerCase(), 
          full_name: newStaffName.trim(), 
          role: newStaffRole
        },
      });
      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Failed to add staff member');
      }

      await logActivity('Added staff member', `Added ${newStaffName} (${newStaffEmail}) with role '${newStaffRole}'`);

      if (data.tempPassword) {
        alert(`Staff member added! Share this temporary password with them:\n\n${data.tempPassword}`);
      } else {
        alert('That email already had an account -- they were added to the team.');
      }

      setNewStaffEmail('');
      setNewStaffName('');
      fetchStaff();
    } catch (error) {
      alert("Error adding staff: " + error.message);
    }
  };

  const handleRemoveStaff = async (member) => {
    const warning = member.role === 'admin'
      ? `${member.email} is an ADMIN. Remove them from the team?`
      : `Remove ${member.email} from the team?`;
    if (!window.confirm(warning)) return;

    const { error } = await supabase.from('staff').delete().eq('email', member.email);
    if (error) {
      alert("Could not remove this team member: " + error.message);
      return;
    }
    await logActivity('Removed staff member', `Removed ${member.full_name || member.email} (${member.role}) from the team`);
    fetchStaff();
  };

  const handleTourChange = (e) => {
    const { name, value, type } = e.target;
    setNewTour(prev => ({ ...prev, [name]: type === 'number' || type === 'range' ? Number(value) : value }));
  };

  const handleEditTour = (tour) => {
    setEditingTour(tour);
    setImageFile(null);
    setNewTour({
      title: tour.title || '',
      location: tour.location || '',
      category: tour.category || '',
      price: tour.price || '',
      duration: tour.duration || '',
      image_url: tour.image_url || '',
      description: tour.description || '',
      included: tour.included ? tour.included.join(', ') : '',
      excluded: tour.excluded ? tour.excluded.join(', ') : '',
      gallery: tour.gallery ? tour.gallery.join(', ') : '',
      itinerary: tour.itinerary ? (Array.isArray(tour.itinerary) ? tour.itinerary.join('\n') : tour.itinerary) : '',
      halal_percentage: tour.halal_percentage !== undefined ? tour.halal_percentage : 100
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTourSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = newTour.image_url;
      if (imageFile) {
        if (!imageFile.type.startsWith('image/')) throw new Error('Please choose an image file.');
        if (imageFile.size > MAX_IMAGE_BYTES) throw new Error('The image is larger than 5 MB.');

        const fileExt = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('tour-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('tour-images').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      const includedArray = newTour.included.split(',').map(item => item.trim()).filter(item => item !== '');
      const excludedArray = newTour.excluded.split(',').map(item => item.trim()).filter(item => item !== '');
      const galleryArray = newTour.gallery.split(',').map(item => item.trim()).filter(item => item !== '');
      const itineraryArray = newTour.itinerary.split('\n').map(item => item.trim()).filter(item => item !== '');

      const price = Number(newTour.price);
      if (!Number.isFinite(price) || price < 0) throw new Error('Please enter a valid price.');

      const tourData = {
        title: newTour.title.trim(),
        location: newTour.location.trim(),
        category: newTour.category,
        price,
        duration: newTour.duration.trim(),
        image_url: finalImageUrl,
        description: newTour.description,
        included: includedArray,
        excluded: excludedArray,
        gallery: galleryArray,
        itinerary: itineraryArray,
        halal_percentage: Number(newTour.halal_percentage) || 0
      };

      const { error } = editingTour
        ? await supabase.from('tours').update(tourData).eq('id', editingTour.id)
        : await supabase.from('tours').insert([tourData]);
      if (error) throw error;

      // LOG TOUR ACTION
      await logActivity(
        editingTour ? 'Updated tour' : 'Created tour',
        `${editingTour ? 'Updated' : 'Created'} tour: "${newTour.title.trim()}" ($${price}) in ${newTour.location.trim()}`
      );

      setNewTour(EMPTY_TOUR);
      setImageFile(null);
      setEditingTour(null);
      fetchData();
      alert("Tour saved successfully!");
    } catch (error) {
      console.error("Error saving tour:", error);
      alert("Error saving tour: " + error.message);
    }
  };

  const handleApproveReview = async (id) => {
    const review = reviews.find(r => r.id === id);
    const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    if (error) {
      alert("Could not approve the review: " + error.message);
      return;
    }
    await logActivity('Approved review', `Approved review by ${review?.customer_name} for "${review?.tours?.title || 'Unknown Tour'}"`);
    fetchData();
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    const review = reviews.find(r => r.id === id);
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      alert("Could not delete the review: " + error.message);
      return;
    }
    await logActivity('Deleted review', `Deleted review by ${review?.customer_name} for "${review?.tours?.title || 'Unknown Tour'}"`);
    fetchData();
  };

  const handleDeleteTour = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) return;
    const tour = tours.find(t => t.id === id);
    const { error } = await supabase.from('tours').delete().eq('id', id);
    if (error) {
      alert("Could not delete the tour: " + error.message);
      return;
    }
    await logActivity('Deleted tour', `Deleted tour: "${tour?.title}" ($${tour?.price})`);
    fetchData();
  };

  // --- ANALYTICS CALCULATIONS ---
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  const totalContacts = contacts.length;

  const destinationCounts = {};
  bookings.forEach(booking => {
    destinationCounts[booking.destination] = (destinationCounts[booking.destination] || 0) + 1;
  });

  const topDestinations = Object.entries(destinationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center">Checking access...</div>;
  if (!isStaff) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-xl shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-safari-green">Yalamlam Staff Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user.email} ({userRole})</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link to="/" className="bg-safari-gold text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition w-full md:w-auto text-center font-bold">🌍 View Public Website</Link>
            <Link to="/change-password" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition w-full md:w-auto text-center">Change Password</Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full md:w-auto">Logout</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
          <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'bookings' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}>Bookings ({bookings.length})</button>
          <button onClick={() => setActiveTab('contacts')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'contacts' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}>Messages ({contacts.length})</button>
          
          {(userRole === 'admin' || userRole === 'manager') && (
            <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'analytics' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}> Analytics</button>
          )}

          {(userRole === 'admin' || userRole === 'manager') && (
            <>
              <button onClick={() => setActiveTab('reviews')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'reviews' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}>Reviews ({reviews.filter(r => !r.is_approved).length} Pending)</button>
              <button onClick={() => setActiveTab('tours')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'tours' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}>Tours</button>
            </>
          )}

          {/* NEW: Activity Log Tab - Admin Only */}
          {userRole === 'admin' && (
            <button onClick={() => setActiveTab('activity')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'activity' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}> Activity Log</button>
          )}

          {userRole === 'admin' && (
            <button onClick={() => setActiveTab('team')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'team' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}>Team Management</button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
          
          {/* --- BOOKINGS TAB --- */}
          {activeTab === 'bookings' && (
            <div className="overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-safari-green">Customer Bookings</h2>
                <button onClick={sendUpcomingReminders} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">🔔 Send 48h Reminders</button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="p-4">Date</th><th className="p-4">Customer</th><th className="p-4">Tour</th>
                    <th className="p-4">Dates</th><th className="p-4">Status</th><th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{booking.first_name} {booking.last_name}</div>
                        <div className="text-gray-500 text-xs">{booking.email} | {booking.phone}</div>
                        <div className="text-gray-400 text-xs">{bookingRef(booking.id)}</div>
                      </td>
                      <td className="p-4 capitalize">{booking.destination}</td>
                      <td className="p-4 text-gray-600">{booking.start_date} to {booking.end_date}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : booking.status === 'completed' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button onClick={() => openEditBooking(booking)} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold hover:bg-blue-200">Edit</button>
                          {booking.status === 'pending' && (
                            <button onClick={() => updateStatus(booking.id, 'confirmed')} className="text-safari-green font-bold hover:underline text-xs">Confirm</button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {booking.payment_status !== 'deposit_paid' && (
                            <button onClick={() => updatePaymentStatus(booking.id, 'deposit_paid')} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200">Mark Deposit</button>
                          )}
                          {booking.payment_status !== 'fully_paid' && (
                            <button onClick={() => updatePaymentStatus(booking.id, 'fully_paid')} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200">Mark Paid</button>
                          )}  
                        </div>
                        <div className="flex gap-2 mt-1">
                          <a href={`mailto:${booking.email}`} className="text-blue-600 hover:underline text-xs">Email</a>
                          <a href={`https://wa.me/${(booking.phone || '').replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline text-xs">WhatsApp</a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <p className="p-8 text-center text-gray-500">No bookings yet.</p>}
            </div>
          )}

          {/* --- CONTACTS TAB --- */}
          {activeTab === 'contacts' && (
            <div className="overflow-x-auto">
              <h2 className="text-xl font-bold text-safari-green mb-4">Contact Messages</h2>
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="p-4">Date</th><th className="p-4">Name</th><th className="p-4">Contact</th><th className="p-4">Message</th><th className="p-4">Reply</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {contacts.map(contact => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-500">{new Date(contact.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-bold">{contact.name}</td>
                      <td className="p-4 text-gray-600">{contact.email}<br/>{contact.phone}</td>
                      <td className="p-4 text-gray-700 max-w-xs truncate">{contact.message}</td>
                      <td className="p-4 flex flex-col gap-1">
                        <a href={`mailto:${contact.email}?subject=${encodeURIComponent('Re: Your message to Yalamlam')}`} className="text-blue-600 hover:underline text-xs">Email Reply</a>
                        {contact.phone && <a href={`https://wa.me/${contact.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Assalamu Alaikum ${contact.name}, thank you for contacting Yalamlam...`)}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline text-xs">WhatsApp Reply</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.length === 0 && <p className="p-8 text-center text-gray-500">No messages yet.</p>}
            </div>
          )}

          {/* --- REVIEWS TAB --- */}
          {activeTab === 'reviews' && (userRole === 'admin' || userRole === 'manager') && (
            <div className="overflow-x-auto">
              <h2 className="text-xl font-bold text-safari-green mb-4">Manage Customer Reviews</h2>
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="p-4">Date</th><th className="p-4">Customer</th><th className="p-4">Tour</th>
                    <th className="p-4">Rating</th><th className="p-4">Comment</th><th className="p-4">Status</th><th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {reviews.map(review => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-500">{new Date(review.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-bold">{review.customer_name}</td>
                      <td className="p-4 text-gray-600">{review.tours?.title || 'Unknown Tour'}</td>
                      <td className="p-4 text-yellow-500 font-bold">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</td>
                      <td className="p-4 text-gray-700 max-w-xs truncate">{review.comment}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {review.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        {!review.is_approved && (
                          <button onClick={() => handleApproveReview(review.id)} className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold hover:bg-green-200">Approve</button>
                        )}
                        <button onClick={() => handleDeleteReview(review.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold hover:bg-red-200">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reviews.length === 0 && <p className="p-8 text-center text-gray-500">No reviews yet.</p>}
            </div>
          )}

          {/* --- ANALYTICS TAB --- */}
          {activeTab === 'analytics' && (userRole === 'admin' || userRole === 'manager') && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-safari-green">Business Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
                  <p className="text-gray-500 text-sm font-medium uppercase">Total Bookings</p>
                  <p className="text-4xl font-bold text-gray-800 mt-2">{totalBookings}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
                  <p className="text-gray-500 text-sm font-medium uppercase">Confirmed</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{confirmedBookings}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-500">
                  <p className="text-gray-500 text-sm font-medium uppercase">Pending</p>
                  <p className="text-4xl font-bold text-yellow-600 mt-2">{pendingBookings}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-purple-500">
                  <p className="text-gray-500 text-sm font-medium uppercase">Total Messages</p>
                  <p className="text-4xl font-bold text-purple-600 mt-2">{totalContacts}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Top Destinations</h3>
                  {topDestinations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No booking data yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {topDestinations.map(([dest, count]) => {
                        const percentage = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
                        return (
                          <div key={dest}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-gray-700">{dest}</span>
                              <span className="text-gray-500">{count} bookings ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                              <div className="bg-safari-green h-3 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Quick Insights</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                      <span className="text-2xl">📈</span>
                      <div>
                        <p className="font-bold text-gray-800">Conversion Rate</p>
                        <p className="text-sm text-gray-600">
                          {totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0}% of all bookings are confirmed.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl">
                      <span className="text-2xl"></span>
                      <div>
                        <p className="font-bold text-gray-800">Action Required</p>
                        <p className="text-sm text-gray-600">You have {pendingBookings} pending booking(s) waiting for confirmation.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl">
                      <span className="text-2xl">🚫</span>
                      <div>
                        <p className="font-bold text-gray-800">Cancellations</p>
                        <p className="text-sm text-gray-600">{cancelledBookings} booking(s) have been cancelled.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TOURS TAB --- */}
          {activeTab === 'tours' && (userRole === 'admin' || userRole === 'manager') && (
            <div>
              <h2 className="text-xl font-bold text-safari-green mb-4">{editingTour ? 'Edit Tour' : 'Add New Tour'}</h2>
              <form onSubmit={handleTourSubmit} className="space-y-4 mb-8 bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" name="title" value={newTour.title} onChange={handleTourChange} placeholder="Tour Title" required className="p-3 border rounded-lg w-full" />
                  <input type="text" name="location" value={newTour.location} onChange={handleTourChange} placeholder="Location" required className="p-3 border rounded-lg w-full" />
                  <select name="category" value={newTour.category} onChange={handleTourChange} required className="p-3 border rounded-lg w-full">
                    <option value="">Select Category</option>
                    <option value="Zanzibar Tours">Zanzibar Tours</option>
                    <option value="Tanzania Safaris">Tanzania Safaris</option>
                    <option value="Halal Packages">Halal Packages</option>
                    <option value="Kilimanjaro">Kilimanjaro</option>
                  </select>
                  <input type="number" name="price" value={newTour.price} onChange={handleTourChange} placeholder="Price (USD)" required className="p-3 border rounded-lg w-full" />
                  <input type="text" name="duration" value={newTour.duration} onChange={handleTourChange} placeholder="Duration (e.g., 3 Days)" className="p-3 border rounded-lg w-full" />
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="p-3 border rounded-lg w-full bg-white" />
                </div>
                <textarea name="description" value={newTour.description} onChange={handleTourChange} placeholder="Short Description" rows="2" className="p-3 border rounded-lg w-full"></textarea>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">What's Included (comma separated)</label>
                    <textarea name="included" value={newTour.included} onChange={handleTourChange} placeholder="e.g. Breakfast, Guide, Transport" rows="2" className="p-3 border rounded-lg w-full"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">What's Excluded (comma separated)</label>
                    <textarea name="excluded" value={newTour.excluded} onChange={handleTourChange} placeholder="e.g. Flights, Tips, Personal Expenses" rows="2" className="p-3 border rounded-lg w-full"></textarea>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Image Gallery URLs (comma separated)</label>
                  <input type="text" name="gallery" value={newTour.gallery} onChange={handleTourChange} placeholder="https://..., https://..." className="p-3 border rounded-lg w-full" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Day-by-Day Itinerary (one day per line)</label>
                  <textarea name="itinerary" value={newTour.itinerary} onChange={handleTourChange} placeholder="Day 1: Arrival&#10;Day 2: Safari" rows="4" className="p-3 border rounded-lg w-full font-mono text-sm"></textarea>
                </div>
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">
                      Halal Friendliness: <span className="text-safari-green text-lg">{newTour.halal_percentage}%</span>
                    </label>
                    <input type="range" name="halal_percentage" min="0" max="100" step="10" value={newTour.halal_percentage} onChange={handleTourChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-safari-green" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0% (Not Halal)</span><span>50% (Partially Halal)</span><span>100% (Fully Halal)</span>
                    </div>
                  </div>
                  <button type="submit" className="bg-safari-green text-white px-6 py-2 rounded-lg font-bold hover:bg-safari-teal transition self-end">
                    {editingTour ? 'Update Tour' : 'Add Tour'}
                  </button>
                </div>
              </form>
              {editingTour && (
                <button type="button" onClick={() => { setEditingTour(null); setImageFile(null); setNewTour(EMPTY_TOUR); }} className="text-red-500 text-sm hover:underline mt-2">Cancel Edit</button>
              )}

              <h3 className="text-lg font-bold text-gray-700 mb-4">All Tours</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <tr><th className="p-4">Tour</th><th className="p-4">Price</th><th className="p-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {tours.map(tour => (
                      <tr key={tour.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold">{tour.title}</td>
                        <td className="p-4">${tour.price}</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => handleEditTour(tour)} className="bg-safari-gold text-safari-green px-3 py-1 rounded-lg text-sm hover:bg-yellow-400 transition">Edit</button>
                          <button onClick={() => handleDeleteTour(tour.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- NEW: ACTIVITY LOG TAB (ADMIN ONLY) --- */}
          {activeTab === 'activity' && userRole === 'admin' && (
            <div className="overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-safari-green">📋 Activity Log</h2>
                  <p className="text-sm text-gray-500 mt-1">Track all staff actions for security and accountability</p>
                </div>
                <span className="text-xs text-gray-400">Showing last {activityLogs.length} activities</span>
              </div>

              {activityLogs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-lg">No activity recorded yet.</p>
                  <p className="text-gray-400 text-sm mt-2">Actions will appear here as staff members use the dashboard.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <tr>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Staff Member</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Device/Browser</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {activityLogs.map((log) => {
                      // Color-code actions
                      const actionColor = 
                        log.action.includes('Logged') ? 'bg-blue-100 text-blue-700' :
                        log.action.includes('Created') || log.action.includes('Added') || log.action.includes('Approved') ? 'bg-green-100 text-green-700' :
                        log.action.includes('Deleted') || log.action.includes('Removed') ? 'bg-red-100 text-red-700' :
                        log.action.includes('Updated') || log.action.includes('Edited') ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700';

                      return (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="p-4 text-gray-500 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-gray-800">{log.user_name || 'Unknown'}</div>
                            <div className="text-gray-500 text-xs">{log.user_email}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${actionColor}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-gray-700 max-w-md">{log.details || '—'}</td>
                          <td className="p-4 text-gray-400 text-xs max-w-xs truncate" title={log.user_agent}>
                            {log.user_agent ? (
                              log.user_agent.includes('Chrome') ? '🌐 Chrome' :
                              log.user_agent.includes('Firefox') ? ' Firefox' :
                              log.user_agent.includes('Safari') ? '🧭 Safari' :
                              log.user_agent.includes('Mobile') ? '📱 Mobile' : '💻 Desktop'
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* --- TEAM TAB --- */}
          {activeTab === 'team' && userRole === 'admin' && (
            <div>
              <h2 className="text-xl font-bold text-safari-green mb-4">Manage Staff Access</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Enter their name and email below. This creates their login automatically and shows you a temporary password to share with them.
              </p>
              
              <form onSubmit={handleAddStaff} className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 p-6 rounded-lg">
                <input type="text" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="Staff Member Name" required className="p-3 border rounded-lg flex-1" />
                <input type="email" value={newStaffEmail} onChange={(e) => setNewStaffEmail(e.target.value)} placeholder="Staff Email Address" required className="p-3 border rounded-lg flex-1" />
                <select value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value)} className="p-3 border rounded-lg md:w-48 bg-white">
                  <option value="manager">Manager (Tours, Bookings, Reviews)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
                <button type="submit" className="bg-safari-green text-white px-6 py-3 rounded-lg font-bold hover:bg-safari-teal transition">Grant Access</button>
              </form>

              <h3 className="text-lg font-bold text-gray-700 mb-4">Current Team Members</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {staffList.map(member => (
                      <tr key={member.email} className="hover:bg-gray-50">
                        <td className="p-4 font-bold">{member.full_name || 'Unknown'}</td>
                        <td className="p-4">{member.email}</td>
                        <td className="p-4 capitalize">{member.role || 'staff'}</td>
                        <td className="p-4">
                          {member.email !== user.email && (
                            <button onClick={() => handleRemoveStaff(member)} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition">Remove</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-safari-green">Edit Booking: {editingBooking.first_name} {editingBooking.last_name}</h2>
              <button onClick={() => setEditingBooking(null)} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
            </div>
            <form onSubmit={saveBookingEdits} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Booking Status</label>
                <select name="status" value={bookingForm.status} onChange={handleBookingFormChange} className="w-full p-2 border rounded">
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Payment Status</label>
                <select name="payment_status" value={bookingForm.payment_status} onChange={handleBookingFormChange} className="w-full p-2 border rounded">
                  <option value="unpaid">Unpaid</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="fully_paid">Fully Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Internal Notes (staff only)</label>
                <textarea name="notes" value={bookingForm.notes} onChange={handleBookingFormChange} rows="3" className="w-full p-2 border rounded" placeholder="e.g., Customer prefers window seat, allergic to nuts..."></textarea>
              </div>
              <button type="submit" className="w-full bg-safari-green text-white py-2 rounded-lg font-bold hover:bg-safari-teal">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}