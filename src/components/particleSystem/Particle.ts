
import p5 from 'p5';
import { AnimationConfig, ParticleState } from './types';

export class Particle {
  position: p5.Vector;
  velocity: p5.Vector;
  acceleration: p5.Vector;
  targetPosition: p5.Vector | null;
  maxSpeed: number;
  baseSize: number;
  size: number;
  brightness: number;
  trail: p5.Vector[];
  trailLength: number;

  constructor(p: p5, x: number, y: number, config: AnimationConfig) {
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
    this.trailLength = 20; // Doubled the trail length from 10 to 20
    this.trail = [];
  }

  applyForce(force: p5.Vector) {
    this.acceleration.add(force);
  }

  followFlowField(p: p5, flowField: p5.Vector[], config: AnimationConfig) {
    const x = p.floor(this.position.x / config.flowFieldResolution);
    const y = p.floor(this.position.y / config.flowFieldResolution);
    const index = x + y * p.floor(p.width / config.flowFieldResolution);

    if (index >= 0 && index < flowField.length) {
      const force = flowField[index].copy();
      force.mult(config.flowFieldStrength);
      this.applyForce(force);
    }
  }

  moveToTarget(p: p5, currentFrame: number, steeringMultiplier: number = 1) {
    if (this.targetPosition) {
      const dir = p5.Vector.sub(this.targetPosition, this.position);
      const distance = dir.mag();

      // Calculate steering force based on distance
      dir.normalize();
      const steeringStrength = p.map(
        distance,
        0, p.width * 0.5,
        0.01, 0.2
      ) * steeringMultiplier; // Apply multiplier for warp effect

      dir.mult(steeringStrength);

      this.applyForce(dir);

      // Pulse effect when close to target
      if (distance < 5) {
        this.size = this.baseSize * (1 + p.sin(currentFrame * 0.1) * 0.2);
      }
    }
  }

  update(p: p5, currentFrame: number) {
    // Add current position to the trail before updating
    this.trail.push(this.position.copy());

    // Keep trail at specified length
    if (this.trail.length > this.trailLength) {
      this.trail.shift(); // Remove oldest position
    }

    // Normal update logic
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

  edges(p: p5) {
    if (this.position.x > p.width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = p.width;
    if (this.position.y > p.height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = p.height;

    // Clear trail when wrapping around edges to prevent visual artifacts
    if (this.position.x === 0 || this.position.x === p.width || 
        this.position.y === 0 || this.position.y === p.height) {
      this.trail = [];
    }
  }

  display(p: p5, config: AnimationConfig) {
    // Draw the trail
    if (this.trail.length > 1) {
      for (let i = 0; i < this.trail.length - 1; i++) {
        // Calculate alpha based on position in the trail
        const alpha = p.map(i, 0, this.trail.length - 1, 10, 150);
        const trailSize = p.map(i, 0, this.trail.length - 1, this.size * 0.5, this.size * 1.5);

        // Draw trail segment with gradient effect
        p.noStroke();
        const trailColor = p.color(
          p.red(config.particleGlowColor),
          p.green(config.particleGlowColor),
          p.blue(config.particleGlowColor),
          alpha * 0.5
        );
        p.fill(trailColor);
        p.circle(this.trail[i].x, this.trail[i].y, trailSize);
      }
    }

    // Glow effect for the main particle
    p.noStroke();
    p.fill(config.particleGlowColor);
    p.circle(this.position.x, this.position.y, this.size * 3);

    // Core of the particle
    p.fill(
      p.red(config.particleColor),
      p.green(config.particleColor),
      p.blue(config.particleColor),
      this.brightness
    );
    p.circle(this.position.x, this.position.y, this.size);
  }
}
