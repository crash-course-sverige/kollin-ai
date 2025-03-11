"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InfoIcon, BookOpenIcon, NetworkIcon } from "lucide-react";

interface GraphControlsProps {
  relationshipTypes: string[];
  visibleRelationships: Record<string, boolean>;
  setVisibleRelationships: (relationships: Record<string, boolean>) => void;
}

export default function GraphControls({
  relationshipTypes,
  visibleRelationships,
  setVisibleRelationships
}: GraphControlsProps) {
  const [showTips, setShowTips] = useState(false);

  // Toggle a specific relationship type
  const toggleRelationship = (type: string) => {
    setVisibleRelationships({
      ...visibleRelationships,
      [type]: !visibleRelationships[type]
    });
  };

  // Toggle all relationship types
  const toggleAll = (checked: boolean) => {
    const updatedRelationships: Record<string, boolean> = {};
    relationshipTypes.forEach(type => {
      updatedRelationships[type] = checked;
    });
    setVisibleRelationships(updatedRelationships);
  };

  // Check if all relationships are visible
  const allVisible = relationshipTypes.every(type => visibleRelationships[type]);
  
  // Check if no relationships are visible
  const noneVisible = relationshipTypes.every(type => !visibleRelationships[type]);

  // Format relationship type for display
  const formatRelationshipType = (type: string): string => {
    return type.toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };
  
  return (
    <Card className="bg-white dark:bg-gray-900">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Graph Controls</CardTitle>
            <CardDescription>
              Customize your knowledge graph view
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowTips(!showTips)}
          >
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showTips && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded text-sm text-blue-700 dark:text-blue-300">
            <p className="mb-2 font-medium flex items-center">
              <NetworkIcon className="h-4 w-4 mr-1" /> 
              Visualization Tips
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Toggle relationship types to focus on specific connections</li>
              <li>Drag nodes to rearrange the graph layout</li>
              <li>Click on nodes to view detailed information</li>
              <li>Use your mouse wheel to zoom in and out</li>
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Relationship Types</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleAll(true)}
                disabled={allVisible}
              >
                Show All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleAll(false)}
                disabled={noneVisible}
              >
                Hide All
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {relationshipTypes.map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox 
                  id={`relationship-${type}`}
                  checked={visibleRelationships[type]}
                  onCheckedChange={() => toggleRelationship(type)}
                />
                <Label 
                  htmlFor={`relationship-${type}`}
                  className="text-sm font-normal"
                >
                  {formatRelationshipType(type)}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-center">
        <Button variant="outline" size="sm" className="gap-1">
          <BookOpenIcon className="h-4 w-4" />
          <span>Learning Mode</span>
        </Button>
      </CardFooter>
    </Card>
  );
} 