import React, { useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Session } from '@/utils/mockData';

interface CancelSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  userRole: 'student' | 'advisor';
  onCancel: (sessionId: string, cancellationData: CancellationData) => void;
}

interface CancellationData {
  reason: string;
  otherReason?: string;
}

const studentCancellationReasons = [
  'Schedule conflict',
  'Personal emergency',
  'Health issues',
  'No longer need advice',
  'Resolved issue independently',
  'Transportation issues',
  'Technical difficulties',
  'Financial constraints',
  'Other'
];

const advisorCancellationReasons = [
  'Schedule conflict',
  'Personal emergency',
  'Health issues',
  'Administrative duties',
  'Meeting conflict',
  'Student no-show (previous)',
  'Technical difficulties',
  'Facility unavailable',
  'Other'
];

const CancelSessionDialog = ({
  open,
  onOpenChange,
  session,
  userRole,
  onCancel
}: CancelSessionDialogProps) => {
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const cancellationReasons = userRole === 'student' 
    ? studentCancellationReasons 
    : advisorCancellationReasons;

  const handleSubmit = () => {
    if (!session || !reason) return;

    const cancellationData: CancellationData = {
      reason,
      otherReason: reason === 'Other' ? otherReason : undefined
    };

    onCancel(session.id, cancellationData);
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    setOtherReason('');
    onOpenChange(false);
  };

  const isFormValid = reason && (reason !== 'Other' || otherReason.trim());

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Session
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this session? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {session && (
          <div className="space-y-6">
            {/* Session Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Session Details</h4>
              <div className="text-sm space-y-1">
                <p><strong>Reference:</strong> {session.reference_code}</p>
                <p><strong>Advisor:</strong> {session.advisor_name}</p>
                <p><strong>Student:</strong> {session.student_name}</p>
                <p><strong>Date:</strong> {format(new Date(session.session_date), 'PPP')}</p>
                <p><strong>Time:</strong> {format(new Date(session.session_date), 'p')}</p>
                <p><strong>Type:</strong> {session.session_details?.sessionType || 'Individual'}</p>
              </div>
            </div>

            {/* Cancellation Reason */}
            <div className="space-y-2">
              <Label htmlFor="cancellation-reason">Reason for Cancellation *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {cancellationReasons.map((reasonOption) => (
                    <SelectItem key={reasonOption} value={reasonOption}>
                      {reasonOption}
                    </SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Other Reason Text */}
            {reason === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="other-cancellation-reason">Please specify *</Label>
                <Textarea
                  id="other-cancellation-reason"
                  placeholder="Enter your reason for cancelling..."
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* Warning Message */}
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">Important Notice:</p>
                  <p className="text-muted-foreground mt-1">
                    {userRole === 'student'
                      ? 'Cancelling this session will notify your advisor. Please consider rescheduling if possible.'
                      : 'Cancelling this session will notify the student. They will need to book a new session if needed.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Keep Session
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            Cancel Session
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelSessionDialog;
