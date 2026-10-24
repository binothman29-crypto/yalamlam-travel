import { Link } from 'react-router-dom';

export default function HalalResorts() {
  return (
    <div className="min-h-screen bg-safari-sand py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg">
        {/* Breadcrumb */}
        <Link to="/" className="text-sm text-safari-green hover:underline mb-6 inline-block">← Back to Home</Link>

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-safari-green mb-4">
          Top 5 Halal-Friendly Family Resorts in Zanzibar (2026 Guide)
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Published on October 24, 2026 • By Yalamlam Travel Team
        </p>
        
        <div className="prose prose-lg text-gray-700 max-w-none">
          <p className="mb-6">
            Planning a family vacation to Zanzibar is exciting, but for Muslim families, finding the right accommodation can sometimes feel like a puzzle. You want beautiful beaches, great food, and a relaxing environment, but you also need peace of mind regarding <strong>Halal food, modest environments, and privacy</strong>.
          </p>
          <p className="mb-6">
            The good news? Zanzibar is over 99% Muslim, making it one of the easiest and most welcoming destinations in the world for Halal travel. Here is our curated list of the top 5 Halal-friendly resorts and accommodation styles perfect for Muslim families.
          </p>

          <h2 className="text-2xl font-bold text-safari-green mt-8 mb-4">1. Baraza Resort & Spa (The Cultural Choice)</h2>
          <p className="mb-6">
            Inspired by traditional Omani architecture, Baraza Resort feels like stepping into a luxurious Arabian palace. The design is inherently modest, and the staff are incredibly accommodating to Halal dietary requirements. It’s perfect for families who want a touch of history and elegance with their beach holiday.
          </p>

          <h2 className="text-2xl font-bold text-safari-green mt-8 mb-4">2. The Palms Zanzibar (Ultra-Luxury & Private)</h2>
          <p className="mb-6">
            If you are looking for the ultimate private escape, The Palms offers exclusive villas with private pools. Because the villas are so secluded, families have complete control over their environment. You can request 100% Halal catering, and the staff are trained to respect the privacy and modesty of their guests.
          </p>

          <h2 className="text-2xl font-bold text-safari-green mt-8 mb-4">3. Essque Zalu Zanzibar (Modern & Family-Friendly)</h2>
          <p className="mb-6">
            Located on the pristine northern coast, Essque Zalu is fantastic for families. They offer spacious family suites and have a dedicated kids' club. While it is a large resort, they are very accustomed to hosting Muslim families and will gladly arrange Halal meals and provide prayer mats upon request.
          </p>

          <h2 className="text-2xl font-bold text-safari-green mt-8 mb-4">4. Zawadi Hotel (Boutique & Serene)</h2>
          <p className="mb-6">
            Zawadi (which means "gift" in Swahili) is a boutique, adults-focused property that is incredibly peaceful. While it's better suited for couples or families with older teens, its minimalist design, private beach, and highly personalized Halal dining make it a favorite for those seeking a quiet, modest retreat.
          </p>

          <h2 className="text-2xl font-bold text-safari-green mt-8 mb-4">5. Private Luxury Villas in Nungwi or Kendwa (The Ultimate Freedom)</h2>
          <p className="mb-6">
            Honestly? The <strong>absolute best</strong> option for a 100% worry-free Halal family holiday is renting a private beachfront villa. 
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Private Pool:</strong> No need to worry about modest swimwear around strangers.</li>
            <li><strong>Private Chef:</strong> You control exactly what goes into your food. 100% Halal, every single meal.</li>
            <li><strong>Space:</strong> Families can relax, pray, and spend time together without any interruptions.</li>
          </ul>

          <h2 className="text-2xl font-bold text-safari-green mt-8 mb-4">What to Look for When Booking</h2>
          <p className="mb-6">
            When researching resorts, always look for these three things:
          </p>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li><strong>Halal Food Policy:</strong> Do they have a dedicated Halal kitchen, or can they source Halal meat locally? (In Zanzibar, almost all local meat is Halal, but it's good to confirm).</li>
            <li><strong>Private vs. Shared Spaces:</strong> Does the resort offer private dining or secluded beach areas?</li>
            <li><strong>Alcohol-Free Zones:</strong> Some resorts have specific family sections that are free from alcohol service.</li>
          </ol>

          {/* Call to Action */}
          <div className="bg-safari-green/10 border-l-4 border-safari-green p-6 rounded-r-xl mt-8 mb-8">
            <h3 className="text-xl font-bold text-safari-green mb-2">Need Help Planning Your Stay?</h3>
            <p className="mb-4">
              At <strong>Yalamlam Travel</strong>, we don't just book tours; we help you plan the entire Halal experience. Whether you need a private villa recommendation, airport transfers, or a family-friendly Safari Blue tour, we've got you covered.
            </p>
            <Link 
              to="/contact" 
              className="inline-block bg-safari-gold text-white px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition shadow-md"
            >
              Contact Us for a Free Consultation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}