import { Metadata } from "next";
import { FlashCardComponent } from "@/components/courses/flashcard";
import flashcardsData from "@/data/flashcards_calculus.json";

export const metadata: Metadata = {
  title: "Flash Cards",
  description: "Review and study with AI-generated flash cards",
};

// Convert data from JSON file
const flashCards = flashcardsData.cards.map(card => ({
  id: card.id,
  question: card.front,
  answer: card.back
}));

export default function FlashCardsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Flash Cards</h2>
        <p className="text-muted-foreground">
          {flashcardsData.title} - Review and study with mathematical concepts
        </p>
      </div>
      
      <div className="py-4">
        <FlashCardComponent cards={flashCards} setId="calculus" />
      </div>
      
      <div className="bg-muted/50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-medium mb-2">How to Use Flash Cards</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Click on a card to flip between question and answer</li>
          <li>Use the arrow buttons to navigate between cards</li>
          <li>Try to answer the question before revealing the answer</li>
          <li>After revealing the answer, rate how difficult it was:</li>
          <ul className="list-none pl-6 pt-2 flex flex-col sm:flex-row gap-3">
            <li className="flex items-center">
              <span className="text-xl mr-2">😊</span> 
              <span>Easy - I knew this</span>
            </li>
            <li className="flex items-center">
              <span className="text-xl mr-2">🤔</span> 
              <span>Medium - Somewhat challenging</span>
            </li>
            <li className="flex items-center">
              <span className="text-xl mr-2">😵</span> 
              <span>Hard - Need more practice</span>
            </li>
          </ul>
          <li>Your progress is tracked at the top with a progress bar</li>
          <li>The progress bar shows your overall completion and difficulty breakdown</li>
          <li>Your ratings are saved so you can focus on harder cards in future sessions</li>
          <li>When signed in, your progress is saved to your account</li>
          <li>Study regularly for better retention</li>
        </ul>
      </div>
    </div>
  );
} 