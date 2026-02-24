import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AgentType } from '@/agents/_shared';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      agentRun: {
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock('./prisma', () => ({
  prisma: mockPrisma,
}));

import { AgentRunService } from './agent-run.service';

describe('AgentRunService', () => {
  const service = new AgentRunService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRun', () => {
    it('should create a new agent run with status pending', async () => {
      const run = {
        id: 'run-1',
        userId: 'user-1',
        agentType: 'research',
        input: 'What is quantum computing?',
        status: 'pending',
        conversationId: null,
        output: null,
        steps: null,
        toolCalls: null,
        model: null,
        error: null,
        duration: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.agentRun.create.mockResolvedValue(run);

      const result = await service.createRun({
        userId: 'user-1',
        agentType: 'research',
        input: 'What is quantum computing?',
      });

      expect(result).toEqual(run);
      expect(mockPrisma.agentRun.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          agentType: 'research',
          input: 'What is quantum computing?',
          status: 'pending',
        },
      });
    });

    it('should create a run with optional conversationId', async () => {
      const run = {
        id: 'run-2',
        userId: 'user-1',
        agentType: 'code',
        input: 'Write a sorting algorithm',
        status: 'pending',
        conversationId: 'conv-1',
        output: null,
        steps: null,
        toolCalls: null,
        model: null,
        error: null,
        duration: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.agentRun.create.mockResolvedValue(run);

      const result = await service.createRun({
        userId: 'user-1',
        agentType: 'code',
        input: 'Write a sorting algorithm',
        conversationId: 'conv-1',
      });

      expect(result).toEqual(run);
      expect(result.conversationId).toBe('conv-1');
      expect(mockPrisma.agentRun.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          agentType: 'code',
          input: 'Write a sorting algorithm',
          status: 'pending',
          conversationId: 'conv-1',
        },
      });
    });

    it('should accept all valid agent types', async () => {
      const agentTypes = ['orchestrator', 'research', 'code', 'data', 'content'] as const;

      for (const agentType of agentTypes) {
        mockPrisma.agentRun.create.mockResolvedValue({
          id: `run-${agentType}`,
          agentType,
          status: 'pending',
        });

        const result = await service.createRun({
          userId: 'user-1',
          agentType,
          input: 'test input',
        });

        expect(result.agentType).toBe(agentType);
      }

      expect(mockPrisma.agentRun.create).toHaveBeenCalledTimes(agentTypes.length);
    });
  });

  describe('updateRunStatus', () => {
    it('should update run status to running', async () => {
      const updated = {
        id: 'run-1',
        status: 'running',
        updatedAt: new Date(),
      };
      mockPrisma.agentRun.update.mockResolvedValue(updated);

      const result = await service.updateRunStatus('run-1', 'running');

      expect(result).toEqual(updated);
      expect(mockPrisma.agentRun.update).toHaveBeenCalledWith({
        where: { id: 'run-1' },
        data: { status: 'running' },
      });
    });

    it('should update status with optional output', async () => {
      const updated = {
        id: 'run-1',
        status: 'completed',
        output: 'Partial result',
        updatedAt: new Date(),
      };
      mockPrisma.agentRun.update.mockResolvedValue(updated);

      const result = await service.updateRunStatus('run-1', 'completed', 'Partial result');

      expect(result.output).toBe('Partial result');
      expect(mockPrisma.agentRun.update).toHaveBeenCalledWith({
        where: { id: 'run-1' },
        data: { status: 'completed', output: 'Partial result' },
      });
    });

    it('should update status without output when not provided', async () => {
      mockPrisma.agentRun.update.mockResolvedValue({ id: 'run-1', status: 'running' });

      await service.updateRunStatus('run-1', 'running');

      expect(mockPrisma.agentRun.update).toHaveBeenCalledWith({
        where: { id: 'run-1' },
        data: { status: 'running' },
      });
    });
  });

  describe('completeRun', () => {
    it('should mark run as completed with full result data', async () => {
      const steps = [
        {
          id: 'step-1',
          agentType: 'research' as AgentType,
          action: 'web_search',
          input: 'quantum computing',
          output: 'search results...',
          timestamp: Date.now(),
        },
      ];
      const toolCalls = [
        {
          id: 'tc-1',
          toolName: 'web_search',
          input: { query: 'quantum computing' },
          output: 'results',
          duration: 1200,
          status: 'success' as const,
        },
      ];
      const result = {
        output: 'Quantum computing is...',
        steps,
        toolCalls,
        model: 'claude-sonnet-4-6',
        duration: 5000,
      };

      const completedRun = {
        id: 'run-1',
        status: 'completed',
        output: result.output,
        steps: result.steps,
        toolCalls: result.toolCalls,
        model: result.model,
        duration: result.duration,
        updatedAt: new Date(),
      };
      mockPrisma.agentRun.update.mockResolvedValue(completedRun);

      const updated = await service.completeRun('run-1', result);

      expect(updated).toEqual(completedRun);
      expect(updated.status).toBe('completed');
      expect(updated.output).toBe('Quantum computing is...');
      expect(updated.model).toBe('claude-sonnet-4-6');
      expect(updated.duration).toBe(5000);
      expect(mockPrisma.agentRun.update).toHaveBeenCalledWith({
        where: { id: 'run-1' },
        data: {
          status: 'completed',
          output: result.output,
          steps: result.steps,
          toolCalls: result.toolCalls,
          model: result.model,
          duration: result.duration,
        },
      });
    });

    it('should store steps as JSON', async () => {
      const steps = [
        {
          id: 'step-1',
          agentType: 'code' as AgentType,
          action: 'generate',
          input: 'sort array',
          output: 'function sort() {...}',
          timestamp: 1700000000,
        },
        {
          id: 'step-2',
          agentType: 'code' as AgentType,
          action: 'review',
          input: 'function sort() {...}',
          output: 'Looks good',
          timestamp: 1700000001,
        },
      ];
      const result = {
        output: 'Generated code',
        steps,
        toolCalls: [],
        model: 'gpt-4o',
        duration: 3000,
      };

      mockPrisma.agentRun.update.mockResolvedValue({
        id: 'run-1',
        status: 'completed',
        steps,
      });

      await service.completeRun('run-1', result);

      const callArgs = mockPrisma.agentRun.update.mock.calls[0][0];
      expect(callArgs.data.steps).toEqual(steps);
      expect(callArgs.data.steps).toHaveLength(2);
    });

    it('should store toolCalls as JSON', async () => {
      const toolCalls = [
        {
          id: 'tc-1',
          toolName: 'web_search',
          input: { query: 'test' },
          output: 'results',
          duration: 500,
          status: 'success' as const,
        },
        {
          id: 'tc-2',
          toolName: 'code_exec',
          input: { code: 'console.log("hi")' },
          output: null,
          duration: 100,
          status: 'error' as const,
          error: 'Timeout',
        },
      ];
      const result = {
        output: 'Done',
        steps: [],
        toolCalls,
        model: 'claude-sonnet-4-6',
        duration: 2000,
      };

      mockPrisma.agentRun.update.mockResolvedValue({
        id: 'run-1',
        status: 'completed',
        toolCalls,
      });

      await service.completeRun('run-1', result);

      const callArgs = mockPrisma.agentRun.update.mock.calls[0][0];
      expect(callArgs.data.toolCalls).toEqual(toolCalls);
      expect(callArgs.data.toolCalls).toHaveLength(2);
    });
  });

  describe('failRun', () => {
    it('should mark run as failed with error message', async () => {
      const failedRun = {
        id: 'run-1',
        status: 'failed',
        error: 'LLM provider timeout',
        updatedAt: new Date(),
      };
      mockPrisma.agentRun.update.mockResolvedValue(failedRun);

      const result = await service.failRun('run-1', 'LLM provider timeout');

      expect(result).toEqual(failedRun);
      expect(result.status).toBe('failed');
      expect(result.error).toBe('LLM provider timeout');
      expect(mockPrisma.agentRun.update).toHaveBeenCalledWith({
        where: { id: 'run-1' },
        data: {
          status: 'failed',
          error: 'LLM provider timeout',
        },
      });
    });

    it('should handle long error messages', async () => {
      const longError = 'Error: ' + 'x'.repeat(1000);
      mockPrisma.agentRun.update.mockResolvedValue({
        id: 'run-1',
        status: 'failed',
        error: longError,
      });

      await service.failRun('run-1', longError);

      expect(mockPrisma.agentRun.update).toHaveBeenCalledWith({
        where: { id: 'run-1' },
        data: {
          status: 'failed',
          error: longError,
        },
      });
    });
  });

  describe('getRun', () => {
    it('should get a single run by id', async () => {
      const run = {
        id: 'run-1',
        userId: 'user-1',
        agentType: 'research',
        status: 'completed',
        input: 'What is AI?',
        output: 'AI is...',
        steps: [],
        toolCalls: [],
        model: 'claude-sonnet-4-6',
        duration: 3000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.agentRun.findUnique.mockResolvedValue(run);

      const result = await service.getRun('run-1');

      expect(result).toEqual(run);
      expect(mockPrisma.agentRun.findUnique).toHaveBeenCalledWith({
        where: { id: 'run-1' },
      });
    });

    it('should return null for non-existent run', async () => {
      mockPrisma.agentRun.findUnique.mockResolvedValue(null);

      const result = await service.getRun('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('listRuns', () => {
    it('should list runs for a user with default pagination', async () => {
      const runs = [
        { id: 'run-2', agentType: 'code', status: 'completed', createdAt: new Date('2026-02-23') },
        { id: 'run-1', agentType: 'research', status: 'completed', createdAt: new Date('2026-02-22') },
      ];
      mockPrisma.agentRun.findMany.mockResolvedValue(runs);

      const result = await service.listRuns('user-1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.agentRun.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      });
    });

    it('should list runs with custom limit and offset', async () => {
      mockPrisma.agentRun.findMany.mockResolvedValue([]);

      await service.listRuns('user-1', { limit: 10, offset: 20 });

      expect(mockPrisma.agentRun.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 20,
      });
    });

    it('should filter runs by agentType', async () => {
      const runs = [
        { id: 'run-1', agentType: 'research', status: 'completed' },
      ];
      mockPrisma.agentRun.findMany.mockResolvedValue(runs);

      const result = await service.listRuns('user-1', { agentType: 'research' });

      expect(result).toHaveLength(1);
      expect(mockPrisma.agentRun.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', agentType: 'research' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      });
    });

    it('should combine agentType filter with pagination', async () => {
      mockPrisma.agentRun.findMany.mockResolvedValue([]);

      await service.listRuns('user-1', { agentType: 'code', limit: 5, offset: 10 });

      expect(mockPrisma.agentRun.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', agentType: 'code' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        skip: 10,
      });
    });

    it('should return empty array when no runs exist', async () => {
      mockPrisma.agentRun.findMany.mockResolvedValue([]);

      const result = await service.listRuns('user-1');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('listRunsByConversation', () => {
    it('should list runs for a specific conversation', async () => {
      const runs = [
        { id: 'run-2', conversationId: 'conv-1', agentType: 'code', status: 'completed' },
        { id: 'run-1', conversationId: 'conv-1', agentType: 'research', status: 'completed' },
      ];
      mockPrisma.agentRun.findMany.mockResolvedValue(runs);

      const result = await service.listRunsByConversation('conv-1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.agentRun.findMany).toHaveBeenCalledWith({
        where: { conversationId: 'conv-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when conversation has no runs', async () => {
      mockPrisma.agentRun.findMany.mockResolvedValue([]);

      const result = await service.listRunsByConversation('conv-no-runs');

      expect(result).toEqual([]);
    });
  });
});
