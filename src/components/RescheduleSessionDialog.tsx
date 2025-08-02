import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Session } from '@/utils/mockData';

interface RescheduleSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  onReschedule: (sessionId: string, rescheduleData: RescheduleData) => void;
}

interface RescheduleData {
  reason: string;
  otherReason?: string;
  newDate: Date;
  newTime: string;
}

const rescheduleReasons = [
  'Schedule conflict',
  'Personal emergency',
  'Health issues',
  'Academic commitment',
  'Work obligations',
  'Transportation issues',
  'Technical difficulties',
  'Other'
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const RescheduleSessionDialog = ({
  open,
  onOpenChange,
  session,
  onReschedule
}: RescheduleSessionDialogProps) => {
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [newDate, setNewDate] = useState<Date>();
  const [newTime, setNewTime] = useState('');

  const handleSubmit = () => {
    if (!session || !reason || !newDate || !newTime) return;

    const rescheduleData: RescheduleData = {
      reason,
      otherReason: reason === 'Other' ? otherReason : undefined,
      newDate,
      newTime
    };

    onReschedule(session.id, rescheduleData);
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    setOtherReason('');
    setNewDate(undefined);
    setNewTime('');
    onOpenChange(false);
  };

  const isFormValid = reason && newDate && newTime && (reason !== 'Other' || otherReason.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reschedule Session</DialogTitle>
          <DialogDescription>
            Please provide a reason for rescheduling and select a new date and time.
          </DialogDescription>
        </DialogHeader>

        {session && (
          <div className="space-y-6">
            {/* Current Session Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Current Session</h4>
              <div className="text-sm space-y-1">
                <p><strong>Reference:</strong> {session.reference_code}</p>
                <p><strong>Advisor:</strong> {session.advisor_name}</p>
                <p><strong>Date:</strong> {format(new Date(session.session_date), 'PPP')}</p>
                <p><strong>Time:</strong> {format(new Date(session.session_date), 'p')}</p>
              </div>
            </div>

            {/* Reschedule Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rescheduling *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {rescheduleReasons.map((reasonOption) => (
                    <SelectItem key={reasonOption} value={reasonOption}>
                      {reasonOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Other Reason Text */}
            {reason === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="other-reason">Please specify *</Label>
                <Textarea
                  id="other-reason"
                  placeholder="Enter your reason for rescheduling..."
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* New Date Selection */}
            <div className="space-y-2">
              <Label>New Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* New Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="new-time">New Time *</Label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            Reschedule Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleSessionDialog;
