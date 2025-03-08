
import p5 from 'p5';
import { AnimationConfig } from './types';

export function generateFlowField(p: p5, config: AnimationConfig): p5.Vector[] {
  const flowField: p5.Vector[] = [];
  const cols = p.floor(p.width / config.flowFieldResolution);
  const rows = p.floor(p.height / config.flowFieldResolution);
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const angle = p.noise(x * 0.1, y * 0.1) * p.TWO_PI * 2;
      const v = p5.Vector.fromAngle(angle);
      flowField.push(v);
    }
  }
  
  return flowField;
}

export function generateCompassPoints(p: p5, config: AnimationConfig): p5.Vector[] {
  const compassPoints: p5.Vector[] = [];
  
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
  
  return compassPoints;
}
