import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80';

export default function TourDetails() {
  const { t } = useLanguage();
  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchTour = async () => {
      const { data } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setTour(data);
        setActiveImage(0);

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('tour_id', data.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (reviewsData && reviewsData.length > 0) {
          setReviews(reviewsData);
          const total = reviewsData.reduce((sum, r) => sum + r.rating, 0);
          setAvgRating((total / reviewsData.length).toFixed(1));
        }
      }
      setLoading(false);
    };
    fetchTour();
  }, [id]);

  // Use 'tr' to prevent blank pages if translation keys are missing
  if (loading) return <div className="min-h-screen flex items-center justify-center text-safari-green">{tr('loadingTourDetails', 'Loading tour details...')}</div>;
  if (!tour) return <div className="min-h-screen flex items-center justify-center text-gray-800">{tr('tourNotFound', 'Tour not found.')} <Link to="/tours" className="text-safari-green underline ml-1">{tr('goBack', 'Go back to tours')}</Link></div>;

  const galleryImages = Array.isArray(tour.gallery) ? tour.gallery.filter(Boolean) : [];
  const images = galleryImages.length > 0 ? galleryImages : [tour.image_url || FALLBACK_IMAGE];

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert([{
      tour_id: tour.id,
      customer_name: newReview.name.trim(),
      rating: parseInt(newReview.rating, 10),
      comment: newReview.comment.trim(),
      is_approved: false
    }]);

    if (!error) {
      alert(tr('reviewSubmittedAlert', 'JazakAllah Khair! Your review has been submitted and is pending admin approval.'));
      setNewReview({ name: '', rating: 5, comment: '' });
      setShowReviewForm(false);
    } else {
      console.error('Review submit failed:', error);
      alert(tr('reviewErrorAlert', 'Error submitting review. Please try again.'));
    }
    setSubmittingReview(false);
  };

  // Safely parse strings into arrays to prevent ".map is not a function" crashes
  const itineraryArray = Array.isArray(tour.itinerary) 
    ? tour.itinerary 
    : (typeof tour.itinerary === 'string' ? tour.itinerary.split('\n').filter(line => line.trim() !== '') : []);

  const includedArray = Array.isArray(tour.included) 
    ? tour.included 
    : (typeof tour.included === 'string' ? tour.included.split(',').map(i => i.trim()).filter(i => i !== '') : []);

  const excludedArray = Array.isArray(tour.excluded) 
    ? tour.excluded 
    : (typeof tour.excluded === 'string' ? tour.excluded.split(',').map(i => i.trim()).filter(i => i !== '') : []);

  return (
    <div className="min-h-screen bg-safari-sand py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Link to="/tours" className="text-sm text-gray-500 hover:text-safari-green mb-4 inline-block">{tr('backToAllTours', 'Back to all tours')}</Link>

        {/* Title & Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-safari-green mb-2">{tour.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">📍 {tour.location}</span>
            <span className="flex items-center gap-1">⏱️ {tour.duration}</span>
            {/* Updated to show the new halal_percentage */}
            {tour.halal_percentage > 0 && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                ✅ {tour.halal_percentage}% {tr('halalFriendly', 'Halal Friendly')}
              </span>
            )}
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
          {/* Left Column: Details + Reviews */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-safari-green mb-4">{tr('aboutTour', 'About this tour')}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.description}</p>
            </div>

            {/* Itinerary (Safely mapped) */}
            {itineraryArray.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-bold text-safari-green mb-4">{tr('itinerary', 'Itinerary')}</h2>
                <div className="space-y-4">
                  {itineraryArray.map((day, index) => (
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

            {/* Included & Excluded (Safely mapped) */}
            <div className="grid md:grid-cols-2 gap-6">
              {includedArray.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{tr('whatsIncluded', "What's Included")} ✅</h3>
                  <ul className="space-y-2">
                    {includedArray.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                        <span className="text-green-600 mt-1">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {excludedArray.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{tr('whatsExcluded', "What's Excluded")} ❌</h3>
                  <ul className="space-y-2">
                    {excludedArray.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                        <span className="text-red-600 mt-1">✕</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* --- REVIEWS SECTION --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-safari-green">{tr('customerReviews', 'Customer Reviews')}</h2>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-500 text-xl">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
                      <span className="text-gray-600 font-medium">{avgRating} {tr('outOf5', 'out of 5')} ({reviews.length} {tr('reviewsWord', 'reviews')})</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-safari-gold text-white px-6 py-2 rounded-full font-bold hover:bg-yellow-600 transition"
                >
                  {showReviewForm ? tr('cancel', 'Cancel') : tr('writeReview', 'Write a Review')}
                </button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-xl mb-8 space-y-4 border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-800">{tr('shareExperience', 'Share your experience')}</h3>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    placeholder={tr('yourName', 'Your Name')}
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  />
                  <div>
                    <label className="block text-sm font-bold mb-2">{tr('rating', 'Rating')}</label>
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="5">★★★★★ ({tr('excellent', 'Excellent')})</option>
                      <option value="4">★★★★☆ ({tr('good', 'Good')})</option>
                      <option value="3">★★★☆☆ ({tr('average', 'Average')})</option>
                      <option value="2">★★☆☆☆ ({tr('poor', 'Poor')})</option>
                      <option value="1">★☆☆☆☆ ({tr('terrible', 'Terrible')})</option>
                    </select>
                  </div>
                  <textarea
                    required
                    maxLength={2000}
                    placeholder={tr('tellUsAboutTrip', 'Tell us about your trip...')}
                    rows="3"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-safari-green text-white px-6 py-2 rounded-full font-bold hover:bg-safari-teal disabled:opacity-50"
                  >
                    {submittingReview ? tr('submittingEllipsis', 'Submitting...') : tr('submitReview', 'Submit Review')}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-gray-500 italic">{tr('noReviewsYet', 'No reviews yet. Be the first to share your experience!')}</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800">{review.customer_name}</h4>
                        <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{new Date(review.created_at).toLocaleDateString()}</p>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Booking Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-safari-green">${tour.price}</span>
                <span className="text-gray-500 text-sm">{tr('perPerson', 'per person')}</span>
              </div>

              <Link
                to={`/booking?tour=${encodeURIComponent(tour.title)}&price=${encodeURIComponent(tour.price)}`}
                className="w-full bg-safari-gold text-white py-4 rounded-full font-bold text-lg hover:bg-yellow-600 transition shadow-md text-center block mb-4"
              >
                {tr('bookThisTour', 'Book This Tour')}
              </Link>

              <p className="text-xs text-gray-500 text-center">
                {tr('noPaymentRequired', 'No payment required today')}
              </p>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <span className="text-safari-green">📞</span>
                  <span>{tr('needHelp', 'Need help? Contact us')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-safari-green">🛡️</span>
                  <span>{tr('freeCancellation', 'Free cancellation')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}