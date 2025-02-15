import { Timestamp } from "firebase/firestore";

export interface PlayerData {
    name: string;
    userId: string;
    vote: number | null;
    joinedAt: Timestamp;
  }
  
  export interface PlanningPokerRoom {
    id: string;
    createdAt: Timestamp;
    createdBy: string;
    players: Record<string, PlayerData>;
    revealed: boolean;
  }
  