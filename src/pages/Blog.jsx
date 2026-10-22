import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Blog() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-safari-sand py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg">
        {/* Breadcrumb */}
        <Link to="/" className="text-sm text-safari-green hover:underline mb-6 inline-block">← Back to Home</Link>

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-safari-green mb-6">
          The Ultimate Guide to a 100% Halal Honeymoon in Zanzibar
        </h1>
        
        <div className="prose prose-lg text-gray-700 max-w-none">
          <p className="mb-6">
            Planning a honeymoon is exciting, but for Muslim couples, it often comes with a unique set of questions: 
            <em> Will the food be Halal? Is the environment modest? Can we get privacy away from alcohol-serving resorts?</em>
          </p>
          <p className="mb-6">
            The good news? Zanzibar is one of the world's best-kept secrets for a luxurious, 100% Halal honeymoon. 
            With its rich Swahili-Islamic heritage, stunning private beaches, and welcoming culture, it is the perfect 
            destination to celebrate your new beginning with peace of mind.
          </p>

          <h2 className="text-2xl font-bold text-safari-green mt-8 mb-4">1. Why Zanzibar is Perfect for Muslim Couples</h2>
          <p className="mb-6">
            Over 99% of Zanzibar's local population is Muslim. This means Halal food is the default, not the exception. 
            From the street food in Stone Town to the fresh seafood on the beaches, you will find delicious, 
            Zabiha-compliant meals everywhere. Furthermore, the culture deeply respects modesty, making it a highly 
            comfortable environment for couples seeking a private, family-friendly atmosphere.
          </p>

          <h2 className="text-2xl font-bold text-safari-green mt-8 mb-4">2. Top 3 Must-Do Halal Honeymoon Experiences</h2>
          <ul className="list-disc pl-6 mb-6 space-y-3">
            <li>
              <strong>Private Sunset Dhow Cruise:</strong> Skip the crowded boats. Book a private, traditional wooden Dhow just for the two of you. Enjoy a modest, private Halal seafood BBQ on a secluded sandbank like Nakupenda.
            </li>
            <li>
              <strong>Secluded Beachfront Villas:</strong> Instead of large, mixed resorts, opt for a private villa. This guarantees complete privacy, your own pool, and the ability to request female staff or private chefs.
            </li>
            <li>
              <strong>Cultural Stone Town Walk:</strong> Explore the UNESCO World Heritage site together. Walk hand-in-hand through the historic alleys and learn about the island's rich Islamic history.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-safari-green mt-8 mb-4">3. Modest Packing Tips for Zanzibar</h2>
          <p className="mb-6">
            While Zanzibar is relaxed, it is respectful to dress modestly, especially in Stone Town and local villages. 
            For the beach, many Muslim couples opt for "burkinis" or modest swimwear, which are widely accepted and available. 
            Lightweight, breathable fabrics that cover the shoulders and knees are perfect for daytime excursions.
          </p>

          {/* Call to Action */}
          <div className="bg-safari-green/10 border-l-4 border-safari-green p-6 rounded-r-xl mt-8 mb-8">
            <h3 className="text-xl font-bold text-safari-green mb-2">Ready to Plan Your Dream Trip?</h3>
            <p className="mb-4">
              At <strong>Yalamlam Travel</strong>, we specialize in curating 100% Halal, modest, and unforgettable honeymoons in Zanzibar. Let us handle every detail for you.
            </p>
            <Link 
              to="/tours" 
              className="inline-block bg-safari-gold text-white px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition shadow-md"
            >
              View Our 6-Day Halal Honeymoon Package →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}