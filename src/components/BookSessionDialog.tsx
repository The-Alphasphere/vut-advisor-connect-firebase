import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, Plus, Eye } from 'lucide-react';
import { addDays, format, isWeekend, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GroupMember {
  name: string;
  surname: string;
  email: string;
}

interface BookSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookSession: (sessionData: any) => void;
  advisors: any[];
  bookedSlots: string[];
}

const BookSessionDialog = ({
  open,
  onOpenChange,
  onBookSession,
  advisors,
  bookedSlots
}: BookSessionDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('individual');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [mode, setMode] = useState('in-person');
  const [numberOfStudents, setNumberOfStudents] = useState(1);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([
    { name: '', surname: '', email: '' }
  ]);
  const [comments, setComments] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const reasonOptions = [
    'Academic Advising',
    'Career Guidance',
    'Course Selection',
    'Time Management',
    'Graduation Requirements',
    'Financial Aid',
    'Study Abroad',
    'Internship Guidance',
    'Research Opportunities',
    'Other'
    // You can add more reasons here
  ];

  const timeSlots = [
    '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
  ];

  const handleReasonSelect = (reason: string) => {
    setSelectedReasons(prev => {
      const isSelected = prev.includes(reason);
      if (isSelected) {
        if (reason === 'Other') {
          setOtherReasonText('');
        }
        return prev.filter(r => r !== reason);
      } else {
        if (prev.length < 4) {
          return [...prev, reason];
        } else {
          toast.error('You can select a maximum of 4 reasons.');
          return prev;
        }
      }
    });
  };

  const validateGroupMemberEmail = (email: string) => {
    return email.endsWith('@edu.vut.ac.za');
  };

  const updateGroupMember = (index: number, field: keyof GroupMember, value: string) => {
    const newMembers = [...groupMembers];
    newMembers[index][field] = value;
    setGroupMembers(newMembers);
  };

  const validateForm = () => {
    if (!selectedDate || !selectedTime || selectedReasons.length === 0) {
      toast.error('Please fill in all required fields.');
      return false;
    }

    if (selectedReasons.includes('Other') && otherReasonText.trim() === '') {
        toast.error('Please specify the reason when "Other" is selected.');
        return false;
    }

    if (sessionType === 'group') {
      const validMembers = groupMembers.filter(member =>
        member.name && member.surname && member.email
      );

      if (validMembers.length === 0) {
        toast.error('Please add at least one group member.');
        return false;
      }

      const invalidEmails = validMembers.filter(member =>
        !validateGroupMemberEmail(member.email)
      );

      if (invalidEmails.length > 0) {
        toast.error('All group member emails must end with @edu.vut.ac.za');
        return false;
      }

      if (validMembers.length > 5) {
        toast.error('Group sessions are limited to 5 members.');
        return false;
      }
    }

    return true;
  };

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
      groupMembers: sessionType === 'group' ? groupMembers.filter(m => m.name && m.surname && m.email) : undefined,
      comments
    };

    onBookSession(sessionData);
    resetForm();
    setShowPreview(false);
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
    setSessionType('individual');
    setSelectedReasons([]);
    setOtherReasonText('');
    setMode('in-person');
    setNumberOfStudents(1);
    setGroupMembers([{ name: '', surname: '', email: '' }]);
    setComments('');
  };

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 9);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={20} />
              Book New Session
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Session Type */}
            <div>
              <Label htmlFor="session-type" className="mb-2 block font-medium">Session Type *</Label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger id="session-type" className="w-full">
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Session</SelectItem>
                  <SelectItem value="group">Group Session</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Number of Students (only for group sessions) */}
            {sessionType === 'group' && (
              <div>
                <Label htmlFor="num-students" className="mb-2 block font-medium">
                  Number of Students (Maximum 5) *
                </Label>
                <Select
                  value={numberOfStudents.toString()}
                  onValueChange={(value) => {
                    const num = parseInt(value);
                    setNumberOfStudents(num);
                    const currentMembers = [...groupMembers];
                    if (num > currentMembers.length) {
                      for (let i = currentMembers.length; i < num; i++) {
                        currentMembers.push({ name: '', surname: '', email: '' });
                      }
                    } else if (num < currentMembers.length) {
                      currentMembers.splice(num);
                    }
                    setGroupMembers(currentMembers);
                  }}
                >
                  <SelectTrigger id="num-students" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Student{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Group Members Details */}
            {sessionType === 'group' && (
              <div>
                <Label className="mb-2 block font-medium">Student Details *</Label>
                <div className="space-y-3">
                  {groupMembers.map((member, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium">Student {index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          placeholder="First Name"
                          value={member.name}
                          onChange={(e) => updateGroupMember(index, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Last Name"
                          value={member.surname}
                          onChange={(e) => updateGroupMember(index, 'surname', e.target.value)}
                        />
                        <Input
                          placeholder="Email (@edu.vut.ac.za)"
                          value={member.email}
                          onChange={(e) => updateGroupMember(index, 'email', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <Label className="mb-2 block font-medium">Select Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      isWeekend(date) || startOfDay(date) < today || startOfDay(date) > maxDate
                    }
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Reason for Session */}
            <div>
                <Label className="mb-2 block font-medium">Reason for Session (Max 4) *</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-start h-auto min-h-[2.5rem]"
                        >
                            {selectedReasons.length > 0 ? (
                                <div className="flex gap-1 flex-wrap">
                                    {selectedReasons.map(reason => (
                                        <span key={reason} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-semibold">
                                            {reason}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-muted-foreground">Select up to 4 reasons</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        {/* MODIFICATION HERE: Added max-height and overflow-y-auto for scrollbar */}
                        <div className="p-2 space-y-1 max-h-[250px] overflow-y-auto">
                            {reasonOptions.map(reason => {
                                const isSelected = selectedReasons.includes(reason);
                                const isDisabled = !isSelected && selectedReasons.length >= 4;
                                return (
                                    <div
                                        key={reason}
                                        onClick={() => !isDisabled && handleReasonSelect(reason)}
                                        className={cn(
                                            "flex items-center space-x-3 p-2 rounded-md",
                                            isDisabled ? "text-muted-foreground opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-accent",
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            readOnly
                                            checked={isSelected}
                                            className={cn("h-4 w-4", isDisabled ? "cursor-not-allowed" : "cursor-pointer")}
                                        />
                                        <Label className={cn("font-normal", isDisabled ? "cursor-not-allowed" : "cursor-pointer")}>
                                            {reason}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    </PopoverContent>
                </Popover>
                {selectedReasons.includes('Other') && (
                    <div className="mt-4">
                        <Label htmlFor="other-reason" className="mb-2 block font-medium">
                            Please specify the other reason *
                        </Label>
                        <Textarea
                            id="other-reason"
                            placeholder="Specify your reason"
                            value={otherReasonText}
                            onChange={(e) => setOtherReasonText(e.target.value)}
                            required
                        />
                    </div>
                )}
            </div>
            
            {/* Time Slot */}
            <div>
              <Label htmlFor="time-select" className="mb-2 block font-medium">Time Slot *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger id="time-select" className="w-full">
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mode */}
            <div>
              <Label htmlFor="mode-select" className="mb-2 block font-medium">Session Mode *</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger id="mode-select" className="w-full">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">In-person</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Comments */}
            <div>
              <Label htmlFor="comments" className="mb-2 block font-medium">Additional Comments</Label>
              <Textarea
                id="comments"
                placeholder="Any additional information or special requests..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handlePreview} className="flex items-center gap-2">
                <Eye size={16} />
                Preview Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Preview Session Booking</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm pt-2">
                <div><strong>Session Type:</strong> {sessionType === 'individual' ? 'Individual Session' : 'Group Session'}</div>
                <div><strong>Date:</strong> {selectedDate ? format(selectedDate, 'PPP') : 'Not selected'}</div>
                <div><strong>Time:</strong> {selectedTime || 'Not selected'}</div>
                <div>
                  <strong>Reason(s):</strong>
                  {selectedReasons.length > 0 ? (
                      <ul className="list-disc list-inside ml-4 mt-1">
                          {selectedReasons.map(reason => (
                              <li key={reason}>
                                  {reason === 'Other' && otherReasonText 
                                      ? `Other: ${otherReasonText}` 
                                      : reason}
                              </li>
                          ))}
                      </ul>
                  ) : (
                      <span> Not selected</span>
                  )}
                </div>
                <div><strong>Mode:</strong> {mode === 'in-person' ? 'In-person' : 'Online'}</div>

                {sessionType === 'group' && (
                  <div>
                    <strong>Group Members:</strong>
                    <ul className="ml-4 mt-1 list-disc list-inside">
                      {groupMembers.filter(m => m.name && m.surname && m.email).map((member, index) => (
                        <li key={index}>{member.name} {member.surname} ({member.email})</li>
                      ))}
                    </ul>
                  </div>
                )}

                {comments && (
                  <div><strong>Comments:</strong> {comments}</div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Edit Details</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBooking}>
              Confirm Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BookSessionDialog;