export interface DeliverableItem {

  title: string;

  isMandatory: boolean;

  allowedFileExtensions?: string;

  allowedLinkPatterns?: string;

  acceptsFile?: boolean;

  acceptsLink?: boolean;

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

  instructorFeedback?: string;

  obtainedMarks?: number;

  marksLocked?: boolean;

  finalPoints?: number;

  fileUrl?: string;

  submissionLink?: string;

  comments?: string;

}


export interface Milestone {


  id: number;

  subjectId: number;


  subjectName?: string;


  title: string;


  description: string;


  deadline: string;


  basePoints: number;

  maxMarks?: number;


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

  maxMarks?:number;


  requiredDeliverables:string;


  isMandatory?:boolean;


}