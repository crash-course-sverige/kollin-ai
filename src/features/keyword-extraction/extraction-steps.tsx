"use client";

import { useState, useEffect } from "react";
import CourseSelectionForm from "./course-selection-form";
import KeywordApproval from "./keyword-approval";
import RelationApproval from "./relation-approval";

export default function ExtractionSteps() {
  const [step, setStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [approvedKeywords, setApprovedKeywords] = useState<string[]>([]);
  const [relations, setRelations] = useState<{source: string, target: string, type: string}[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // When chapters are selected, fetch keywords
  useEffect(() => {
    if (step === 2 && selectedChapters.length > 0 && extractedKeywords.length === 0) {
      // This would be replaced by an actual API call
      // fetchKeywordsForChapters(selectedCourse, selectedChapters)
      //   .then(keywords => setExtractedKeywords(keywords));
      
      // For now, we'll let the KeywordApproval component handle demo data
    }
  }, [step, selectedChapters, selectedCourse, extractedKeywords.length]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleComplete = () => {
    // This would be where you send the final approved keywords and relations to your backend
    console.log("Extraction complete!");
    console.log("Approved keywords:", approvedKeywords);
    console.log("Approved relations:", relations);
    setIsCompleted(true);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <CourseSelectionForm
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            selectedChapters={selectedChapters}
            setSelectedChapters={setSelectedChapters}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <KeywordApproval
            keywords={extractedKeywords}
            approvedKeywords={approvedKeywords}
            setApprovedKeywords={setApprovedKeywords}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <RelationApproval
            keywords={approvedKeywords}
            relations={relations}
            setRelations={setRelations}
            onBack={prevStep}
            onComplete={handleComplete}
          />
        );
      default:
        return <div>Something went wrong</div>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Keyword Extraction</h1>
      
      {isCompleted ? (
        <div className="bg-black border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Extraction Complete!</h2>
          <p className="text-green-600 mb-6">
            You have successfully extracted and approved {approvedKeywords.length} keywords and {relations.length} relations.
          </p>
          <button
            onClick={() => {
              setStep(1);
              setSelectedCourse("");
              setSelectedChapters([]);
              setExtractedKeywords([]);
              setApprovedKeywords([]);
              setRelations([]);
              setIsCompleted(false);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Start New Extraction
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <ol className="flex items-center w-full">
              <li className={`flex items-center ${step >= 1 ? "text-blue-600" : "text-gray-500"}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                  1
                </span>
                <span className="ml-2">Course Selection</span>
              </li>
              <div className="w-10 h-0.5 mx-2 bg-gray-200"></div>
              <li className={`flex items-center ${step >= 2 ? "text-blue-600" : "text-gray-500"}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                  2
                </span>
                <span className="ml-2">Keyword Approval</span>
              </li>
              <div className="w-10 h-0.5 mx-2 bg-gray-200"></div>
              <li className={`flex items-center ${step >= 3 ? "text-blue-600" : "text-gray-500"}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                  3
                </span>
                <span className="ml-2">Relation Approval</span>
              </li>
            </ol>
          </div>

          <div className="bg-black p-6 rounded-lg shadow-md">
            {renderStep()}
          </div>
        </>
      )}
    </div>
  );
} 