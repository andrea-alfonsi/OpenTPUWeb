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

import { type MyNode, type Data, ConvNode, Uint8ArrayToFloat32Array } from './utils';
import { tensor4d } from '@tensorflow/tfjs';

function UppercaseNode({ id, data }: NodeProps<ConvNode>) {
  const { updateNodeData } = useReactFlow<MyNode, Edge>();
  const connections = useHandleConnections({ type: 'target' });
  const nodesData = useNodesData<MyNode>(connections[0]?.source);
  const [ renderer, setRenderer ] = useState( "debug" );

  useEffect(() => {

    const weight_name  = data.op.input.find( i => i.match(/.*w.*/i) )
    const weight = data.initializers?.filter( i => i.name === weight_name ).at(0);
    //  tensor_shape = (BATCH_SIZE, CHANNELS, WIDTH, HEIGHT).
    const w = tensor4d( 
      Uint8ArrayToFloat32Array(weight?.rawData as any), weight?.dims as any
    )
    const strides = data.op.attribute.filter( a => a.name == "strides" ).at(0)?.ints as [number, number];
    setTimeout( () => {
      try {
        updateNodeData( id, {
          value: nodesData?.data.value?.conv2d( w, strides, "valid", "NCHW" ),
        })
      } catch (e) {
        console.error( e, data, nodesData );
      }
        
    }, 100);
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
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <div>
        {data.nodeName}
        {
          data.op.input
            .map( ( input ) => data.initializers?.filter( init  => init.name == input).at(0)?.dims.join(" x ") )
            .filter( i => i != undefined ).map( (el, i) => <div key={i}>{el}</div>) 
        }
        { data.value === undefined ? "Undefined" : "HasData"}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(UppercaseNode);