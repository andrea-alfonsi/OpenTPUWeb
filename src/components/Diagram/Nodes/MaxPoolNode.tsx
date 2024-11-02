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

  // console.info( data.op );

  useEffect(() => {
    const strides = data.op.attribute.filter( a => a.name == "strides" ).at(0)?.ints;
    const pads = data.op.attribute.filter( a => a.name == "pads").at(0)?.ints;
    const dilations = data.op.attribute.filter( a => a.name == "dilations").at(0)?.ints;
    const kernal_shape = data.op.attribute.filter( a => a.name == "kernel_shape" ).at(0)?.ints;
    
    // output_spatial_shape[i] = floor(
    //                                (input_spatial_shape[i] + pad_shape[i] - dilation[i] * (kernel_shape[i] - 1) - 1) / 
    //                                strides_spatial_shape[i] + 1)
    updateNodeData(id, { value: nodesData?.data.value?.maxPool( new Array( kernal_shape?.length ).fill( 0 ).map( (el,i) => Math.floor( 
      ((nodesData?.data.value?.shape[i] ?? 0) + (pads?.at(i) ?? 0) - (dilations?.at(i) ?? 0) * ((kernal_shape?.at(i) ?? 0) - 1) - 1) / 
      (strides?.at(0) ?? 1) + 1) ) as [number, number], strides as [number, number], "valid") });
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
        <div>
          {
            data.value === undefined ? "Undefined" : "HasData"
          }
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(UppercaseNode);