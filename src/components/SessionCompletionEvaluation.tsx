import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SessionCompletionEvaluationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: any;
  onComplete: (evaluationData: any) => void;
}

const SessionCompletionEvaluation = ({
  open,
  onOpenChange,
  session,
  onComplete
}: SessionCompletionEvaluationProps) => {
  const [sessionOutcome, setSessionOutcome] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [referredTo, setReferredTo] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleSubmit = () => {
    if (!sessionOutcome || !additionalNotes) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (sessionOutcome === 'no' && !cancellationReason) {
      toast.error('Please select a cancellation reason');
      return;
    }

    const evaluationData = {
      sessionOutcome,
      cancellationReason: sessionOutcome === 'no' ? cancellationReason : null,
      recommendedAction: sessionOutcome === 'yes' ? recommendedAction : null,
      referredTo: sessionOutcome === 'yes' ? referredTo : null,
      followUpRequired: sessionOutcome === 'yes' ? followUpRequired : null,
      followUpDate: followUpRequired === 'yes' ? followUpDate : null,
      additionalNotes,
      completedAt: new Date().toISOString(),
      completedBy: 'current_advisor'
    };

    onComplete(evaluationData);
    resetForm();
    onOpenChange(false);
    toast.success('Session evaluation completed successfully');
  };

  const resetForm = () => {
    setSessionOutcome('');
    setCancellationReason('');
    setRecommendedAction('');
    setReferredTo('');
    setFollowUpRequired('');
    setFollowUpDate('');
    setAdditionalNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} />
            Complete Session Evaluation
          </DialogTitle>
        </DialogHeader>

        {/* Session Summary */}
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">Session Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span><strong>Student:</strong> {session?.student_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span><strong>Date:</strong> {session ? format(new Date(session.session_date), 'PPP') : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span><strong>Time:</strong> {session ? format(new Date(session.session_date), 'HH:mm') : ''}</span>
            </div>
            <div>
              <Badge variant="secondary">{session?.session_details?.sessionType || 'Individual'}</Badge>
            </div>
          </div>
          {session?.session_details?.reasons && (
            <div className="mt-2">
              <strong>Reason:</strong> {session.session_details.reasons.join(', ')}
            </div>
          )}
        </div>

        {/* Evaluation Form */}
        <div className="space-y-6">
          {/* Did the session take place? */}
          <div>
            <Label htmlFor="session-outcome" className="mb-2 block font-medium">
              Did the session take place? *
            </Label>
            <Select value={sessionOutcome} onValueChange={setSessionOutcome}>
              <SelectTrigger id="session-outcome" className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* If No - Cancellation Reason */}
          {sessionOutcome === 'no' && (
            <div>
              <Label htmlFor="cancellation-reason" className="mb-2 block font-medium">
                Reason for session cancellation *
              </Label>
              <Select value={cancellationReason} onValueChange={setCancellationReason}>
                <SelectTrigger id="cancellation-reason" className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student-no-show">Student did not show up</SelectItem>
                  <SelectItem value="advisor-unavailable">Advisor unavailable</SelectItem>
                  <SelectItem value="technical-issues">Technical/connection issues</SelectItem>
                  <SelectItem value="rescheduled">Session was rescheduled</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* If Yes - Recommended Actions */}
          {sessionOutcome === 'yes' && (
            <>
              <div>
                <Label className="mb-2 block font-medium">Recommended Actions</Label>
                <Select value={recommendedAction} onValueChange={setRecommendedAction}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a recommended action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow-up-tutor">Follow up with tutor/lecturer</SelectItem>
                    <SelectItem value="visit-support">Visit support unit</SelectItem>
                    <SelectItem value="time-management">Time management plan</SelectItem>
                    <SelectItem value="study-schedule">Study schedule</SelectItem>
                    <SelectItem value="course-change">Course change request</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Referred To */}
              <div>
                <Label className="mb-2 block font-medium">Referred To</Label>
                <Select value={referredTo} onValueChange={setReferredTo}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select referral option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic-support">Academic Support Unit</SelectItem>
                    <SelectItem value="counselling">Counselling/Wellness</SelectItem>
                    <SelectItem value="career-services">Career Services</SelectItem>
                    <SelectItem value="financial-aid">Financial Aid</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Follow-up Needed */}
              <div>
                <Label className="mb-2 block font-medium">Is follow-up needed?</Label>
                <Select value={followUpRequired} onValueChange={setFollowUpRequired}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Follow-up Date */}
              {followUpRequired === 'yes' && (
                <div>
                  <Label className="mb-2 block font-medium">Follow-up Session Date</Label>
                  <Input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </>
          )}

          {/* Advisor Comment */}
          <div>
            <Label htmlFor="advisor-comment" className="mb-2 block font-medium">
              Advisor Comment *
            </Label>
            <Textarea
              id="advisor-comment"
              placeholder="Enter your comment about the session..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Complete Evaluation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionCompletionEvaluation;