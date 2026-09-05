import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function HalalTourism() {
  const { t } = useLanguage();

  const pillars = [
    { icon: "🍽️", title: t('pillarDiningTitle'), description: t('pillarDiningDesc') },
    { icon: "🕌", title: t('pillarPrayerTitle'), description: t('pillarPrayerDesc') },
    { icon: "🚙", title: t('pillarTravelTitle'), description: t('pillarTravelDesc') },
    { icon: "👩", title: t('pillarGuidesTitle'), description: t('pillarGuidesDesc') },
    { icon: "🌙", title: t('pillarRamadanTitle'), description: t('pillarRamadanDesc') },
    { icon: "🤝", title: t('pillarEthicalTitle'), description: t('pillarEthicalDesc') },
  ];

  return (
    <div className="min-h-screen bg-safari-sand">
      {/* Hero Section */}
      <section className="bg-safari-green text-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-safari-gold text-safari-green px-4 py-1 rounded-full text-sm font-bold mb-4 uppercase tracking-wide">
            {t('yourFaithJourney')}
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            {t('ultimateHalalExp')}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {t('ultimateHalalExpDesc')}
          </p>
        </div>
      </section>

      {/* The 6 Pillars */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-safari-green mb-4">
            {t('whyTravelWithUs')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('whyTravelWithUsDesc')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
              <div className="text-5xl mb-4">{pillar.icon}</div>
              <h3 className="text-xl font-heading font-bold text-safari-green mb-3">{pillar.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-safari-teal text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">{t('readyWorryFree')}</h2>
          <p className="text-gray-200 mb-8 text-lg">{t('readyWorryFreeDesc')}</p>
          <Link to="/booking" className="inline-block bg-safari-gold text-safari-green px-8 py-3 rounded-full font-bold text-lg hover:bg-white transition shadow-lg">
            {t('planMyHalalTrip')}
          </Link>
        </div>
      </section>
    </div>
  );
}
