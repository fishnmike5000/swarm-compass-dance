
import React, { useRef, useEffect, useState } from 'react';
import p5 from 'p5';

interface ParticleAnimationProps {
  isCompassMode: boolean;
  onReady: () => void;
}

const ParticleAnimation: React.FC<ParticleAnimationProps> = ({ isCompassMode, onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<p5 | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create the P5 instance
    const sketch = (p: p5) => {
      // Animation configuration
      const config = {
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

      // Particles array
      let particles: Particle[] = [];
      
      // Flow field and compass target positions
      let flowField: p5.Vector[] = [];
      let compassPoints: p5.Vector[] = [];
      let currentFrame = 0;
      let transitionStartFrame = 0;
      let isTransitioning = false;
      
      class Particle {
        position: p5.Vector;
        velocity: p5.Vector;
        acceleration: p5.Vector;
        targetPosition: p5.Vector | null;
        maxSpeed: number;
        baseSize: number;
        size: number;
        brightness: number;
        
        constructor(x: number, y: number) {
          this.position = p.createVector(x, y);
          this.velocity = p.createVector(
            p.random(-config.minVelocity, config.minVelocity),
            p.random(-config.minVelocity, config.minVelocity)
          );
          this.acceleration = p.createVector(0, 0);
          this.targetPosition = null;
          this.maxSpeed = p.random(config.minVelocity, config.maxVelocity);
          this.baseSize = p.random(config.particleSize * 0.7, config.particleSize * 1.3);
          this.size = this.baseSize;
          this.brightness = p.random(150, 255);
        }
        
        applyForce(force: p5.Vector) {
          this.acceleration.add(force);
        }
        
        followFlowField(flowField: p5.Vector[]) {
          const x = p.floor(this.position.x / config.flowFieldResolution);
          const y = p.floor(this.position.y / config.flowFieldResolution);
          const index = x + y * p.floor(p.width / config.flowFieldResolution);
          
          if (index >= 0 && index < flowField.length) {
            const force = flowField[index].copy();
            force.mult(config.flowFieldStrength);
            this.applyForce(force);
          }
        }
        
        moveToTarget() {
          if (this.targetPosition) {
            const dir = p5.Vector.sub(this.targetPosition, this.position);
            const distance = dir.mag();
            
            // Calculate steering force based on distance
            dir.normalize();
            const steeringStrength = p.map(
              distance,
              0, p.width * 0.5,
              0.01, 0.2
            );
            dir.mult(steeringStrength);
            
            this.applyForce(dir);
            
            // Pulse effect when close to target
            if (distance < 5) {
              this.size = this.baseSize * (1 + p.sin(currentFrame * 0.1) * 0.2);
            }
          }
        }
        
        update() {
          this.velocity.add(this.acceleration);
          this.velocity.limit(this.maxSpeed);
          this.position.add(this.velocity);
          this.acceleration.mult(0);
          
          // Slight pulsing effect
          this.size = this.baseSize * (1 + p.sin(currentFrame * 0.05 + this.baseSize) * 0.1);
          
          // Fade brightness slightly based on velocity
          this.brightness = p.map(
            this.velocity.mag(),
            0, this.maxSpeed,
            180, 255
          );
        }
        
        edges() {
          if (this.position.x > p.width) this.position.x = 0;
          if (this.position.x < 0) this.position.x = p.width;
          if (this.position.y > p.height) this.position.y = 0;
          if (this.position.y < 0) this.position.y = p.height;
        }
        
        display() {
          p.noStroke();
          
          // Glow effect
          p.fill(config.particleGlowColor);
          p.circle(this.position.x, this.position.y, this.size * 3);
          
          // Core
          p.fill(
            p.red(config.particleColor),
            p.green(config.particleColor),
            p.blue(config.particleColor),
            this.brightness
          );
          p.circle(this.position.x, this.position.y, this.size);
        }
      }
      
      // Setup function
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(containerRef.current!);
        p.pixelDensity(window.devicePixelRatio);
        p.frameRate(60);
        p.colorMode(p.RGB, 255, 255, 255, 255);
        p.blendMode(p.ADD);
        
        // Calculate particle count based on screen size
        const area = p.width * p.height;
        config.particleCount = Math.min(Math.floor(area / 10000), 300);
        
        // Initialize flow field
        const cols = p.floor(p.width / config.flowFieldResolution);
        const rows = p.floor(p.height / config.flowFieldResolution);
        
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const angle = p.noise(x * 0.1, y * 0.1) * p.TWO_PI * 2;
            const v = p5.Vector.fromAngle(angle);
            flowField.push(v);
          }
        }
        
        // Create compass points
        generateCompassPoints();
        
        // Create particles
        for (let i = 0; i < config.particleCount; i++) {
          particles.push(new Particle(
            p.random(p.width),
            p.random(p.height)
          ));
        }
        
        setIsReady(true);
        onReady();
      };
      
      const generateCompassPoints = () => {
        compassPoints = [];
        
        // Center of the compass
        const centerX = p.width / 2;
        const centerY = p.height / 2;
        
        // Radius of the compass
        const radius = Math.min(p.width, p.height) * 0.25;
        const smallRadius = radius * 0.5;
        
        // Cardinal points (N, E, S, W)
        const cardinalCount = 4;
        for (let i = 0; i < cardinalCount; i++) {
          const angle = (i * p.TWO_PI) / cardinalCount - p.PI / 4;
          const x = centerX + p.cos(angle) * radius;
          const y = centerY + p.sin(angle) * radius;
          compassPoints.push(p.createVector(x, y));
        }
        
        // Intercardinal points (NE, SE, SW, NW)
        const intercardinalCount = 4;
        for (let i = 0; i < intercardinalCount; i++) {
          const angle = (i * p.TWO_PI) / intercardinalCount;
          const x = centerX + p.cos(angle) * smallRadius;
          const y = centerY + p.sin(angle) * smallRadius;
          compassPoints.push(p.createVector(x, y));
        }
        
        // Center point
        compassPoints.push(p.createVector(centerX, centerY));
        
        // Additional decorative points
        const decorativeCount = Math.min(config.particleCount - compassPoints.length, 40);
        const decorativeAngles = 8;
        const decorativeRadii = decorativeCount / decorativeAngles;
        
        for (let i = 0; i < decorativeAngles; i++) {
          const angle = (i * p.TWO_PI) / decorativeAngles;
          for (let j = 1; j <= decorativeRadii; j++) {
            const r = (j / decorativeRadii) * radius * 1.2;
            const x = centerX + p.cos(angle) * r;
            const y = centerY + p.sin(angle) * r;
            compassPoints.push(p.createVector(x, y));
          }
        }
        
        // If we need more points, add them randomly around the compass
        while (compassPoints.length < config.particleCount) {
          const angle = p.random(p.TWO_PI);
          const r = p.random(radius * 1.3);
          const x = centerX + p.cos(angle) * r;
          const y = centerY + p.sin(angle) * r;
          compassPoints.push(p.createVector(x, y));
        }
      };
      
      // Draw function
      p.draw = () => {
        p.clear();
        p.background(10, 15, 30, 255);
        currentFrame++;
        
        // Check if we should start or stop transition
        if (isCompassMode && !isTransitioning) {
          startTransition();
        } else if (!isCompassMode && isTransitioning && 
                  currentFrame - transitionStartFrame > config.transitionDuration) {
          stopTransition();
        }
        
        // Update and display particles
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          
          if (isTransitioning) {
            // During transition, gradually move towards compass formation
            const progress = (currentFrame - transitionStartFrame) / config.transitionDuration;
            if (progress <= 1 && i < compassPoints.length) {
              particle.targetPosition = compassPoints[i];
              particle.moveToTarget();
            }
          } else if (!isCompassMode) {
            // In flow field mode
            particle.followFlowField(flowField);
            particle.edges();
          } else {
            // In full compass mode
            if (i < compassPoints.length) {
              particle.targetPosition = compassPoints[i];
              particle.moveToTarget();
            }
          }
          
          particle.update();
          particle.display();
        }
      };
      
      const startTransition = () => {
        isTransitioning = true;
        transitionStartFrame = currentFrame;
        
        // Shuffle particles to avoid bias in compass formation
        particles = [...particles].sort(() => Math.random() - 0.5);
        
        // Ensure all particles have a reference to a compass point, with priority to the
        // cardinal and intercardinal points
        for (let i = 0; i < Math.min(particles.length, compassPoints.length); i++) {
          particles[i].targetPosition = compassPoints[i];
        }
      };
      
      const stopTransition = () => {
        isTransitioning = false;
        
        // Clear target positions
        particles.forEach(p => {
          p.targetPosition = null;
          // Reset velocities to be more random
          p.velocity = p.createVector(
            p.random(-config.minVelocity, config.minVelocity),
            p.random(-config.minVelocity, config.minVelocity)
          );
        });
      };
      
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        
        // Recalculate flow field
        flowField = [];
        const cols = p.floor(p.width / config.flowFieldResolution);
        const rows = p.floor(p.height / config.flowFieldResolution);
        
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const angle = p.noise(x * 0.1, y * 0.1) * p.TWO_PI * 2;
            const v = p5.Vector.fromAngle(angle);
            flowField.push(v);
          }
        }
        
        // Recalculate compass points
        generateCompassPoints();
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
