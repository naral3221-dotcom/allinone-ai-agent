import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationList, type ConversationItem } from './conversation-list';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/chat/conv-1'),
}));

describe('ConversationList', () => {
  const conversations: ConversationItem[] = [
    { id: 'conv-1', title: 'First Chat', updatedAt: '2026-02-23T10:00:00Z' },
    { id: 'conv-2', title: null, updatedAt: '2026-02-23T09:00:00Z' },
  ];

  it('should render conversation titles', () => {
    render(<ConversationList conversations={conversations} />);
    expect(screen.getByText('First Chat')).toBeDefined();
    expect(screen.getByText('제목 없음')).toBeDefined();
  });

  it('should show empty state', () => {
    render(<ConversationList conversations={[]} />);
    expect(screen.getByText('대화 기록이 없습니다')).toBeDefined();
  });

  it('should have links to conversations', () => {
    render(<ConversationList conversations={conversations} />);
    const link = screen.getByText('First Chat').closest('a');
    expect(link?.getAttribute('href')).toBe('/chat/conv-1');
  });

  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(
      <ConversationList conversations={conversations} onDelete={onDelete} />
    );
    const deleteButtons = screen.getAllByLabelText(/삭제/);
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith('conv-1');
  });
});
