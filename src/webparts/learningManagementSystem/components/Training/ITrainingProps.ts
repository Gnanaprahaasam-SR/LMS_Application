import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ITrainingProps {
    context: WebPartContext;
   
}

export interface ITrainingIndividualProps{
    context: WebPartContext,
    userId:number;
}

export interface ITrainingVideoProps{
    context: WebPartContext,
   
}