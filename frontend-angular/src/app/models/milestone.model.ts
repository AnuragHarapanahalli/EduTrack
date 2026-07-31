export interface DeliverableItem {
  title: string;
  isMandatory: boolean;
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
  deliverablesList?: DeliverableItem[];
}

export interface CreateMilestoneRequest {
  subjectId: number;
  title: string;
  description: string;
  deadline: string;
  basePoints: number;
  requiredDeliverables: string;
  isMandatory?: boolean;
}
