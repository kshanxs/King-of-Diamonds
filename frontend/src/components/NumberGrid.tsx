import React, { memo } from 'react';

interface NumberGridProps {
  onNumberSelect: (number: number) => void;
}

export const NumberGrid: React.FC<NumberGridProps> = memo(({ onNumberSelect }) => {
  return (
    <div className="grid grid-cols-10 gap-2 max-h-96 overflow-y-auto mb-4">
      {Array.from({ length: 101 }, (_, i) => (
        <button
          key={i}
          onClick={() => onNumberSelect(i)}
          className="number-button aspect-square flex items-center justify-center"
        >
          {i}
        </button>
      ))}
    </div>
  );
});
