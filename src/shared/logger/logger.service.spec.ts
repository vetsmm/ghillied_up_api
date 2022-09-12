import { AppLogger } from './logger.service';

import { describe, it, expect } from '@jest/globals';

describe('AppLogger', () => {
  it('should be defined', () => {
    expect(new AppLogger()).toBeDefined();
  });
});
