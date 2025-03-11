"use client";

import { useEffect, useState } from "react";
import { KnowledgeGraphNode } from "@/lib/courses/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, BookOpen, Sparkles, ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createOrUpdateAssessment } from "@/lib/actions/assessment-actions";

interface ConceptDetailsProps {
  node: KnowledgeGraphNode | null;
  relatedConcepts?: {
    prerequisites: KnowledgeGraphNode[];
    dependents: KnowledgeGraphNode[];
    related: KnowledgeGraphNode[];
  };
  onAssessment?: (nodeId: string, understood: boolean) => void;
}

interface Recommendation {
  id: string;
  name: string;
  description: string | null;
}

// Extend Window interface to include MathJax
declare global {
  interface Window {
    MathJax?: {
      typeset?: () => void;
      [key: string]: unknown;
    };
  }
}

// Add MathJax script to document head
const loadMathJax = () => {
  if (typeof window !== 'undefined' && !document.getElementById('mathjax-script')) {
    const script = document.createElement('script');
    script.id = 'mathjax-script';
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    document.head.appendChild(script);
  }
};

export default function ConceptDetails({ 
  node, 
  relatedConcepts = { prerequisites: [], dependents: [], related: [] },
  onAssessment
}: ConceptDetailsProps) {
  const [expanded, setExpanded] = useState(false);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  // Fetch related concepts from the API if not provided
  useEffect(() => {
    // Logic to fetch related concepts could go here
  }, [node?.id]);
  
  // Load MathJax when component mounts
  useEffect(() => {
    loadMathJax();
  }, []);
  
  // Render MathJax when content changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.MathJax && node?.formula) {
      window.MathJax.typeset?.();
    }
  }, [node, expanded]);
  
  // Handle user assessment of concept
  const handleAssessment = async (node: KnowledgeGraphNode, understood: boolean) => {
    if (!node) return;
    
    setLoading(true);
    setAssessment(understood ? "understood" : "notUnderstood");
    
    try {
      // Create form data for the server action
      const formData = new FormData();
      formData.append('user_id', 'test-user-1'); // Hardcoded for demo, would normally be from auth session
      formData.append('node_id', node.id);
      formData.append('assessment', understood ? 'understood' : 'not_understood');
      
      // Call the onAssessment callback if provided
      if (onAssessment) {
        onAssessment(node.id, understood);
      }
      
      // Call the server action
      const result = await createOrUpdateAssessment(formData);
      
      // If we got recommendations, display them
      if (result.success && result.recommendations && result.recommendations.length > 0) {
        setRecommendations(result.recommendations);
      } else {
        setRecommendations([]);
      }
      
      console.log("Assessment recorded:", result);
    } catch (error) {
      console.error("Error saving assessment:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Add recommendations panel if we have recommendations and the user didn't understand
  const renderRecommendations = () => {
    if (assessment !== "notUnderstood" || recommendations.length === 0) return null;
    
    return (
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900 rounded-md">
        <h4 className="text-sm font-medium flex items-center mb-2">
          <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
          Recommended Concepts
        </h4>
        <p className="text-xs text-muted-foreground mb-2">
          Based on your assessment, here are some concepts that might help:
        </p>
        <ul className="space-y-2">
          {recommendations.map(rec => (
            <li key={rec.id} className="bg-white dark:bg-gray-800 p-2 rounded text-sm">
              <div className="font-medium">{rec.name}</div>
              <div className="text-xs text-muted-foreground">{rec.description}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  if (!node) {
    return (
      <Card className="h-full bg-gray-50 dark:bg-gray-800 border-dashed flex items-center justify-center">
        <CardContent className="text-center py-10">
          <div className="mx-auto rounded-full bg-primary/10 p-3 mb-4">
            <Sparkles className="h-6 w-6 text-primary/80" />
          </div>
          <h3 className="text-lg font-medium mb-2">No concept selected</h3>
          <p className="text-sm text-muted-foreground">
            Click on any node in the graph to view its details.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const getDifficultyBadge = () => {
    const difficultyMap: Record<string, { color: string; label: string }> = {
      basic: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", label: "Basic" },
      intermediate: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", label: "Intermediate" },
      advanced: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", label: "Advanced" },
    };
    
    const difficulty = node.difficulty?.toLowerCase() || "basic";
    const { color, label } = difficultyMap[difficulty] || difficultyMap.basic;
    
    return <Badge className={color}>{label}</Badge>;
  };
  
  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{node.name}</CardTitle>
            <CardDescription>
              {node.category && (
                <span className="capitalize text-xs">{node.category}</span>
              )}
            </CardDescription>
          </div>
          {node.difficulty && getDifficultyBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Assessment UI */}
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium">Do you understand this concept?</p>
          <div className="flex space-x-2">
            <Button 
              variant={assessment === "understood" ? "default" : "outline"} 
              size="sm"
              className="flex-1"
              onClick={() => handleAssessment(node, true)}
              disabled={loading}
            >
              <ThumbsUp className="h-4 w-4 mr-2" /> Yes
            </Button>
            
            <Button 
              variant={assessment === "notUnderstood" ? "default" : "outline"} 
              size="sm"
              className="flex-1"
              onClick={() => handleAssessment(node, false)}
              disabled={loading}
            >
              <ThumbsDown className="h-4 w-4 mr-2" /> No
            </Button>
          </div>
        </div>
        
        {/* Recommendations panel */}
        {renderRecommendations()}
        
        <div>
          <p className="text-sm text-muted-foreground">
            {node.description}
          </p>
        </div>
        
        {node.formula && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md overflow-x-auto">
            <p className="text-sm font-medium mb-1">Formula:</p>
            <div className="formula">{`\\[${node.formula}\\]`}</div>
          </div>
        )}
        
        {/* Tabs for related concepts */}
        <Tabs defaultValue="prerequisites" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
            <TabsTrigger value="dependents">Next Steps</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prerequisites" className="space-y-2 py-2">
            {relatedConcepts.prerequisites.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {relatedConcepts.prerequisites.map(concept => (
                  <li key={concept.id} className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <div className="font-medium">{concept.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{concept.description}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No prerequisites found.</p>
            )}
          </TabsContent>
          
          <TabsContent value="related" className="space-y-2 py-2">
            {relatedConcepts.related.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {relatedConcepts.related.map(concept => (
                  <li key={concept.id} className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <div className="font-medium">{concept.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{concept.description}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No related concepts found.</p>
            )}
          </TabsContent>
          
          <TabsContent value="dependents" className="space-y-2 py-2">
            {relatedConcepts.dependents.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {relatedConcepts.dependents.map(concept => (
                  <li key={concept.id} className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <div className="font-medium">{concept.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{concept.description}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No dependent concepts found.</p>
            )}
          </TabsContent>
        </Tabs>
        
        {node.examples && node.examples.length > 0 && expanded && (
          <div>
            <p className="text-sm font-medium mb-2">Examples:</p>
            <ul className="space-y-2 text-sm">
              {node.examples.map((example, index) => (
                <li key={index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  {String(example)}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {node.progress !== undefined && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{node.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${node.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" /> Less Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" /> More Details
            </>
          )}
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full ml-2"
        >
          <BookOpen className="h-4 w-4 mr-1" /> Learn
        </Button>
      </CardFooter>
    </Card>
  );
} 