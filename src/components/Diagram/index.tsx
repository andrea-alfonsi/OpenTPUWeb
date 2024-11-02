// receiver an objects that tells hot wo render the diagram (no interaction support)
// https://github.com/onnx/onnx/blob/main/onnx/tools/net_drawer.py

import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Edge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import './index.css';
import { MyNode } from './Nodes/utils';
import { NodeProto, TensorProto, ValueInfoProto } from '../../onnx_proto';
import ConvNode from './Nodes/ConvNode';
import ReluNode from './Nodes/ReluNode';
import InputNode from './Nodes/InputNode';
import useLayoutNodes from './useLayoutNodes';
import SoftmaxNode from './Nodes/SoftmaxNode';
import ConcatNode from './Nodes/ConcatNode';
import DropoutNode from './Nodes/DropoutNode';
import MaxPoolNode from './Nodes/MaxPoolNode';
import GlobalAveragePoolNode from './Nodes/GlobalAveragePoolNode';
import OutputNode from './Nodes/OutputNode';

const connectionLineStyle = { stroke: '#fff' };
const snapGrid: [number, number] = [20, 20];
const nodeTypes = {
  Input: InputNode,
  Output: OutputNode,
  Conv: ConvNode,
  Concat: ConcatNode,
  Dropout: DropoutNode,
  MaxPool: MaxPoolNode,
  GlobalAveragePool: GlobalAveragePoolNode,
  Relu: ReluNode,
  Softmax: SoftmaxNode
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

// Returns a Node object with the named handles
const OpNodeProducer = ( op: NodeProto, opId: number, initializers: undefined | TensorProto[] ) : MyNode => {
  let nodeName = op.name ? `${op.name}/${op.opType} (op#${opId})`: `${op.opType} (op#${opId})`  ;

  return {
    id: opId + "",
    type: op.opType as unknown as any,
    position: {x: opId * 0, y: 0},
    data: {
      nodeName, 
      op: op,
      initializers,
      value: undefined
    }
  };
}

interface CustomNodeFlowProps { 
  operations: undefined | NodeProto[], 
  initializers: undefined | TensorProto[],
  inputs: undefined| ValueInfoProto[],
  outputs: undefined | ValueInfoProto[]
}

const CustomNodeFlow = ({operations, inputs, outputs, initializers}: CustomNodeFlowProps) => {

  let builtNodes: MyNode[] = [];
  let builtEdges: Edge[] = [];
  let myoutputs: {[name: string]: string} = {};

  inputs?.forEach( (input, inputId) => {
    const inputNode: MyNode = {
      id: input.name,
      position: {x: 0, y: 0},
      type: 'Input',
      data: {
        type: input.type,
        value: undefined
      }
    }
    myoutputs[input.name] = input.name;
    if ( initializers?.find( v => v.name === input.name) === undefined ) {
      builtNodes.push( inputNode );
    }
  })
  operations?.forEach( (op, opId) => {
    const opNode = OpNodeProducer( op, opId, initializers);
    builtNodes.push( opNode );
    op.input.forEach( input => {
      myoutputs[input] = myoutputs[input] ?? ""; // TODO: throw error if not found?
      if ( initializers?.find( v => v.name === input) === undefined ){
        builtEdges.push( { id: myoutputs[input] + "_" + opId, source: myoutputs[input], target: opId + "" } )
      }
    })
    op.output.forEach( output => {
      myoutputs[output] = opId + "";
    })
  });
  outputs?.forEach( (output, outputId) => {
    const outputNode: MyNode = {
      id: output.name,
      position: {x: 0, y: 0},
      type: 'Output',
      data: {
        type: output.type,
        value: undefined
      }
    }
    builtNodes.push( outputNode );
    builtEdges.push( {id: myoutputs[output.name] + "_" + outputId , source: myoutputs[output.name], target: output.name } )
  })

  const [ nodes, , onNodesChange ] = useNodesState<MyNode>(builtNodes);
  const [ edges, , onEdgesChange ] = useEdgesState<Edge>(builtEdges);
  useLayoutNodes()

  return (
    <ReactFlow
      nodesDraggable={false}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      style={{ background: 'white' }}
      nodeTypes={nodeTypes}
      connectionLineStyle={connectionLineStyle}
      snapToGrid={true}
      snapGrid={snapGrid}
      defaultViewport={defaultViewport}
      fitView
    >
      <Controls />
    </ReactFlow>
  );
};

export default function (props: CustomNodeFlowProps) {
  return (
    <ReactFlowProvider>
      <CustomNodeFlow {...props}/>
    </ReactFlowProvider>
  );
}
