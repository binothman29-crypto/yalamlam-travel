import { Link } from 'react-router-dom';

export default function HalalTourism() {
  const pillars = [
    {
      icon: "🍽️",
      title: "100% Halal Dining",
      description: "We partner exclusively with certified Halal kitchens. From gourmet lodge dinners to packed safari lunches, you will never have to question your food. No alcohol in the minibar, no cross-contamination."
    },
    {
      icon: "🕌",
      title: "Prayer Facilities Everywhere",
      description: "Every vehicle is equipped with a clean prayer mat and Qibla compass. Our partner lodges provide dedicated prayer rooms, and our guides are trained to adjust the itinerary around Salah times."
    },
    {
      icon: "🚙",
      title: "Private & Modest Travel",
      description: "Travel in your own private 4x4 safari vehicle with just your family and your guide. We avoid crowded, mixed-gender group tours, ensuring your privacy and modesty are always respected."
    },
    {
      icon: "👩",
      title: "Female Guides & Staff",
      description: "Traveling with the ladies? We can arrange female tour guides, female drivers, and women-only spa and excursion activities for a completely comfortable experience."
    },
    {
      icon: "🌙",
      title: "Ramadan & Eid Specials",
      description: "Traveling during the holy month? We provide customized Suhoor and Iftar schedules, packed iftar boxes for game drives, and special Eid celebration arrangements."
    },
    {
      icon: "🤝",
      title: "Ethical & Responsible",
      description: "Islam teaches us to be stewards of the earth. Our safaris are eco-friendly, we respect local wildlife, and we give back to the local Tanzanian communities we visit."
    }
  ];

  return (
    <div className="min-h-screen bg-safari-sand">
      {/* Hero Section */}
      <section className="bg-safari-green text-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-safari-gold text-safari-green px-4 py-1 rounded-full text-sm font-bold mb-4 uppercase tracking-wide">
            Your Faith, Your Journey
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            The Ultimate Halal Tourism Experience
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Explore the wild beauty of Tanzania and the paradise of Zanzibar without ever compromising your Islamic values. We handle the details; you enjoy the blessings.
          </p>
        </div>
      </section>

      {/* The 6 Pillars */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-safari-green mb-4">
            Why Travel With Us?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We don't just add Halal food to a standard tour. We build the entire itinerary from the ground up with the Muslim traveler in mind.
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
          <h2 className="text-3xl font-heading font-bold mb-4">Ready for a Worry-Free Safari?</h2>
          <p className="text-gray-200 mb-8 text-lg">Let us craft a custom itinerary that perfectly balances adventure, relaxation, and your spiritual needs.</p>
          <Link to="/booking" className="inline-block bg-safari-gold text-safari-green px-8 py-3 rounded-full font-bold text-lg hover:bg-white transition shadow-lg">
            Plan My Halal Trip
          </Link>
        </div>
      </section>
    </div>
  );
}