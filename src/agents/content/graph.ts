import { StateGraph, START, END } from '@langchain/langgraph';
import { ContentState } from './state';
import { classifyContent, generateContent } from './nodes';

export function createContentGraph() {
  const graph = new StateGraph(ContentState)
    .addNode('classify', classifyContent)
    .addNode('generate', generateContent)
    .addEdge(START, 'classify')
    .addEdge('classify', 'generate')
    .addEdge('generate', END);

  return graph.compile();
}
