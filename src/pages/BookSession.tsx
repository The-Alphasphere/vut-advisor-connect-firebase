
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Eye, CheckCircle } from 'lucide-react';
import { format, addDays, isWeekend } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { mockAdvisors, getStoredSessions, setStoredSessions, generateSessionId, generateReferenceCode } from '@/utils/mockData';

const BookSession = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    studentNumber: '',
    faculty: '',
    course: '',
    yearOfStudy: '',
    reason: '',
    otherReason: '',
    date: undefined as Date | undefined,
    time: '',
    mode: '',
    sessionType: 'individual',
    groupSize: '',
    groupEmails: [''],
    comments: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookedSlots, setBookedSlots] = useState<{[key: string]: string[]}>({});
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const faculties = [
    'Engineering & Technology',
    'Management Sciences',
    'Applied & Computer Sciences',
    'Human Sciences'
  ];

  const courses = [
    'Computer Science',
    'Information Technology',
    'Engineering',
    'Business Management',
    'Accounting',
    'Marketing'
  ];

  const yearsOfStudy = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Honours', 'Masters', 'Doctorate'];

  const reasons = [
    'Academic Planning',
    'Course Selection',
    'Career Guidance',
    'Study Methods',
    'Time Management',
    'Personal Issues Affecting Studies',
    'Other'
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Load booked sessions to determine availability
  useEffect(() => {
    const loadBookedSessions = () => {
      try {
        // Load sessions from mock data
        const sessions = getStoredSessions();
        const activeSessions = sessions.filter(s => s.status === 'Pending' || s.status === 'Confirmed');

        // Group sessions by date and time
        const bookedByDate: {[key: string]: string[]} = {};
        activeSessions.forEach(session => {
          const sessionDate = new Date(session.session_date);
          const dateKey = format(sessionDate, 'yyyy-MM-dd');
          const timeKey = format(sessionDate, 'HH:mm');
          
          if (!bookedByDate[dateKey]) {
            bookedByDate[dateKey] = [];
          }
          bookedByDate[dateKey].push(timeKey);
        });

        setBookedSlots(bookedByDate);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    loadBookedSessions();
  }, []);

  // Update available time slots when date changes
  useEffect(() => {
    if (formData.date) {
      const dateKey = format(formData.date, 'yyyy-MM-dd');
      const booked = bookedSlots[dateKey] || [];
      
      // Filter out booked time slots to show only available ones
      const available = timeSlots.filter(slot => {
        // Check if this time slot is already booked
        return !booked.includes(slot);
      });
      
      setAvailableTimeSlots(available);
      
      // Clear selected time if it's no longer available
      if (formData.time && booked.includes(formData.time)) {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    } else {
      setAvailableTimeSlots(timeSlots);
    }
  }, [formData.date, bookedSlots, formData.time]);

  // Check if a date should be disabled (weekend, past, or fully booked)
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tenDaysFromNow = addDays(today, 10);
    
    // Disable if: past date, weekend, or more than 10 days from now
    if (date < today || isWeekend(date) || date > tenDaysFromNow) {
      return true;
    }
    
    // Disable if all time slots are booked
    const dateKey = format(date, 'yyyy-MM-dd');
    const booked = bookedSlots[dateKey] || [];
    return booked.length >= timeSlots.length;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Full name cannot contain numbers or symbols';
    }

    if (!formData.studentNumber.trim()) {
      newErrors.studentNumber = 'Student number is required';
    } else if (!/^\d{9}$/.test(formData.studentNumber)) {
      newErrors.studentNumber = 'Student number must be exactly 9 digits';
    }

    if (!formData.faculty) newErrors.faculty = 'Please select a faculty';
    if (!formData.course) newErrors.course = 'Please select a course';
    if (!formData.yearOfStudy) newErrors.yearOfStudy = 'Please select year of study';
    if (!formData.reason) newErrors.reason = 'Please select a reason';
    if (formData.reason === 'Other' && !formData.otherReason.trim()) {
      newErrors.otherReason = 'Please specify the reason when selecting Other';
    }
    
    // Group session validation
    if (formData.sessionType === 'group') {
      if (!formData.groupSize || parseInt(formData.groupSize) < 2) {
        newErrors.groupSize = 'Group size must be at least 2 students';
      }
      
      const validEmails = formData.groupEmails.filter(email => email.trim() && /\S+@\S+\.\S+/.test(email));
      const requiredEmails = parseInt(formData.groupSize) - 1; // Minus 1 for the current student
      
      if (validEmails.length < requiredEmails) {
        newErrors.groupEmails = `Please provide ${requiredEmails} valid email addresses for group members`;
      }
    }
    
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    if (!formData.mode) newErrors.mode = 'Please select a mode of advising';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // Generate unique identifiers
        const sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const referenceCode = `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        
        // Create session date
        const sessionDate = new Date(formData.date!);
        const [hours, minutes] = formData.time.split(':');
        sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Double-check for conflicting sessions before booking
        const existingSessions = getStoredSessions();
        const conflictingSessions = existingSessions.filter(s => 
          s.session_date === sessionDate.toISOString() &&
          (s.status === 'Pending' || s.status === 'Confirmed')
        );
        
        if (conflictingSessions.length > 0) {
          toast({
            title: "Time Slot Unavailable",
            description: "This time slot is already booked. Please select a different time.",
            variant: "destructive"
          });
          return;
        }
        
        // Find a sample advisor from mock data
        const advisor = mockAdvisors.find(a => a.faculty === formData.faculty) || mockAdvisors[0];
        
        // Mock student data
        const student = {
          id: '1',
          name: formData.fullName.split(' ')[0],
          surname: formData.fullName.split(' ').slice(1).join(' '),
          email: 'student@example.com'
        };
        
        // Prepare session data
        const sessionData = {
          id: generateSessionId(),
          session_id: sessionId,
          reference_code: referenceCode,
          student_id: student.id,
          advisor_id: advisor.id,
          session_date: sessionDate.toISOString(),
          student_name: formData.fullName,
          student_email: student.email,
          advisor_name: `${advisor.name} ${advisor.surname}`,
          advisor_email: advisor.email,
          booking_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Pending' as const,
          session_details: {
            faculty: formData.faculty,
            course: formData.course,
            yearOfStudy: formData.yearOfStudy,
            reason: formData.reason === 'Other' ? formData.otherReason : formData.reason,
            mode: formData.mode,
            sessionType: formData.sessionType,
            groupSize: formData.sessionType === 'group' ? formData.groupSize : undefined,
            groupEmails: formData.sessionType === 'group' ? formData.groupEmails.filter(email => email.trim()) : undefined,
            concerns: formData.comments
          }
        };
        
        // Save to localStorage
        setStoredSessions([...existingSessions, sessionData]);
        
        toast({
          title: "Session Booked Successfully!",
          description: `Your session ${referenceCode} has been booked. You can track your appointment using the reference code.`,
        });
        
        // Reset form
        setFormData({
          fullName: '',
          studentNumber: '',
          faculty: '',
          course: '',
          yearOfStudy: '',
          reason: '',
          otherReason: '',
          date: undefined,
          time: '',
          mode: '',
          sessionType: 'individual',
          groupSize: '',
          groupEmails: [''],
          comments: ''
        });
        setShowPreview(false);
        
      } catch (error) {
        console.error('Booking error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-700 text-white">
              <CardTitle className="text-2xl">Book Your Academic Advisory Session</CardTitle>
            </CardHeader>
            <CardContent className="p-8 max-h-[80vh] overflow-y-auto">
              <form className="space-y-6">
                {/* Student Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Student Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                      {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="studentNumber">Student Number *</Label>
                      <Input
                        id="studentNumber"
                        value={formData.studentNumber}
                        onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                        placeholder="9 digits"
                        className={errors.studentNumber ? 'border-red-500' : ''}
                      />
                      {errors.studentNumber && <p className="text-red-500 text-sm mt-1">{errors.studentNumber}</p>}
                    </div>
                    
                    <div>
                      <Label>Faculty *</Label>
                      <Select value={formData.faculty} onValueChange={(value) => setFormData({ ...formData, faculty: value })}>
                        <SelectTrigger className={errors.faculty ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {faculties.map((faculty) => (
                            <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.faculty && <p className="text-red-500 text-sm mt-1">{errors.faculty}</p>}
                    </div>
                    
                    <div>
                      <Label>Course *</Label>
                      <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
                        <SelectTrigger className={errors.course ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {courses.map((course) => (
                            <SelectItem key={course} value={course}>{course}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label>Year of Study *</Label>
                      <Select value={formData.yearOfStudy} onValueChange={(value) => setFormData({ ...formData, yearOfStudy: value })}>
                        <SelectTrigger className={errors.yearOfStudy ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select year of study" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {yearsOfStudy.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.yearOfStudy && <p className="text-red-500 text-sm mt-1">{errors.yearOfStudy}</p>}
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Appointment Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Session Type */}
                    <div className="md:col-span-2">
                      <Label>Session Type *</Label>
                      <Select value={formData.sessionType} onValueChange={(value) => setFormData({ ...formData, sessionType: value, groupSize: '', groupEmails: [''] })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select session type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="individual">Individual Session</SelectItem>
                          <SelectItem value="group">Group Session</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Group Session Fields */}
                    {formData.sessionType === 'group' && (
                      <>
                        <div>
                          <Label htmlFor="groupSize">Number of Students in Group *</Label>
                          <Input
                            id="groupSize"
                            type="number"
                            min="2"
                            max="10"
                            value={formData.groupSize}
                            onChange={(e) => {
                              const size = parseInt(e.target.value) || 0;
                              const emailCount = Math.max(0, size - 1); // Minus 1 for the current student
                              const newEmails = Array(emailCount).fill('').map((_, i) => formData.groupEmails[i] || '');
                              setFormData({ ...formData, groupSize: e.target.value, groupEmails: newEmails });
                            }}
                            placeholder="e.g., 3"
                            className={errors.groupSize ? 'border-red-500' : ''}
                          />
                          {errors.groupSize && <p className="text-red-500 text-sm mt-1">{errors.groupSize}</p>}
                        </div>

                        {parseInt(formData.groupSize) > 1 && (
                          <div className="md:col-span-2">
                            <Label>Group Members' Email Addresses *</Label>
                            <div className="space-y-2 mt-2">
                              {formData.groupEmails.map((email, index) => (
                                <Input
                                  key={index}
                                  type="email"
                                  value={email}
                                  onChange={(e) => {
                                    const newEmails = [...formData.groupEmails];
                                    newEmails[index] = e.target.value;
                                    setFormData({ ...formData, groupEmails: newEmails });
                                  }}
                                  placeholder={`Group member ${index + 1} email`}
                                  className={errors.groupEmails ? 'border-red-500' : ''}
                                />
                              ))}
                            </div>
                            {errors.groupEmails && <p className="text-red-500 text-sm mt-1">{errors.groupEmails}</p>}
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <Label>Reason for Appointment *</Label>
                      <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value, otherReason: '' })}>
                        <SelectTrigger className={errors.reason ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {reasons.map((reason) => (
                            <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                    </div>
                    
                    {formData.reason === 'Other' && (
                      <div>
                        <Label htmlFor="otherReason">Please specify *</Label>
                        <Input
                          id="otherReason"
                          value={formData.otherReason}
                          onChange={(e) => setFormData({ ...formData, otherReason: e.target.value })}
                          className={errors.otherReason ? 'border-red-500' : ''}
                        />
                        {errors.otherReason && <p className="text-red-500 text-sm mt-1">{errors.otherReason}</p>}
                      </div>
                    )}
                    
                    <div>
                      <Label>Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${errors.date ? 'border-red-500' : ''}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => setFormData({ ...formData, date })}
                            disabled={isDateDisabled}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                    </div>
                    
                    <div>
                      <Label>Time *</Label>
                      <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                        <SelectTrigger className={errors.time ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>No available slots</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Mode of Advising *</Label>
                    <RadioGroup
                      value={formData.mode}
                      onValueChange={(value) => setFormData({ ...formData, mode: value })}
                      className="flex space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online">Online</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-person" id="in-person" />
                        <Label htmlFor="in-person">In-person</Label>
                      </div>
                    </RadioGroup>
                    {errors.mode && <p className="text-red-500 text-sm mt-1">{errors.mode}</p>}
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="comments">Additional Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      value={formData.comments}
                      onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                      placeholder="Any additional information you'd like to share..."
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => validateForm() && setShowPreview(true)}
                        className="px-6"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview Booking
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white">
                      <DialogHeader>
                        <DialogTitle>Booking Preview</DialogTitle>
                      </DialogHeader>
                       <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Full Name:</strong> {formData.fullName}</div>
                          <div><strong>Student Number:</strong> {formData.studentNumber}</div>
                          <div><strong>Faculty:</strong> {formData.faculty}</div>
                          <div><strong>Course:</strong> {formData.course}</div>
                          <div><strong>Year of Study:</strong> {formData.yearOfStudy}</div>
                          <div><strong>Session Type:</strong> {formData.sessionType === 'individual' ? 'Individual Session' : 'Group Session'}</div>
                          {formData.sessionType === 'group' && (
                            <>
                              <div><strong>Group Size:</strong> {formData.groupSize} students</div>
                              <div className="col-span-2">
                                <strong>Group Members:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {formData.groupEmails.filter(email => email.trim()).map((email, index) => (
                                    <li key={index}>{email}</li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          )}
                          <div><strong>Reason:</strong> {formData.reason === 'Other' ? formData.otherReason : formData.reason}</div>
                          <div><strong>Date:</strong> {formData.date ? format(formData.date, "PPP") : ''}</div>
                          <div><strong>Time:</strong> {formData.time}</div>
                          <div><strong>Mode:</strong> {formData.mode}</div>
                          {formData.comments && <div className="col-span-2"><strong>Comments:</strong> {formData.comments}</div>}
                        </div>
                        <div className="text-center pt-4">
                          <p className="text-sm text-gray-600 mb-4">
                            Your assigned academic advisor: <strong>Dr. Sarah Johnson</strong>
                          </p>
                          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Booking
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookSession;
