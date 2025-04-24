"use client";

import { useEffect, useState } from "react";

interface KeywordApprovalProps {
  keywords: string[];
  approvedKeywords: string[];
  setApprovedKeywords: (keywords: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function KeywordApproval({
  keywords,
  approvedKeywords,
  setApprovedKeywords,
  onNext,
  onBack,
}: KeywordApprovalProps) {
  const [loading, setLoading] = useState(false);
  const [localKeywords, setLocalKeywords] = useState<{word: string, approved: boolean}[]>([]);

  // For demo purposes, populate with sample keywords if empty
  useEffect(() => {
    if (keywords.length === 0) {
      setLoading(true);
      
      // Simulate API call to extract keywords
      setTimeout(() => {
        const demoKeywords = [
          "Algorithm", "Data Structure", "Variable", "Function", 
          "Loop", "Condition", "Object", "Array", "Recursion",
          "Complexity", "Big O Notation", "Sorting", "Binary Tree",
          "Hash Table", "Queue", "Stack", "Linked List", "Graph",
          "Dynamic Programming", "Greedy Algorithm"
        ];
        
        setLocalKeywords(demoKeywords.map(word => ({
          word,
          approved: approvedKeywords.includes(word)
        })));
        
        setLoading(false);
      }, 1000);
    } else {
      setLocalKeywords(keywords.map(word => ({
        word,
        approved: approvedKeywords.includes(word)
      })));
    }
  }, [keywords]);

  const toggleKeyword = (index: number) => {
    const updatedKeywords = [...localKeywords];
    updatedKeywords[index].approved = !updatedKeywords[index].approved;
    setLocalKeywords(updatedKeywords);
    
    // Update the approved keywords list
    setApprovedKeywords(
      updatedKeywords
        .filter(kw => kw.approved)
        .map(kw => kw.word)
    );
  };

  const handleSaveAndContinue = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Review Extracted Keywords</h2>
        <p className="text-white mb-4">
          Review the keywords extracted from your selected chapters. 
          Approve or reject each keyword.
        </p>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {localKeywords.map((item, index) => (
              <div
                key={item.word}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  item.approved 
                    ? "border-green-500 text-green-500" 
                    : "border-gray-300 bg-black"
                }`}
              >
                <span className="font-medium">{item.word}</span>
                <button
                  onClick={() => toggleKeyword(index)}
                  className={`px-3 py-1 rounded text-white text-sm ${
                    item.approved
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {item.approved ? "Reject" : "Approve"}
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          {approvedKeywords.length} of {localKeywords.length} keywords approved
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-white hover:bg-gray-50 hover:text-black"
        >
          Back
        </button>
        <button
          onClick={handleSaveAndContinue}
          disabled={approvedKeywords.length < 2 || loading}
          className={`px-4 py-2 rounded-md text-white ${
            approvedKeywords.length < 2 || loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Continue to Relations
        </button>
      </div>
    </div>
  );
} 