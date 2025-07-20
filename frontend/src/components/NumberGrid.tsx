import React, { memo, useState, useEffect } from 'react';

interface NumberGridProps {
  onNumberSelect: (number: number) => void;
  isExiting?: boolean;
}

export const NumberGrid: React.FC<NumberGridProps> = memo(({ onNumberSelect, isExiting = false }) => {
  const [visibleButtons, setVisibleButtons] = useState<Set<number>>(new Set());
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isExiting) {
      // Start exit animation
      setIsAnimatingOut(true);
      // Stagger the exit animation (reverse order)
      const buttons = Array.from({ length: 101 }, (_, i) => i).reverse();
      
      buttons.forEach((buttonIndex, arrayIndex) => {
        setTimeout(() => {
          setVisibleButtons(prev => {
            const newSet = new Set(prev);
            newSet.delete(buttonIndex);
            return newSet;
          });
        }, arrayIndex * 4); // 4ms delay between each button (faster exit)
      });
    } else {
      // Entrance animation
      setIsAnimatingOut(false);
      const animateButtons = () => {
        const buttons = Array.from({ length: 101 }, (_, i) => i);
        
        buttons.forEach((buttonIndex, arrayIndex) => {
          setTimeout(() => {
            setVisibleButtons(prev => new Set(prev).add(buttonIndex));
          }, arrayIndex * 8); // 8ms delay between each button
        });
      };

      // Start animation after a brief delay
      const timer = setTimeout(animateButtons, 100);
      return () => clearTimeout(timer);
    }
  }, [isExiting]);

  const handleNumberSelect = (number: number) => {
    if (isAnimatingOut) return; // Prevent selection during exit animation
    onNumberSelect(number);
  };

  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1 sm:gap-2 max-h-96 overflow-y-auto mb-4">
      {Array.from({ length: 101 }, (_, i) => (
        <button
          key={i}
          onClick={() => handleNumberSelect(i)}
          disabled={isAnimatingOut}
          className={`number-button aspect-square flex items-center justify-center transition-all duration-300 ease-out text-xs sm:text-sm ${
            visibleButtons.has(i) 
              ? 'opacity-100 transform translate-y-0 scale-100' 
              : 'opacity-0 transform translate-y-4 scale-90'
          } ${isAnimatingOut ? 'pointer-events-none' : ''}`}
        >
          {i}
        </button>
      ))}
    </div>
  );
});
