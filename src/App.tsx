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

import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

import { initialNodes, nodeTypes } from './nodes';
import { initialEdges, edgeTypes } from './edges';
import { getChartInfo, OrgChartNode, parseOrgDataToNodesAndEdges } from './chart/org';

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    console.log('node::', node);
    
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: node?.data?.role === 'participant' ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x,
        y: nodeWithPosition.y ,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
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
      if (data) {
        const { nodes: parsedNodes, edges: parsedEdges } = data
        // const { nodes: parsedNodes, edges: parsedEdges } = getLayoutedElements(data.nodes, data.edges);
        setNodes(parsedNodes);
        setEdges(parsedEdges);
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
