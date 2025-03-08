
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, Sparkles } from 'lucide-react';

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
        'bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full',
        'hover:bg-black/30 transition-all duration-300',
        'border border-white/20 text-white',
        'animate-fade-in opacity-0',
        !isAnimationReady && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={isCompassMode ? 'Return to flow field' : 'Access Now'}
    >
      <span className="relative z-10">
        {isCompassMode ? 'Return to Flow' : 'Access Now'}
      </span>
      {isCompassMode ? (
        <ArrowRight className="w-4 h-4 relative z-10" />
      ) : (
        <Sparkles className="w-4 h-4 relative z-10" />
      )}
    </button>
  );
};

export default TransitionButton;
