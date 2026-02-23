import { StateGraph, START, END } from '@langchain/langgraph';
import { OrchestratorState } from './state';
import { routeNode, executeNode, shouldContinue } from './nodes';

export function createOrchestratorGraph() {
  const graph = new StateGraph(OrchestratorState)
    .addNode('route', routeNode)
    .addNode('execute', executeNode)
    .addEdge(START, 'route')
    .addConditionalEdges('route', shouldContinue, {
      execute: 'execute',
      __end__: END,
    })
    .addEdge('execute', END);

  return graph.compile();
}
