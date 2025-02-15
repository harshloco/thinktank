// src/components/Note.tsx
import type { Note as NoteType } from "../../types/board.types";
import { ThumbsUp, Trash2, Edit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
interface Props {
  note: NoteType;
  boardId: string;
  sectionId: string;
  isAuthor: boolean;
  isDark: boolean;
  userId: string;
  isBoardVisible: boolean;
  onVote: (noteId: string, voteType: "up" | "down") => void;
  onDelete: (noteId: string) => void;
  onEdit?: (noteId: string, content: string) => void;
  onNoteClick?: () => void;
}

export default function Note({
  note,
  isAuthor,
  isDark,
  isBoardVisible,
  userId,
  onVote,
  onDelete,
  onEdit,
  onNoteClick,
}: Props) {
  const upvoteAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 },
    },
  };

  const noteVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  // Ensure votes is an array
  const votes = Array.isArray(note.votes) ? note.votes : [];

  // Count votes
  const upvotes = votes.filter((vote) => vote.type === "up").length;

  // Check if current user has voted
  const userUpvoted = votes.some(
    (vote) => vote.userId === userId && vote.type === "up"
  );


  // Format timestamp
  const formattedTime = formatDistanceToNow(note.createdAt.toDate(), {
    addSuffix: true,
  });

  if (!isBoardVisible && !isAuthor) {
    return (
      <div
        className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div
          className={`w-full h-20 bg-gradient-to-r 
            ${
              isDark ? "from-gray-700 to-gray-600" : "from-gray-200 to-gray-300"
            } 
            rounded-lg blur-sm opacity-70`}
        >
          <div
            className={`w-full h-full flex items-center justify-center text-center ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Content hidden
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={noteVariants}
      initial="hidden"
      animate="visible"
      className={`p-4 rounded-lg shadow-md transition-all duration-300 cursor-${
        isAuthor ? "pointer" : "default"
      } ${
        isDark
          ? isAuthor
            ? "bg-indigo-900/50"
            : "bg-gray-800"
          : isAuthor
          ? "bg-indigo-50"
          : "bg-white"
      }`}
      whileHover={{
        scale: 1.02,
        boxShadow: isDark
          ? "0 4px 6px rgba(255,255,255,0.1)"
          : "0 4px 6px rgba(0,0,0,0.1)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <p
        onClick={isAuthor ? onNoteClick : undefined}
        className={`break-words mb-3 cursor-${
          isAuthor ? "pointer" : "default"
        } ${isDark ? "text-gray-100" : "text-gray-800"}`}
      >
        {note.content}
      </p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <motion.button
            {...(upvotes === 0 ? {} : upvoteAnimation)}
            onClick={(e) => {
              e.stopPropagation();
              onVote(note.id, "up");
            }}
            className={`flex items-center space-x-1 p-1 rounded hover:bg-opacity-80 transition-colors ${
              isDark
                ? userUpvoted
                  ? "bg-green-900"
                  : "hover:bg-gray-700"
                : userUpvoted
                ? "bg-green-100"
                : "hover:bg-gray-200"
            }`}
          >
            <AnimatePresence>
              <motion.div
                key={upvotes}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <ThumbsUp
                  size={16}
                  className={`
                    ${isDark ? "text-gray-300" : "text-gray-600"}
                    ${userUpvoted ? "text-green-500" : ""}
                  `}
                />
                {upvotes > 0 && (
                  <span
                    className={`
                      ${isDark ? "text-gray-300" : "text-gray-600"}
                      ${userUpvoted ? "text-green-500" : ""}
                    `}
                  >
                    {upvotes}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {isAuthor && (
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(note.id, note.content)}
                  className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
                    isDark ? "hover:bg-indigo-900" : "hover:bg-indigo-100"
                  }`}
                >
                  <Edit2
                    size={16}
                    className={isDark ? "text-indigo-400" : "text-indigo-600"}
                  />
                </button>
              )}
              <button
                onClick={() => onDelete(note.id)}
                className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
                  isDark ? "hover:bg-red-900" : "hover:bg-red-100"
                }`}
              >
                <Trash2
                  size={16}
                  className={isDark ? "text-red-400" : "text-red-600"}
                />
              </button>
            </div>
          )}
        </div>
        <span className={isDark ? "text-gray-400" : "text-gray-500"}>
          {formattedTime}
        </span>
      </div>
    </motion.div>
  );
}
