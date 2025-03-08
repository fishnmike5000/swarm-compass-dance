
import React, { useRef, useEffect, useState } from 'react';
import p5 from 'p5';
import { ParticleAnimationProps } from './particleSystem/types';
import { AnimationSystem } from './particleSystem/AnimationSystem';

const ParticleAnimation: React.FC<ParticleAnimationProps> = ({ isCompassMode, onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<p5 | null>(null);
  const systemRef = useRef<AnimationSystem | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create the P5 instance
    const sketch = (p: p5) => {
      // Create animation system
      systemRef.current = new AnimationSystem(p, () => {
        setIsReady(true);
        onReady();
      });
      
      // Setup function
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(containerRef.current!);
        systemRef.current?.setup();
      };
      
      // Draw function
      p.draw = () => {
        systemRef.current?.update(isCompassMode);
      };
      
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        systemRef.current?.windowResized();
      };
    };

    // Clean up previous instance
    if (canvasRef.current) {
      canvasRef.current.remove();
    }

    // Create new P5 instance
    canvasRef.current = new p5(sketch);

    // Cleanup
    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }, [isCompassMode, onReady]);

  return <div ref={containerRef} className="canvas-container" />;
};

export default ParticleAnimation;
