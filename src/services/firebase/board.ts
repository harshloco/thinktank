// src/services/firebase/board.ts
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  onSnapshot,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "./config";
import { Board, Section, NoteStatus, Note } from "../../types/board.types";
import { v4 as uuidv4 } from "uuid";

export const getUserBoards = async (userId: string): Promise<Board[]> => {
  const boardsRef = collection(db, 'boards');
  const boardsSnapshot = await getDocs(boardsRef);
  
  const boards: Board[] = [];
  
  for (const doc of boardsSnapshot.docs) {
    const boardData = doc.data() as Board;
    const sections = boardData.sections || [];
    
    // Get unique member IDs from notes
    const memberIds = new Set<string>();
    let hasUserNote = false;
    
    sections.forEach((section) => {
      section.notes?.forEach(note => {
        memberIds.add(note.authorId);
        if (note.authorId === userId) {
          hasUserNote = true;
        }
      });
    });

    // Only include boards where user is creator or has notes
    if (boardData.creatorId === userId || hasUserNote) {
      boards.push({
      
        ...boardData,
        memberCount: memberIds.size,
        hasUserNote
      });
    }
  }

  return boards;
};

export const toggleBoardVisibility = async (
  boardId: string,
  userId: string,
  newVisibility: "visible" | "hidden"
): Promise<void> => {
  try {
    // Check creator permissions
    await checkBoardCreatorPermission(boardId, userId);

    const boardRef = doc(db, "boards", boardId);
    await updateDoc(boardRef, {
      boardVisibility: newVisibility,
    });
  } catch (error) {
    console.error("Error toggling board visibility:", error);
    throw error;
  }
};

// Add a permission check utility
const checkBoardCreatorPermission = async (
  boardId: string,
  userId: string
): Promise<void> => {
  const boardRef = doc(db, "boards", boardId);
  const boardDoc = await getDoc(boardRef);

  if (!boardDoc.exists()) {
    throw new Error("Board not found");
  }

  const board = boardDoc.data() as Board;
  if (board.creatorId !== userId) {
    throw new Error("Only board creator can perform this action");
  }
};

export const createBoard = async (
  title: string,
  userId: string
): Promise<string> => {
  const boardId = uuidv4();
  const board: Board = {
    id: boardId,
    title,
    creatorId: userId,
    createdAt: Timestamp.now(),
    sections: [
      {
        id: uuidv4(),
        title: "What went well",
        type: "positive",
        notes: [],
      },
      {
        id: uuidv4(),
        title: "What to improve",
        type: "negative",
        notes: [],
      },
      {
        id: uuidv4(),
        title: "Action Items",
        type: "action",
        notes: [],
      },
    ],
  };

  try {
    await setDoc(doc(db, "boards", boardId), board);
    return boardId;
  } catch (error) {
    console.error("Error creating board:", error);
    throw error;
  }
};

export const updateSection = async (
  boardId: string,
  sectionId: string,
  userId: string,
  updates: Partial<Section>
): Promise<void> => {
  try {
    // Check creator permissions
    await checkBoardCreatorPermission(boardId, userId);

    const boardRef = doc(db, "boards", boardId);
    const boardDoc = await getDoc(boardRef);
    const board = boardDoc.data() as Board;

    const sectionIndex = board.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) {
      throw new Error("Section not found");
    }

    const updatedSections = [...board.sections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      ...updates,
    };

    await updateDoc(boardRef, { sections: updatedSections });
  } catch (error) {
    console.error("Error updating section:", error);
    throw error;
  }
};

export const addSection = async (
  boardId: string,
  userId: string,
  title: string
): Promise<void> => {
  try {
    // Check creator permissions
    await checkBoardCreatorPermission(boardId, userId);

    const boardRef = doc(db, "boards", boardId);
    const boardDoc = await getDoc(boardRef);
    const board = boardDoc.data() as Board;

    const newSection: Section = {
      id: uuidv4(),
      title,
      type: "custom",
      notes: [],
    };

    await updateDoc(boardRef, {
      sections: [...board.sections, newSection],
    });
  } catch (error) {
    console.error("Error adding section:", error);
    throw error;
  }
};

