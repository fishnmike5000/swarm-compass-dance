
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, RotateCw } from 'lucide-react';

interface TransitionButtonProps {
  isCompassMode: boolean;
  onClick: () => void;
  className?: string;
  isAnimationReady: boolean;
}

const TransitionButton: React.FC<TransitionButtonProps> = ({
  isCompassMode,
  onClick,
  className,
  isAnimationReady
}) => {
  return (
    <button
      onClick={onClick}
      disabled={!isAnimationReady}
      className={cn(
        'transition-button relative flex items-center gap-2 z-10',
        'animate-fade-in opacity-0',
        !isAnimationReady && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={isCompassMode ? 'Return to flow field' : 'Form square'}
    >
      <span className="relative z-10">
        {isCompassMode ? 'Return to Flow' : 'Form Square'}
      </span>
      {isCompassMode ? (
        <RotateCw className="w-4 h-4 relative z-10" />
      ) : (
        <ArrowRight className="w-4 h-4 relative z-10" />
      )}
    </button>
  );
};

export default TransitionButton;
