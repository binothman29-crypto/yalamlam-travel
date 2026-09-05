import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Destinations() {
  const { t } = useLanguage();

  const destinations = [
    {
      id: 1,
      name: t('dZanzibarName'),
      tagline: t('dZanzibarTagline'),
      image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=1000&auto=format&fit=crop",
      description: t('dZanzibarDesc'),
      tours: 12
    },
    {
      id: 2,
      name: t('dSerengetiName'),
      tagline: t('dSerengetiTagline'),
      image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=1000&auto=format&fit=crop",
      description: t('dSerengetiDesc'),
      tours: 8
    },
    {
      id: 3,
      name: t('dNgorongoroName'),
      tagline: t('dNgorongoroTagline'),
      image: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=1000&auto=format&fit=crop",
      description: t('dNgorongoroDesc'),
      tours: 6
    },
    {
      id: 4,
      name: t('dKilimanjaroName'),
      tagline: t('dKilimanjaroTagline'),
      image: "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?q=80&w=1000&auto=format&fit=crop",
      description: t('dKilimanjaroDesc'),
      tours: 4
    },
    {
      id: 5,
      name: t('dTarangireName'),
      tagline: t('dTarangireTagline'),
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop",
      description: t('dTarangireDesc'),
      tours: 5
    },
    {
      id: 6,
      name: t('dManyaraName'),
      tagline: t('dManyaraTagline'),
      image: "https://images.unsplash.com/photo-1549366021-9f761d040a94?q=80&w=1000&auto=format&fit=crop",
      description: t('dManyaraDesc'),
      tours: 4
    }
  ];

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
            <div key={dest.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer">
              <div className="h-64 overflow-hidden relative">
                <img
                  src={dest.image}
                  alt={dest.name}
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
                  <span className="text-sm font-semibold text-safari-teal">{dest.tours} {t('toursAvailable')}</span>
                  <Link to="/tours" className="text-safari-green font-bold text-sm hover:text-safari-gold transition flex items-center gap-1">
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
