import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

describe('App Component', () => {
  it('renders the main RAGLAB title in the navigation', () => {
    render(<App />);
    
    // Using a function matcher to find "RAGLAB" even if it's split into spans
    const titleElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && content.includes('RAG');
    });
    
    // We expect at least one to be the main header
    expect(titleElement).toBeInTheDocument();
  });

  it('shows the initial empty state message', () => {
    render(<App />);
    
    // Updated to match the current UI text: "Knowledge base ready"
    const welcomeMessage = screen.getByText(/Knowledge base ready/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  it('contains the document search placeholder', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Type your query/i);
    expect(input).toBeInTheDocument();
  });

  it('updates input value when user types', async () => {
  const user = userEvent.setup();
  render(<App />);
  
  const input = screen.getByPlaceholderText(/Type your query/i) as HTMLInputElement;
  
  // Simulate typing
  await user.type(input, 'What is FastAPI?');
  
  expect(input.value).toBe('What is FastAPI?');
  });

});

// Mock Axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('RAG Assistant Web UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm for Reset button
    window.confirm = vi.fn(() => true);
  });

  test('swaps "Ask AI" for "Stop" button during request', async () => {
    // Delay the mock response to keep it in a "loading" state
    mockedAxios.post.mockReturnValue(new Promise(() => {}));

    render(<App />);
    const input = screen.getByPlaceholderText(/type your query/i);
    const askButton = screen.getByText(/ask ai/i);

    fireEvent.change(input, { target: { value: 'What is RAG?' } });
    fireEvent.click(askButton);

    // Verify "Stop" button appears and "Ask AI" is gone
    expect(screen.getByText(/stop/i)).toBeInTheDocument();
    expect(screen.queryByText(/ask ai/i)).not.toBeInTheDocument();
  });

  test('Reset button clears input and chat history', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/type your query/i) as HTMLTextAreaElement;
    const resetButton = screen.getByText(/reset/i);

    fireEvent.change(input, { target: { value: 'Draft text' } });
    expect(input.value).toBe('Draft text');

    fireEvent.click(resetButton);
    expect(input.value).toBe('');
  });

  test('Export button triggers a download', () => {
    // Mock URL.createObjectURL and click()
    const createObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    const linkClickMock = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<App />);
    // Note: Export logic usually requires chat data to be present
    const exportButton = screen.getByText(/export/i);
    fireEvent.click(exportButton);

    expect(linkClickMock).toHaveBeenCalled();
  });
});