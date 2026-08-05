import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchTour = async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setTour(data);
        // Set the first image in the gallery (or the main image_url) as active
        const images = data.gallery && data.gallery.length > 0 ? data.gallery : [data.image_url];
        setActiveImage(0);
      }
      setLoading(false);
    };
    fetchTour();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-safari-green">Loading tour details...</div>;
  if (!tour) return <div className="min-h-screen flex items-center justify-center">Tour not found. <Link to="/tours" className="text-safari-green underline">Go back</Link></div>;

  const images = tour.gallery && tour.gallery.length > 0 ? tour.gallery : [tour.image_url];

  return (
    <div className="min-h-screen bg-safari-sand py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Link to="/tours" className="text-sm text-gray-500 hover:text-safari-green mb-4 inline-block">← Back to All Tours</Link>

        {/* Title & Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-safari-green mb-2">{tour.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">📍 {tour.location}</span>
            <span className="flex items-center gap-1">⏱️ {tour.duration}</span>
            {tour.is_halal && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">✅ 100% Halal Certified</span>}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-lg">
            <img src={images[activeImage]} alt={tour.title} className="w-full h-96 object-cover" />
          </div>
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">
            {images.map((img, index) => (
              <button 
                key={index} 
                onClick={() => setActiveImage(index)}
                className={`flex-shrink-0 w-24 h-24 md:w-full md:h-28 rounded-xl overflow-hidden border-2 transition ${activeImage === index ? 'border-safari-gold' : 'border-transparent'}`}
              >
                <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-safari-green mb-4">About This Tour</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.description}</p>
            </div>

            {/* Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-bold text-safari-green mb-4">Day-by-Day Itinerary</h2>
                <div className="space-y-4">
                  {tour.itinerary.map((day, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-safari-gold text-white rounded-full flex items-center justify-center font-bold">
                        D{index + 1}
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{day}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included & Excluded */}
            <div className="grid md:grid-cols-2 gap-6">
              {tour.included && tour.included.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">What's Included ✅</h3>
                  <ul className="space-y-2">
                    {tour.included.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                        <span className="text-green-600 mt-1">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tour.excluded && tour.excluded.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">What's Excluded ❌</h3>
                  <ul className="space-y-2">
                    {tour.excluded.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                        <span className="text-red-600 mt-1">✕</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Booking Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-safari-green">${tour.price}</span>
                <span className="text-gray-500 text-sm">per person</span>
              </div>

              <Link 
                to={`/booking?tour=${encodeURIComponent(tour.title)}&price=${tour.price}`}
                className="w-full bg-safari-gold text-white py-4 rounded-full font-bold text-lg hover:bg-yellow-600 transition shadow-md text-center block mb-4"
              >
                Book This Tour Now
              </Link>

              <p className="text-xs text-gray-500 text-center">
                No payment required today. We will contact you to confirm availability and arrange secure payment.
              </p>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <span className="text-safari-green">📞</span> 
                  <span>Need help? WhatsApp us</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-safari-green">🛡️</span> 
                  <span>Free cancellation up to 48h before</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}