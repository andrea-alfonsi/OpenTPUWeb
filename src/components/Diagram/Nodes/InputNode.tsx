import { memo, useEffect, useState } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
  Edge,
} from '@xyflow/react';
import { MyNode, type InputNode} from './utils';
import { tensor, Tensor } from '@tensorflow/tfjs';

function MyInputNode({ id, data }: NodeProps<InputNode>) {
  const { updateNodeData } = useReactFlow<MyNode, Edge>();

  return (
    <div
      style={{
        background: '#999',
        color: '#222',
        padding: 10,
        fontSize: 12,
        borderRadius: 10,
      }}
    >
      <div>
        <div>Input: {id}</div>
        <div>
          { data.value  === undefined ? "Undefined" : "HasData" }
          <button onClick={() =>{ 
            updateNodeData(id, { 
              value: tensor( 
                new Array(224 * 224 * 3).fill( 1 ).map( el => Math.random() ), 
                data.type?.tensorType?.shape?.dim.map( el => el.dimValue) as any, 
                "float32" 
              ) 
            })
          }}>Load</button>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(MyInputNode);
