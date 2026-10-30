import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  // Dynamic reviews state
  const [homepageReviews, setHomepageReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  // Fetch approved reviews for homepage
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*, tours(title)')
          .eq('is_approved', true)
          .eq('rating', 5)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching reviews:', error);
          setReviewsError('Failed to load reviews');
        } else {
          setHomepageReviews(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setReviewsError('Failed to load reviews');
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

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
              <h3 className="text-xl font-bold text-safari-green mb-2">{t('halalMealsTitle')}</h3>
              <p className="text-gray-600">{t('halalMealsDesc')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-safari-sand shadow-sm">
              <div className="text-4xl mb-4">🕌</div>
              <h3 className="text-xl font-bold text-safari-green mb-2">{t('prayerFacilitiesTitle')}</h3>
              <p className="text-gray-600">{t('prayerFacilitiesDesc')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-safari-sand shadow-sm">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-safari-green mb-2">{t('modestSafeTitle')}</h3>
              <p className="text-gray-600">{t('modestSafeDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- DYNAMIC TESTIMONIALS SECTION --- */}
      <section className="py-16 px-4 bg-safari-sand">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-safari-green mb-4">{t('whatOurGuestsSay')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('testimonialsSubtitle', 'Read what Muslim families and couples say about their Halal experiences with us')}
            </p>
          </div>

          {loadingReviews ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-safari-green border-t-transparent"></div>
              <p className="text-gray-500 mt-2">{t('loadingReviews', 'Loading reviews...')}</p>
            </div>
          ) : reviewsError ? (
            <div className="text-center py-12 text-gray-500">
              <p>{t('reviewsLoadError', 'Unable to load reviews at this time.')}</p>
            </div>
          ) : homepageReviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-500">{t('noReviewsYet', 'No reviews yet. Be the first to share your experience!')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {homepageReviews.map((review) => (
                <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-yellow-500 text-2xl mb-4">
                    {'★'.repeat(review.rating)}
                  </div>
                  <p className="text-gray-700 mb-6 italic line-clamp-4">"{review.comment}"</p>
                  <div className="font-bold text-safari-green">
                    {review.customer_name}
                    {review.tours?.title && (
                      <div className="text-xs text-gray-500 font-normal mt-1">
                        {review.tours.title}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- QUICK TRANSFER FLOATING BUTTON --- */}
      <div className="fixed bottom-6 left-6 z-50 hidden md:block">
        <Link to="/transfers" className="flex items-center gap-3 bg-white shadow-xl rounded-full px-5 py-3 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
          <div className="bg-safari-green text-white p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-500 font-medium">Need a ride?</p>
            <p className="text-sm font-bold text-safari-green group-hover:text-safari-teal">Quick Transfer</p>
          </div>
        </Link>
      </div>
    </div>
  );
}