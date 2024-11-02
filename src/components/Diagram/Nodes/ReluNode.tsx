import { memo, useEffect, useState } from 'react';
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
  const connections = useHandleConnections({ type: 'target' });
  const nodesData = useNodesData<MyNode>(connections[0]?.source);
  const [ renderer, setRenderer ] = useState( "debug" );

  useEffect(() => {
    updateNodeData(id, { value:  nodesData?.data.value?.relu() });
  }, [nodesData]);

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
        <div>
          { data.value === undefined ? "Undefined" : "HasData"}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(UppercaseNode);