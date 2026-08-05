export interface DeliverableItem {

  title: string;

  isMandatory: boolean;

}


export interface UserSubmission {

  id?: number;

  status:
    | 'SUBMITTED'
    | 'APPROVED'
    | 'REJECTED'
    | 'PENDING'
    | 'NEEDS_REVISION'
    | 'OVERDUE';

  submittedAt?: string;

  marks?: number;

}


export interface Milestone {


  id: number;

  subjectId: number;


  subjectName?: string;


  title: string;


  description: string;


  deadline: string;


  basePoints: number;


  requiredDeliverables?: string;


  isMandatory?: boolean;


  isOverdue?: boolean;



  // -------- UI SUPPORT --------


  isLocked?: boolean;


  daysRemainingText?: string;


  userSubmission?: UserSubmission;



  deliverablesList: DeliverableItem[];


}
 


export interface CreateMilestoneRequest {


  subjectId:number;


  title:string;


  description:string;


  deadline:string;


  basePoints:number;


  requiredDeliverables:string;


  isMandatory?:boolean;


}