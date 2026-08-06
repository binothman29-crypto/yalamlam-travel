import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    home: 'Home',
    tours: 'Tours',
    halalTourism: 'Halal Tourism',
    destinations: 'Destinations',
    contact: 'Contact',
    login: 'Login',
    register: 'Sign Up',
    bookNow: 'Book Now',
    myDashboard: 'My Dashboard',
    logout: 'Logout',
    
    // Home Page
    heroTitle: 'Experience the Wild,',
    heroSubtitle: 'Without Compromising Your Faith',
    heroDescription: 'Premium African safaris with guaranteed Halal meals, private prayer facilities, and modest-friendly itineraries.',
    certified: '100% MUSLIM-FRIENDLY & HALAL CERTIFIED',
    exploreTours: 'Explore Tours',
    whyChooseUs: 'Why Choose Yalamlam?',
    
    // Common
    price: 'Price',
    duration: 'Duration',
    days: 'Days',
    learnMore: 'Learn More',
    viewDetails: 'View Details',
    startingFrom: 'Starting from',
    perPerson: 'per person',
    bookThisTour: 'Book This Tour Now',
    noPaymentRequired: 'No payment required today. We will contact you to confirm availability.',
    needHelp: 'Need help? WhatsApp us',
    freeCancellation: 'Free cancellation up to 48h before',
    
    // Tour Details
    aboutTour: 'About This Tour',
    itinerary: 'Day-by-Day Itinerary',
    included: "What's Included",
    excluded: "What's Excluded",
    halalCertified: '100% Halal Certified',
    customerReviews: 'Customer Reviews',
    writeReview: 'Write a Review',
    shareExperience: 'Share your experience',
    yourName: 'Your Name',
    rating: 'Rating',
    excellent: 'Excellent',
    good: 'Good',
    average: 'Average',
    poor: 'Poor',
    terrible: 'Terrible',
    tellUsAboutTrip: 'Tell us about your trip...',
    submitReview: 'Submit Review',
    noReviewsYet: 'No reviews yet. Be the first to share your experience!',
    reviewPending: 'JazakAllah Khair! Your review has been submitted and is pending admin approval.',
    
    // Booking
    bookingForm: 'Booking Form',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    startDate: 'Start Date',
    endDate: 'End Date',
    numberOfGuests: 'Number of Guests',
    specialRequests: 'Special Requests',
    submitBooking: 'Submit Booking Request',
    bookingSuccess: 'Booking request submitted successfully! We will contact you within 24 hours.',
    
    // Contact
    contactUs: 'Contact Us',
    contactDescription: 'Have questions? We\'re here to help you plan your perfect Halal safari.',
    name: 'Name',
    message: 'Message',
    sendMessage: 'Send Message',
    messageSuccess: 'Message sent successfully! We\'ll get back to you soon.',
    
    // Footer
    quickLinks: 'Quick Links',
    legalPolicies: 'Legal & Policies',
    termsConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    cancellationPolicy: 'Cancellation Policy',
    contactInfo: 'Contact Us',
    reservations: 'Reservations',
    zanzibarOffice: 'Zanzibar Office',
    customerSupport: 'Customer Support',
    allRightsReserved: 'All Rights Reserved',
    
    // Filters
    searchTours: 'Search tours or locations...',
    allCategories: 'All Categories',
    anyPrice: 'Any Price',
    under500: 'Under $500',
    under1000: 'Under $1,000',
    under2000: 'Under $2,000',
    under5000: 'Under $5,000',
    sortBy: 'Sort By',
    newestFirst: 'Newest First',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    durationShort: 'Duration: Shortest First',
    showingTours: 'Showing',
    tours: 'tours',
    tour: 'tour',
    noToursFound: 'No tours found',
    tryAdjustingFilters: 'Try adjusting your filters or search query.',
    clearAllFilters: 'Clear all filters',
    
    // Categories
    zanzibarTours: 'Zanzibar Tours',
    tanzaniaSafaris: 'Tanzania Safaris',
    halalPackages: 'Halal Packages',
    kilimanjaro: 'Kilimanjaro',
  },
  
  ar: {
    // Navigation
    home: 'الرئيسية',
    tours: 'الجولات',
    halalTourism: 'السياحة الحلال',
    destinations: 'الوجهات',
    contact: 'اتصل بنا',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    bookNow: 'احجز الآن',
    myDashboard: 'لوحة التحكم',
    logout: 'تسجيل الخروج',
    
    // Home Page
    heroTitle: 'استكشف البرية،',
    heroSubtitle: 'دون المساس بإيمانك',
    heroDescription: 'رحلات سفاري أفريقية متميزة مع وجبات حلال مضمونة، ومرافق صلاة خاصة، وبرامج مناسبة للحياء.',
    certified: '100% صديق للمسلمين ومعتمد حلال',
    exploreTours: 'استكشف الجولات',
    whyChooseUs: 'لماذا تختار يلملم؟',
    
    // Common
    price: 'السعر',
    duration: 'المدة',
    days: 'أيام',
    learnMore: 'اعرف المزيد',
    viewDetails: 'عرض التفاصيل',
    startingFrom: 'ابتداءً من',
    perPerson: 'للشخص',
    bookThisTour: 'احجز هذه الجولة الآن',
    noPaymentRequired: 'لا حاجة للدفع اليوم. سنتواصل معك لتأكيد التوفر.',
    needHelp: 'تحتاج مساعدة؟ راسلنا على واتساب',
    freeCancellation: 'إلغاء مجاني حتى 48 ساعة قبل',
    
    // Tour Details
    aboutTour: 'عن هذه الجولة',
    itinerary: 'البرنامج اليومي',
    included: 'ما يشمل',
    excluded: 'ما لا يشمل',
    halalCertified: 'معتمد 100% حلال',
    customerReviews: 'تقييمات العملاء',
    writeReview: 'اكتب تقييمك',
    shareExperience: 'شارك تجربتك',
    yourName: 'اسمك',
    rating: 'التقييم',
    excellent: 'ممتاز',
    good: 'جيد',
    average: 'متوسط',
    poor: 'ضعيف',
    terrible: 'سيء جداً',
    tellUsAboutTrip: 'أخبرنا عن رحلتك...',
    submitReview: 'إرسال التقييم',
    noReviewsYet: 'لا توجد تقييمات بعد. كن الأول!',
    reviewPending: 'جزاك الله خيراً! تم إرسال تقييمك في انتظار الموافقة.',
    
    // Booking
    bookingForm: 'نموذج الحجز',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    numberOfGuests: 'عدد الضيوف',
    specialRequests: 'طلبات خاصة',
    submitBooking: 'إرسال طلب الحجز',
    bookingSuccess: 'تم إرسال طلب الحجز بنجاح! سنتواصل معك خلال 24 ساعة.',
    
    // Contact
    contactUs: 'اتصل بنا',
    contactDescription: 'هل لديك أسئلة؟ نحن هنا لمساعدتك في التخطيط لرحلتك المثالية.',
    name: 'الاسم',
    message: 'الرسالة',
    sendMessage: 'إرسال الرسالة',
    messageSuccess: 'تم إرسال الرسالة بنجاح! سنتواصل معك قريباً.',
    
    // Footer
    quickLinks: 'روابط سريعة',
    legalPolicies: 'الشروط والسياسات',
    termsConditions: 'الشروط والأحكام',
    privacyPolicy: 'سياسة الخصوصية',
    cancellationPolicy: 'سياسة الإلغاء',
    contactInfo: 'اتصل بنا',
    reservations: 'الحجوزات',
    zanzibarOffice: 'مكتب زنجبار',
    customerSupport: 'دعم العملاء',
    allRightsReserved: 'جميع الحقوق محفوظة',
    
    // Filters
    searchTours: 'ابحث عن الجولات أو الوجهات...',
    allCategories: 'جميع الفئات',
    anyPrice: 'أي سعر',
    under500: 'أقل من 500$',
    under1000: 'أقل من 1,000$',
    under2000: 'أقل من 2,000$',
    under5000: 'أقل من 5,000$',
    sortBy: 'ترتيب حسب',
    newestFirst: 'الأحدث أولاً',
    priceLowHigh: 'السعر: من الأقل للأعلى',
    priceHighLow: 'السعر: من الأعلى للأقل',
    durationShort: 'المدة: الأقصر أولاً',
    showingTours: 'عرض',
    tours: 'جولة',
    tour: 'جولة',
    noToursFound: 'لم يتم العثور على جولات',
    tryAdjustingFilters: 'حاول تعديل الفلاتر أو البحث.',
    clearAllFilters: 'مسح جميع الفلاتر',
    
    // Categories
    zanzibarTours: 'جولات زنجبار',
    tanzaniaSafaris: 'سفاري تنزانيا',
    halalPackages: 'باقات حلال',
    kilimanjaro: 'كليمنجارو',
  },
  
  fr: {
    // Navigation
    home: 'Accueil',
    tours: 'Circuits',
    halalTourism: 'Tourisme Halal',
    destinations: 'Destinations',
    contact: 'Contact',
    login: 'Connexion',
    register: 'S\'inscrire',
    bookNow: 'Réserver',
    myDashboard: 'Mon Tableau de Bord',
    logout: 'Déconnexion',
    
    // Home Page
    heroTitle: 'Découvrez la Nature,',
    heroSubtitle: 'Sans Compromettre Votre Foi',
    heroDescription: 'Safaris africains premium avec repas halal garantis, installations de prière privées et itinéraires adaptés.',
    certified: '100% COMPATIBLE MUSULMAN & CERTIFIÉ HALAL',
    exploreTours: 'Explorer les Circuits',
    whyChooseUs: 'Pourquoi Choisir Yalamlam?',
    
    // Common
    price: 'Prix',
    duration: 'Durée',
    days: 'Jours',
    learnMore: 'En Savoir Plus',
    viewDetails: 'Voir Détails',
    startingFrom: 'À partir de',
    perPerson: 'par personne',
    bookThisTour: 'Réserver ce Circuit',
    noPaymentRequired: 'Aucun paiement requis aujourd\'hui. Nous vous contacterons.',
    needHelp: 'Besoin d\'aide? WhatsApp-nous',
    freeCancellation: 'Annulation gratuite jusqu\'à 48h avant',
    
    // Tour Details
    aboutTour: 'À Propos de ce Circuit',
    itinerary: 'Itinéraire Jour par Jour',
    included: 'Ce qui est Inclus',
    excluded: 'Ce qui est Exclu',
    halalCertified: '100% Certifié Halal',
    customerReviews: 'Avis des Clients',
    writeReview: 'Écrire un Avis',
    shareExperience: 'Partagez votre expérience',
    yourName: 'Votre Nom',
    rating: 'Note',
    excellent: 'Excellent',
    good: 'Bien',
    average: 'Moyen',
    poor: 'Médiocre',
    terrible: 'Terrible',
    tellUsAboutTrip: 'Parlez-nous de votre voyage...',
    submitReview: 'Soumettre l\'Avis',
    noReviewsYet: 'Pas encore d\'avis. Soyez le premier!',
    reviewPending: 'JazakAllah Khair! Votre avis est en attente d\'approbation.',
    
    // Booking
    bookingForm: 'Formulaire de Réservation',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    startDate: 'Date de Début',
    endDate: 'Date de Fin',
    numberOfGuests: 'Nombre de Personnes',
    specialRequests: 'Demandes Spéciales',
    submitBooking: 'Soumettre la Réservation',
    bookingSuccess: 'Réservation soumise! Nous vous contacterons sous 24h.',
    
    // Contact
    contactUs: 'Contactez-nous',
    contactDescription: 'Des questions? Nous sommes là pour vous aider.',
    name: 'Nom',
    message: 'Message',
    sendMessage: 'Envoyer',
    messageSuccess: 'Message envoyé! Nous vous répondrons bientôt.',
    
    // Footer
    quickLinks: 'Liens Rapides',
    legalPolicies: 'Légal & Politiques',
    termsConditions: 'Conditions Générales',
    privacyPolicy: 'Politique de Confidentialité',
    cancellationPolicy: 'Politique d\'Annulation',
    contactInfo: 'Contactez-nous',
    reservations: 'Réservations',
    zanzibarOffice: 'Bureau Zanzibar',
    customerSupport: 'Support Client',
    allRightsReserved: 'Tous Droits Réservés',
    
    // Filters
    searchTours: 'Rechercher circuits ou destinations...',
    allCategories: 'Toutes Catégories',
    anyPrice: 'Tout Prix',
    under500: 'Moins de 500$',
    under1000: 'Moins de 1,000$',
    under2000: 'Moins de 2,000$',
    under5000: 'Moins de 5,000$',
    sortBy: 'Trier par',
    newestFirst: 'Plus Récents',
    priceLowHigh: 'Prix: Croissant',
    priceHighLow: 'Prix: Décroissant',
    durationShort: 'Durée: Plus Court',
    showingTours: 'Affichage',
    tours: 'circuits',
    tour: 'circuit',
    noToursFound: 'Aucun circuit trouvé',
    tryAdjustingFilters: 'Essayez d\'ajuster vos filtres.',
    clearAllFilters: 'Effacer les filtres',
    
    // Categories
    zanzibarTours: 'Circuits Zanzibar',
    tanzaniaSafaris: 'Safaris Tanzanie',
    halalPackages: 'Forfaits Halal',
    kilimanjaro: 'Kilimandjaro',
  },
  
  tr: {
    // Navigation
    home: 'Ana Sayfa',
    tours: 'Turlar',
    halalTourism: 'Helal Turizm',
    destinations: 'Destinasyonlar',
    contact: 'İletişim',
    login: 'Giriş Yap',
    register: 'Kaydol',
    bookNow: 'Rezervasyon',
    myDashboard: 'Panelim',
    logout: 'Çıkış',
    
    // Home Page
    heroTitle: 'Vahşi Doğayı Keşfet,',
    heroSubtitle: 'İmanınızdan Ödün Vermeden',
    heroDescription: 'Garantili helal yemekler, özel namaz alanları ve mütevazı programlarla premium Afrika safari turları.',
    certified: '100% MÜSLÜMAN DOSTU & HELAL SERTİFİKALI',
    exploreTours: 'Turları Keşfet',
    whyChooseUs: 'Neden Yalamlam?',
    
    // Common
    price: 'Fiyat',
    duration: 'Süre',
    days: 'Gün',
    learnMore: 'Daha Fazla',
    viewDetails: 'Detayları Gör',
    startingFrom: 'Başlangıç',
    perPerson: 'kişi başı',
    bookThisTour: 'Bu Turu Rezervasyon Yap',
    noPaymentRequired: 'Bugün ödeme gerekmez. Uygunluk için sizi arayacağız.',
    needHelp: 'Yardıma mı ihtiyacınız var? WhatsApp',
    freeCancellation: '48 saat öncesine kadar ücretsiz iptal',
    
    // Tour Details
    aboutTour: 'Bu Tur Hakkında',
    itinerary: 'Günlük Program',
    included: 'Dahil Olanlar',
    excluded: 'Dahil Olmayanlar',
    halalCertified: '100% Helal Sertifikalı',
    customerReviews: 'Müşteri Yorumları',
    writeReview: 'Yorum Yaz',
    shareExperience: 'Deneyiminizi Paylaşın',
    yourName: 'Adınız',
    rating: 'Değerlendirme',
    excellent: 'Mükemmel',
    good: 'İyi',
    average: 'Ortalama',
    poor: 'Zayıf',
    terrible: 'Çok Kötü',
    tellUsAboutTrip: 'Seyahatiniz hakkında bize anlatın...',
    submitReview: 'Yorum Gönder',
    noReviewsYet: 'Henüz yorum yok. İlk siz olun!',
    reviewPending: 'Cezakallahu Hayran! Yorumunuz onay bekliyor.',
    
    // Booking
    bookingForm: 'Rezervasyon Formu',
    firstName: 'Ad',
    lastName: 'Soyad',
    email: 'E-posta',
    phone: 'Telefon',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    numberOfGuests: 'Misafir Sayısı',
    specialRequests: 'Özel İstekler',
    submitBooking: 'Rezervasyon Gönder',
    bookingSuccess: 'Rezervasyon alındı! 24 saat içinde size ulaşacağız.',
    
    // Contact
    contactUs: 'Bize Ulaşın',
    contactDescription: 'Sorularınız mı var? Mükemmel helal safari planlamanız için burayız.',
    name: 'İsim',
    message: 'Mesaj',
    sendMessage: 'Gönder',
    messageSuccess: 'Mesaj gönderildi! Yakında dönüş yapacağız.',
    
    // Footer
    quickLinks: 'Hızlı Bağlantılar',
    legalPolicies: 'Yasal & Politikalar',
    termsConditions: 'Şartlar ve Koşullar',
    privacyPolicy: 'Gizlilik Politikası',
    cancellationPolicy: 'İptal Politikası',
    contactInfo: 'İletişim',
    reservations: 'Rezervasyonlar',
    zanzibarOffice: 'Zanzibar Ofisi',
    customerSupport: 'Müşteri Desteği',
    allRightsReserved: 'Tüm Hakları Saklıdır',
    
    // Filters
    searchTours: 'Tur veya destinasyon ara...',
    allCategories: 'Tüm Kategoriler',
    anyPrice: 'Her Fiyat',
    under500: '500$ Altı',
    under1000: '1,000$ Altı',
    under2000: '2,000$ Altı',
    under5000: '5,000$ Altı',
    sortBy: 'Sırala',
    newestFirst: 'En Yeni',
    priceLowHigh: 'Fiyat: Düşükten Yükseğe',
    priceHighLow: 'Fiyat: Yüksekten Düşüğe',
    durationShort: 'Süre: En Kısa',
    showingTours: 'Gösteriliyor',
    tours: 'tur',
    tour: 'tur',
    noToursFound: 'Tur bulunamadı',
    tryAdjustingFilters: 'Filtrelerinizi ayarlamayı deneyin.',
    clearAllFilters: 'Filtreleri Temizle',
    
    // Categories
    zanzibarTours: 'Zanzibar Turları',
    tanzaniaSafaris: 'Tanzanya Safarileri',
    halalPackages: 'Helal Paketler',
    kilimanjaro: 'Kilimanjaro',
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Check localStorage for saved language
    const savedLang = localStorage.getItem('yalamlam_lang') || 'en';
    setLang(savedLang);
    setIsRTL(savedLang === 'ar');
    
    // Set HTML direction
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;
  }, []);

  const changeLanguage = (languageCode) => {
    setLang(languageCode);
    setIsRTL(languageCode === 'ar');
    localStorage.setItem('yalamlam_lang', languageCode);
    document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = languageCode;
  };

  const t = (key) => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, t, changeLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;