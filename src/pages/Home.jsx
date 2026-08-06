import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[80vh] flex items-center justify-center text-white text-center px-4 bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80")' }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-safari-gold text-safari-green px-6 py-2 rounded-full font-bold text-sm md:text-base inline-block mb-6 shadow-lg">
            {t('certified')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-heading leading-tight">
            {t('heroTitle')} <br />
            <span className="text-safari-gold">{t('heroSubtitle')}</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
            {t('heroDescription')}
          </p>
          <Link to="/tours" className="bg-safari-green text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-lg inline-block">
            {t('exploreTours')}
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-safari-green mb-12">{t('whyChooseUs')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-safari-sand shadow-sm">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold text-safari-green mb-2">100% Halal Meals</h3>
              <p className="text-gray-600">Every meal is strictly Halal certified, prepared in clean, modest environments.</p>
            </div>
            <div className="p-6 rounded-2xl bg-safari-sand shadow-sm">
              <div className="text-4xl mb-4">🕌</div>
              <h3 className="text-xl font-bold text-safari-green mb-2">Prayer Facilities</h3>
              <p className="text-gray-600">Itineraries are built around prayer times with guaranteed access to clean mosques.</p>
            </div>
            <div className="p-6 rounded-2xl bg-safari-sand shadow-sm">
              <div className="text-4xl mb-4">️</div>
              <h3 className="text-xl font-bold text-safari-green mb-2">Modest & Safe</h3>
              <p className="text-gray-600">Private transfers, modest-friendly guides, and family-oriented environments.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}