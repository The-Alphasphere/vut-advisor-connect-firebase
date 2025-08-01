
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface StudentSessionEvaluationProps {
  session: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evaluationData: any) => void;
}

const StudentSessionEvaluation = ({ session, isOpen, onClose, onSubmit }: StudentSessionEvaluationProps) => {
  const [overallSatisfaction, setOverallSatisfaction] = useState<string>('');
  const [advisorHelpfulness, setAdvisorHelpfulness] = useState<string>('');
  const [sessionObjectivesMet, setSessionObjectivesMet] = useState<string>('');
  const [recommendAdvisor, setRecommendAdvisor] = useState<string>('');
  const [additionalSupport, setAdditionalSupport] = useState<string[]>([]);
  const [studentComments, setStudentComments] = useState<string>('');
  const [improvements, setImprovements] = useState<string>('');

  const additionalSupportOptions = [
    'Follow-up session needed',
    'Need more time with advisor',
    'Require additional resources',
    'Connect with other support services',
    'Academic skills workshop',
    'Study group formation',
    'Peer mentoring program'
  ];

  const handleAdditionalSupportChange = (option: string, checked: boolean) => {
    if (checked) {
      setAdditionalSupport(prev => [...prev, option]);
    } else {
      setAdditionalSupport(prev => prev.filter(item => item !== option));
    }
  };

  const handleSubmit = () => {
    const evaluationData = {
      overallSatisfaction,
      advisorHelpfulness,
      sessionObjectivesMet,
      recommendAdvisor: recommendAdvisor === 'yes',
      additionalSupport,
      studentComments,
      improvements,
      studentEvaluationCompleted: true
    };

    onSubmit(evaluationData);
    
    // Reset form
    setOverallSatisfaction('');
    setAdvisorHelpfulness('');
    setSessionObjectivesMet('');
    setRecommendAdvisor('');
    setAdditionalSupport([]);
    setStudentComments('');
    setImprovements('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Session Evaluation - Student Feedback</DialogTitle>
          <DialogDescription>
            Please provide your feedback for the session with {session?.advisor_name} 
            on {session ? format(new Date(session.session_date), 'PPP') : ''} 
            at {session ? format(new Date(session.session_date), 'HH:mm') : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Satisfaction */}
          <div>
            <Label className="text-base font-semibold">Overall, how satisfied were you with this advising session?</Label>
            <Select value={overallSatisfaction} onValueChange={setOverallSatisfaction}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select satisfaction level" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="very_satisfied">Very Satisfied</SelectItem>
                <SelectItem value="satisfied">Satisfied</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="dissatisfied">Dissatisfied</SelectItem>
                <SelectItem value="very_dissatisfied">Very Dissatisfied</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advisor Helpfulness */}
          <div>
            <Label className="text-base font-semibold">How helpful was your academic advisor during this session?</Label>
            <Select value={advisorHelpfulness} onValueChange={setAdvisorHelpfulness}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select helpfulness level" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="very_helpful">Very Helpful</SelectItem>
                <SelectItem value="helpful">Helpful</SelectItem>
                <SelectItem value="somewhat_helpful">Somewhat Helpful</SelectItem>
                <SelectItem value="not_helpful">Not Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Objectives Met */}
          <div>
            <Label className="text-base font-semibold">Were your session objectives met?</Label>
            <Select value={sessionObjectivesMet} onValueChange={setSessionObjectivesMet}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select objective completion level" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="completely">Completely</SelectItem>
                <SelectItem value="mostly">Mostly</SelectItem>
                <SelectItem value="partially">Partially</SelectItem>
                <SelectItem value="not_at_all">Not at All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recommend Advisor */}
          <div>
            <Label className="text-base font-semibold">Would you recommend this advisor to other students?</Label>
            <Select value={recommendAdvisor} onValueChange={setRecommendAdvisor}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select recommendation" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Support */}
          <div>
            <Label className="text-base font-semibold">Do you need any additional support? (Select all that apply)</Label>
            <div className="mt-2 space-y-2">
              {additionalSupportOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={additionalSupport.includes(option)}
                    onCheckedChange={(checked) => handleAdditionalSupportChange(option, checked as boolean)}
                  />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Student Comments */}
          <div>
            <Label htmlFor="studentComments">Additional Comments</Label>
            <Textarea
              id="studentComments"
              value={studentComments}
              onChange={(e) => setStudentComments(e.target.value)}
              placeholder="Please share any additional thoughts about your session..."
              className="mt-1"
            />
          </div>

          {/* Improvements */}
          <div>
            <Label htmlFor="improvements">Suggestions for Improvement</Label>
            <Textarea
              id="improvements"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="How could we improve the advising experience?"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!overallSatisfaction || !advisorHelpfulness || !sessionObjectivesMet || !recommendAdvisor}
          >
            Submit Evaluation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSessionEvaluation;
