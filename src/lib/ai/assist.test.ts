import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGenerateText } = vi.hoisted(() => ({
  mockGenerateText: vi.fn(),
}));
vi.mock('ai', () => ({ generateText: mockGenerateText }));

vi.mock('./providers', () => ({
  models: {
    'claude-sonnet': { modelId: 'claude-sonnet' },
    'claude-haiku': { modelId: 'claude-haiku' },
  },
}));

import { AIAssistService } from './assist';

describe('AIAssistService', () => {
  const service = new AIAssistService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call generateText with "improve" system prompt for improve action', async () => {
    mockGenerateText.mockResolvedValue({ text: 'Improved text here.' });

    const result = await service.assist({
      text: 'This is my text.',
      action: 'improve',
    });

    expect(result).toEqual({ result: 'Improved text here.' });
    expect(mockGenerateText).toHaveBeenCalledTimes(1);

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.system.toLowerCase()).toContain('improve');
    expect(callArgs.prompt).toBe('This is my text.');
  });

  it('should call generateText with "expand" system prompt for expand action', async () => {
    mockGenerateText.mockResolvedValue({ text: 'Expanded text here.' });

    const result = await service.assist({
      text: 'Short text.',
      action: 'expand',
    });

    expect(result).toEqual({ result: 'Expanded text here.' });

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.system.toLowerCase()).toContain('expand');
    expect(callArgs.prompt).toBe('Short text.');
  });

  it('should call generateText with "summarize" system prompt for summarize action', async () => {
    mockGenerateText.mockResolvedValue({ text: 'Summary here.' });

    const result = await service.assist({
      text: 'A very long text that needs to be summarized.',
      action: 'summarize',
    });

    expect(result).toEqual({ result: 'Summary here.' });

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.system.toLowerCase()).toContain('summarize');
  });

  it('should call generateText with "translate" prompt including target language', async () => {
    mockGenerateText.mockResolvedValue({ text: 'Translated text.' });

    const result = await service.assist({
      text: 'Hello world',
      action: 'translate',
      options: { language: 'Korean' },
    });

    expect(result).toEqual({ result: 'Translated text.' });

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.system.toLowerCase()).toContain('translat');
    expect(callArgs.system).toContain('Korean');
  });

  it('should call generateText with "fix grammar" prompt for fix-grammar action', async () => {
    mockGenerateText.mockResolvedValue({ text: 'Fixed grammar text.' });

    const result = await service.assist({
      text: 'Me wants go home.',
      action: 'fix-grammar',
    });

    expect(result).toEqual({ result: 'Fixed grammar text.' });

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.system.toLowerCase()).toContain('grammar');
  });

  it('should call generateText with "change tone" prompt including target tone', async () => {
    mockGenerateText.mockResolvedValue({ text: 'Formal text here.' });

    const result = await service.assist({
      text: 'Hey dude, whats up.',
      action: 'change-tone',
      options: { tone: 'formal' },
    });

    expect(result).toEqual({ result: 'Formal text here.' });

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.system.toLowerCase()).toContain('tone');
    expect(callArgs.system).toContain('formal');
  });

  it('should use claude-sonnet model', async () => {
    mockGenerateText.mockResolvedValue({ text: 'Result text.' });

    await service.assist({
      text: 'Some text.',
      action: 'improve',
    });

    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.model).toEqual({ modelId: 'claude-sonnet' });
  });

  it('should handle errors gracefully', async () => {
    mockGenerateText.mockRejectedValue(new Error('LLM API failed'));

    await expect(
      service.assist({
        text: 'Some text.',
        action: 'improve',
      })
    ).rejects.toThrow('LLM API failed');
  });
});
