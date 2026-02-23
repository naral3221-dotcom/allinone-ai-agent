import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks (hoisted to top so vi.mock calls resolve correctly)
// ---------------------------------------------------------------------------

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    workflow: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    workflowStep: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('./prisma', () => ({
  prisma: mockPrisma,
}));

// ---------------------------------------------------------------------------
// System under test
// ---------------------------------------------------------------------------

import { WorkflowService } from './workflow.service';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WorkflowService', () => {
  const service = new WorkflowService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // create
  // -------------------------------------------------------------------------

  describe('create', () => {
    it('should create a workflow with name, userId, and steps', async () => {
      const workflow = {
        id: 'wf-1',
        userId: 'user-1',
        name: 'Research Pipeline',
        description: null,
        isActive: true,
        steps: [
          { id: 'step-1', workflowId: 'wf-1', order: 0, agentType: 'research', prompt: 'Find info', config: null },
          { id: 'step-2', workflowId: 'wf-1', order: 1, agentType: 'content', prompt: 'Summarize', config: null },
        ],
      };
      mockPrisma.workflow.create.mockResolvedValue(workflow);

      const result = await service.create({
        userId: 'user-1',
        name: 'Research Pipeline',
        steps: [
          { order: 0, agentType: 'research', prompt: 'Find info' },
          { order: 1, agentType: 'content', prompt: 'Summarize' },
        ],
      });

      expect(result).toEqual(workflow);
      expect(mockPrisma.workflow.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          name: 'Research Pipeline',
          steps: {
            create: [
              { order: 0, agentType: 'research', prompt: 'Find info' },
              { order: 1, agentType: 'content', prompt: 'Summarize' },
            ],
          },
        },
        include: { steps: { orderBy: { order: 'asc' } } },
      });
    });

    it('should create a workflow with description and config on steps', async () => {
      const workflow = {
        id: 'wf-2',
        userId: 'user-1',
        name: 'Code Review',
        description: 'Automated code review pipeline',
        isActive: true,
        steps: [
          { id: 'step-1', workflowId: 'wf-2', order: 0, agentType: 'code', prompt: 'Review code', config: { model: 'claude-sonnet' } },
        ],
      };
      mockPrisma.workflow.create.mockResolvedValue(workflow);

      const result = await service.create({
        userId: 'user-1',
        name: 'Code Review',
        description: 'Automated code review pipeline',
        steps: [
          { order: 0, agentType: 'code', prompt: 'Review code', config: { model: 'claude-sonnet' } },
        ],
      });

      expect(result).toEqual(workflow);
      expect(mockPrisma.workflow.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          name: 'Code Review',
          description: 'Automated code review pipeline',
          steps: {
            create: [
              { order: 0, agentType: 'code', prompt: 'Review code', config: { model: 'claude-sonnet' } },
            ],
          },
        },
        include: { steps: { orderBy: { order: 'asc' } } },
      });
    });
  });

  // -------------------------------------------------------------------------
  // list
  // -------------------------------------------------------------------------

  describe('list', () => {
    it('should list workflows for a user', async () => {
      const workflows = [
        { id: 'wf-1', userId: 'user-1', name: 'Pipeline A', isActive: true },
        { id: 'wf-2', userId: 'user-1', name: 'Pipeline B', isActive: true },
      ];
      mockPrisma.workflow.findMany.mockResolvedValue(workflows);

      const result = await service.list('user-1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.workflow.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { steps: { orderBy: { order: 'asc' } } },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should return empty array when user has no workflows', async () => {
      mockPrisma.workflow.findMany.mockResolvedValue([]);

      const result = await service.list('user-no-workflows');

      expect(result).toEqual([]);
      expect(mockPrisma.workflow.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-no-workflows' },
        include: { steps: { orderBy: { order: 'asc' } } },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  // -------------------------------------------------------------------------
  // get
  // -------------------------------------------------------------------------

  describe('get', () => {
    it('should get a workflow with steps ordered by order', async () => {
      const workflow = {
        id: 'wf-1',
        userId: 'user-1',
        name: 'Pipeline A',
        steps: [
          { id: 'step-1', order: 0, agentType: 'research', prompt: 'Search' },
          { id: 'step-2', order: 1, agentType: 'content', prompt: 'Write' },
        ],
      };
      mockPrisma.workflow.findUnique.mockResolvedValue(workflow);

      const result = await service.get('wf-1');

      expect(result).toEqual(workflow);
      expect(mockPrisma.workflow.findUnique).toHaveBeenCalledWith({
        where: { id: 'wf-1' },
        include: { steps: { orderBy: { order: 'asc' } } },
      });
    });

    it('should return null for non-existent workflow', async () => {
      mockPrisma.workflow.findUnique.mockResolvedValue(null);

      const result = await service.get('non-existent');

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // update
  // -------------------------------------------------------------------------

  describe('update', () => {
    it('should update workflow name and description', async () => {
      const updated = {
        id: 'wf-1',
        name: 'Updated Pipeline',
        description: 'New description',
      };
      mockPrisma.workflow.update.mockResolvedValue(updated);

      const result = await service.update('wf-1', {
        name: 'Updated Pipeline',
        description: 'New description',
      });

      expect(result).toEqual(updated);
      expect(mockPrisma.workflow.update).toHaveBeenCalledWith({
        where: { id: 'wf-1' },
        data: {
          name: 'Updated Pipeline',
          description: 'New description',
        },
        include: { steps: { orderBy: { order: 'asc' } } },
      });
    });
  });

  // -------------------------------------------------------------------------
  // delete
  // -------------------------------------------------------------------------

  describe('delete', () => {
    it('should delete a workflow by id', async () => {
      mockPrisma.workflow.delete.mockResolvedValue({ id: 'wf-1' });

      await service.delete('wf-1');

      expect(mockPrisma.workflow.delete).toHaveBeenCalledWith({
        where: { id: 'wf-1' },
      });
    });
  });

  // -------------------------------------------------------------------------
  // addStep
  // -------------------------------------------------------------------------

  describe('addStep', () => {
    it('should add a step to a workflow', async () => {
      const step = {
        id: 'step-3',
        workflowId: 'wf-1',
        order: 2,
        agentType: 'data',
        prompt: 'Analyze data',
        config: null,
      };
      mockPrisma.workflowStep.create.mockResolvedValue(step);

      const result = await service.addStep('wf-1', {
        order: 2,
        agentType: 'data',
        prompt: 'Analyze data',
      });

      expect(result).toEqual(step);
      expect(mockPrisma.workflowStep.create).toHaveBeenCalledWith({
        data: {
          workflowId: 'wf-1',
          order: 2,
          agentType: 'data',
          prompt: 'Analyze data',
        },
      });
    });
  });

  // -------------------------------------------------------------------------
  // removeStep
  // -------------------------------------------------------------------------

  describe('removeStep', () => {
    it('should remove a step from a workflow', async () => {
      mockPrisma.workflowStep.delete.mockResolvedValue({ id: 'step-3' });

      await service.removeStep('step-3');

      expect(mockPrisma.workflowStep.delete).toHaveBeenCalledWith({
        where: { id: 'step-3' },
      });
    });
  });
});
