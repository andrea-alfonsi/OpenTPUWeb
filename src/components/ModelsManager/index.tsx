import { useEffect, useState } from "react";
import style from "./ModelsManager.module.css"
import Diagram from "../Diagram";
import { MyNode } from "../Diagram/Nodes/utils";
import { Edge } from "@xyflow/react";
import { ModelProto } from "../../onnx_proto";

type IModelNode = MyNode;
interface IModelEdge extends Edge{}
interface IExperiment{}

interface IModel {
  name: string,
  model: Uint8Array,
  experiments: IExperiment[]
}

export default function ModelsManager(){
  const [myModels, setMyModels] = useState<IModel[]>([]);
  const [currentModel, setCurrentModel] = useState<null|number>(null);

  useEffect(() => {
    fetch("/squeezenet.onnx")
      .then( data => data.arrayBuffer() )
      .then( buffer => new Uint8Array( buffer ) )
      .then( uint8 =>  {
        setMyModels( [{ name: "Squeezenet", model: uint8, experiments: []}] );
        setCurrentModel( 0 );
      })
  }, [])

  return <div className={style.ModelsManager}>
    <nav>
      <h1>Experiments</h1>
      <ul style={{listStyleType: 'none', paddingLeft: 0}}>
        {
          myModels.map( (model, i) => {
            return <li key={i}>{model.name}</li>
          })
        }
        <li style={{borderTop: 'solid 1px #ccc'}}>
          Add model
        </li>
      </ul>
    </nav>
    <div>
      <div style={{height: 64, borderBottom: 'solid 1px #ccc'}}>Diamond</div>
      {
        myModels.filter( (_, i ) => currentModel !== null && i === currentModel as unknown as number)
                .map( (model, i) => { 
                  const m = ModelProto.decode( model.model );
                  return <Diagram key={i} operations={m.graph?.node} initializers={m.graph?.initializer} inputs={m.graph?.input} outputs={m.graph?.output}></Diagram> 
        })
      }
    </div>
  </div>
} 