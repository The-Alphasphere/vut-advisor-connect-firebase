import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Star, Send, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import FooterSmall from '@/components/FooterSmall';
import { useToast } from '@/hooks/use-toast';

const Feedback = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    rating: '',
    whatToAdd: '',
    whatToImprove: '',
    whatToRemove: '',
    additionalComments: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    'User Interface',
    'Booking System',
    'Navigation',
    'Performance',
    'Features',
    'General Feedback'
  ];

  const ratings = [
    { value: '5', label: '5 - Excellent' },
    { value: '4', label: '4 - Very Good' },
    { value: '3', label: '3 - Good' },
    { value: '2', label: '2 - Fair' },
    { value: '1', label: '1 - Poor' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.category) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in your name, email, and feedback category.",
        variant: "destructive"
      });
      return;
    }

    // Simulate submission
    setIsSubmitted(true);
    toast({
      title: "Feedback Submitted!",
      description: "Thank you for your feedback. We'll review it and get back to you soon.",
    });

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        category: '',
        rating: '',
        whatToAdd: '',
        whatToImprove: '',
        whatToRemove: '',
        additionalComments: ''
      });
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
              <p className="text-gray-600 mb-6">
                Your feedback has been submitted successfully. We appreciate your input and will use it to improve VUT Advisor Connect.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting you back to the form in a few seconds...
              </p>
            </CardContent>
          </Card>
        </div>
        
        <FooterSmall />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-16 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <MessageSquare className="h-12 w-12 text-blue-700" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">We Value Your Feedback</h1>
            <p className="text-lg text-gray-600">
              Help us improve VUT Advisor Connect by sharing your thoughts and suggestions
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="bg-blue-700 text-white">
              <CardTitle className="text-2xl">Feedback Form</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Feedback Category and Rating */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Feedback Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Feedback Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Overall Rating</Label>
                      <Select value={formData.rating} onValueChange={(value) => setFormData({ ...formData, rating: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Rate your experience" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {ratings.map((rating) => (
                            <SelectItem key={rating.value} value={rating.value}>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: parseInt(rating.value) }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="ml-2">{rating.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Help Us Improve</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="whatToAdd">What features would you like us to add?</Label>
                      <Textarea
                        id="whatToAdd"
                        value={formData.whatToAdd}
                        onChange={(e) => setFormData({ ...formData, whatToAdd: e.target.value })}
                        placeholder="Suggest new features, functionality, or improvements you'd like to see..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatToImprove">What existing features need improvement?</Label>
                      <Textarea
                        id="whatToImprove"
                        value={formData.whatToImprove}
                        onChange={(e) => setFormData({ ...formData, whatToImprove: e.target.value })}
                        placeholder="Tell us about features that could work better or be more user-friendly..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatToRemove">What features are unnecessary or confusing?</Label>
                      <Textarea
                        id="whatToRemove"
                        value={formData.whatToRemove}
                        onChange={(e) => setFormData({ ...formData, whatToRemove: e.target.value })}
                        placeholder="Point out features that seem unnecessary or make the system confusing..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Comments */}
                <div>
                  <Label htmlFor="additionalComments">Additional Comments</Label>
                  <Textarea
                    id="additionalComments"
                    value={formData.additionalComments}
                    onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
                    placeholder="Any other feedback, suggestions, or comments you'd like to share..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 text-lg"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="mt-12 text-center">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">Other Ways to Reach Us</h2>
                <div className="grid md:grid-cols-3 gap-6 text-blue-700">
                  <div>
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p>advisor@vut.ac.za</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Phone</h3>
                    <p>+27 16 950 9000</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Office Hours</h3>
                    <p>Mon - Fri, 8:00 AM - 5:00 PM</p>
                  </div>
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

export default Feedback;