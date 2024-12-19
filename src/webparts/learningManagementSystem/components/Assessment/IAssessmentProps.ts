import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IAssessmentProps {
    context: WebPartContext;
    userId: number;
    Id: string;
    type: string
    onDataChange: (data: any) => void;

}