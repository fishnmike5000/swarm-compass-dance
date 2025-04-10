
import p5 from 'p5';

export interface ParticleAnimationProps {
  isCompassMode: boolean;
  onReady: () => void;
}

export interface AnimationConfig {
  particleCount: number;
  particleSize: number;
  flowFieldResolution: number;
  flowFieldStrength: number;
  transitionDuration: number;
  minVelocity: number;
  maxVelocity: number;
  particleColor: p5.Color;
  particleGlowColor: p5.Color;
}

export interface ParticleState {
  position: p5.Vector;
  velocity: p5.Vector;
  acceleration: p5.Vector;
  targetPosition: p5.Vector | null;
  maxSpeed: number;
  baseSize: number;
  size: number;
  brightness: number;
}
