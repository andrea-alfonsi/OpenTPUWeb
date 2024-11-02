import { memo, useEffect } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  useHandleConnections,
  useNodesData,
  type NodeProps,
  Edge,
} from '@xyflow/react';

import { type MyNode, type Data, ConvNode } from './utils';

function UppercaseNode({ id, data }: NodeProps<ConvNode>) {
  const { updateNodeData } = useReactFlow<MyNode, Edge>();
  const connections = useHandleConnections({
    type: 'target',
  });
  const nodesData = useNodesData<MyNode>(connections[0]?.source);
  const textNode = (nodesData) ? nodesData : null;

  useEffect(() => {
    updateNodeData(id, { value: undefined });
  }, [textNode]);

  return (
    <div
      style={{
        background: '#eee',
        color: '#222',
        padding: 10,
        fontSize: 12,
        borderRadius: 10,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={connections.length === 0}
      />
      <div>
        {data.nodeName}
        {
          data.op.input
            .map( ( input ) => data.initializers?.filter( init  => init.name == input).at(0)?.dims.join(" x ") )
            .filter( i => i != undefined ).map( (el, i) => <div key={i}>{el}</div>) 
        }
        {
          data.op.input
          .map( ( input ) => data.initializers?.filter( init  => init.name == input).at(0) === undefined ? input : undefined )
          .filter( i => i != undefined ).map( (el, i) => <div key={i}>{el}</div>) 
        }
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(UppercaseNode);