'use client';

import { useEffect, useState } from 'react';
import { getUserAssessments } from '@/lib/actions/assessment-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface UserProgressProps {
  userId: string;
}

interface AssessmentData {
  nodeId: string;
  conceptName: string;
  assessment: string;
  updatedAt: string;
}

/**
 * UserProgress component - Uses server actions to fetch user assessment data
 */
export function UserProgress({ userId }: UserProgressProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);

  useEffect(() => {
    async function fetchUserProgress() {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const result = await getUserAssessments(userId);
        
        if (result.success && result.assessments) {
          setAssessments(result.assessments);
        } else {
          toast.error('Error', {
            description: result.message || 'Failed to load assessment data',
          });
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
        toast.error('Error', {
          description: 'Failed to load assessment data',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserProgress();
  }, [userId]);

  // Format relative time (e.g., "2 days ago")
  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  }

  // Get assessment icon based on status
  function getAssessmentIcon(assessment: string) {
    if (assessment === 'understood') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Loading your assessment history...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 w-32 bg-muted rounded mb-4"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>No assessments recorded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start interacting with concepts to track your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
        <CardDescription>Recent concept assessments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assessments.slice(0, 5).map((item) => (
            <div 
              key={`${item.nodeId}-${item.updatedAt}`}
              className="flex items-start gap-2 pb-3 border-b border-border last:border-0 last:pb-0"
            >
              <div className="pt-1">{getAssessmentIcon(item.assessment)}</div>
              <div className="flex-1">
                <div className="font-medium">{item.conceptName}</div>
                <div className="text-xs text-muted-foreground">
                  Status: {item.assessment === 'understood' ? 'Understood' : 'Need Review'}
                </div>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {formatRelativeTime(item.updatedAt)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 