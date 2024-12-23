import { Handle, Position, type NodeProps } from '@xyflow/react';

import { type PositionLoggerNode } from './types';

export function PositionLoggerNode({
  positionAbsoluteX,
  positionAbsoluteY,
  data,
  ...props
}: NodeProps<PositionLoggerNode>) {
  const x = `${Math.round(positionAbsoluteX)}px`;
  const y = `${Math.round(positionAbsoluteY)}px`;
console.log('PositionLoggerNode', x, y, data, props); 

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default">
      {data.label && <div>{data.label}</div>}

      <div>
        {x} {y}
      </div>
      <Handle type="target" position={Position.Left} />

      {/* <Handle type="source" position={Position.Bottom} style={{left: '10%'}}/> */}
    </div>
  );
}


export function PositionLoggerNode2({
  positionAbsoluteX,
  positionAbsoluteY,
  data,
  ...props
}: NodeProps<PositionLoggerNode>) {
  const x = `${Math.round(positionAbsoluteX)}px`;
  const y = `${Math.round(positionAbsoluteY)}px`;
console.log('PositionLoggerNode', x, y, data, props); 

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default">
      {data.label && <div>{data.label}</div>}

      <div>
        {x} {y}
      </div>
      <Handle type="target" position={Position.Top} />

      <Handle type="source" position={Position.Bottom} style={{left: '10%'}}/>
    </div>
  );
}
