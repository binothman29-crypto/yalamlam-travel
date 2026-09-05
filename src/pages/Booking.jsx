import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function Booking() {
  const { t } = useLanguage();
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

  // Activities are stored in the database in English regardless of UI language,
  // so the "value" here stays fixed while only the visible label is translated.
  const activityOptions = [
    { value: 'Wildlife Safari', label: t('actWildlifeSafari') },
    { value: 'Snorkelling', label: t('actSnorkelling') },
    { value: 'Spice Tour', label: t('actSpiceTour') },
    { value: 'Cultural Village', label: t('actCulturalVillage') },
    { value: 'Dolphin Tour', label: t('actDolphinTour') },
    { value: 'Sunset Cruise', label: t('actSunsetCruise') },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
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
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-safari-green mb-2">{t('planSafariTitle')}</h1>
          <p className="text-gray-600">{t('planSafariDesc')}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium text-safari-green">
            <span>{t('step')} {step} {t('of')} 4</span>
            <span>{Math.round(progress)}% {t('complete')}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-safari-gold h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg">

          {/* STEP 1: TRIP DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-safari-green border-b pb-3">{t('step1Title')}</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('whereToGo')}</label>
                <select name="destination" value={formData.destination} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent">
                  <option value="zanzibar">{t('destZanzibar')}</option>
                  <option value="serengeti">{t('destSerengeti')}</option>
                  <option value="kilimanjaro">{t('destKilimanjaro')}</option>
                  <option value="custom">{t('destCustom')}</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('startDate')}</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('endDate')}</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('numberOfGuests')}</label>
                <input type="number" name="guests" min="1" value={formData.guests} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
              </div>
            </div>
          )}

          {/* STEP 2: MUSLIM-FRIENDLY REQUIREMENTS */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-safari-green border-b pb-3">{t('step2Title')}</h2>
              <p className="text-sm text-gray-500">{t('step2Subtitle')}</p>
              <div className="space-y-4">
                <CheckboxItem label={t('halalMealsRequired')} name="halalMeals" checked={formData.halalMeals} onChange={handleChange} />
                <CheckboxItem label={t('prayerFacilitiesQibla')} name="prayerFacilities" checked={formData.prayerFacilities} onChange={handleChange} />
                <CheckboxItem label={t('privateVehicleLabel')} name="privateVehicle" checked={formData.privateVehicle} onChange={handleChange} />
                <CheckboxItem label={t('femaleGuideLabel')} name="femaleGuide" checked={formData.femaleGuide} onChange={handleChange} />
                <CheckboxItem label={t('modestActivitiesLabel')} name="modestActivities" checked={formData.modestActivities} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* STEP 3: ACCOMMODATION & ACTIVITIES */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-safari-green border-b pb-3">{t('step3Title')}</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('accommodationPref')}</label>
                <select name="accommodation" value={formData.accommodation} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold">
                  <option value="luxury-lodge">{t('accLuxury')}</option>
                  <option value="family-villa">{t('accVilla')}</option>
                  <option value="budget-camp">{t('accBudget')}</option>
                  <option value="halal-hotel">{t('accHalalHotel')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{t('activitiesInterest')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {activityOptions.map(activity => (
                    <label key={activity.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-safari-sand transition">
                      <input type="checkbox" value={activity.value} checked={formData.activities.includes(activity.value)} onChange={handleActivityChange} className="h-4 w-4 text-safari-gold rounded focus:ring-safari-gold" />
                      <span className="ml-2 text-sm text-gray-700">{activity.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT & REVIEW */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-safari-green border-b pb-3">{t('step4Title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label={t('firstName')} name="firstName" value={formData.firstName} onChange={handleChange} required />
                <InputField label={t('lastName')} name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
              <InputField label={t('emailAddress')} name="email" type="email" value={formData.email} onChange={handleChange} required />
              <InputField label={t('whatsappNumberLabel')} name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('specialRequests')}</label>
                <textarea name="specialRequests" rows="4" value={formData.specialRequests} onChange={handleChange} placeholder={t('specialRequestsPlaceholder')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold"></textarea>
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="px-6 py-3 border-2 border-safari-green text-safari-green rounded-full font-semibold hover:bg-safari-sand transition">
                {t('back')}
              </button>
            ) : <div></div>}

            {step < 4 ? (
              <button type="button" onClick={nextStep} className="px-8 py-3 bg-safari-green text-white rounded-full font-semibold hover:bg-safari-teal transition shadow-md">
                {t('nextStep')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('savingRequest') : t('submitBooking')}
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
