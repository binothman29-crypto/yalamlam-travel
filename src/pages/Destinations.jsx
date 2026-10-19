import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

// `keyword` is matched (case-insensitively) against each tour's title, location
// and category to count the tours for that destination, and is passed to
// /tours?q=... so the link lands on a filtered list.
const DESTINATIONS = [
  { id: 1, key: 'dZanzibar', keyword: 'zanzibar', image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=1000&auto=format&fit=crop" },
  { id: 2, key: 'dSerengeti', keyword: 'serengeti', image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=1000&auto=format&fit=crop" },
  { id: 3, key: 'dNgorongoro', keyword: 'ngorongoro', image: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=1000&auto=format&fit=crop" },
  { id: 4, key: 'dKilimanjaro', keyword: 'kilimanjaro', image: "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?q=80&w=1000&auto=format&fit=crop" },
  { id: 5, key: 'dTarangire', keyword: 'tarangire', image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop" },
  { id: 6, key: 'dManyara', keyword: 'manyara', image: "https://images.unsplash.com/photo-1549366021-9f761d040a94?q=80&w=1000&auto=format&fit=crop" },
];

export default function Destinations() {
  const { t } = useLanguage();
  // null = not loaded yet (or failed): show no count rather than a wrong one.
  const [tours, setTours] = useState(null);

  useEffect(() => {
    const loadTours = async () => {
      const { data, error } = await supabase.from('tours').select('title, location, category');
      if (error) {
        console.error('Failed to load tours for destination counts:', error);
        return;
      }
      setTours(data || []);
    };
    loadTours();
  }, []);

  const countFor = (keyword) => {
    if (!tours) return null;
    return tours.filter(tour =>
      `${tour.title || ''} ${tour.location || ''} ${tour.category || ''}`.toLowerCase().includes(keyword)
    ).length;
  };

  const destinations = DESTINATIONS.map(dest => ({
    ...dest,
    name: t(`${dest.key}Name`),
    tagline: t(`${dest.key}Tagline`),
    description: t(`${dest.key}Desc`),
    tourCount: countFor(dest.keyword),
  }));

  return (
    <div className="min-h-screen bg-safari-sand">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center bg-cover bg-center"
               style={{backgroundImage: "url('https://images.unsplash.com/photo-1523805009345-7448845a9e53?q=80&w=2000&auto=format&fit=crop')"}}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">{t('discoverTanzania')}</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">{t('discoverTanzaniaDesc')}</p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <div key={dest.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group">
              <div className="h-64 overflow-hidden relative">
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs uppercase tracking-widest text-safari-gold font-bold">{dest.tagline}</p>
                  <h3 className="text-2xl font-heading font-bold">{dest.name}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{dest.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-safari-teal">
                    {dest.tourCount > 0 ? `${dest.tourCount} ${t('toursAvailable')}` : ''}
                  </span>
                  <Link
                    to={`/tours?q=${encodeURIComponent(dest.keyword)}`}
                    className="text-safari-green font-bold text-sm hover:text-safari-gold transition flex items-center gap-1"
                  >
                    {t('viewToursLink')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
