'use client';

import { useState } from 'react';
import { KnowledgeGraphNode } from '@/lib/courses/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createOrUpdateAssessment } from '@/lib/actions/assessment-actions';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface AssessmentFormProps {
  node: KnowledgeGraphNode;
  userId: string;
  onComplete?: (success: boolean) => void;
}

/**
 * AssessmentForm component - Uses server actions directly
 * This is an example of how to use server actions instead of API routes
 */
export function AssessmentForm({ node, userId, onComplete }: AssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessment, setAssessment] = useState<string | null>(null);

  // Form submission handler using server action
  async function handleAssessment(understood: boolean) {
    if (!node?.id) return;

    setIsSubmitting(true);
    setAssessment(understood ? 'understood' : 'not_understood');

    try {
      // Create form data for server action
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('node_id', node.id);
      formData.append('assessment', understood ? 'understood' : 'not_understood');
      
      // Call the server action
      const result = await createOrUpdateAssessment(formData);
      
      if (result.success) {
        toast.success('Assessment recorded', {
          description: result.message,
        });
        
        if (onComplete) {
          onComplete(true);
        }
      } else {
        toast.error('Error', {
          description: result.message,
        });
        
        if (onComplete) {
          onComplete(false);
        }
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Error', {
        description: 'Failed to submit your assessment',
      });
      
      if (onComplete) {
        onComplete(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Do you understand this concept?</div>
      
      <div className="flex space-x-2">
        <Button
          variant={assessment === 'understood' ? 'default' : 'outline'}
          size="sm"
          className="flex-1" 
          onClick={() => handleAssessment(true)}
          disabled={isSubmitting}
        >
          <ThumbsUp className="h-4 w-4 mr-2" /> Yes
        </Button>
        
        <Button
          variant={assessment === 'not_understood' ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => handleAssessment(false)}
          disabled={isSubmitting}
        >
          <ThumbsDown className="h-4 w-4 mr-2" /> No
        </Button>
      </div>
      
      {isSubmitting && (
        <div className="text-xs text-muted-foreground text-center animate-pulse">
          Submitting...
        </div>
      )}
    </div>
  );
} 