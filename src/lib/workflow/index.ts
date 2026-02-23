export { WorkflowEngine } from './engine';
export type { WorkflowResult, WorkflowStepResult } from './engine';

import { WorkflowEngine } from './engine';

const globalForEngine = globalThis as unknown as {
  workflowEngine: WorkflowEngine | undefined;
};

export const workflowEngine =
  globalForEngine.workflowEngine ?? new WorkflowEngine();

if (process.env.NODE_ENV !== 'production')
  globalForEngine.workflowEngine = workflowEngine;
