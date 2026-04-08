import { describe, it, expect } from 'vitest';
import { IdGenerator } from '../utils/IdGenerator';

describe('IdGenerator', () => {
  it('should generate a string of correct length', () => {
    const id = IdGenerator.generate();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(8); // IdGenerator produces 8 chars
  });

  it('should generate unique ids', () => {
    const id1 = IdGenerator.generate();
    const id2 = IdGenerator.generate();
    expect(id1).not.toBe(id2);
  });
});
