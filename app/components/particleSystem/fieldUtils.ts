
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
  
  // Center of the screen
  const centerX = p.width / 2;
  const centerY = p.height / 2;
  
  // Size of the square - using a percentage of the smaller dimension
  const size = Math.min(p.width, p.height) * 0.3;
  
  // Four corners of a square
  compassPoints.push(p.createVector(centerX - size/2, centerY - size/2)); // Top left
  compassPoints.push(p.createVector(centerX + size/2, centerY - size/2)); // Top right
  compassPoints.push(p.createVector(centerX + size/2, centerY + size/2)); // Bottom right
  compassPoints.push(p.createVector(centerX - size/2, centerY + size/2)); // Bottom left
  
  // If we need more points (for other particles that aren't part of the square)
  // distribute them randomly
  while (compassPoints.length < config.particleCount) {
    const angle = p.random(p.TWO_PI);
    const r = p.random(size * 1.5);
    const x = centerX + p.cos(angle) * r;
    const y = centerY + p.sin(angle) * r;
    compassPoints.push(p.createVector(x, y));
  }
  
  return compassPoints;
}
