import { useEffect } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { type Edge, useNodesInitialized, useReactFlow } from '@xyflow/react';
import { MyNode } from './Nodes/utils';

// elk layouting options can be found here:
// https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html
const layoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.edgeNodeBetweenLayers': '40',
  'elk.spacing.nodeNode': '40',
  'elk.layered.nodePlacement.strategy': 'SIMPLE',
};

const elk = new ELK();

// uses elkjs to give each node a layouted position
export const getLayoutedNodes = async (nodes: MyNode[], edges: Edge[]) => {
  const graph = {
    id: 'root',
    layoutOptions,
    children: nodes.map((n) => {
      return {
        id: n.id,
        width: n.measured?.width ?? 150,
        height: n.measured?.height ?? 50,
        // ⚠️ we need to tell elk that the ports are fixed, in order to reduce edge crossings
        properties: {
          'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
        },
        // we are also passing the id, so we can also handle edges without a sourceHandle or targetHandle option
        ports: [{ id: n.id }],
      };
    }),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.sourceHandle || e.source],
      targets: [e.targetHandle || e.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find(
      (lgNode) => lgNode.id === node.id,
    );

    return {
      ...node,
      position: {
        x: layoutedNode?.x ?? 0,
        y: layoutedNode?.y ?? 0,
      },
    };
  });

  return layoutedNodes;
};

export default function useLayoutNodes() {
  const nodesInitialized = useNodesInitialized();
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow<MyNode>();

  useEffect(() => {
    if (nodesInitialized) {
      const layoutNodes = async () => {
        const layoutedNodes = await getLayoutedNodes(
          getNodes(),
          getEdges(),
        );

        setNodes(layoutedNodes);
        // setTimeout(() => fitView(), 0);
      };

      layoutNodes();
    }
  }, [nodesInitialized, getNodes, getEdges, setNodes, fitView]);

  return null;
}
