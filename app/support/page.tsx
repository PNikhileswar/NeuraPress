import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Support - NeuraPress',
  description: 'Get help and support for NeuraPress. Contact our team for assistance.',
};
export default function SupportPage() {
  const supportOptions = [
    {
      icon: 'ðŸ“§',
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      action: 'nikhileswarpalivela@gmail.com',
      type: 'email'
    },
    {
      icon: '',
      title: 'Documentation',
      description: 'Browse our comprehensive guides and tutorials',
      action: '/api-docs',
      type: 'link'
    },
    {
      icon: 'â“',
      title: 'FAQ',
      description: 'Find answers to commonly asked questions',
      action: '#faq',
      type: 'anchor'
    }
  ];
  const faqs = [
    {
      question: 'How does AI article generation work?',
      answer: 'NeuraPress uses advanced language models to generate high-quality articles based on trending topics, news sources, and user preferences. Our AI analyzes current trends and creates engaging content while maintaining factual accuracy.'
    },
    {
      question: 'Can I customize the generated content?',
      answer: 'Yes! All generated articles can be edited, customized, and refined to match your brand voice and requirements. You have full control over the final content before publication.'
    },
    {
      question: 'How often is content updated?',
      answer: 'Our platform continuously monitors trending topics and news sources, updating content recommendations in real-time. You can generate fresh articles on-demand or set up automated publishing schedules.'
    },
    {
      question: 'Is there a limit to article generation?',
      answer: 'Generation limits depend on your subscription plan. Free users can generate up to 10 articles per month, while premium plans offer unlimited generation with priority processing.'
    },
    {
      question: 'Can I integrate NeuraPress with my existing website?',
      answer: 'Yes! NeuraPress offers a comprehensive API and various integration options, including WordPress plugins, headless CMS integration, and direct API access for custom implementations.'
    },
    {
      question: 'How do you ensure content quality and accuracy?',
      answer: 'Our AI models are trained on high-quality datasets and include fact-checking mechanisms. Additionally, all generated content goes through automated quality checks and can be reviewed before publication.'
    }
  ];
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Support Center
            </h1>
            <p className="text-xl text-green-100">
              We're here to help you succeed with NeuraPress
            </p>
          </div>
        </div>
      </section>
      {/* Support Options */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Can We Help?</h2>
            <p className="text-lg text-gray-600">
              Choose the best way to get the support you need
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {supportOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{option.title}</h3>
                <p className="text-gray-600 mb-4">{option.description}</p>
                {option.type === 'email' && (
                  <a 
                    href={`mailto:${option.action}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send Email
                  </a>
                )}
                {option.type === 'link' && (
                  <a 
                    href={option.action}
                    className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Docs
                  </a>
                )}
                {option.type === 'anchor' && (
                  <a 
                    href={option.action}
                    className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View FAQ
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section id="faq" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Quick answers to common questions about NeuraPress
              </p>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-gray-50 rounded-lg p-6">
                  <summary className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
                    {faq.question}
                  </summary>
                  <div className="mt-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Contact Form Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Still Need Help?
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Send us a message and we'll get back to you as soon as possible.
            </p>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a topic</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please describe your question or issue in detail..."
                  required
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}