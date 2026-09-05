import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('contacts').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          status: 'new'
        }
      ]);

      if (error) {
        console.error("Database error:", error);
        alert("Sorry, there was an error sending your message.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 4000);

    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-safari-sand">
      {/* Hero Section */}
      <section className="bg-safari-green text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{t('getInTouch')}</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {t('getInTouchDesc')}
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-4 max-w-7xl mx-auto -mt-10">
        <div className="grid md:grid-cols-3 gap-6">

          {/* 1. Phone Numbers Card (Custom Div) */}
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-2 border border-gray-100">
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-xl font-heading font-bold text-safari-green mb-2">{t('callWhatsappUs')}</h3>

            <div className="text-safari-teal font-semibold space-y-1">
              <a href="tel:+255778265758" className="block hover:text-safari-gold transition">+255 778 265 758</a>
              <a href="tel:+255773348401" className="block hover:text-safari-gold transition">+255 773 348 401</a>
              <a href="tel:+255715869725" className="block hover:text-safari-gold transition">+255 715 869 725</a>
            </div>

            <p className="text-gray-500 text-sm mt-3">{t('availableHours')}</p>
          </div>

          {/* 2. Email Card (Using InfoCard Component) */}
          <InfoCard
            icon="📧"
            title={t('emailUsTitle')}
            info="info@yalamlamtravel.com"
            subInfo={t('replyWithin24')}
          />

          {/* 3. Location Card (Using InfoCard Component) */}
          <InfoCard
            icon="📍"
            title={t('visitOurOffice')}
            info={t('officeLocation')}
            subInfo={t('officeCountry')}
          />
        </div>
      </section>

      {/* Form and Map Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto mb-12">
        <div className="grid lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-lg overflow-hidden">

          {/* Contact Form */}
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-heading font-bold text-safari-green mb-2">{t('sendUsMessageTitle')}</h2>
            <p className="text-gray-600 mb-8">{t('sendUsMessageDesc')}</p>

            {isSubmitted && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                {t('contactSuccessBanner')}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('fullName')}</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('emailAddress')}</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('phoneNumber')}</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('yourMessage')}</label>
                <textarea name="message" rows="5" value={formData.message} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-safari-green text-white py-3 rounded-full font-bold text-lg hover:bg-safari-teal transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
              {isSubmitting ? t('sendingEllipsis') : t('sendMessage')}
              </button>
            </form>
          </div>

          {/* Google Map */}
          <div className="relative min-h-[400px] bg-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3978.583742837237!2d39.1857!3d-6.1622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMDknNDMuOSJTIDM5wrAxMScwOC41IkU!5e0!3m2!1sen!2stz!4v1600000000000!5m2!1sen!2stz"
              width="100%"
              height="100%"
              style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Yalamlam Office Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}

// Reusable Card Component
function InfoCard({ icon, title, info, subInfo }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-2 border border-gray-100">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-heading font-bold text-safari-green mb-2">{title}</h3>
      <p className="text-safari-teal font-semibold">{info}</p>
      <p className="text-gray-500 text-sm mt-1">{subInfo}</p>
    </div>
  );
}
