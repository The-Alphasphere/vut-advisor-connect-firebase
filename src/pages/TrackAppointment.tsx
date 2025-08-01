import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Calendar, Clock, User, MapPin, MessageSquare, X, Download } from 'lucide-react';
import Header from '@/components/Header';
import FooterSmall from '@/components/FooterSmall';
import { useToast } from '@/hooks/use-toast';
import { getStoredSessions } from '@/utils/mockData';

const TrackAppointment = () => {
  const { toast } = useToast();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [sessionData, setSessionData] = useState(null);

  // Mock session data
  const mockSession = {
    id: "REF123456789",
    student: "John Doe",
    advisor: "Dr. Sarah Ndlovu",
    date: "2025-01-15",
    time: "10:00-11:00",
    mode: "Online",
    reason: "Academic Planning",
    course: "Computer Science",
    faculty: "Applied and Computer Sciences",
    status: "Confirmed",
    comments: "Looking forward to discussing course selection for next semester."
  };

  const handleSearch = async () => {
    if (!referenceNumber.trim()) {
      toast({
        title: "Reference Number Required",
        description: "Please enter your reference number to track your appointment.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Search in mock data
      const sessions = getStoredSessions();
      const session = sessions.find(s => s.reference_code === referenceNumber);

      if (!session) {
        setSessionData(null);
        toast({
          title: "Session Not Found",
          description: "No appointment found with this reference number. Please check and try again.",
          variant: "destructive"
        });
        return;
      }

      const sessionDetails = session.session_details as any;
      const formattedSession = {
        id: session.reference_code,
        student: session.student_name,
        advisor: session.advisor_name,
        date: new Date(session.session_date).toLocaleDateString(),
        time: new Date(session.session_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        mode: sessionDetails?.mode || 'N/A',
        reason: sessionDetails?.reason || 'N/A',
        course: sessionDetails?.course || 'N/A',
        faculty: sessionDetails?.faculty || 'N/A',
        status: session.status,
        comments: sessionDetails?.concerns || ''
      };

      setSessionData(formattedSession);
      toast({
        title: "Session Found!",
        description: "Your appointment details are displayed below. Log in to see more information and manage your session.",
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelSession = () => {
    toast({
      title: "Session Cancelled",
      description: "Your appointment has been cancelled successfully. You will receive a confirmation email.",
    });
    setSessionData(null);
    setReferenceNumber('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Appointment</h1>
            <p className="text-lg text-gray-600">Enter your reference number to view and manage your session</p>
          </div>

          {/* Search Section */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="bg-blue-700 text-white">
              <CardTitle className="text-xl flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Search Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Enter your reference number (e.g., REF123456789)"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} className="bg-blue-700 hover:bg-blue-800">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Details */}
          {sessionData && (
            <Card className="shadow-lg">
              <CardHeader className="bg-green-700 text-white">
                <CardTitle className="text-xl flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                      <span><strong>Date:</strong> {sessionData.date}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-4 w-4 mr-2 text-purple-600" />
                      <span><strong>Time:</strong> {sessionData.time}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-indigo-600" />
                      <span><strong>Mode:</strong> {sessionData.mode}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-blue-800 text-sm">
                        <strong>Want to see more details or manage your session?</strong><br />
                        Please log in to your student dashboard for full access to your appointment information and additional options.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <FooterSmall />
    </div>
  );
};

export default TrackAppointment;