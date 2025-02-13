// src/types/board.types.ts
import { Timestamp } from 'firebase/firestore';

export type NoteStatus = 'visible' | 'hidden' | 'draft';
export type SectionType = 'positive' | 'negative' | 'neutral' | 'action' | 'custom';

export interface Vote {
  userId: string;
  type: 'up' | 'down';
  createdAt: Timestamp;
}

export interface Note {
  id: string;
  content: string;
  createdAt: Timestamp;
  authorId: string;
  votes: Vote[];
  status: NoteStatus;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: Timestamp;
}

export interface Section {
  id: string;
  title: string;
  type: SectionType;
  notes: Note[];
}

export interface Board {
    id: string;
    title: string;
    creatorId: string;
    createdAt: Timestamp;
    sections: Section[];
    boardVisibility?: 'visible' | 'hidden';
    memberCount?: number;
    hasUserNote?: boolean;
  }

  