import p5 from 'p5';
import { Particle } from './Particle';
import { generateFlowField, generateCompassPoints } from './fieldUtils';
import { AnimationConfig } from './types';

export class AnimationSystem {
  p: p5;
  config: AnimationConfig;
  particles: Particle[] = [];
  flowField: p5.Vector[] = [];
  compassPoints: p5.Vector[] = [];
  currentFrame: number = 0;
  transitionStartFrame: number = 0;
  isTransitioning: boolean = false;
  onReadyCallback: () => void;

  constructor(p: p5, onReady: () => void) {
    this.p = p;
    this.onReadyCallback = onReady;

    // Animation configuration - will be initialized in setup
    this.config = {
      particleCount: 0, // Will be set based on screen size
      particleSize: 3,
      flowFieldResolution: 20,
      flowFieldStrength: 0.1,
      transitionDuration: 120, // frames
      minVelocity: 0.1,
      maxVelocity: 1.5,
      particleColor: p.color(255, 255, 255, 200),
      particleGlowColor: p.color(100, 150, 255, 50),
    };
  }

  setup() {
    this.p.pixelDensity(window.devicePixelRatio);
    this.p.frameRate(60);
    this.p.colorMode(this.p.RGB, 255, 255, 255, 255);
    this.p.blendMode(this.p.ADD);
    
    // Calculate particle count based on screen size
    const area = this.p.width * this.p.height;
    this.config.particleCount = Math.min(Math.floor(area / 10000), 300);
    
    // Initialize flow field
    this.flowField = generateFlowField(this.p, this.config);
    
    // Create square points
    this.compassPoints = generateCompassPoints(this.p, this.config);
    
    // Create particles
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push(new Particle(
        this.p,
        this.p.random(this.p.width),
        this.p.random(this.p.height),
        this.config
      ));
    }
    
    this.onReadyCallback();
  }

  update(isCompassMode: boolean) {
    this.p.clear();
    this.p.background(10, 15, 30, 255);
    this.currentFrame++;
    
    // Check if we should start or stop transition
    if (isCompassMode && !this.isTransitioning) {
      this.startTransition();
    } else if (!isCompassMode && this.isTransitioning && 
              this.currentFrame - this.transitionStartFrame > this.config.transitionDuration) {
      this.stopTransition();
    }
    
    // Update and display particles
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      if (this.isTransitioning) {
        // During transition, gradually move towards square formation
        const progress = (this.currentFrame - this.transitionStartFrame) / this.config.transitionDuration;
        if (progress <= 1) {
          // First 4 particles go to the square corners
          if (i < 4) {
            particle.targetPosition = this.compassPoints[i];
            particle.moveToTarget(this.p, this.currentFrame);
          } else {
            // Other particles move randomly
            particle.followFlowField(this.p, this.flowField, this.config);
            particle.edges(this.p);
          }
        }
      } else if (!isCompassMode) {
        // In flow field mode
        particle.followFlowField(this.p, this.flowField, this.config);
        particle.edges(this.p);
      } else {
        // In full square mode
        if (i < 4) {
          particle.targetPosition = this.compassPoints[i];
          particle.moveToTarget(this.p, this.currentFrame);
        } else {
          // Other particles continue to move freely
          particle.followFlowField(this.p, this.flowField, this.config);
          particle.edges(this.p);
        }
      }
      
      particle.update(this.p, this.currentFrame);
      particle.display(this.p, this.config);
    }
  }

  windowResized() {
    // Recalculate flow field
    this.flowField = generateFlowField(this.p, this.config);
    
    // Recalculate square points
    this.compassPoints = generateCompassPoints(this.p, this.config);
  }

  startTransition() {
    this.isTransitioning = true;
    this.transitionStartFrame = this.currentFrame;
    
    // Make sure the first 4 particles are the best candidates to form the square corners
    // Sort particles based on their current positions to find ones closest to the target positions
    
    // Temporary array of particles with their distances to targets
    const particlesWithDistances = this.particles.map((particle, index) => {
      // Find the closest corner point to this particle
      let minDistance = Number.MAX_VALUE;
      let closestCornerIndex = 0;
      
      // Only consider the 4 corner points
      for (let i = 0; i < 4; i++) {
        const cornerPoint = this.compassPoints[i];
        const dist = p5.Vector.dist(particle.position, cornerPoint);
        if (dist < minDistance) {
          minDistance = dist;
          closestCornerIndex = i;
        }
      }
      
      return {
        particle,
        distance: minDistance,
        cornerIndex: closestCornerIndex
      };
    });
    
    // Sort by distance
    particlesWithDistances.sort((a, b) => a.distance - b.distance);
    
    // Create a new sorted array of particles
    this.particles = particlesWithDistances.map(item => item.particle);
    
    // Assign the corner targets to the first 4 particles
    for (let i = 0; i < 4; i++) {
      this.particles[i].targetPosition = this.compassPoints[i];
    }
  }

  stopTransition() {
    this.isTransitioning = false;
    
    // Clear target positions
    this.particles.forEach(particle => {
      particle.targetPosition = null;
      // Reset velocities to be more random using p5 instance
      particle.velocity = this.p.createVector(
        this.p.random(-this.config.minVelocity, this.config.minVelocity),
        this.p.random(-this.config.minVelocity, this.config.minVelocity)
      );
    });
  }
}
