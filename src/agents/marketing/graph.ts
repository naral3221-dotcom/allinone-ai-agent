import { StateGraph, START, END } from '@langchain/langgraph';
import { MarketingState } from './state';
import { classifyIntent, analyzeMarketing } from './nodes';

export function createMarketingGraph() {
  const graph = new StateGraph(MarketingState)
    .addNode('classify', classifyIntent)
    .addNode('analyze', analyzeMarketing)
    .addEdge(START, 'classify')
    .addEdge('classify', 'analyze')
    .addEdge('analyze', END);

  return graph.compile();
}
