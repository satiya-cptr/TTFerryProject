import { Timestamp } from "firebase/firestore";

export interface UpdateAuthor {
  uid: string;
  firstName: string;
  lastName: string;
}

export interface UpdateEdit {
  editedAt: Timestamp;
  editedBy: UpdateAuthor;
  changes: {
    title?: string;
    subtitle?: string;
    body?: string;
    imageUrl?: string;
  };
}

export interface Update {
  id?: string;
  title: string;
  subtitle: string;
  body: string;
  imageUrl?: string;
  type: "general" | "sailing";
  sailingId?: string;
  
  createdAt: Timestamp;
  createdBy: UpdateAuthor;
  
  editHistory: UpdateEdit[];
  lastEditedAt?: Timestamp;
  lastEditedBy?: UpdateAuthor;
}