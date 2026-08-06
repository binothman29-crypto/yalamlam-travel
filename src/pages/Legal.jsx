import { useParams, Link } from 'react-router-dom';

export default function Legal() {
  const { type } = useParams();

  const pages = {
    terms: {
      title: "Terms & Conditions",
      content: `
        <p class="mb-4">Welcome to Yalamlam Travel & Tours. By accessing our website and booking our services, you agree to the following terms and conditions.</p>
        <h3 class="text-xl font-bold text-safari-green mt-6 mb-2">1. Bookings & Reservations</h3>
        <p class="mb-4">All bookings are subject to availability. A booking is only confirmed once you receive a written confirmation email from us and the required deposit has been received.</p>
        <h3 class="text-xl font-bold text-safari-green mt-6 mb-2">2. Pricing & Payments</h3>
        <p class="mb-4">Prices are quoted in USD and are subject to change without notice until a booking is confirmed. Full payment is required before the commencement of the tour unless otherwise agreed in writing.</p>
        <h3 class="text-xl font-bold text-safari-green mt-6 mb-2">3. Halal & Religious Services</h3>
        <p class="mb-4">We strive to provide 100% Halal-certified meals and prayer-friendly itineraries. However, we operate in various regions and cannot guarantee Halal certification at every single remote stop. We advise guests to bring their own snacks if they have strict dietary requirements.</p>
        <h3 class="text-xl font-bold text-safari-green mt-6 mb-2">4. Liability</h3>
        <p class="mb-4">Yalamlam Travel & Tours acts as an agent for independent suppliers. We are not liable for any injury, loss, or damage caused by the negligence of these suppliers or events beyond our control (Force Majeure).</p>
      `
    },
    privacy: {
      title: "Privacy Policy",
      content: `
        <p class="mb-4">At Yalamlam Travel & Tours, we respect your privacy and are committed to protecting your personal data.</p>
        <h3 class="text-xl font-bold text-safari-green mt-6 mb-2">1. Information We Collect</h3>
        <p class="mb-4">We collect personal information that you provide to us, such as your name, email address, phone number, and passport details, strictly for the purpose of processing your bookings.</p>
        <h3 class="text-xl font-bold text-safari-green mt-6 mb-2">2. How We Use Your Data</h3>
        <p class="mb-4">Your data is used to confirm bookings, send pre-tour reminders, and communicate with you regarding your trip. We will never sell your data to third parties.</p>
        <h3 class="text-xl font-bold text-safari-green mt-6 mb-2">3. Data Security</h3>
        <p class="mb-4">We use industry-standard encryption and secure databases (Supabase) to store your information. You have the right to request the deletion of your data at any time by contacting us.</p>
      `
    },
    cancellation: {
      title: "Cancellation & Refund Policy",
      content: `
        <p class="mb-4">We understand that plans can change. Here is our fair and transparent cancellation policy.</p>
        <h3 class="text-xl font-bold text-safari-green mt-6 mb-2">1. Cancellations by the Customer</h3>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li><strong>More than 14 days before tour:</strong> Full refund minus a 10% administrative fee.</li>
          <li><strong>7 to 14 days before tour:</strong> 50% refund.</li>
          <li><strong>Less than 7 days before tour:</strong> No refund.</li>
        </ul>
        <h3 class="text-xl font-bold text-safari-green mt-6 mb-2">2. Cancellations by Yalamlam Travel</h3>
        <p class="mb-4">If we must cancel a tour due to unforeseen circumstances (e.g., severe weather, political unrest), you will receive a full refund or the option to reschedule at no extra cost.</p>
        <h3 class="text-xl font-bold text-safari-green mt-6 mb-2">3. No-Shows</h3>
        <p class="mb-4">Failure to arrive at the designated meeting point at the scheduled time will be considered a "No-Show" and no refund will be issued.</p>
      `
    }
  };

  const currentPage = pages[type] || pages.terms;

  return (
    <div className="min-h-screen bg-safari-sand py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg">
        <Link to="/" className="text-sm text-gray-500 hover:text-safari-green mb-6 inline-block">← Back to Home</Link>
        <h1 className="text-3xl md:text-4xl font-bold text-safari-green mb-8">{currentPage.title}</h1>
        <div className="prose prose-lg text-gray-700" dangerouslySetInnerHTML={{ __html: currentPage.content }} />
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">If you have any questions about these policies, please contact us at <a href="mailto:admin@yalamlamtravel.com" className="text-safari-green font-bold hover:underline">admin@yalamlamtravel.com</a> or WhatsApp us at +255 778 265 758.</p>
        </div>
      </div>
    </div>
  );
}