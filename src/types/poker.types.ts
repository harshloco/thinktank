import { Timestamp } from "firebase/firestore";

export type StoryPoint = number | "?" ;
export type Suit = 'H' | 'D' | 'C' | 'S';
export type CardValue = 'a' | '1' | '2' | '3' | '5' | '8' | '10' | 'j' | 'q' | 'k';
export type SuitType = "spades" | "hearts" | "diamonds" | "clubs";

export const DEFAULT_STORY_POINTS: StoryPoint[] = [1, 2, 3, 5, 8, 10, 11, 13];
  export interface PlanningPokerRoom {
    id: string;
    createdAt: Timestamp;
    createdBy: string;
    players: Record<string, PlayerData>;
    revealed: boolean;
  }
  

  export interface PlayerData {
    name: string;
    userId: string;
    vote: StoryPoint | null;
    suit: SuitType | null;
    joinedAt: Date | string | { seconds: number; nanoseconds?: number };
    isOwner: boolean;
    currentUserId?: string;
  }
  export interface PlanningPokerRoom {
    id: string;
    createdAt: Timestamp;
    createdBy: string;
    players: Record<string, PlayerData>;
    revealed: boolean;
  }


  export interface VoteParams {
    points: StoryPoint;
    roomId: string;
    playerName: string;
    revealed: boolean;
  }
  
  export interface VoteResult {
    success: boolean;
    error?: string;
  }
  
  // Utility type for vote updates
  export interface VoteUpdate {
    points: StoryPoint;
    suit: SuitType;
  }
  
  // Hook return types
  export interface UsePlanningPokerRoom {
    room: PlanningPokerRoom | null;
    loading: boolean;
    error: Error | null;
    vote: (params: VoteParams) => Promise<VoteResult>;
    reveal: () => Promise<void>;
    reset: () => Promise<void>;
  }