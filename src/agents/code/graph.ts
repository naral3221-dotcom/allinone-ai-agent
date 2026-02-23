import { StateGraph, START, END } from '@langchain/langgraph';
import { CodeState } from './state';
import { classifyAction, executeCode } from './nodes';

export function createCodeGraph() {
  const graph = new StateGraph(CodeState)
    .addNode('classify', classifyAction)
    .addNode('execute', executeCode)
    .addEdge(START, 'classify')
    .addEdge('classify', 'execute')
    .addEdge('execute', END);

  return graph.compile();
}
