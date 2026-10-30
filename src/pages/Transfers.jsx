import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

const WHATSAPP_NUMBER = '255778265758';

export default function Transfers() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    passengers: 2,
    luggage: 2,
    vehicle: 'standard',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const transferDetails = `
TRANSFER REQUEST DETAILS:
-------------------------
 Vehicle: ${formData.vehicle === 'standard' ? 'Standard Sedan (1-3 Pax)' : formData.vehicle === 'van' ? 'Family Van (4-7 Pax)' : 'Luxury SUV'}
📅 Date: ${formData.date}
⏰ Time: ${formData.time}
 Passengers: ${formData.passengers}
 Luggage: ${formData.luggage}
📍 Route: ${formData.pickup} ➡️ ${formData.dropoff}
${formData.notes ? `📝 Notes: ${formData.notes}` : ''}
      `.trim();

      // 1. Save to Database (Reusing the bookings table)
      const { data: bookingData, error } = await supabase.from('bookings').insert([
        {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          destination: 'Transfer', // Identifies this as a transfer in the admin panel
          start_date: formData.date,
          end_date: formData.date,
          guests: parseInt(formData.passengers, 10),
          accommodation: formData.vehicle, // Storing vehicle type here for easy filtering
          special_requests: transferDetails,
          status: 'pending',
          user_id: user ? user.id : null
        }
      ]).select('id');

      if (error) throw error;

      // 2. Trigger Admin Email Alert
      try {
        await supabase.functions.invoke('send-booking-email', { 
          body: { type: 'admin_notification', booking_id: bookingData[0].id } 
        });
      } catch (err) {
        console.error('Admin alert failed:', err);
      }

      // 3. Build WhatsApp Message
      const message = `
 *NEW TRANSFER REQUEST - YALAMLAM TRAVEL*
---------------------------------
📍 *Route:* ${formData.pickup} ➡️ ${formData.dropoff}
📅 *Date & Time:* ${formData.date} at ${formData.time}
🚗 *Vehicle:* ${formData.vehicle === 'standard' ? 'Standard Sedan' : formData.vehicle === 'van' ? 'Family Van' : 'Luxury SUV'}
👥 *Pax:* ${formData.passengers} | 🧳 *Luggage:* ${formData.luggage}

👤 *Customer:* ${formData.firstName} ${formData.lastName}
 *Phone:* ${formData.phone}
      `.trim();

      setCompleted({
        whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
        loggedIn: Boolean(user),
      });
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Please try again or WhatsApp us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-safari-sand py-12 px-4">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg text-center space-y-5">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl md:text-3xl font-bold text-safari-green">Transfer Request Received!</h1>
          <p className="text-gray-600">Our dispatch team has been notified. Please click below to confirm your transfer details with us on WhatsApp.</p>
          <a href={completed.whatsappUrl} target="_blank" rel="noreferrer" className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-green-700 transition shadow-md">
            Confirm on WhatsApp
          </a>
          <div className="pt-2">
            <Link to="/" className="text-sm font-medium text-safari-green hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-safari-sand py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-safari-green mb-2">Private Airport & Hotel Transfers</h1>
          <p className="text-gray-600">Reliable, safe, and Halal-friendly transport with our own private fleet.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium text-safari-green">
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-safari-gold h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg">
          
          {/* STEP 1: ROUTE & DATE */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-safari-green border-b pb-3">1. Route & Schedule</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location</label>
                <select name="pickup" value={formData.pickup} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold">
                  <option value="">Select Pickup</option>
                  <option value="Zanzibar Airport (ZNZ)">Zanzibar Airport (ZNZ)</option>
                  <option value="Stone Town Ferry Port">Stone Town Ferry Port</option>
                  <option value="Nungwi Beach">Nungwi Beach</option>
                  <option value="Kendwa Beach">Kendwa Beach</option>
                  <option value="Paje Beach">Paje Beach</option>
                  <option value="Jambiani Beach">Jambiani Beach</option>
                  <option value="Other (Specify in notes)">Other / Specific Hotel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Drop-off Location</label>
                <select name="dropoff" value={formData.dropoff} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold">
                  <option value="">Select Drop-off</option>
                  <option value="Zanzibar Airport (ZNZ)">Zanzibar Airport (ZNZ)</option>
                  <option value="Stone Town Ferry Port">Stone Town Ferry Port</option>
                  <option value="Nungwi Beach">Nungwi Beach</option>
                  <option value="Kendwa Beach">Kendwa Beach</option>
                  <option value="Paje Beach">Paje Beach</option>
                  <option value="Jambiani Beach">Jambiani Beach</option>
                  <option value="Other (Specify in notes)">Other / Specific Hotel</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VEHICLE & PASSENGERS */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-safari-green border-b pb-3">2. Choose Your Vehicle</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['standard', 'van', 'luxury'].map(type => (
                  <label key={type} className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${formData.vehicle === type ? 'border-safari-green bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="vehicle" value={type} checked={formData.vehicle === type} onChange={handleChange} className="hidden" />
                    <div className="text-3xl mb-2">{type === 'standard' ? '🚗' : type === 'van' ? '🚐' : '🚙'}</div>
                    <div className="font-bold text-gray-800 capitalize">{type === 'standard' ? 'Standard Sedan' : type === 'van' ? 'Family Van' : 'Luxury SUV'}</div>
                    <div className="text-xs text-gray-500 mt-1">{type === 'standard' ? '1-3 Passengers' : type === 'van' ? '4-7 Passengers' : '1-3 Passengers (Premium)'}</div>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Passengers</label>
                  <input type="number" name="passengers" min="1" max="7" value={formData.passengers} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Luggage</label>
                  <input type="number" name="luggage" min="0" max="10" value={formData.luggage} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Special Notes (Optional)</label>
                <textarea name="notes" rows="2" value={formData.notes} onChange={handleChange} placeholder="e.g., Flight number, hotel name, child seat needed..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold"></textarea>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT INFO */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-safari-green border-b pb-3">3. Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
              </div>
              
              {/* Summary */}
              <div className="bg-safari-sand p-4 rounded-xl border border-safari-gold/30">
                <h3 className="font-bold text-safari-green mb-2">Booking Summary</h3>
                <p className="text-sm text-gray-700">📍 {formData.pickup} ➡️ {formData.dropoff}</p>
                <p className="text-sm text-gray-700">📅 {formData.date} at {formData.time}</p>
                <p className="text-sm text-gray-700">🚗 {formData.vehicle === 'standard' ? 'Standard Sedan' : formData.vehicle === 'van' ? 'Family Van' : 'Luxury SUV'} ({formData.passengers} Pax)</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="px-6 py-3 border-2 border-safari-green text-safari-green rounded-full font-semibold hover:bg-safari-sand transition">Back</button>
            ) : <div></div>}

            {step < 3 ? (
              <button type="button" onClick={nextStep} className="px-8 py-3 bg-safari-green text-white rounded-full font-semibold hover:bg-safari-teal transition shadow-md">Next Step</button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="w-full ml-4 bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50">
                {isSubmitting ? 'Processing...' : 'Request Transfer'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- TRANSFER PRICING GUIDE --- */}
      <div className="max-w-5xl mx-auto mt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-safari-green mb-2">Transparent Fixed Prices</h2>
          <p className="text-gray-600">No hidden fees. No surge pricing. Just reliable, private transport.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Route 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl">✈️</span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Popular</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Airport to Stone Town</h3>
            <p className="text-sm text-gray-500 mb-4">Zanzibar Airport (ZNZ) ➡️ Stone Town</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-safari-green">$25</span>
              <span className="text-gray-500 text-sm">/ Standard Sedan</span>
            </div>
          </div>

          {/* Route 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl">🌴</span>
              <span className="bg-safari-gold/20 text-safari-gold text-xs font-bold px-3 py-1 rounded-full">Beach</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Airport to Nungwi / Kendwa</h3>
            <p className="text-sm text-gray-500 mb-4">Zanzibar Airport (ZNZ) ➡️ North Beach</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-safari-green">$45</span>
              <span className="text-gray-500 text-sm">/ Family Van</span>
            </div>
          </div>

          {/* Route 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl">🌊</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">South</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Airport to Paje / Jambiani</h3>
            <p className="text-sm text-gray-500 mb-4">Zanzibar Airport (ZNZ) ➡️ East Coast</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-safari-green">$35</span>
              <span className="text-gray-500 text-sm">/ Standard Sedan</span>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          * Prices are estimates for one-way private transfers. Final price confirmed via WhatsApp based on exact hotel location and vehicle type.
        </p>
      </div>
    </div>
  );
}