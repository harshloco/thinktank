import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';
import { PlanningPokerRoom } from '../../types/poker.types';

export const getUserPlanningPokerRooms = async (userId: string): Promise<PlanningPokerRoom[]> => {
  const pokerRoomsRef = collection(db, 'planningPoker');
  const pokerRoomsSnapshot = await getDocs(
    query(pokerRoomsRef, where('createdBy', '==', userId))
  );
  
  const rooms: PlanningPokerRoom[] = pokerRoomsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as PlanningPokerRoom));

  return rooms;
};