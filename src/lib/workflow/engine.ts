import { generateText } from 'ai';
import { models } from '@/lib/ai/providers';

export interface WorkflowStepResult {
  stepId: string;
  agentType: string;
  input: string;
  output: string;
  duration: number;
  status: 'success' | 'error';
  error?: string;
}

export interface WorkflowResult {
  steps: WorkflowStepResult[];
  finalOutput: string;
  totalDuration: number;
  status: 'completed' | 'failed';
}

interface WorkflowStep {
  id: string;
  order: number;
  agentType: string;
  prompt: string;
  config?: Record<string, unknown>;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  research:
    'You are a research agent. Analyze topics thoroughly, gather information, and provide well-structured research findings.',
  code:
    'You are a code agent. Write clean, efficient code. Review, debug, and generate code as requested.',
  data:
    'You are a data analysis agent. Analyze data, generate insights, create statistical summaries, and suggest visualizations.',
  content:
    'You are a content creation agent. Write high-quality documents, summaries, emails, and reports.',
};

function getSystemPrompt(agentType: string): string {
  return SYSTEM_PROMPTS[agentType] ?? `You are an AI agent specializing in ${agentType}. Complete the task as requested.`;
}

export class WorkflowEngine {
  async execute(workflow: {
    steps: WorkflowStep[];
  }): Promise<WorkflowResult> {
    const stepResults: WorkflowStepResult[] = [];
    const totalStart = Date.now();
    let previousOutput: string | undefined;

    const sortedSteps = [...workflow.steps].sort((a, b) => a.order - b.order);

    for (const step of sortedSteps) {
      const stepStart = Date.now();

      let userPrompt = step.prompt;
      if (previousOutput) {
        userPrompt += `\n\nPrevious step output:\n${previousOutput}`;
      }

      try {
        const result = await generateText({
          model: models['claude-sonnet'],
          system: getSystemPrompt(step.agentType),
          prompt: userPrompt,
          maxTokens: 4096,
        });

        const duration = Date.now() - stepStart;
        previousOutput = result.text;

        stepResults.push({
          stepId: step.id,
          agentType: step.agentType,
          input: step.prompt,
          output: result.text,
          duration,
          status: 'success',
        });
      } catch (err) {
        const duration = Date.now() - stepStart;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';

        stepResults.push({
          stepId: step.id,
          agentType: step.agentType,
          input: step.prompt,
          output: '',
          duration,
          status: 'error',
          error: errorMessage,
        });

        return {
          steps: stepResults,
          finalOutput: '',
          totalDuration: Date.now() - totalStart,
          status: 'failed',
        };
      }
    }

    return {
      steps: stepResults,
      finalOutput: previousOutput ?? '',
      totalDuration: Date.now() - totalStart,
      status: 'completed',
    };
  }
}
