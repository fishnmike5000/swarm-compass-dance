
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
  centerPoint: p5.Vector;

  constructor(p: p5, onReady: () => void) {
    this.p = p;
    this.onReadyCallback = onReady;
    this.centerPoint = p.createVector(0, 0); // Will be properly set in setup
    
    // Animation configuration - will be initialized in setup
    this.config = {
      particleCount: 0, // Will be set based on screen size
      particleSize: 3,
      flowFieldResolution: 20,
      flowFieldStrength: 0.1,
      transitionDuration: 120, // frames (approx 2 seconds at 60fps)
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
    
    // Set center point to the vertical center but slightly higher horizontally
    // This positions it where the button will be
    this.centerPoint = this.p.createVector(this.p.width / 2, this.p.height / 2 - this.p.height * 0.06);
    
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
    
    // Calculate transition progress once for all particles
    let transitionProgress = 0;
    if (this.isTransitioning) {
      transitionProgress = Math.min(1, (this.currentFrame - this.transitionStartFrame) / this.config.transitionDuration);
    }
    
    // Update and display particles
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      if (this.isTransitioning) {
        // During transition, all particles move toward center
        const progress = transitionProgress;
        
        if (progress <= 1) {
          // All particles zip toward the center
          particle.targetPosition = this.centerPoint;
          
          // Increase steering strength as transition progresses for "warp" effect
          const steeringMultiplier = this.p.map(progress, 0, 1, 1, 5);
          particle.moveToTarget(this.p, this.currentFrame, steeringMultiplier);
          
          // Increase speed and size based on progress for warp effect
          particle.maxSpeed = this.p.map(progress, 0, 1, this.config.maxVelocity, this.config.maxVelocity * 3);
          particle.size = particle.baseSize * (1 + progress * 2); // Grow particles as they approach center
        }
      } else if (!isCompassMode) {
        // In flow field mode
        particle.followFlowField(this.p, this.flowField, this.config);
        particle.edges(this.p);
      } else {
        // In compass mode (after transition)
        // Keep particles near center with some random movement
        if (this.p.random(1) < 0.02) { // Occasionally give particles a push
          const randomAngle = this.p.random(this.p.TWO_PI);
          const randomForce = this.p.createVector(
            Math.cos(randomAngle) * 0.05,
            Math.sin(randomAngle) * 0.05
          );
          particle.applyForce(randomForce);
        }
        
        // Make particles orbit around center if they get too far
        const distToCenter = this.p.dist(
          particle.position.x, particle.position.y, 
          this.centerPoint.x, this.centerPoint.y
        );
        
        if (distToCenter > 100) {
          const toCenter = this.p.createVector(
            this.centerPoint.x - particle.position.x,
            this.centerPoint.y - particle.position.y
          );
          toCenter.normalize();
          toCenter.mult(0.1);
          particle.applyForce(toCenter);
        }
      }
      
      // Pass transition information to the update method
      particle.update(this.p, this.currentFrame, this.isTransitioning, transitionProgress);
      particle.display(this.p, this.config);
    }
  }

  windowResized() {
    // Update center point
    this.centerPoint = this.p.createVector(this.p.width / 2, this.p.height / 2 - this.p.height * 0.06);
    
    // Recalculate flow field
    this.flowField = generateFlowField(this.p, this.config);
    
    // Recalculate square points
    this.compassPoints = generateCompassPoints(this.p, this.config);
  }

  startTransition() {
    this.isTransitioning = true;
    this.transitionStartFrame = this.currentFrame;
    
    // Set all particles to head toward center
    this.particles.forEach(particle => {
      particle.targetPosition = this.centerPoint;
      // Increase initial velocity toward center for more dramatic effect
      const toCenter = this.p.createVector(
        this.centerPoint.x - particle.position.x,
        this.centerPoint.y - particle.position.y
      );
      toCenter.normalize();
      toCenter.mult(this.config.maxVelocity * 0.5);
      particle.velocity = toCenter;
    });
  }

  stopTransition() {
    this.isTransitioning = false;
    
    // Scatter particles from center with high velocity
    this.particles.forEach(particle => {
      particle.targetPosition = null;
      // Reset particle properties
      particle.maxSpeed = this.p.random(this.config.minVelocity, this.config.maxVelocity);
      particle.size = particle.baseSize;
      
      // Give particles explosive velocity outward from center
      const angle = this.p.random(this.p.TWO_PI);
      const speed = this.p.random(this.config.minVelocity * 5, this.config.maxVelocity * 5);
      particle.velocity = this.p.createVector(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    });
  }
}
