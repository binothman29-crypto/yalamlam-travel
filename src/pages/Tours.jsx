import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Tours() {
  // 1. Define State Variables
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Tours');

  // 2. Fetch Data from Database on Page Load
  useEffect(() => {
    const fetchFreshData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tours:", error);
      } else {
        setTours(data); // Save database data to state
      }
      setLoading(false);
    };
    
    fetchFreshData();
  }, []);

  // Categories based on your sitemap
  const categories = [
    { name: 'All Tours', icon: '🌍' },
    { name: 'Zanzibar Tours', icon: '🏝️' },
    { name: 'Tanzania Safaris', icon: '🦁' },
    { name: 'Halal Packages', icon: '🕌' },
    { name: 'Kilimanjaro', icon: '⛰️' },
    { name: 'Beach Holidays', icon: '🏖️' },
    { name: 'Custom Tours', icon: '✨' },
  ];

  // 3. Filter the LIVE database data
  const filteredTours = activeCategory === 'All Tours' 
    ? tours 
    : tours.filter(tour => tour.category === activeCategory);

  return (
    <div className="min-h-screen bg-safari-sand">
       {/* Page Hero */}
       <section className="bg-safari-green text-white py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
             <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Explore Our Tours</h1>
             <p className="text-lg text-gray-300 max-w-2xl mx-auto">From the historic streets of Stone Town to the wild plains of the Serengeti. 100% Halal and Muslim-friendly.</p>
          </div>
       </section>

       <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-1/4 w-full">
             <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                <h3 className="font-heading font-bold text-xl text-safari-green mb-4">Categories</h3>
                <ul className="space-y-2">
                   {categories.map(cat => (
                      <li key={cat.name}>
                         <button 
                            onClick={() => setActiveCategory(cat.name)}
                            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition ${activeCategory === cat.name ? 'bg-safari-green text-white' : 'hover:bg-safari-sand text-gray-700'}`}
                         >
                            <span className="text-xl">{cat.icon}</span>
                            <span className="font-medium">{cat.name}</span>
                         </button>
                      </li>
                   ))}
                </ul>
             </div>
          </aside>

          {/* Main Content Grid */}
          <main className="lg:w-3/4 w-full">
             <h2 className="text-2xl font-heading font-bold text-safari-green mb-8">
                {activeCategory} ({filteredTours.length} Tours)
             </h2>

             {/* Loading State */}
             {loading ? (
               <div className="text-center py-20">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safari-gold mx-auto mb-4"></div>
                 <p className="text-safari-green font-medium">Loading amazing tours...</p>
               </div>
             ) : (
               <div className="grid md:grid-cols-2 gap-8">
                  {filteredTours.map(tour => (
                     <div key={tour.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                        <div className="h-56 overflow-hidden relative">
                           <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           <span className="absolute top-4 right-4 bg-safari-gold text-safari-green text-xs font-bold px-3 py-1 rounded-full">
                              100% Halal
                           </span>
                        </div>
                        <div className="p-6">
                           <h3 className="text-xl font-heading font-bold text-safari-green mb-2">{tour.title}</h3>
                           <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">📍 {tour.location}</p>
                           <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                             <div>
                               <span className="text-xs text-gray-500">From</span>
                               <p className="text-2xl font-bold text-safari-gold">${tour.price}</p>
                             </div>
                             <div className="flex space-x-2">
                               <Link to={`/tours/${tour.id}`} className="bg-safari-gold text-safari-green px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-400 transition">
                                 View Details
                               </Link>
                               <Link to="/booking" className="bg-safari-green text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-safari-teal transition">
                                 Book Now
                               </Link>
                             </div>
                           </div>
                         </div>
                       </div>
                  ))}
               </div>
             )}
             
             {/* Empty State */}
             {!loading && filteredTours.length === 0 && (
               <div className="text-center py-20 bg-white rounded-2xl">
                 <p className="text-gray-500 text-lg">No tours found in this category.</p>
               </div>
             )}
          </main>
       </div>
    </div>
  );
}