// Modify the addNote method in board service
export const addNote = async (
  boardId: string,
  sectionId: string,
  content: string,
  authorId: string
): Promise<void> => {
  try {
    const boardRef = doc(db, "boards", boardId);
    const boardDoc = await getDoc(boardRef);

    if (!boardDoc.exists()) {
      throw new Error("Board not found");
    }

    const board = boardDoc.data() as Board;
    const sectionIndex = board.sections.findIndex((s) => s.id === sectionId);

    if (sectionIndex === -1) {
      throw new Error("Section not found");
    }

    const note: Note = {
      id: uuidv4(),
      content,
      createdAt: Timestamp.now(),
      authorId,
      votes: [],
      status: "visible",
    };

    const updatedSections = [...board.sections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      notes: [...updatedSections[sectionIndex].notes, note],
    };

    await updateDoc(boardRef, { sections: updatedSections });
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
};

export const deleteNote = async (
  boardId: string,
  sectionId: string,
  noteId: string,
  userId: string
): Promise<void> => {
  try {
    const boardRef = doc(db, "boards", boardId);
    const boardDoc = await getDoc(boardRef);

    if (!boardDoc.exists()) {
      throw new Error("Board not found");
    }

    const board = boardDoc.data() as Board;
    const sectionIndex = board.sections.findIndex((s) => s.id === sectionId);

    if (sectionIndex === -1) {
      throw new Error("Section not found");
    }

    const noteIndex = board.sections[sectionIndex].notes.findIndex(
      (n) => n.id === noteId
    );

    if (noteIndex === -1) {
      throw new Error("Note not found");
    }

    // Check if current user is the note author
    const note = board.sections[sectionIndex].notes[noteIndex];
    if (note.authorId !== userId) {
      throw new Error("Only note author can delete");
    }

    const updatedSections = [...board.sections];
    const updatedNotes = [...updatedSections[sectionIndex].notes];
    updatedNotes.splice(noteIndex, 1);

    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      notes: updatedNotes,
    };

    await updateDoc(boardRef, { sections: updatedSections });
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

export const voteNote = async (
  boardId: string,
  sectionId: string,
  noteId: string,
  userId: string,
  voteType: 'up' | 'down'
): Promise<void> => {
  try {
    const boardRef = doc(db, "boards", boardId);
    const boardDoc = await getDoc(boardRef);

    if (!boardDoc.exists()) {
      throw new Error("Board not found");
    }

    const board = boardDoc.data() as Board;
    const sectionIndex = board.sections.findIndex((s) => s.id === sectionId);

    if (sectionIndex === -1) {
      throw new Error("Section not found");
    }

    const noteIndex = board.sections[sectionIndex].notes.findIndex(
      (n) => n.id === noteId
    );

    if (noteIndex === -1) {
      throw new Error("Note not found");
    }

    const updatedSections = [...board.sections];
    const updatedNotes = [...updatedSections[sectionIndex].notes];
    const note = updatedNotes[noteIndex];

    // Ensure votes is an array
    const votes = Array.isArray(note.votes) ? note.votes : [];

    // Check if user has already voted
    const existingVoteIndex = votes.findIndex(
      (vote) => vote.userId === userId
    );

    let updatedVotes;
    if (existingVoteIndex !== -1) {
      // Remove existing vote if it's the same type
      if (votes[existingVoteIndex].type === voteType) {
        updatedVotes = votes.filter((_, index) => index !== existingVoteIndex);
      } else {
        // Replace existing vote with new vote type
        updatedVotes = votes.map((vote, index) => 
          index === existingVoteIndex 
            ? { userId, type: voteType, createdAt: Timestamp.now() }
            : vote
        );
      }
    } else {
      // Add new vote
      updatedVotes = [
        ...votes,
        { userId, type: voteType, createdAt: Timestamp.now() }
      ];
    }

    updatedNotes[noteIndex] = {
      ...note,
      votes: updatedVotes
    };

    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      notes: updatedNotes,
    };

    await updateDoc(boardRef, { sections: updatedSections });
  } catch (error) {
    console.error("Error voting on note:", error);
    throw error;
  }
};

export const updateNote = async (
  boardId: string,
  sectionId: string,
  noteId: string,
  userId: string,
  newContent: string
): Promise<void> => {
  try {
    const boardRef = doc(db, "boards", boardId);
    const boardDoc = await getDoc(boardRef);

    if (!boardDoc.exists()) {
      throw new Error("Board not found");
    }

    const board = boardDoc.data() as Board;
    const sectionIndex = board.sections.findIndex((s) => s.id === sectionId);

    if (sectionIndex === -1) {
      throw new Error("Section not found");
    }

    const noteIndex = board.sections[sectionIndex].notes.findIndex(
      (n) => n.id === noteId
    );

    if (noteIndex === -1) {
      throw new Error("Note not found");
    }

    // Check if current user is the note author
    const note = board.sections[sectionIndex].notes[noteIndex];
    if (note.authorId !== userId) {
      throw new Error("Only note author can edit");
    }

    const updatedSections = [...board.sections];
    const updatedNotes = [...updatedSections[sectionIndex].notes];

    updatedNotes[noteIndex] = {
      ...updatedNotes[noteIndex],
      content: newContent,
    };

    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      notes: updatedNotes,
    };

    await updateDoc(boardRef, { sections: updatedSections });
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

export const toggleNoteVisibility = async (
  boardId: string,
  sectionId: string,
  noteId: string,
  userId: string,
  newStatus: NoteStatus
): Promise<void> => {
  try {
    // Check creator permissions
    await checkBoardCreatorPermission(boardId, userId);

    const boardRef = doc(db, "boards", boardId);
    const boardDoc = await getDoc(boardRef);
    const board = boardDoc.data() as Board;

    const sectionIndex = board.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) {
      throw new Error("Section not found");
    }

    const noteIndex = board.sections[sectionIndex].notes.findIndex(
      (n) => n.id === noteId
    );
    if (noteIndex === -1) {
      throw new Error("Note not found");
    }

    const updatedSections = [...board.sections];
    const updatedNotes = [...updatedSections[sectionIndex].notes];

    updatedNotes[noteIndex] = {
      ...updatedNotes[noteIndex],
      status: newStatus,
    };

    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      notes: updatedNotes,
    };

    await updateDoc(boardRef, { sections: updatedSections });
  } catch (error) {
    console.error("Error toggling note visibility:", error);
    throw error;
  }
};

export const subscribeToBoard = (
  boardId: string,
  callback: (board: Board) => void,
  onError?: (error: Error) => void
): (() => void) => {
  // Explicitly return a function
  if (!boardId) {
    onError?.(new Error("Board ID is required"));
    return () => {}; // Return no-op function if no boardId
  }

  try {
    return onSnapshot(
      doc(db, "boards", boardId),
      (doc) => {
        if (doc.exists()) {
          const boardData = {
            id: doc.id,
            ...doc.data(),
          } as Board;
          callback(boardData);
        } else {
          console.error("No such board");
          onError?.(new Error("Board not found"));
        }
      },
      (error) => {
        console.error("Board subscription error:", error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error("Error setting up board subscription:", error);
    onError?.(error as Error);
    return () => {}; // Return no-op function in case of error
  }
};
