import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function TourDetails() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('tours').select('*').eq('id', id).single();
      if (error) console.error("Error fetching tour:", error);
      else setTour(data);
      setLoading(false);
    };
    fetchTour();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-safari-sand flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safari-gold"></div>
    </div>
  );
  
  if (!tour) return (
    <div className="min-h-screen bg-safari-sand flex items-center justify-center">
      <p className="text-safari-green text-xl">Tour not found.</p>
    </div>
  );

  const inclusionsList = Array.isArray(tour.inclusions) ? tour.inclusions : (tour.inclusions ? tour.inclusions.split(',').map(item => item.trim()) : []);
  const exclusionsList = Array.isArray(tour.exclusions) ? tour.exclusions : (tour.exclusions ? tour.exclusions.split(',').map(item => item.trim()) : []);
  const itineraryLines = tour.itinerary ? tour.itinerary.split('\n').filter(line => line.trim() !== '') : [];

  return (
    <div className="min-h-screen bg-safari-sand">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center bg-cover bg-center" 
               style={{ backgroundImage: `url('${tour.image_url || 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=2000'}')` }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">{tour.title}</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">{tour.description}</p>
        </div>
      </section>

      {/* Tour Details */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Left Column - Tour Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-heading font-bold text-safari-green mb-6">Tour Highlights</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div><h3 className="font-bold text-lg text-safari-green mb-1">Location</h3><p className="text-gray-600">{tour.location}</p></div>
                <div><h3 className="font-bold text-lg text-safari-green mb-1">Duration</h3><p className="text-gray-600">{tour.duration || 'Not specified'}</p></div>
                <div><h3 className="font-bold text-lg text-safari-green mb-1">Price</h3><p className="text-2xl font-bold text-safari-gold">${tour.price}</p></div>
                <div><h3 className="font-bold text-lg text-safari-green mb-1">Category</h3><p className="text-gray-600 capitalize">{tour.category}</p></div>
              </div>
            </div>

            {/* Vehicle Specs Grid (Architect's Trust Builder) */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-heading font-bold text-safari-green mb-6">Your Safari Vehicle</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SpecItem icon="🚙" title="4x4 Land Cruiser" desc="Pop-up roof" />
                <SpecItem icon="️" title="Fridge & Cooler" desc="Cold drinks daily" />
                <SpecItem icon="🔌" title="Charging Ports" desc="Keep devices powered" />
                <SpecItem icon="🕌" title="Prayer Mats" desc="Qibla direction provided" />
              </div>
            </div>
            
            {itineraryLines.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-heading font-bold text-safari-green mb-6">Day-by-Day Itinerary</h2>
                <div className="space-y-6">
                  {itineraryLines.map((line, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-safari-gold text-white flex items-center justify-center mr-4 font-bold">{index + 1}</div>
                      <p className="text-gray-700 pt-1">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Booking & Inclusions */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-8 sticky top-24">
              <h2 className="text-2xl font-heading font-bold text-safari-green mb-4">Book This Tour</h2>
              
              <div className="bg-safari-sand rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Price</span>
                  <span className="text-2xl font-bold text-safari-gold">${tour.price}</span>
                </div>
                <p className="text-gray-600 text-xs">*Price per person. Includes all listed activities and meals.</p>
              </div>
              
              <Link to="/booking" className="w-full bg-safari-green text-white py-4 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md mb-6 block text-center">
                Book Now
              </Link>
              
              {inclusionsList.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-bold text-lg text-safari-green mb-3">What's Included</h3>
                  <ul className="space-y-3">
                    {inclusionsList.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-safari-green mr-2 font-bold">✓</span>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exclusionsList.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-bold text-lg text-red-600 mb-3">What's Excluded</h3>
                  <ul className="space-y-3">
                    {exclusionsList.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2 font-bold">✕</span>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper component for the Vehicle Specs
function SpecItem({ icon, title, desc }) {
  return (
    <div className="bg-safari-sand p-4 rounded-xl text-center hover:shadow-md transition">
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="font-bold text-safari-green text-sm">{title}</h4>
      <p className="text-xs text-gray-600 mt-1">{desc}</p>
    </div>
  );
}