import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

// ⚠️ EmailJS Configuration
const EMAILJS_SERVICE_ID = 'yalamlam_smtp'; 
const EMAILJS_TEMPLATE_ID = 'template_oibiz3z'; 
const EMAILJS_PUBLIC_KEY = 'user_9hNXFaXZnQiRVgtyx';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // For RBAC
  const [isStaff, setIsStaff] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [reviews, setReviews] = useState([]);
  
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [tours, setTours] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingForm, setBookingForm] = useState({});
  
  // Tour Form State (Updated to match DB schema: included, excluded, gallery, itinerary)
  const [newTour, setNewTour] = useState({
    title: '', location: '', category: '', price: '', duration: '', 
    image_url: '', description: '', included: '', excluded: '', gallery: '', itinerary: '', is_halal: true
  });
  const [editingTour, setEditingTour] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Staff Form State
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');

  const navigate = useNavigate();

  // 1. Check Authentication & Staff Status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: staffData } = await supabase.from('staff').select('*').eq('email', user.email).single();
        if (staffData) {
          setIsStaff(true);
          setUserRole(staffData.role || 'staff'); // Capture role for RBAC
          fetchData();
          fetchStaff();
        } else {
          alert("Access Denied: Your account is not authorized to view this dashboard.");
          await supabase.auth.signOut();
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
      setLoadingAuth(false);
    };
    checkUser();
  }, [navigate]);

  const fetchData = async () => {
    const { data: toursData } = await supabase.from('tours').select('*').order('created_at', { ascending: false });
    setTours(toursData || []);
    
    const { data: bookingsData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    setBookings(bookingsData || []);
    
    const { data: contactsData } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    setContacts(contactsData || []);
    
    const { data: reviewsData } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    setReviews(reviewsData || []);
  };

  const fetchStaff = async () => {
    const { data } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    setStaffList(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

    const sendUpcomingReminders = async () => {
    if (!window.confirm("Send reminder emails to all customers with tours in the next 48 hours?")) return;

    // Calculate today and 2 days from now
    const today = new Date().toISOString().split('T')[0];
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch upcoming confirmed bookings
    const { data: upcomingBookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'confirmed')
      .gte('start_date', today)
      .lte('start_date', twoDaysFromNow);

    if (error) {
      alert("Error fetching bookings: " + error.message);
      return;
    }

    if (!upcomingBookings || upcomingBookings.length === 0) {
      alert("No upcoming tours in the next 48 hours.");
      return;
    }

    let successCount = 0;
    // Loop through and send emails
    for (const booking of upcomingBookings) {
      try {
        await emailjs.send(
          'yalamlam_smtp', 
          'template_nlcb9zr', // ⚠️ REPLACE THIS with your actual Reminder Template ID!
          {
            to_email: booking.email,
            first_name: booking.first_name,
            destination: booking.destination,
            start_date: booking.start_date
          },
          'user_9hNXFaXZnQiRVgtyx'
        );
        successCount++;
      } catch (err) {
        console.error("Failed to send to", booking.email, err);
      }
    }

    alert(`✅ Successfully sent reminders to ${successCount} customer(s)!`);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { data: bookingData } = await supabase.from('bookings').select('*').eq('id', id).single();
      await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
      
      if (newStatus === 'confirmed' && bookingData) {
        const templateParams = {
          to_email: bookingData.email,
          first_name: bookingData.first_name,
          destination: bookingData.destination,
          start_date: bookingData.start_date,
          end_date: bookingData.end_date,
          guests: bookingData.guests,
          booking_id: `YAL-${bookingData.id}`
        };
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
        alert("✅ Booking confirmed and email sent!");
      } else {
        alert("Status updated!");
      }
      fetchData();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const updatePaymentStatus = async (id, newPaymentStatus) => {
    await supabase.from('bookings').update({ payment_status: newPaymentStatus }).eq('id', id);
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
    await supabase.from('bookings').update({
      status: bookingForm.status,
      payment_status: bookingForm.payment_status,
      special_requests: bookingForm.special_requests,
      notes: bookingForm.notes
    }).eq('id', editingBooking.id);
    
    setEditingBooking(null);
    fetchData();
    alert("Booking updated successfully!");
  };

  // --- STAFF MANAGEMENT ---
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('staff').insert([{ 
        email: newStaffEmail, 
        full_name: newStaffName,
        role: 'staff' 
      }]);
      if (error) throw error;
      
      alert("Staff member added successfully! They can now log in.");
      setNewStaffEmail('');
      setNewStaffName('');
      fetchStaff();
    } catch (error) {
      alert("Error adding staff: " + error.message);
    }
  };

  const handleRemoveStaff = async (email) => {
    if (window.confirm(`Remove ${email} from the team?`)) {
      await supabase.from('staff').delete().eq('email', email);
      fetchStaff();
    }
  };

  // --- TOUR MANAGEMENT ---
  const handleTourChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTour(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
      // Convert arrays from DB back to comma-separated strings for the form
      included: tour.included ? tour.included.join(', ') : '',
      excluded: tour.excluded ? tour.excluded.join(', ') : '',
      gallery: tour.gallery ? tour.gallery.join(', ') : '',
      // Convert itinerary array to newline-separated string
      itinerary: tour.itinerary ? (Array.isArray(tour.itinerary) ? tour.itinerary.join('\n') : tour.itinerary) : '',
      is_halal: tour.is_halal !== undefined ? tour.is_halal : true
    });
  };

  const handleTourSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = newTour.image_url;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('tour-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('tour-images').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      // Convert comma/newline separated strings back to arrays for the database
      const includedArray = newTour.included.split(',').map(item => item.trim()).filter(item => item !== '');
      const excludedArray = newTour.excluded.split(',').map(item => item.trim()).filter(item => item !== '');
      const galleryArray = newTour.gallery.split(',').map(item => item.trim()).filter(item => item !== '');
      const itineraryArray = newTour.itinerary.split('\n').map(item => item.trim()).filter(item => item !== '');

      const tourData = {
        title: newTour.title, 
        location: newTour.location, 
        category: newTour.category,
        price: Number(newTour.price), 
        duration: newTour.duration, 
        image_url: finalImageUrl,
        description: newTour.description, 
        included: includedArray, 
        excluded: excludedArray,
        gallery: galleryArray,
        itinerary: itineraryArray, 
        is_halal: newTour.is_halal
      };

      if (editingTour) {
        await supabase.from('tours').update(tourData).eq('id', editingTour.id);
      } else {
        await supabase.from('tours').insert([tourData]);
      }

      setNewTour({ title: '', location: '', category: '', price: '', duration: '', image_url: '', description: '', included: '', excluded: '', gallery: '', itinerary: '', is_halal: true });
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
    await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    fetchData();
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm("Delete this review permanently?")) {
      await supabase.from('reviews').delete().eq('id', id);
      fetchData();
    }
  };

  const handleDeleteTour = async (id) => {
    if (window.confirm("Are you sure you want to delete this tour?")) {
      await supabase.from('tours').delete().eq('id', id);
      fetchData();
    }
  };

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
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full md:w-auto">Logout</button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
          <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'bookings' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}>Bookings ({bookings.length})</button>
          <button onClick={() => setActiveTab('contacts')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'contacts' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}>Messages ({contacts.length})</button>
          <button onClick={() => setActiveTab('reviews')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'reviews' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}>Reviews ({reviews.length})</button>
          {/* ROLE-BASED ACCESS: Only Admins see these tabs */}
          {userRole === 'admin' && (
            <>
              <button onClick={() => setActiveTab('tours')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'tours' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}>Tours</button>
              <button onClick={() => setActiveTab('team')} className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === 'team' ? 'bg-safari-green text-white' : 'bg-white text-gray-600'}`}>Team Management</button>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
          
          {/* --- BOOKINGS TAB --- */}
          {activeTab === 'bookings' && (
            <div className="overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-safari-green">Customer Bookings</h2>
                <button 
                  onClick={sendUpcomingReminders}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  🔔 Send 48h Reminders
                </button>
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
                      </td>
                      <td className="p-4 capitalize">{booking.destination}</td>
                      <td className="p-4 text-gray-600">{booking.start_date} to {booking.end_date}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button onClick={() => openEditBooking(booking)} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold hover:bg-blue-200 ">Edit</button>
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
                          <a href={`https://wa.me/${booking.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline text-xs">WhatsApp</a>
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
                        <a href={`mailto:${contact.email}?subject=Re: Your message to Yalamlam`} className="text-blue-600 hover:underline text-xs">Email Reply</a>
                        {contact.phone && <a href={`https://wa.me/${contact.phone.replace(/\D/g,'')}?text=Assalamu Alaikum ${contact.name}, thank you for contacting Yalamlam...`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline text-xs">WhatsApp Reply</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.length === 0 && <p className="p-8 text-center text-gray-500">No messages yet.</p>}
            </div>
          )}

          {/* --- REVIEWS TAB --- */}
          {activeTab === 'reviews' && userRole === 'admin' && (
            <div className="overflow-x-auto">
              <h2 className="text-xl font-bold text-safari-green mb-4">Manage Customer Reviews</h2>
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Tour</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Comment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
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

          {/* --- TOURS TAB (ADMIN ONLY) --- */}
          {activeTab === 'tours' && userRole === 'admin' && (
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
                
                {/* NEW ADVANCED FIELDS */}
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
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_halal" checked={newTour.is_halal} onChange={handleTourChange} className="h-5 w-5" />
                    <span className="text-sm font-bold">100% Halal Friendly</span>
                  </label>
                  <button type="submit" className="bg-safari-green text-white px-6 py-2 rounded-lg font-bold hover:bg-safari-teal transition">
                    {editingTour ? 'Update Tour' : 'Add Tour'}
                  </button>
                </div>
                {editingTour && <button type="button" onClick={() => { setEditingTour(null); setNewTour({ title: '', location: '', category: '', price: '', duration: '', image_url: '', description: '', included: '', excluded: '', gallery: '', itinerary: '', is_halal: true }); }} className="text-red-500 text-sm hover:underline mt-2">Cancel Edit</button>}
              </form>

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

          {/* --- TEAM TAB (ADMIN ONLY) --- */}
          {activeTab === 'team' && userRole === 'admin' && (
            <div>
              <h2 className="text-xl font-bold text-safari-green mb-4">Manage Staff Access</h2>
              <p className="text-gray-600 mb-6 text-sm">
                <strong>Step 1:</strong> Go to Supabase Dashboard -{'>'} Authentication -{'>'} Users -{'>'} "Invite User" to create their login.<br/>
                <strong>Step 2:</strong> Add their email below to grant them access to this dashboard.
              </p>
              
              <form onSubmit={handleAddStaff} className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 p-6 rounded-lg">
                <input type="text" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="Staff Member Name" required className="p-3 border rounded-lg flex-1" />
                <input type="email" value={newStaffEmail} onChange={(e) => setNewStaffEmail(e.target.value)} placeholder="Staff Email Address" required className="p-3 border rounded-lg flex-1" />
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
                            <button onClick={() => handleRemoveStaff(member.email)} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition">Remove</button>
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
                <label className="block text-sm font-bold text-gray-700 mb-1">Internal Notes (Only admins see this)</label>
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