import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/shadcn/components/ui/carousel';
import { Flashcard } from './Flashcard';
import type { Flashcard as FlashcardType } from '@/services/recapService';

interface FlashcardData {
  id: string;
  number: number;
  question: string;
  answer: string;
  isAnswered?: boolean;
}

interface FlashcardCarouselProps {
  flashcards: FlashcardData[];
  flashcardData?: FlashcardType[]; // Full flashcard data for stats
  onCorrect?: (flashcardId: string) => void;
  onIncorrect?: (flashcardId: string) => void;
  onDelete?: (flashcardId: string) => void;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const FlashcardCarousel = ({
  flashcards,
  flashcardData: _flashcardData,
  onCorrect,
  onIncorrect,
  onDelete,
}: FlashcardCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [shuffledFlashcards, setShuffledFlashcards] = useState<FlashcardData[]>(flashcards);
  const previousFlashcardIdsRef = useRef<string>('');

  // Shuffle flashcards only when the actual flashcard IDs change (not just array reference)
  useEffect(() => {
    const currentIds = flashcards.map(fc => fc.id).join(',');
    // Only shuffle if the IDs have actually changed
    if (currentIds !== previousFlashcardIdsRef.current) {
      setShuffledFlashcards(shuffleArray(flashcards));
      previousFlashcardIdsRef.current = currentIds;
    }
  }, [flashcards]);

  // Reset carousel to first slide when it's ready
  useEffect(() => {
    if (api) {
      api.scrollTo(0);
    }
  }, [api]);

  const handleAnswer = useCallback(
    (flashcardId: string, isCorrect: boolean) => {
      // Call the callback
      if (isCorrect && onCorrect) {
        onCorrect(flashcardId);
      } else if (!isCorrect && onIncorrect) {
        onIncorrect(flashcardId);
      }

      // Move to next card after a short delay
      setTimeout(() => {
        if (api) {
          const isLastCard = current === shuffledFlashcards.length - 1;
          if (isLastCard) {
            // Loop back to the first card
            api.scrollTo(0);
          } else {
            // Move to next flashcard
            api.scrollNext();
          }
        }
      }, 300); // Small delay to show the button click feedback
    },
    [api, current, shuffledFlashcards.length, onCorrect, onIncorrect]
  );

  // Track current slide
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  return (
    <div className='relative w-full'>
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true, // Enable looping so it goes back to start
        }}
        className='w-full'
      >
        <CarouselContent className='-ml-2 md:-ml-4'>
          {shuffledFlashcards.map((flashcard, index) => (
            <CarouselItem key={`${flashcard.id}-${index}`} className='pl-2 md:pl-4 basis-full'>
              <Flashcard
                id={flashcard.id}
                number={index + 1}
                question={flashcard.question}
                answer={flashcard.answer}
                isAnswered={flashcard.isAnswered}
                onCorrect={onCorrect ? () => handleAnswer(flashcard.id, true) : undefined}
                onIncorrect={onIncorrect ? () => handleAnswer(flashcard.id, false) : undefined}
                onDelete={onDelete}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='absolute left-2 top-1/2 -translate-y-1/2 z-10' />
        <CarouselNext className='absolute right-2 top-1/2 -translate-y-1/2 z-10' />
      </Carousel>
    </div>
  );
};
