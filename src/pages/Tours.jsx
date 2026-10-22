import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function Tours() {
  const { t } = useLanguage();
  // t() returns the key itself when a translation is missing, so new strings
  // fall back to English until they are added to LanguageContext.
  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  // The Destinations page links here as /tours?q=zanzibar
  const [searchParams] = useSearchParams();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchTours = async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load tours:', error);
        setLoadError(tr('toursLoadError', 'We could not load the tours. Please refresh the page.'));
      } else {
        setTours(data || []);
      }
      setLoading(false);
    };
    fetchTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1. Filter Logic (null-safe: a tour missing a title/location must not crash the page)
  const query = searchQuery.trim().toLowerCase();
  const filteredTours = tours.filter(tour => {
    const matchesSearch =
      !query ||
      (tour.title || '').toLowerCase().includes(query) ||
      (tour.location || '').toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'All' || tour.category === selectedCategory;
    const matchesPrice = maxPrice === 'All' || Number(tour.price) <= parseInt(maxPrice, 10);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // 2. Sort Logic
  const sortedTours = [...filteredTours].sort((a, b) => {
    if (sortBy === 'price-asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
    if (sortBy === 'price-desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
    if (sortBy === 'duration') {
      // Extracts the number from strings like "3 Days" or "5 Days"
      const numA = parseInt(a.duration, 10) || 0;
      const numB = parseInt(b.duration, 10) || 0;
      return numA - numB;
    }
    return 0; // Default: newest first (from DB order)
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-safari-green">{t('loadingTours')}</div>;

  return (
    <div className="min-h-screen bg-safari-sand py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-safari-green mb-4">{t('exploreToursTitle')}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('exploreToursSubtitle')}</p>
        </div>

        {loadError && (
          <div role="alert" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {loadError}
          </div>
        )}

        {/* Advanced Filter Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder={t('searchTours')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-green focus:border-transparent outline-none"
              />
            </div>

            {/* Category - option values stay in English: they must match the category values stored in the database */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-green outline-none bg-white"
            >
              <option value="All">{t('allCategories')}</option>
              <option value="Zanzibar Tours">{t('zanzibarTours')}</option>
              <option value="Tanzania Safaris">{t('tanzaniaSafaris')}</option>
              <option value="Halal Packages">{t('halalPackages')}</option>
              <option value="Kilimanjaro">{t('kilimanjaro')}</option>
            </select>

            {/* Max Price */}
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-green outline-none bg-white"
            >
              <option value="All">{t('anyPrice')}</option>
              <option value="500">{t('under500')}</option>
              <option value="1000">{t('under1000')}</option>
              <option value="2000">{t('under2000')}</option>
              <option value="5000">{t('under5000')}</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-green outline-none bg-white"
            >
              <option value="newest">{t('newestFirst')}</option>
              <option value="price-asc">{t('priceLowHigh')}</option>
              <option value="price-desc">{t('priceHighLow')}</option>
              <option value="duration">{t('durationShort')}</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-6 font-medium">
          {t('showingTours')} {sortedTours.length} {sortedTours.length === 1 ? t('tour') : t('toursPlural')}
        </p>

        {/* Tours Grid */}
        {sortedTours.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-2xl text-gray-400 mb-4">🔍</p>
            <h3 className="text-xl font-bold text-gray-700">{t('noToursFound')}</h3>
            <p className="text-gray-500">{t('tryAdjustingFilters')}</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setMaxPrice('All'); }}
              className="mt-4 text-safari-green font-bold hover:underline"
            >
              {t('clearAllFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTours.map(tour => (
              <Link key={tour.id} to={`/tours/${tour.id}`} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <img
                    loading="lazy"
                    src={tour.image_url || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80'}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {tour.halal_percentage > 0 && (
                    <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      ✅ {tour.halal_percentage}% {t('halalFriendly') || 'Halal'}
                    </span>
                  )}
                  <span className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-safari-green text-sm font-bold px-3 py-1 rounded-lg shadow-sm">
                    {tour.duration}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-bold text-safari-gold uppercase tracking-wide mb-2">{tour.category}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-safari-green transition-colors line-clamp-2">
                    {tour.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                    {tour.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div>
                      <span className="text-xs text-gray-500 block">{t('startingFrom')}</span>
                      <span className="text-2xl font-bold text-safari-green">${tour.price}</span>
                    </div>
                    <span className="bg-safari-green text-white px-4 py-2 rounded-full text-sm font-bold group-hover:bg-safari-teal transition-colors">
                      {t('viewDetails')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
