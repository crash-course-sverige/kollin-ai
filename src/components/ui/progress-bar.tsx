"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  totalCards: number;
  reviewedCards: number;
  statistics?: {
    easyCount: number;
    mediumCount: number;
    hardCount: number;
  };
  className?: string;
}

export function ProgressBar({ 
  totalCards, 
  reviewedCards, 
  statistics, 
  className 
}: ProgressBarProps) {
  const progressPercentage = totalCards > 0 
    ? Math.min(Math.round((reviewedCards / totalCards) * 100), 100) 
    : 0;

  const easyPercentage = statistics && totalCards > 0 
    ? Math.round((statistics.easyCount / totalCards) * 100) 
    : 0;
  
  const mediumPercentage = statistics && totalCards > 0 
    ? Math.round((statistics.mediumCount / totalCards) * 100) 
    : 0;
  
  const hardPercentage = statistics && totalCards > 0 
    ? Math.round((statistics.hardCount / totalCards) * 100) 
    : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Progress: {progressPercentage}%</span>
        <span>
          {reviewedCards} of {totalCards} cards reviewed
        </span>
      </div>
      
      {/* Main progress bar */}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Statistics breakdown */}
      {statistics && (
        <div className="space-y-2 pt-2">
          <div className="flex flex-wrap gap-3 justify-between text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5" />
              <span>Easy: {statistics.easyCount} ({easyPercentage}%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5" />
              <span>Medium: {statistics.mediumCount} ({mediumPercentage}%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1.5" />
              <span>Hard: {statistics.hardCount} ({hardPercentage}%)</span>
            </div>
          </div>
          
          {/* Detailed progress bar */}
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-green-500" 
              style={{ width: `${easyPercentage}%` }}
            />
            <div 
              className="h-full bg-yellow-500" 
              style={{ width: `${mediumPercentage}%` }}
            />
            <div 
              className="h-full bg-red-500" 
              style={{ width: `${hardPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 