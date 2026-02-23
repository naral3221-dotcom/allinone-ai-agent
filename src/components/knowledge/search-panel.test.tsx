import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchPanel } from './search-panel';

const mockResults = [
  { title: 'Result One', content: 'First result content', similarity: 0.95 },
  { title: 'Result Two', content: 'Second result content', similarity: 0.82 },
];

describe('SearchPanel', () => {
  const defaultProps = {
    onSearch: vi.fn().mockResolvedValue([]),
  };

  it('renders search input and button', () => {
    render(<SearchPanel {...defaultProps} />);
    expect(screen.getByTestId('search-input')).toBeDefined();
    expect(screen.getByTestId('search-button')).toBeDefined();
  });

  it('search disabled when empty', () => {
    render(<SearchPanel {...defaultProps} />);
    const button = screen.getByTestId('search-button');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('calls onSearch and displays results', async () => {
    const onSearch = vi.fn().mockResolvedValue(mockResults);
    render(<SearchPanel onSearch={onSearch} />);

    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'test query' },
    });
    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test query');
    });

    await waitFor(() => {
      expect(screen.getByTestId('search-results')).toBeDefined();
      expect(screen.getByText('Result One')).toBeDefined();
      expect(screen.getByText('Result Two')).toBeDefined();
    });
  });

  it('shows similarity percentage', async () => {
    const onSearch = vi.fn().mockResolvedValue(mockResults);
    render(<SearchPanel onSearch={onSearch} />);

    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'query' },
    });
    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(screen.getByText('95.0%')).toBeDefined();
      expect(screen.getByText('82.0%')).toBeDefined();
    });
  });

  it('Enter key triggers search', async () => {
    const onSearch = vi.fn().mockResolvedValue(mockResults);
    render(<SearchPanel onSearch={onSearch} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'enter query' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('enter query');
    });
  });
});
