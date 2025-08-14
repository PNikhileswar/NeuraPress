import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Terms of Service - NeuraPress',
  description: 'Terms and conditions for using the NeuraPress platform.',
};
export default function TermsPage() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300">
              Terms and conditions for using the NeuraPress platform.
            </p>
          </div>
        </div>
      </section>
      {/* Content Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600 mb-8">
              <strong>Last updated:</strong> July 1, 2025
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using NeuraPress, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-6">
              Permission is granted to temporarily download one copy of the materials on 
              NeuraPress for personal, non-commercial transitory viewing only. This is the 
              grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on NeuraPress</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-6">
              When you create an account with us, you must provide information that is 
              accurate, complete, and current at all times. You are responsible for 
              safeguarding your account and for all activities that occur under your account.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Content Guidelines</h2>
            <p className="text-gray-700 mb-6">
              Users may contribute content through comments and other interactive features. 
              By submitting content, you agree that:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Your content does not violate any applicable laws</li>
              <li>Your content is not offensive, defamatory, or harmful</li>
              <li>You have the right to submit the content</li>
              <li>NeuraPress may moderate, edit, or remove content at its discretion</li>
            </ul>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              The service and its original content, features, and functionality are and will 
              remain the exclusive property of NeuraPress and its licensors. The service is 
              protected by copyright, trademark, and other laws.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy Policy</h2>
            <p className="text-gray-700 mb-6">
              Your privacy is important to us. Please review our Privacy Policy, which also 
              governs your use of the service, to understand our practices.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimers</h2>
            <p className="text-gray-700 mb-6">
              The information on this website is provided on an "as is" basis. To the fullest 
              extent permitted by law, NeuraPress excludes all representations, warranties, 
              conditions, and other terms which might otherwise have effect in relation to 
              this website.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitations</h2>
            <p className="text-gray-700 mb-6">
              In no event shall NeuraPress or its suppliers be liable for any damages 
              (including, without limitation, damages for loss of data or profit, or due to 
              business interruption) arising out of the use or inability to use the materials 
              on NeuraPress, even if NeuraPress or an authorized representative has been 
              notified orally or in writing of the possibility of such damage.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-700 mb-6">
              We may terminate or suspend your account and bar access to the service 
              immediately, without prior notice or liability, under our sole discretion, 
              for any reason whatsoever including breach of the Terms.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These terms and conditions are governed by and construed in accordance with 
              the laws and you irrevocably submit to the exclusive jurisdiction of the 
              courts in that state or location.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right, at our sole discretion, to modify or replace these 
              Terms at any time. If a revision is material, we will provide at least 30 
              days notice prior to any new terms taking effect.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@neurapress.com<br />
                <strong>Address:</strong> NeuraPress HQ, 123 Innovation Street, Tech City, TC 12345
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}