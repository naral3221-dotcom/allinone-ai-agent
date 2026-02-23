import { StateGraph, START, END } from '@langchain/langgraph';
import { DataState } from './state';
import { classifyAnalysis, analyzeData } from './nodes';

export function createDataGraph() {
  const graph = new StateGraph(DataState)
    .addNode('classify', classifyAnalysis)
    .addNode('analyze', analyzeData)
    .addEdge(START, 'classify')
    .addEdge('classify', 'analyze')
    .addEdge('analyze', END);

  return graph.compile();
}
