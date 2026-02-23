import { WorkflowService } from './workflow.service';

const globalForService = globalThis as unknown as {
  workflowService: WorkflowService | undefined;
};

export const workflowService =
  globalForService.workflowService ?? new WorkflowService();

if (process.env.NODE_ENV !== 'production')
  globalForService.workflowService = workflowService;
