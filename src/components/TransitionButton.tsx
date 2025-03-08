
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
        'bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full',
        'hover:bg-white/30 transition-all duration-300',
        'border border-white/40 text-white font-medium',
        'shadow-lg shadow-black/20',
        'slow-flicker-animation',
        !isAnimationReady && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={isCompassMode ? 'Return to flow field' : 'Access Now'}
    >
      <span className="relative z-10 text-white text-base">
        {isCompassMode ? 'Return to Flow' : 'Access Now'}
      </span>
      {isCompassMode ? (
        <ArrowRight className="w-4 h-4 relative z-10" />
      ) : (
        <Sparkles className="w-5 h-5 relative z-10" />
      )}
    </button>
  );
};

export default TransitionButton;
