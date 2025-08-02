import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Plus, Eye, Search, Link as LinkIcon } from 'lucide-react';
import { format, isWeekend, startOfDay, addDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- INTERFACES ---
interface GroupMember {
  studentNumber: string;
  name: string;
  surname: string;
  email: string;
  status: 'input' | 'searching' | 'found' | 'not_found';
}

interface FoundStudent {
    id: string;
    Name: string;
    Surname: string;
    email: string;
}

interface BookSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookSession: (sessionData: any) => void;
  advisors: any[];
  bookedSlots: string[];
}

const BookSessionDialog = ({ open, onOpenChange, onBookSession }: BookSessionDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('individual');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [mode, setMode] = useState('in-person');
  const [meetLink, setMeetLink] = useState('');
  const [numberOfStudents, setNumberOfStudents] = useState(1);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([{ studentNumber: '', name: '', surname: '', email: '', status: 'input' }]);
  const [searchResults, setSearchResults] = useState<FoundStudent[][]>([]);
  const [comments, setComments] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const reasonOptions = [
    'Academic Planning (change course/major)', 'Academic Performance', 'Career Development', 'First-Year Transition Support',
    'Financial Literacy & Support', 'Learning/Study strategies', 'Goal Setting & Time management',
    'Revision Planning & Exam preparation', 'Personal Development & Wellness', 'Academic Advising', 'Career Guidance',
    'Course Selection', 'Time Management', 'Graduation Requirements', 'Financial Aid', 'Study Abroad',
    'Internship Guidance', 'Research Opportunities', 'Other'
  ];

  const timeSlots = [
    '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
  ];

  const generateMeetLink = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const randomString = (length: number) => Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `https://meet.google.com/${randomString(3)}-${randomString(4)}-${randomString(3)}`;
  };

  useEffect(() => {
    if (mode === 'online') {
      setMeetLink(generateMeetLink());
    } else {
      setMeetLink('');
    }
  }, [mode]);

  const handleReasonSelect = (reason: string) => {
    setSelectedReasons(prev => {
        const isSelected = prev.includes(reason);
        if (isSelected) {
            return prev.filter(r => r !== reason);
        } else {
            if (prev.length < 4) {
                return [...prev, reason];
            } else {
                toast.error("You can select a maximum of 4 reasons.");
                return prev;
            }
        }
    });
  };

  const handleStudentSearch = async (index: number) => {
    const member = groupMembers[index];
    if (!member.studentNumber.trim()) {
        toast.error("Please enter a student number to search.");
        return;
    }
    
    const newMembers = [...groupMembers];
    newMembers[index].status = 'searching';
    setGroupMembers(newMembers);

    try {
        const q = query(collection(db, "users"), where("studentNumber", "==", member.studentNumber.trim()));
        const querySnapshot = await getDocs(q);
        const results: FoundStudent[] = [];
        querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() } as FoundStudent);
        });

        const newSearchResults = [...searchResults];
        newSearchResults[index] = results;
        setSearchResults(newSearchResults);

        if (results.length === 0) {
            newMembers[index].status = 'not_found';
        } else {
            newMembers[index].status = 'input'; // Back to input to show results
        }
    } catch (error) {
        toast.error("Failed to search for student.");
        newMembers[index].status = 'input';
    } finally {
        setGroupMembers(newMembers);
    }
  };

  const handleSelectStudent = (memberIndex: number, student: FoundStudent) => {
    const newMembers = [...groupMembers];
    newMembers[memberIndex] = {
        ...newMembers[memberIndex],
        name: student.Name,
        surname: student.Surname,
        email: student.email,
        status: 'found'
    };
    setGroupMembers(newMembers);
    const newSearchResults = [...searchResults];
    newSearchResults[memberIndex] = [];
    setSearchResults(newSearchResults);
  };
  
  const handleClearMember = (index: number) => {
    const newMembers = [...groupMembers];
    newMembers[index] = { studentNumber: '', name: '', surname: '', email: '', status: 'input' };
    setGroupMembers(newMembers);
  }

  useEffect(() => {
    const newMembers = Array.from({ length: numberOfStudents }, () => ({ studentNumber: '', name: '', surname: '', email: '', status: 'input' as 'input' }));
    setGroupMembers(newMembers);
  }, [numberOfStudents, sessionType]);


  const validateForm = () => { /* ... validation logic ... */ return true; };

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleConfirmBooking = () => {
    const sessionData = {
      sessionType,
      selectedDate,
      selectedTime,
      selectedReasons,
      otherReasonText: selectedReasons.includes('Other') ? otherReasonText : undefined,
      mode,
      meetLink: mode === 'online' ? meetLink : undefined,
      groupMembers: sessionType === 'group' ? groupMembers.filter(m => m.status === 'found') : undefined,
      comments
    };
    
    onBookSession(sessionData);
    resetForm();
    setShowPreview(false);
    onOpenChange(false);
  };

  const resetForm = () => { /* ... reset logic ... */ };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus size={20} /> Book New Session</DialogTitle></DialogHeader>
          
          <div className="space-y-6">
            {/* Session Type */}
            <div>
              <Label htmlFor="session-type" className="mb-2 block font-medium">Session Type *</Label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger id="session-type"><SelectValue placeholder="Select session type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Session</SelectItem>
                  <SelectItem value="group">Group Session</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group Session Fields */}
            {sessionType === 'group' && (
              <div className="space-y-4 border p-4 rounded-lg">
                <Label>Number of Students (Max 5) *</Label>
                <Select value={String(numberOfStudents)} onValueChange={(val) => setNumberOfStudents(Number(val))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} Student{n > 1 ? 's' : ''}</SelectItem>)}
                    </SelectContent>
                </Select>

                {groupMembers.map((member, index) => (
                    <div key={index} className="space-y-2">
                        <Label>Student {index + 1}</Label>
                        {member.status === 'found' ? (
                            <div className="flex items-center justify-between p-2 bg-slate-100 rounded-md">
                                <div>
                                    <p className="font-medium">{member.name} {member.surname}</p>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleClearMember(index)}>Clear</Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Enter Student Number" 
                                    value={member.studentNumber}
                                    onChange={(e) => {
                                        const newMembers = [...groupMembers];
                                        newMembers[index].studentNumber = e.target.value;
                                        setGroupMembers(newMembers);
                                    }}
                                />
                                <Button onClick={() => handleStudentSearch(index)} disabled={member.status === 'searching'}>
                                    <Search size={16}/>
                                </Button>
                            </div>
                        )}
                        {searchResults[index] && searchResults[index].length > 0 && (
                            <div className="border rounded-md mt-1 p-2 space-y-1">
                                {searchResults[index].map(student => (
                                    <div key={student.id} onClick={() => handleSelectStudent(index, student)} className="p-2 hover:bg-accent rounded-md cursor-pointer">
                                        <p className="font-medium">{student.Name} {student.Surname}</p>
                                        <p className="text-sm text-muted-foreground">{student.email}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {member.status === 'not_found' && <p className="text-xs text-red-500">No student found with that number.</p>}
                    </div>
                ))}
              </div>
            )}

            {/* Date Selection, Reasons, Time, Mode etc. */}
            <div>
                <Label className="mb-2 block font-medium">Reason for Session * (Max 4)</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            {selectedReasons.length > 0 ? `${selectedReasons.length} selected` : "Select reasons..."}
                            <Plus size={14}/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <div className="p-2 space-y-1 max-h-[250px] overflow-y-auto">
                            {reasonOptions.map((reason, idx) => {
                                const isSelected = selectedReasons.includes(reason);
                                return (
                                <label key={idx} htmlFor={`reason-${idx}`} className="flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-accent">
                                    <Checkbox
                                        id={`reason-${idx}`}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                if(selectedReasons.length < 4) setSelectedReasons(prev => [...prev, reason]);
                                                else toast.error("Maximum of 4 reasons allowed.");
                                            } else {
                                                setSelectedReasons(prev => prev.filter(r => r !== reason));
                                            }
                                        }}
                                    />
                                    <span className="font-normal flex-1">{reason}</span>
                                </label>
                                )
                            })}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            
            {/* Other reason text field */}
            {selectedReasons.includes('Other') && (
                <div className="mt-3">
                    <Label htmlFor="other-reason" className="mb-1 block text-sm font-medium">Please specify:</Label>
                    <Input id="other-reason" value={otherReasonText} onChange={(e) => setOtherReasonText(e.target.value)} placeholder="Describe your reason..." required />
                </div>
            )}
            
            {/* Online Session Meet Link */}
            {mode === 'online' && (
                <div>
                    <Label className="mb-2 block font-medium">Meeting Link</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-md">
                        <LinkIcon size={16} className="text-slate-500"/>
                        <span className="text-sm text-blue-600 flex-1 truncate">{meetLink}</span>
                        <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(meetLink).then(() => toast.success("Link copied!"))}>Copy</Button>
                    </div>
                </div>
            )}

            {/* Other fields like Date, Time, Mode, Comments */}
            {/* ... */}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handlePreview}><Eye size={16} className="mr-2"/> Preview</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      {/* ... */}
    </>
  );
};

export default BookSessionDialog;