
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PostSessionEvaluationProps {
  session: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const PostSessionEvaluation: React.FC<PostSessionEvaluationProps> = ({
  session,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    sessionTookPlace: '',
    reasonNotCompleted: '',
    otherReason: '',
    comments: '',
    recommendedActions: '',
    referredTo: '',
    followUpNeeded: '',
    followUpDate: null as Date | null
  });

  const reasonsNotCompleted = [
    'Student did not attend',
    'Advisor unavailable',
    'Technical difficulties',
    'Scheduling conflict',
    'Student cancelled last minute',
    'Emergency situation',
    'Other'
  ];

  const referralOptions = [
    'Academic Support Center',
    'Career Services',
    'Counseling Services',
    'Financial Aid Office',
    'Disability Services',
    'International Student Services',
    'Student Success Center',
    'Mental Health Services',
    'Not applicable'
  ];

  const recommendedActions = [
    'Follow up with tutor/lecturer',
    'Visit support unit',
    'Time management plan',
    'Study schedule',
    'Course change request',
    'Academic skills workshop',
    'Study group formation',
    'Peer mentoring program',
    'Other'
  ];

  const followUpOptions = [
    'Yes',
    'No'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      sessionTookPlace: '',
      reasonNotCompleted: '',
      otherReason: '',
      comments: '',
      recommendedActions: '',
      referredTo: '',
      followUpNeeded: '',
      followUpDate: null
    });
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post-Session Evaluation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Session Details</h3>
            <p><strong>Student:</strong> {session.student_name}</p>
            <p><strong>Date:</strong> {new Date(session.session_date).toLocaleDateString()}</p>
            <p><strong>Reference:</strong> {session.reference_code}</p>
            <p><strong>Type of session:</strong> {session.session_details?.sessionType || 'N/A'}</p>
            {session.session_details?.groupMembers && session.session_details.groupMembers.length > 0 && (
              <div>
                <strong>Group Members:</strong>
                <ul className="list-disc list-inside ml-2">
                  {session.session_details.groupMembers.map((member: any, index: number) => (
                    <li key={index}>{member.name} ({member.email})</li>
                  ))}
                </ul>
              </div>
            )}
            <p><strong>Reason for session:</strong> {session.session_details?.reasonForSession || 'N/A'}</p>
          </div>

          {/* Did the session take place? */}
          <div>
            <Label className="text-base font-medium">Did the session take place? *</Label>
            <RadioGroup
              value={formData.sessionTookPlace}
              onValueChange={(value) => setFormData(prev => ({ ...prev, sessionTookPlace: value }))}
              className="flex flex-row gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Reason why session was not completed (only show if "No" is selected) */}
          {formData.sessionTookPlace === 'no' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reasonNotCompleted">Reason why session was not completed *</Label>
                <Select value={formData.reasonNotCompleted} onValueChange={(value) => setFormData(prev => ({ ...prev, reasonNotCompleted: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {reasonsNotCompleted.map((reason) => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Other reason text field */}
              {formData.reasonNotCompleted === 'Other' && (
                <div>
                  <Label htmlFor="otherReason">Please specify other reason *</Label>
                  <Input
                    id="otherReason"
                    value={formData.otherReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherReason: e.target.value }))}
                    placeholder="Enter the specific reason"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Show additional fields only if session took place */}
          {formData.sessionTookPlace === 'yes' && (
            <>
              {/* Recommended Actions */}
              <div>
                <Label htmlFor="recommendedActions">Recommended Actions</Label>
                <Select value={formData.recommendedActions} onValueChange={(value) => setFormData(prev => ({ ...prev, recommendedActions: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recommended actions" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {recommendedActions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Referred To */}
              <div>
                <Label htmlFor="referredTo">Referred To (if applicable)</Label>
                <Select value={formData.referredTo} onValueChange={(value) => setFormData(prev => ({ ...prev, referredTo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select referral (if applicable)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {referralOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Follow-up Session Needed */}
              <div>
                <Label htmlFor="followUpNeeded">Is a follow-up session needed? *</Label>
                <Select value={formData.followUpNeeded} onValueChange={(value) => setFormData(prev => ({ ...prev, followUpNeeded: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select follow-up option" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {followUpOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Follow-up Date Picker */}
              {formData.followUpNeeded === 'Yes' && (
                <div>
                  <Label>Follow-up Session Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.followUpDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.followUpDate ? format(formData.followUpDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.followUpDate}
                        onSelect={(date) => setFormData(prev => ({ ...prev, followUpDate: date }))}
                        disabled={(date) => {
                          const today = new Date();
                          const dayOfWeek = date.getDay();
                          return date < today || dayOfWeek === 0 || dayOfWeek === 6;
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </>
          )}

          {/* Advisor Comments */}
          {formData.sessionTookPlace && (
            <div>
              <Label htmlFor="comments">Advisor Comments *</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Enter your comments about the session..."
                rows={4}
                required
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={
                !formData.sessionTookPlace || 
                !formData.comments ||
                (formData.sessionTookPlace === 'no' && !formData.reasonNotCompleted) || 
                (formData.sessionTookPlace === 'no' && formData.reasonNotCompleted === 'Other' && !formData.otherReason) ||
                (formData.sessionTookPlace === 'yes' && (!formData.followUpNeeded)) ||
                (formData.sessionTookPlace === 'yes' && formData.followUpNeeded === 'Yes' && !formData.followUpDate)
              }
            >
              Complete Evaluation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostSessionEvaluation;
