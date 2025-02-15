import React, { useState } from "react";
import { EditIcon, XIcon } from "lucide-react";
import Note from "./Note";
import {
  addNote,
  deleteNote,
  voteNote,
  updateNote as updateNoteService,
} from "../../services/firebase/board";
import { Section as SectionType } from "../../types/board.types";
import { motion, AnimatePresence } from "framer-motion";

interface SectionProps {
  section: SectionType;
  boardId: string;
  userId: string;
  isDark: boolean;
  isCreator: boolean;
  isBoardVisible: boolean;
  onUpdateTitle: (sectionId: string, newTitle: string) => Promise<void>;
}

export default function Section({
  section,
  boardId,
  userId,
  isDark,
  isBoardVisible,
  isCreator,
  onUpdateTitle,
}: SectionProps) {
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(section.title);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState("");

  const handleAddNote = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && newNoteContent.trim()) {
      e.preventDefault();
      try {
        await addNote(boardId, section.id, newNoteContent, userId);
        setNewNoteContent("");
      } catch (error) {
        console.error("Error adding note:", error);
      }
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(boardId, section.id, noteId, userId);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleVote = async (noteId: string, voteType: "up" | "down") => {
    try {
      await voteNote(boardId, section.id, noteId, userId, voteType);
    } catch (error) {
      console.error("Error voting on note:", error);
    }
  };

  const handleUpdateNote = async (
    e?: React.KeyboardEvent<HTMLTextAreaElement>,
    forceSubmit = false
  ) => {
    if ((e && e.key === "Enter" && !e.shiftKey) || forceSubmit) {
      if (!editingNoteId || !editNoteContent.trim()) {
        setEditingNoteId(null);
        setEditNoteContent("");
        return;
      }

      try {
        await updateNoteService(
          boardId,
          section.id,
          editingNoteId,
          userId,
          editNoteContent
        );
        setEditingNoteId(null);
        setEditNoteContent("");
      } catch (error) {
        console.error("Error updating note:", error);
      }
    }
  };

  const handleUpdateTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    try {
      await onUpdateTitle(section.id, titleInput);
      setEditingTitle(false);
    } catch (error) {
      console.error("Error updating section title:", error);
    }
  };

  return (
    <div
      className={`rounded-xl shadow-lg p-6 transition-all duration-300 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Section Title */}
      <div className="flex items-center mb-4">
        {editingTitle ? (
          <form
            onSubmit={handleUpdateTitle}
            className="flex-grow flex items-center space-x-2"
          >
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className={`flex-grow p-2 rounded border ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <button
              type="submit"
              className={`p-2 rounded ${
                isDark
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-indigo-500 text-white hover:bg-indigo-600"
              }`}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingTitle(false)}
              className={`p-2 rounded ${
                isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <XIcon size={16} />
            </button>
          </form>
        ) : (
          <div className="flex-grow flex items-center justify-between">
            <h2
              className={`text-xl font-bold ${
                isDark ? "text-gray-100" : "text-gray-700"
              }`}
            >
              {section.title}
            </h2>
            {isCreator && (
              <button
                onClick={() => setEditingTitle(true)}
                className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
              >
                <EditIcon size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Notes List */}
        <div className="space-y-4 mb-4">
          <AnimatePresence>
            {section.notes.map((note) =>
              editingNoteId === note.id ? (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <textarea
                    ref={(input) => {
                      if (!input) return;

                      // Focus the input
                      input.focus();

                      // Add click-outside handler
                      const handleClickOutside = (e: MouseEvent) => {
                        if (!input.contains(e.target as Node)) {
                          handleUpdateNote(undefined, true);
                          document.removeEventListener(
                            "mousedown",
                            handleClickOutside
                          );
                        }
                      };

                      // Add listener after a short timeout to prevent immediate trigger
                      const timeoutId = setTimeout(() => {
                        document.addEventListener(
                          "mousedown",
                          handleClickOutside
                        );
                      }, 0);

                      // Return a cleanup function
                      return () => {
                        document.removeEventListener(
                          "mousedown",
                          handleClickOutside
                        );
                        clearTimeout(timeoutId);
                      };
                    }}
                    value={editNoteContent}
                    onChange={(e) => setEditNoteContent(e.target.value)}
                    onKeyDown={(e) => {
                      // Prevent editing when Esc is pressed
                      if (e.key === "Escape") {
                        setEditingNoteId(null);
                        setEditNoteContent("");
                        return;
                      }
                      handleUpdateNote(e);
                    }}
                    className={`w-full p-2 border rounded ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    rows={3}
                  />
                </motion.div>
              ) : (
                <Note
                  key={note.id}
                  note={note}
                  boardId={boardId}
                  sectionId={section.id}
                  userId={userId}
                  isAuthor={note.authorId === userId}
                  isDark={isDark}
                  isBoardVisible={isBoardVisible}
                  onVote={(noteId, voteType) => {
                    // Prevent editing when voting
                    handleVote(noteId, voteType);
                  }}
                  onDelete={handleDeleteNote}
                  onNoteClick={() => {
                    setEditingNoteId(note.id);
                    setEditNoteContent(note.content);
                  }}
                />
              )
            )}
          </AnimatePresence>
        </div>

        {/* Add Note Textarea */}
        <motion.textarea
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          onKeyDown={handleAddNote}
          placeholder="Type a note and press Enter to add..."
          className={`w-full p-3 border rounded-lg
          transition-all duration-300 
          focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          }`}
          rows={3}
        />
      </div>
    </div>
  );
}
