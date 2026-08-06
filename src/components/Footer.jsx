import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-safari-green text-white py-12 px-4 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Section 1: Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Yalamlam Travel & Tours Logo" className="h-16 w-16 rounded-full bg-white p-1" />
            <div>
              <span className="text-2xl font-heading font-bold block text-white">Yalamlam</span>
              <span className="text-sm text-safari-gold font-medium">Travel & Tours</span>
              <span className="text-xs text-safari-gold italic block mt-1">Where Faith Meets Travel Excellence</span>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Your Trusted Partner for Halal Travel Experiences & Tanzania Safaris.
          </p>
        </div>

        {/* Section 2: Quick Links */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-safari-gold">Explore</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><Link to="/tours" className="hover:text-white transition">Zanzibar Tours</Link></li>
            <li><Link to="/tours" className="hover:text-white transition">Tanzania Safaris</Link></li>
            <li><Link to="/halal" className="hover:text-white transition">Halal Packages</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Section 3: Legal & Policies (NEW) */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-safari-gold">Legal & Policies</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><Link to="/legal/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
            <li><Link to="/legal/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link to="/legal/cancellation" className="hover:text-white transition">Cancellation Policy</Link></li>
          </ul>
        </div>

        {/* Section 4: Contact Us */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-safari-gold">Contact Us</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>📧 info@yalamlamtravel.com</li>
            <li>📞 Reservations: +255 778 265 758</li>
            <li>📞 Zanzibar Office: +255 773 348 401</li>
            <li>📞 Support: +255 715 869 725</li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-safari-teal text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Yalamlam Travel & Tours. All Rights Reserved.</p>
      </div>
    </footer>
  );
}