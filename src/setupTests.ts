import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock scrollIntoView because JSDom doesn't implement it
window.HTMLElement.prototype.scrollIntoView = vi.fn();