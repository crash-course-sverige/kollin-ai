"use client";

import { useState, useEffect, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownMath } from "@/components/ui/markdown-math";
import { ProgressBar } from "@/components/ui/progress-bar";
import { saveFlashcardProgress } from "@/lib/actions/flashcard-progress";
import { useSession } from "next-auth/react";

interface FlashCard {
  id: number;
  question: string;
  answer: string;
}

interface FlashCardProps {
  cards: FlashCard[];
  setId?: string;
}

type Difficulty = 'easy' | 'medium' | 'hard' | null;

export function FlashCardComponent({ cards, setId = "default" }: FlashCardProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardDifficulties, setCardDifficulties] = useState<Record<number, Difficulty>>({});
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();

  // Statistics state
  const [statistics, setStatistics] = useState({
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0
  });

  // Load saved difficulties from localStorage if available
  useEffect(() => {
    const savedDifficulties = localStorage.getItem(`flashcard-difficulties-${setId}`);
    if (savedDifficulties) {
      const parsed = JSON.parse(savedDifficulties);
      setCardDifficulties(parsed);
      
      // Calculate statistics
      const easy = Object.values(parsed).filter(d => d === 'easy').length;
      const medium = Object.values(parsed).filter(d => d === 'medium').length;
      const hard = Object.values(parsed).filter(d => d === 'hard').length;
      
      setStatistics({
        easyCount: easy,
        mediumCount: medium,
        hardCount: hard
      });
    }
  }, [setId]);

  // Save difficulties to localStorage when they change
  useEffect(() => {
    if (Object.keys(cardDifficulties).length > 0) {
      localStorage.setItem(`flashcard-difficulties-${setId}`, JSON.stringify(cardDifficulties));
      
      // Update statistics
      const easy = Object.values(cardDifficulties).filter(d => d === 'easy').length;
      const medium = Object.values(cardDifficulties).filter(d => d === 'medium').length;
      const hard = Object.values(cardDifficulties).filter(d => d === 'hard').length;
      
      setStatistics({
        easyCount: easy,
        mediumCount: medium,
        hardCount: hard
      });
    }
  }, [cardDifficulties, setId]);

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prevIndex) => 
      prevIndex === 0 ? cards.length - 1 : prevIndex - 1
    );
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prevIndex) => 
      prevIndex === cards.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleDifficultyRating = (difficulty: Difficulty) => {
    // Only allow rating after seeing the answer
    if (!isFlipped || !difficulty) return;
    
    // Update local state
    setCardDifficulties(prev => ({
      ...prev,
      [currentCard.id]: difficulty
    }));
    
    // If user is logged in, save to database
    if (session?.user) {
      startTransition(async () => {
        try {
          await saveFlashcardProgress(
            currentCard.id,
            setId,
            difficulty
          );
        } catch (error) {
          console.error("Failed to save progress:", error);
        }
      });
    }
  };

  const currentCard = cards[currentCardIndex];
  const currentDifficulty = cardDifficulties[currentCard.id] || null;
  const totalReviewed = Object.keys(cardDifficulties).length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <ProgressBar 
        totalCards={cards.length}
        reviewedCards={totalReviewed}
        statistics={statistics}
      />
      
      <div className="relative">
        <div 
          className="aspect-[3/2] bg-card text-card-foreground shadow-lg rounded-xl border p-8 cursor-pointer"
          onClick={handleFlip}
        >
          <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
            <div className="flip-card-front">
              <h3 className="text-xl font-semibold mb-4">Question</h3>
              <MarkdownMath className="text-lg">
                {currentCard.question}
              </MarkdownMath>
            </div>
            <div className="flip-card-back">
              <h3 className="text-xl font-semibold mb-4">Answer</h3>
              <MarkdownMath className="text-lg">
                {currentCard.answer}
              </MarkdownMath>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 -left-4">
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full bg-background shadow-md"
            onClick={handlePrevCard}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 -right-4">
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full bg-background shadow-md"
            onClick={handleNextCard}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center mt-6 space-y-3">
        <div className="text-sm text-muted-foreground">
          Card {currentCardIndex + 1} of {cards.length}
        </div>

        <div className="flex items-center justify-center space-x-6">
          <button 
            onClick={() => handleDifficultyRating('easy')}
            className={`difficulty-emoji text-2xl transition-transform hover:scale-125 ${isPending ? 'opacity-50' : ''} ${currentDifficulty === 'easy' ? 'opacity-100 scale-125' : 'opacity-70'} ${!isFlipped ? 'pointer-events-none opacity-40' : ''}`}
            title="Easy"
            aria-label="Rate as easy"
            disabled={isPending}
          >
            😊
          </button>
          <button 
            onClick={() => handleDifficultyRating('medium')}
            className={`difficulty-emoji text-2xl transition-transform hover:scale-125 ${isPending ? 'opacity-50' : ''} ${currentDifficulty === 'medium' ? 'opacity-100 scale-125' : 'opacity-70'} ${!isFlipped ? 'pointer-events-none opacity-40' : ''}`}
            title="Medium"
            aria-label="Rate as medium"
            disabled={isPending}
          >
            🤔
          </button>
          <button 
            onClick={() => handleDifficultyRating('hard')}
            className={`difficulty-emoji text-2xl transition-transform hover:scale-125 ${isPending ? 'opacity-50' : ''} ${currentDifficulty === 'hard' ? 'opacity-100 scale-125' : 'opacity-70'} ${!isFlipped ? 'pointer-events-none opacity-40' : ''}`}
            title="Hard"
            aria-label="Rate as hard"
            disabled={isPending}
          >
            😵
          </button>
        </div>
        {!isFlipped && (
          <p className="text-xs text-muted-foreground italic">Flip card to rate difficulty</p>
        )}
        {isPending && (
          <p className="text-xs text-muted-foreground">Saving your progress...</p>
        )}
      </div>
    </div>
  );
} 