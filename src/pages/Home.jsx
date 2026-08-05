const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;

export default function Home() {
  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center bg-cover bg-center" 
               style={{backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2000&auto=format&fit=crop')"}}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <span className="inline-block bg-safari-gold text-safari-green px-4 py-1 rounded-full text-sm font-bold mb-4 uppercase tracking-wide">
            100% Muslim-Friendly Travel & Halal Safaris 
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight">
            Experience the Wild, <br/> <span className="text-safari-gold">Without Compromising Your Faith</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            Premium African safaris with guaranteed Halal meals, private prayer facilities, and modest-friendly itineraries.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-safari-green mb-4">Tailored for the Muslim Traveler</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard icon={<LeafIcon />} title="100% Halal Dining" description="Gourmet meals prepared with strictly Halal ingredients." />
          <FeatureCard icon={<MoonIcon />} title="Prayer Facilities" description="All lodges provide clean prayer mats and Qibla direction." />
          <FeatureCard icon={<UsersIcon />} title="Private & Modest" description="Private 4x4 vehicles for your family only." />
          <FeatureCard icon={<MapIcon />} title="Ramadan Ready" description="Suhoor and Iftar schedules and packed meals for game drives." />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 text-center group hover:-translate-y-2">
      <div className="bg-safari-sand text-safari-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-safari-green group-hover:text-safari-gold transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-heading font-bold mb-3 text-safari-green">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}