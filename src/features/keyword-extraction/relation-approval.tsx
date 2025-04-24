"use client";

import { useEffect, useState } from "react";

interface Relation {
  source: string;
  target: string;
  type: string;
}

interface RelationApprovalProps {
  keywords: string[];
  relations: Relation[];
  setRelations: (relations: Relation[]) => void;
  onBack: () => void;
  onComplete: () => void;
}

export default function RelationApproval({
  keywords,
  relations,
  setRelations,
  onBack,
  onComplete,
}: RelationApprovalProps) {
  const [loading, setLoading] = useState(false);
  const [localRelations, setLocalRelations] = useState<(Relation & { approved: boolean })[]>([]);

  // For demo purposes, generate sample relations if empty
  useEffect(() => {
    if (keywords.length > 0 && relations.length === 0) {
      setLoading(true);
      
      // Simulate API call to generate relations
      setTimeout(() => {
        // Generate some sample relations between keywords
        const sampleRelations: (Relation & { approved: boolean })[] = [];
        
        // Sample relation types
        const relationTypes = ["prerequisite", "part_of", "related_to", "applies_to"];
        
        // Generate some random relations
        for (let i = 0; i < keywords.length; i++) {
          // Each keyword will have 1-3 relations
          const numRelations = Math.floor(Math.random() * 3) + 1;
          
          for (let j = 0; j < numRelations; j++) {
            // Pick a random target keyword (different from source)
            let targetIndex;
            do {
              targetIndex = Math.floor(Math.random() * keywords.length);
            } while (targetIndex === i);
            
            // Pick a random relation type
            const typeIndex = Math.floor(Math.random() * relationTypes.length);
            
            sampleRelations.push({
              source: keywords[i],
              target: keywords[targetIndex],
              type: relationTypes[typeIndex],
              approved: false
            });
          }
        }
        
        // Remove duplicates (simplistic approach)
        const uniqueRelations = sampleRelations.filter((relation, index, self) => 
          index === self.findIndex(r => 
            r.source === relation.source && 
            r.target === relation.target && 
            r.type === relation.type
          )
        );
        
        setLocalRelations(uniqueRelations);
        setLoading(false);
      }, 1500);
    } else {
      setLocalRelations(relations.map(rel => ({ ...rel, approved: true })));
    }
  }, [keywords]);

  const toggleRelation = (index: number) => {
    const updatedRelations = [...localRelations];
    updatedRelations[index].approved = !updatedRelations[index].approved;
    setLocalRelations(updatedRelations);
    
    // Update the approved relations list
    setRelations(
      updatedRelations
        .filter(rel => rel.approved)
        .map(({ source, target, type }) => ({ source, target, type }))
    );
  };

  const getRelationLabel = (type: string) => {
    switch (type) {
      case "prerequisite": return "is prerequisite for";
      case "part_of": return "is part of";
      case "related_to": return "is related to";
      case "applies_to": return "applies to";
      default: return "is related to";
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Review Keyword Relations</h2>
        <p className="text-gray-600 mb-4">
          Review the relationships between keywords. Approve or reject each relationship.
        </p>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : localRelations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No relations available. Please go back and select more keywords.
          </div>
        ) : (
          <div className="space-y-3">
            {localRelations.map((relation, index) => (
              <div
                key={`${relation.source}-${relation.type}-${relation.target}-${index}`}
                className={`p-4 rounded-lg border ${
                  relation.approved 
                    ? "border-green-500 text-green-500" 
                    : "border-gray-300 bg-black"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium">{relation.source}</span>
                      <span className="text-gray-500 mx-2 hidden sm:inline">→</span>
                      <span className="text-gray-500 sm:hidden">↓</span>
                      <span className="italic text-blue-400">{getRelationLabel(relation.type)}</span>
                      <span className="text-gray-500 mx-2 hidden sm:inline">→</span>
                      <span className="text-gray-500 sm:hidden">↓</span>
                      <span className="font-medium">{relation.target}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRelation(index)}
                    className={`ml-4 px-3 py-1 rounded text-white text-sm ${
                      relation.approved
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {relation.approved ? "Reject" : "Approve"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          {localRelations.filter(r => r.approved).length} of {localRelations.length} relations approved
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={localRelations.filter(r => r.approved).length === 0 || loading}
          className={`px-4 py-2 rounded-md text-white ${
            localRelations.filter(r => r.approved).length === 0 || loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Complete Extraction
        </button>
      </div>
    </div>
  );
} 