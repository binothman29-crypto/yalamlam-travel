import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // This object holds all the data the user types in
  const [formData, setFormData] = useState({
    destination: 'zanzibar',
    startDate: '',
    endDate: '',
    guests: 2,
    // Muslim-friendly specific fields
    halalMeals: true,
    prayerFacilities: true,
    privateVehicle: true,
    femaleGuide: false,
    modestActivities: true,
    // Accommodation & Extras
    accommodation: 'luxury-lodge',
    activities: [],
    // Contact Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  // Helper to update text/number/select inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Helper specifically for the "Activities" checkboxes (arrays)
  const handleActivityChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      activities: checked ? [...prev.activities, value] : prev.activities.filter(act => act !== value)
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. SAVE TO DATABASE
      const { data, error } = await supabase.from('bookings').insert([
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          destination: formData.destination,
          start_date: formData.startDate,
          end_date: formData.endDate,
          guests: formData.guests,
          halal_meals: formData.halalMeals,
          prayer_facilities: formData.prayerFacilities,
          private_vehicle: formData.privateVehicle,
          female_guide: formData.femaleGuide,
          modest_activities: formData.modestActivities,
          accommodation: formData.accommodation,
          activities: formData.activities,
          special_requests: formData.specialRequests,
          status: 'pending',
          user_id: user ? user.id : null
        }
      ]);

      if (error) {
        console.error("Database error:", error);
        alert("Sorry, there was an error saving your booking. Please try again or WhatsApp us directly.");
        setIsSubmitting(false);
        return;
      }

      // 2. SEND TO WHATSAPP
      const message = `
🌍 *NEW YALAMLAM TRAVEL BOOKING REQUEST*
---------------------------------
📍 *Destination:* ${formData.destination}
📅 *Dates:* ${formData.startDate} to ${formData.endDate}
👥 *Guests:* ${formData.guests}

🕌 *FAITH & COMFORT:*
- Halal Meals: ${formData.halalMeals ? '✅ Yes' : '❌ No'}
- Prayer Facilities: ${formData.prayerFacilities ? '✅ Yes' : '❌ No'}
- Private Vehicle: ${formData.privateVehicle ? '✅ Yes' : '❌ No'}
- Female Guide: ${formData.femaleGuide ? '✅ Yes' : '❌ No'}
- Modest Activities: ${formData.modestActivities ? '✅ Yes' : '❌ No'}

🏨 *STAY & PLAY:*
- Accommodation: ${formData.accommodation}
- Activities: ${formData.activities.join(', ') || 'None selected'}

👤 *CONTACT DETAILS:*
- Name: ${formData.firstName} ${formData.lastName}
- Email: ${formData.email}
- Phone/WhatsApp: ${formData.phone}

📝 *SPECIAL REQUESTS:*
${formData.specialRequests || 'None'}
      `.trim();

      const encodedMessage = encodeURIComponent(message);
      
      // ⚠️ REPLACE THIS WITH YOUR ACTUAL WHATSAPP NUMBER (No + sign, no spaces)
      const yourWhatsAppNumber = "255778265758"; 
      
      window.open(`https://wa.me/${yourWhatsAppNumber}?text=${encodedMessage}`, '_blank');
      
      alert("JazakAllah Khair! Your booking has been saved and we've opened WhatsApp to finalize it.");
      
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress bar calculation
  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-safari-sand py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-safari-green mb-2">Plan Your Halal Safari</h1>
          <p className="text-gray-600">Fill in your details below. We will customize everything to your faith and comfort.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium text-safari-green">
            <span>Step {step} of 4</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-safari-gold h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg">
          
          {/* STEP 1: TRIP DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-safari-green border-b pb-3">1. Trip Details</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Where do you want to go?</label>
                <select name="destination" value={formData.destination} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent">
                  <option value="zanzibar">Zanzibar (Beach & Stone Town)</option>
                  <option value="serengeti">Serengeti & Ngorongoro Safari</option>
                  <option value="kilimanjaro">Kilimanjaro Trekking</option>
                  <option value="custom">Custom Multi-Destination</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Guests</label>
                <input type="number" name="guests" min="1" value={formData.guests} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
              </div>
            </div>
          )}

          {/* STEP 2: MUSLIM-FRIENDLY REQUIREMENTS */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-safari-green border-b pb-3">2. Faith & Comfort Preferences</h2>
              <p className="text-sm text-gray-500">Select all that apply to ensure your trip aligns with your values.</p>
              <div className="space-y-4">
                <CheckboxItem label="100% Halal Meals Required" name="halalMeals" checked={formData.halalMeals} onChange={handleChange} />
                <CheckboxItem label="Prayer Facilities & Qibla Direction in Rooms" name="prayerFacilities" checked={formData.prayerFacilities} onChange={handleChange} />
                <CheckboxItem label="Private 4x4 Vehicle (Family Only)" name="privateVehicle" checked={formData.privateVehicle} onChange={handleChange} />
                <CheckboxItem label="Female Tour Guide (for women-only or modesty preference)" name="femaleGuide" checked={formData.femaleGuide} onChange={handleChange} />
                <CheckboxItem label="Modest-Friendly Activities Only (No mixed swimming, etc.)" name="modestActivities" checked={formData.modestActivities} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* STEP 3: ACCOMMODATION & ACTIVITIES */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-safari-green border-b pb-3">3. Stay & Play</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Accommodation Preference</label>
                <select name="accommodation" value={formData.accommodation} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold">
                  <option value="luxury-lodge">Luxury Safari Lodge / Resort</option>
                  <option value="family-villa">Private Family Villa</option>
                  <option value="budget-camp">Budget-Friendly Camp</option>
                  <option value="halal-hotel">Certified Halal Hotel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Activities of Interest (Select multiple)</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Wildlife Safari', 'Snorkelling', 'Spice Tour', 'Cultural Village', 'Dolphin Tour', 'Sunset Cruise'].map(activity => (
                    <label key={activity} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-safari-sand transition">
                      <input type="checkbox" value={activity} checked={formData.activities.includes(activity)} onChange={handleActivityChange} className="h-4 w-4 text-safari-gold rounded focus:ring-safari-gold" />
                      <span className="ml-2 text-sm text-gray-700">{activity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT & REVIEW */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-safari-green border-b pb-3">4. Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
              <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <InputField label="WhatsApp Number (Include Country Code)" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Special Requests or Questions</label>
                <textarea name="specialRequests" rows="4" value={formData.specialRequests} onChange={handleChange} placeholder="e.g., Traveling in Ramadan, need a room near the mosque, celebrating honeymoon..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold"></textarea>
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="px-6 py-3 border-2 border-safari-green text-safari-green rounded-full font-semibold hover:bg-safari-sand transition">
                Back
              </button>
            ) : <div></div>}

            {step < 4 ? (
              <button type="button" onClick={nextStep} className="px-8 py-3 bg-safari-green text-white rounded-full font-semibold hover:bg-safari-teal transition shadow-md">
                Next Step
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving Request...' : 'Submit Booking Request'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// --- REUSABLE FORM COMPONENTS ---

function CheckboxItem({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center p-4 bg-safari-sand rounded-xl cursor-pointer hover:bg-gray-100 transition">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-5 w-5 text-safari-gold rounded focus:ring-safari-gold border-gray-300" />
      <span className="ml-3 text-gray-800 font-medium">{label}</span>
    </label>
  );
}

function InputField({ label, name, type = 'text', value, onChange, required = false }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent" />
    </div>
  );
}