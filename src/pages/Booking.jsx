import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

const WHATSAPP_NUMBER = '255778265758';
const todayISO = () => new Date().toLocaleDateString('en-CA');

export default function Booking() {
  const { t } = useLanguage();
  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const [searchParams] = useSearchParams();
  const tourTitle = (searchParams.get('tour') || '').trim();
  const tourPrice = (searchParams.get('price') || '').trim();

  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(null);

  // DYNAMIC ITINERARY BUILDER STATE
  const initialItinerary = tourTitle 
    ? [{ location: 'Custom Tour', days: 1, notes: `Specific Request: ${tourTitle} (Quoted: $${tourPrice})` }]
    : [{ location: 'Zanzibar', days: 3, notes: '' }];

  const [itinerary, setItinerary] = useState(initialItinerary);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    guests: 2,
    halalMeals: true,
    prayerFacilities: true,
    privateVehicle: true,
    femaleGuide: false,
    modestActivities: true,
    accommodation: 'luxury-lodge',
    activities: [],
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  // --- ITINERARY BUILDER FUNCTIONS ---
  const addDestination = () => {
    setItinerary([...itinerary, { location: 'Zanzibar', days: 2, notes: '' }]);
  };

  const removeDestination = (index) => {
    if (itinerary.length > 1) {
      setItinerary(itinerary.filter((_, i) => i !== index));
    }
  };

  const updateDestination = (index, field, value) => {
    const newItinerary = [...itinerary];
    newItinerary[index][field] = value;
    setItinerary(newItinerary);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleActivityChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      activities: checked ? [...prev.activities, value] : prev.activities.filter(act => act !== value)
    }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.startDate || !formData.endDate) {
        return tr('datesRequired', 'Please choose your overall start and end dates.');
      }
      if (formData.startDate < todayISO()) {
        return tr('startInPast', 'The start date cannot be in the past.');
      }
      if (formData.endDate < formData.startDate) {
        return tr('endBeforeStart', 'The end date cannot be before the start date.');
      }
      if (!(parseInt(formData.guests, 10) >= 1)) {
        return tr('guestsMin', 'Please enter at least 1 guest.');
      }
      // Validate itinerary
      for (let i = 0; i < itinerary.length; i++) {
        if (!itinerary[i].location) return `Please select a location for Destination ${i + 1}.`;
        if (parseInt(itinerary[i].days, 10) < 1) return `Please enter at least 1 day for Destination ${i + 1}.`;
      }
    }
    return '';
  };

  const nextStep = () => {
    const problem = validateStep(step);
    if (problem) {
      setStepError(problem);
      return;
    }
    setStepError('');
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setStepError('');
    setStep(prev => prev - 1);
  };

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
    setSubmitError('');

    const problem = validateStep(1);
    if (problem) {
      setStep(1);
      setStepError(problem);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const guests = Math.max(1, parseInt(formData.guests, 10) || 1);

      // Format the custom itinerary into a clean string
      const itinerarySummary = itinerary.map((leg, i) => 
        `📍 Leg ${i + 1}: ${leg.location} (${leg.days} Days) - ${leg.notes || 'Standard exploration'}`
      ).join('\n');

      const specialRequests = [itinerarySummary, formData.specialRequests.trim()].filter(Boolean).join('\n\n');

      const { error } = await supabase.from('bookings').insert([
        {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          destination: 'Custom Multi-Destination', // Fixed value for custom builder
          start_date: formData.startDate,
          end_date: formData.endDate,
          guests,
          halal_meals: formData.halalMeals,
          prayer_facilities: formData.prayerFacilities,
          private_vehicle: formData.privateVehicle,
          female_guide: formData.femaleGuide,
          modest_activities: formData.modestActivities,
          accommodation: formData.accommodation,
          activities: formData.activities,
          special_requests: specialRequests,
          status: 'pending',
          user_id: user ? user.id : null
        }
      ]);

      if (error) {
        console.error("Database error:", error);
        setSubmitError(tr('bookingSaveError', 'Sorry, we could not save your booking. Please try again, or WhatsApp us directly.'));
        return;
      }

      const message = `
🌍 *NEW YALAMLAM TRAVEL CUSTOM ITINERARY REQUEST*
---------------------------------
📅 *Overall Dates:* ${formData.startDate} to ${formData.endDate}
👥 *Total Guests:* ${guests}

🗺️ *CUSTOM ITINERARY:*
${itinerarySummary}

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

📝 *ADDITIONAL NOTES:*
${formData.specialRequests.trim() || 'None'}
      `.trim();

      setCompleted({
        whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
        loggedIn: Boolean(user),
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      setSubmitError(tr('bookingUnexpectedError', 'Something went wrong. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 4) * 100;
  const today = todayISO();

  if (completed) {
    return (
      <div className="min-h-screen bg-safari-sand py-12 px-4">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg text-center space-y-5">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-safari-green">
            {tr('bookingSavedTitle', 'JazakAllah Khair! Your custom request is saved.')}
          </h1>
          <p className="text-gray-600">
            {tr('bookingSavedBody', 'One last step: send your custom itinerary to us on WhatsApp so our experts can build your perfect quote.')}
          </p>
          <a
            href={completed.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-green-700 transition shadow-md"
          >
            {tr('continueOnWhatsApp', 'Send Itinerary on WhatsApp')}
          </a>
          <div className="pt-2">
            <Link
              to={completed.loggedIn ? '/dashboard' : '/'}
              className="text-sm font-medium text-safari-green hover:text-safari-teal underline"
            >
              {completed.loggedIn ? tr('viewMyBookings', 'View my bookings') : tr('backToHome', 'Back to home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-safari-sand py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-safari-green mb-2">{t('planSafariTitle')}</h1>
          <p className="text-gray-600">{t('planSafariDesc')}</p>
        </div>

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

          {/* STEP 1: CUSTOM ITINERARY BUILDER */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-safari-green border-b pb-3">Build Your Custom Itinerary</h2>
              <p className="text-sm text-gray-500">Tell us the overall dates and group size, then add each destination you want to visit.</p>

              {/* Overall Trip Details */}
              <div className="bg-safari-sand/50 p-4 rounded-xl border border-safari-gold/30 space-y-4">
                <h3 className="font-bold text-safari-green">Overall Trip Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                    <input type="date" name="startDate" min={today} value={formData.startDate} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                    <input type="date" name="endDate" min={formData.startDate || today} value={formData.endDate} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Number of Guests</label>
                  <input type="number" name="guests" min="1" max="50" value={formData.guests} onChange={handleChange} required className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" />
                </div>
              </div>

              {/* Dynamic Itinerary Legs */}
              <div className="space-y-4">
                <h3 className="font-bold text-safari-green">Trip Destinations</h3>
                {itinerary.map((leg, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                    {itinerary.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeDestination(index)} 
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        ✕ Remove
                      </button>
                    )}
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">Destination {index + 1}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                        <select 
                          value={leg.location} 
                          onChange={(e) => updateDestination(index, 'location', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold bg-white"
                        >
                          <option value="Zanzibar">Zanzibar</option>
                          <option value="Serengeti">Serengeti National Park</option>
                          <option value="Ngorongoro">Ngorongoro Crater</option>
                          <option value="Kilimanjaro">Mount Kilimanjaro</option>
                          <option value="Tarangire">Tarangire National Park</option>
                          <option value="Custom">Other / Custom</option>
                        </select>
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Number of Days</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="30" 
                          value={leg.days} 
                          onChange={(e) => updateDestination(index, 'days', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" 
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Specific Tours or Notes for this leg (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Safari Blue tour, Private beachfront villa, Spice farm visit..." 
                          value={leg.notes} 
                          onChange={(e) => updateDestination(index, 'notes', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={addDestination}
                  className="w-full py-3 border-2 border-dashed border-safari-green text-safari-green rounded-xl font-bold hover:bg-safari-green hover:text-white transition flex items-center justify-center gap-2"
                >
                  <span>+</span> Add Another Destination
                </button>
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
                <textarea name="specialRequests" rows="4" maxLength={2000} value={formData.specialRequests} onChange={handleChange} placeholder="Any dietary restrictions, flight details, or special celebrations?" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold"></textarea>
              </div>
            </div>
          )}

          {(stepError || submitError) && (
            <div role="alert" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-6 text-sm">
              {stepError || submitError}
            </div>
          )}

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
                className="w-full ml-4 bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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