import { generateText } from 'ai';
import { models } from '@/lib/ai/providers';
import type { DataStateType, AnalysisType } from './state';

const ANALYSIS_TYPE_PROMPT = `Analyze the user's request and determine the type of data analysis needed.
The available analysis types are:
- summarize: Provide a summary of data, key findings, and notable patterns
- statistics: Calculate and explain statistical measures, distributions, and correlations
- visualize: Suggest chart types and visualization approaches for the data
- transform: Suggest data cleaning, normalization, and restructuring steps
- compare: Compare datasets or metrics, highlight differences and trends

Respond with ONLY one of: summarize, statistics, visualize, transform, compare`;

const SYSTEM_PROMPTS: Record<AnalysisType, string> = {
  summarize:
    'You are a data summarization expert. Provide a clear summary of the data, key findings, and notable patterns.',
  statistics:
    'You are a statistical analyst. Calculate and explain relevant statistics, distributions, and correlations.',
  visualize:
    'You are a data visualization expert. Suggest the best chart types and explain how to visualize the data. Provide chart configuration as JSON.',
  transform:
    'You are a data transformation expert. Suggest and explain data cleaning, normalization, and restructuring steps.',
  compare:
    'You are a comparative analysis expert. Compare datasets or metrics, highlight differences and trends.',
};

export async function classifyAnalysis(
  state: DataStateType
): Promise<Partial<DataStateType>> {
  const { text } = await generateText({
    model: models['claude-haiku'],
    system: ANALYSIS_TYPE_PROMPT,
    prompt: state.query,
    maxOutputTokens: 20,
  });

  const analysisType = text.trim().toLowerCase() as AnalysisType;
  const validTypes: AnalysisType[] = [
    'summarize',
    'statistics',
    'visualize',
    'transform',
    'compare',
  ];

  return {
    analysisType: validTypes.includes(analysisType) ? analysisType : 'summarize',
  };
}

export async function analyzeData(
  state: DataStateType
): Promise<Partial<DataStateType>> {
  const system = SYSTEM_PROMPTS[state.analysisType];

  const { text } = await generateText({
    model: models['claude-sonnet'],
    system,
    messages: state.messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
    maxOutputTokens: 4096,
  });

  const result: Partial<DataStateType> = {
    analysisOutput: text,
    isComplete: true,
    messages: [{ role: 'assistant', content: text }],
  };

  if (state.analysisType === 'visualize') {
    result.chartSuggestion = text;
  }

  return result;
}
