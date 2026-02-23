import { StateGraph, START, END } from '@langchain/langgraph';
import { ResearchState } from './state';
import { analyzeQuery, searchWeb, synthesize } from './nodes';

export function createResearchGraph() {
  const graph = new StateGraph(ResearchState)
    .addNode('analyze', analyzeQuery)
    .addNode('search', searchWeb)
    .addNode('synthesize', synthesize)
    .addEdge(START, 'analyze')
    .addEdge('analyze', 'search')
    .addEdge('search', 'synthesize')
    .addEdge('synthesize', END);

  return graph.compile();
}
