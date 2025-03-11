"use client";

import { ChevronRight, X, BookOpen, Check, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KnowledgeGraphData, KnowledgeGraphNode } from "@/lib/courses/types";

interface LearningPathViewProps {
  selectedNode: KnowledgeGraphNode;
  data: KnowledgeGraphData;
  onClose: () => void;
}

export default function LearningPathView({ 
  selectedNode, 
  data, 
  onClose 
}: LearningPathViewProps) {
  // Mock progress data (in a real app, this would come from a database)
  const mockProgress: Record<string, boolean> = {
    "basic_algebra_concepts": true,
    "polynomial_functions": true,
    "function_notation_and_domain_range": true,
    "limits_concept": false,
    "limit_definition": false,
  };
  
  // Find prerequisites for the selected concept
  const prerequisites = data.links
    .filter(link => 
      link.type === "PREREQUISITE_FOR" && link.target === selectedNode.id
    )
    .map(link => 
      data.nodes.find(node => node.id === link.source)
    )
    .filter(Boolean) as KnowledgeGraphNode[];
  
  // Find concepts that this is a prerequisite for
  const nextConcepts = data.links
    .filter(link => 
      link.type === "PREREQUISITE_FOR" && link.source === selectedNode.id
    )
    .map(link => 
      data.nodes.find(node => node.id === link.target)
    )
    .filter(Boolean) as KnowledgeGraphNode[];
  
  // Check if all prerequisites are completed
  const allPrerequisitesCompleted = prerequisites.length > 0 
    ? prerequisites.every(prereq => mockProgress[prereq.id]) 
    : true;
  
  // Calculate completion percentage for this category
  const getCompletionPercentage = () => {
    if (!selectedNode.category) return 0;
    
    const conceptsInCategory = data.nodes
      .filter(node => node.category === selectedNode.category);
    
    if (conceptsInCategory.length === 0) return 0;
    
    const completedInCategory = conceptsInCategory
      .filter(node => mockProgress[node.id])
      .length;
    
    return Math.round((completedInCategory / conceptsInCategory.length) * 100);
  };
  
  return (
    <Card className="absolute right-4 top-16 w-80 shadow-md z-10 max-h-[400px] overflow-auto">
      <CardHeader className="pb-3 flex flex-row justify-between items-center space-y-0">
        <CardTitle className="text-md">Learning Path</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Prerequisites section */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            Prerequisites
          </h3>
          
          {prerequisites.length > 0 ? (
            <ul className="space-y-2">
              {prerequisites.map(prereq => (
                <li key={prereq.id} className="text-sm flex items-start">
                  <div className="mr-2 mt-0.5">
                    {mockProgress[prereq.id] ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{prereq.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {mockProgress[prereq.id] ? "Completed" : "Not completed"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No prerequisites found for this concept.
            </p>
          )}
        </div>
        
        {/* Current concept status */}
        <div className="py-2 border-t border-b">
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
            <h3 className="text-sm font-medium mb-1 flex items-center">
              Current Focus: {selectedNode.name}
            </h3>
            <div className="flex items-center mt-1">
              <div className="text-xs text-muted-foreground">Status:</div>
              <div className="ml-2 text-xs font-medium">
                {mockProgress[selectedNode.id] ? (
                  <span className="text-green-600">Completed</span>
                ) : allPrerequisitesCompleted ? (
                  <span className="text-blue-600">Ready to Learn</span>
                ) : (
                  <span className="text-amber-600">Prerequisites Needed</span>
                )}
              </div>
            </div>
            
            {selectedNode.category && (
              <div className="flex items-center mt-1">
                <div className="text-xs text-muted-foreground">
                  Category Completion:
                </div>
                <div className="ml-2 w-16 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${getCompletionPercentage()}%` }}
                  />
                </div>
                <div className="ml-2 text-xs">
                  {getCompletionPercentage()}%
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* What's next section */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <ChevronRight className="h-4 w-4 mr-1" />
            What&apos;s Next
          </h3>
          
          {nextConcepts.length > 0 ? (
            <ul className="space-y-2">
              {nextConcepts.map(next => (
                <li key={next.id} className="text-sm">
                  <div className="font-medium">{next.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {!mockProgress[selectedNode.id] ? (
                      "Complete current concept first"
                    ) : mockProgress[next.id] ? (
                      "Already completed"
                    ) : (
                      "Ready to learn"
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              This concept is not a prerequisite for any other concepts.
            </p>
          )}
        </div>
        
        {/* Learning path recommendation */}
        <div className="pt-2 border-t">
          <h3 className="text-sm font-medium mb-2">Recommended Path</h3>
          <p className="text-xs text-muted-foreground">
            The optimal learning sequence for this category:
          </p>
          <ol className="text-xs mt-2 space-y-1 list-decimal pl-4">
            <li className={mockProgress["basic_algebra_concepts"] ? "line-through text-muted-foreground" : ""}>
              Basic Algebra Concepts
            </li>
            <li className={mockProgress["function_notation_and_domain_range"] ? "line-through text-muted-foreground" : ""}>
              Function Notation
            </li>
            <li className={mockProgress["limits_concept"] ? "line-through text-muted-foreground" : ""}>
              Limits
            </li>
            <li>
              {selectedNode.name}
            </li>
            {nextConcepts.slice(0, 2).map(next => (
              <li key={next.id} className={mockProgress[next.id] ? "line-through text-muted-foreground" : ""}>
                {next.name}
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
} 