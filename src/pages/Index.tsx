
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleAnimation from '@/components/ParticleAnimation';
import TransitionButton from '@/components/TransitionButton';

const Index = () => {
  const [isCompassMode, setIsCompassMode] = useState(false);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const navigate = useNavigate();
  
  const handleTransition = () => {
    setIsCompassMode(prev => !prev);
  };
  
  const handleAnimationReady = () => {
    setIsAnimationReady(true);
  };

  // Effect to redirect after 5 seconds when animation is complete
  useEffect(() => {
    let redirectTimer: number;
    
    if (isCompassMode) {
      redirectTimer = window.setTimeout(() => {
        navigate('/signup');
      }, 5000); // 5 seconds
    }
    
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [isCompassMode, navigate]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Animation */}
      <ParticleAnimation 
        isCompassMode={isCompassMode} 
        onReady={handleAnimationReady} 
      />
      
      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none p-6">
        <div className="max-w-xl w-full text-center transform -translate-y-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight fade-up delay-0">
              <span className="font-normal">AI Readiness</span> Audit
            </h1>
            
            <p className="text-white/80 max-w-md mx-auto fade-up delay-1">
              Technology-driven efficiency meets human strategic thinking
            </p>
            
            <div className="flex justify-center pt-4 fade-up delay-2">
              <TransitionButton 
                isCompassMode={isCompassMode}
                onClick={handleTransition}
                isAnimationReady={isAnimationReady}
                className="pointer-events-auto"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Attribution */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-sm fade-up delay-4">
        <p>Human-Validated Intelligence</p>
      </div>
    </div>
  );
};

export default Index;
