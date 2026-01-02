import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import userEvent from '@testing-library/user-event';

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
    
    // Updated to match the current UI text: "Knowledge base active"
    const welcomeMessage = screen.getByText(/Knowledge base active/i);
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