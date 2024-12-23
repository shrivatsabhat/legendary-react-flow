import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  ConnectionLineType,
} from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

import { initialNodes, nodeTypes } from './nodes';
import { initialEdges, edgeTypes } from './edges';
import { getChartInfo, OrgChartNode, parseOrgDataToNodesAndEdges } from './chart/org';

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElementsDagre = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

const elk = new ELK();

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

const getLayoutedElementsElk = (nodes, edges, options = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => {
      if(node.data.role ==='participant') {
        return ({
          ...node,
          // Adjust the target and source handle positions based on the layout
          // direction.
          targetPosition: 'left' ,
          sourcePosition: 'right' ,
    
          // Hardcode a width and height for elk to use when layouting.
          width: 150,
          height: 50,
        })
      }
      return ({
        ...node,
        // Adjust the target and source handle positions based on the layout
        // direction.
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
  
        // Hardcode a width and height for elk to use when layouting.
        width: 150,
        height: 50,
      })
    }),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        position: { x: node.x, y: node.y },
      })),

      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  // const onConnect: OnConnect = useCallback(
  //   (connection) => setEdges((edges) => addEdge(connection, edges)),
  //   [setEdges]
  // );

  useEffect( () => {
    const loadData = async () => {
      setLoading(true);
      const data = await OrgChartNode();
      const opts = { 'elk.direction': 'DOWN', ...elkOptions };
      if (data) {
        const { nodes: parsedNodes, edges: parsedEdges } = data
        // const { nodes: parsedNodes, edges: parsedEdges } = getLayoutedElementsDagre(data.nodes, data.edges);
        // const { nodes: parsedNodes, edges: parsedEdges } = await getLayoutedElementsElk(data.nodes, data.edges, opts);
        setNodes([...parsedNodes]);
        setEdges([...parsedEdges]);
      }
      setLoading(false);
    };

    loadData();
    
  }
  , []);

  if(loading) {
    return <div>Loading...</div>
  }

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      // onConnect={onConnect}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      connectionLineType={ConnectionLineType.SmoothStep}
    >
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}
