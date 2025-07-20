import React from 'react';
import { triggerHaptic } from '../utils/haptics';

interface GameCountdownProps {
  countdown: number;
}

export const GameCountdown: React.FC<GameCountdownProps> = ({ countdown }) => {
  React.useEffect(() => {
    if (countdown === 3 || countdown === 2 || countdown === 1) {
      triggerHaptic();
    }
    if (countdown === 0) {
      // 0 is typically 'Start', so trigger haptic for 'Start' as well
      triggerHaptic(60); // slightly longer vibration for emphasis
    }
  }, [countdown]);
  return (
    <div className="glass-card p-8 text-center">
      <h2 className="text-4xl font-bold text-white mb-4">Game Starting...</h2>
      <div className="text-8xl font-bold text-diamond-400 animate-pulse">
        {countdown === 0 ? 'Start' : countdown}
      </div>
    </div>
  );
};
