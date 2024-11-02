import { type Node } from '@xyflow/react';
import { NodeProto, TensorProto, TypeProto } from '../../../onnx_proto';
import { Tensor } from '@tensorflow/tfjs';

export type Data = { 
  nodeName: string, 
  op: NodeProto,
  initializers: TensorProto[] | undefined,
  value: Tensor | undefined
}

export type IOData = {
  type: TypeProto | undefined
  value: Tensor | undefined,
}

export type InputNode = Node<IOData, 'Input'>;
export type OutputNode = Node<IOData, 'Output'>;
export type ConvNode = Node<Data, 'Conv'>;
export type ConcatNode = Node<Data, 'Concat'>;
export type DropoutNode = Node<Data, 'Dropout'>;
export type MaxPoolNode = Node<Data, 'MaxPool'>;
export type GlobalAveragePoolNode = Node<Data, 'GlobalAveragePool'>;
export type ReluNode = Node<Data, 'Relu'>;
export type SoftmaxNode = Node<Data, 'Softmax'>
export type MyNode = InputNode | OutputNode | ConvNode | ConcatNode | DropoutNode | MaxPoolNode | GlobalAveragePoolNode | ReluNode | SoftmaxNode;



export function Uint8ArrayToFloat32Array( buffer: Uint8Array ): Float32Array {

  const bf = new DataView( buffer.buffer );
  const nextValue = (function*(){
    for(let i = 0; i < buffer.length; i += 4){
      yield bf.getFloat32(i)
    }
  })();

  return new Float32Array( nextValue );
}