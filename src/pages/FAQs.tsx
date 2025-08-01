
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import Header from '@/components/Header';
import FooterSmall from '@/components/FooterSmall';

const FAQs = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "How do I book an academic advisory session?",
      answer: "To book a session, click on the 'Book Session' button on the homepage or navigate to the Book Session page. Fill in your student information, select your preferred date and time, choose between online or in-person mode, and provide the reason for your appointment. You'll receive a confirmation email with all the details."
    },
    {
      id: 2,
      question: "What information do I need to provide when booking?",
      answer: "You'll need to provide your full name, 9-digit student number, faculty, course, year of study, reason for appointment, preferred date and time, mode of advising (online or in-person), and any additional comments you'd like to share with your advisor."
    },
    {
      id: 3,
      question: "Can I cancel or reschedule my appointment?",
      answer: "Yes, you can cancel your appointment through your student dashboard or by using the unique booking token link sent to your email. For rescheduling, you'll need to cancel your current appointment and book a new one with your preferred time slot."
    },
    {
      id: 4,
      question: "What's the difference between online and in-person sessions?",
      answer: "Online sessions are conducted via Microsoft Teams video calls, while in-person sessions take place at the advisor's office on campus. When you select online mode, a Teams meeting will be automatically scheduled and the meeting details will be sent to both you and your advisor."
    },
    {
      id: 5,
      question: "Who will be my academic advisor?",
      answer: "Your academic advisor is assigned based on your faculty and course. The system will automatically match you with the appropriate advisor who specializes in your area of study. You'll see your assigned advisor's information in the booking confirmation."
    },
    {
      id: 6,
      question: "What if my student number is not recognized?",
      answer: "If you receive an error message stating 'No such student in VUT', please double-check that you've entered your 9-digit student number correctly. If the issue persists, contact the student administration office to verify your enrollment status."
    },
    {
      id: 7,
      question: "How far in advance can I book a session?",
      answer: "You can book sessions for any future date. However, popular time slots may fill up quickly, so we recommend booking at least a week in advance to secure your preferred appointment time."
    },
    {
      id: 8,
      question: "Will I receive confirmation of my booking?",
      answer: "Yes, you'll receive an email confirmation immediately after booking your session. The email will include all session details, your advisor's information, and a PDF attachment with your appointment confirmation. For online sessions, you'll also receive Microsoft Teams meeting details."
    },
    {
      id: 9,
      question: "What should I prepare for my advisory session?",
      answer: "Come prepared with specific questions about your academic journey, course selections, or career goals. If you're discussing course planning, bring your current transcript or course catalog. For career guidance sessions, consider preparing questions about internships, job prospects, or further study options."
    },
    {
      id: 10,
      question: "Can I have multiple sessions with the same advisor?",
      answer: "Absolutely! You can book multiple sessions throughout the semester. Many students find it helpful to have regular check-ins with their advisor to track progress and adjust their academic plans as needed."
    },
    {
      id: 11,
      question: "What if I'm late for my appointment?",
      answer: "Please try to arrive on time for your appointment. If you're running late, contact your advisor as soon as possible. For online sessions, join the Teams meeting as soon as you can. Advisors typically wait 10-15 minutes before considering the appointment a no-show."
    },
    {
      id: 12,
      question: "Is there a cost for academic advisory sessions?",
      answer: "No, academic advisory sessions are completely free for all registered VUT students. This service is part of our commitment to supporting student success and academic achievement."
    }
  ];

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <HelpCircle className="h-12 w-12 text-blue-700" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600">
              Find answers to common questions about the VUT Advisor Connect system
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex justify-between items-center"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    {openFAQ === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-blue-700 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-blue-700 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFAQ === faq.id && (
                    <div className="px-6 pb-6">
                      <div className="border-t pt-4">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 space-y-8">
            {/* Feedback Section */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-green-900 mb-4">Help Us Improve</h2>
                <p className="text-green-700 mb-6">
                  Your feedback is valuable to us. Help us make the VUT Advisor Connect system better by sharing your thoughts.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">What to Add?</h3>
                    <p className="text-sm text-green-600">Suggest new features or improvements</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">What to Improve?</h3>
                    <p className="text-sm text-green-600">Tell us what could work better</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">What to Remove?</h3>
                    <p className="text-sm text-green-600">Point out unnecessary features</p>
                  </div>
                </div>
                <div className="text-center">
                  <a 
                    href="mailto:advisor@vut.ac.za?subject=VUT Advisor Connect Feedback&body=Dear VUT Team,%0A%0AWhat should we add:%0A[Your suggestions here]%0A%0AWhat should we improve:%0A[Your suggestions here]%0A%0AWhat should we remove:%0A[Your suggestions here]%0A%0AAdditional comments:%0A[Your comments here]%0A%0AThank you!"
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Send Feedback
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">Still have questions?</h2>
                <p className="text-blue-700 mb-6">
                  If you couldn't find the answer you're looking for, don't hesitate to contact our support team.
                </p>
                <div className="space-y-2 text-blue-600">
                  <p><strong>Email:</strong> advisor@vut.ac.za</p>
                  <p><strong>Phone:</strong> +27 16 950 9000</p>
                  <p><strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <FooterSmall />
    </div>
  );
};

export default FAQs;
