import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

// 1. Mock the axios module
vi.mock('axios');

describe('RAG Assistant UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Fix for the URL global
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'mock-url'),
      revokeObjectURL: vi.fn(),
    });

    window.confirm = vi.fn(() => true);
  });

  it('renders the new main title and subheader', () => {
    render(<App />);
    expect(screen.getByText(/RAG Assistant/i)).toBeInTheDocument();
  });

  it('updates input value when user types', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByPlaceholderText(/know/i) as HTMLTextAreaElement;
    
    await user.type(input, 'What is FastAPI?');
    expect(input.value).toBe('What is FastAPI?');
  });

  it('swaps "Ask AI" for "Stop" button during request', async () => {
    // 2. Access the mock directly through the axios import to satisfy TS and Lint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios.post as any).mockReturnValue(new Promise(() => {}));

    render(<App />);
    const input = screen.getByPlaceholderText(/What would you like to know/i);
    const askButton = screen.getByRole('button', { name: /ask ai/i });

    fireEvent.change(input, { target: { value: 'What is RAG?' } });
    fireEvent.click(askButton);

    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ask ai/i })).not.toBeInTheDocument();
  });

  it('Export button triggers a download link click', () => {
    const linkClickMock = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<App />);
    const exportButton = screen.getByText(/export/i);
    fireEvent.click(exportButton);

    expect(linkClickMock).toHaveBeenCalled();
    linkClickMock.mockRestore();
  });

  it('Reset button clears the textarea', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/know/i) as HTMLTextAreaElement;
    const resetButton = screen.getByText(/reset/i);

    fireEvent.change(input, { target: { value: 'Some random text' } });
    expect(input.value).toBe('Some random text');

    fireEvent.click(resetButton);
    // Since we mocked confirm to return true, it should clear
    expect(input.value).toBe('');
  });

  it('Export button triggers a download link click', () => {
    // Mock the click behavior of anchors
    const linkClickMock = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<App />);
    const exportButton = screen.getByText(/export/i);
    fireEvent.click(exportButton);

    expect(linkClickMock).toHaveBeenCalled();
    linkClickMock.mockRestore();
  });
});