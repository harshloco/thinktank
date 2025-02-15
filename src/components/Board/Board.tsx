import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  subscribeToBoard,
  updateSection,
  addSection,
  toggleBoardVisibility,
} from "../../services/firebase/board";
import { getCurrentUserId } from "../../services/firebase/auth";
import { Board as BoardType } from "../../types/board.types";
import { 
  PlusIcon, 
  EyeIcon, 
  EyeOffIcon, 
  HomeIcon, 
  ChevronRightIcon, 
  SunIcon, 
  MoonIcon 
} from 'lucide-react';
import { Tooltip } from "../UI/Tooltip";
import confetti from "canvas-confetti";
import Section from "./Section";
import { useDarkMode } from '../../context/DarkModeContext';

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<BoardType | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    setUserId(getCurrentUserId());
  }, []);

  useEffect(() => {
    if (!boardId) return;

    const unsubscribe = subscribeToBoard(boardId, (boardData) => {
      setBoard(boardData);
    });

    return () => unsubscribe();
  }, [boardId]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [
        "#ff0a54",
        "#ff477e",
        "#ff7096",
        "#ff85a2",
        "#fbb1bd",
        "#f9bec7",
      ],
    });
  };

   // Loading UI Component
   const LoadingUI = () => (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-4">
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-64 bg-gray-300 animate-pulse rounded"></div>
          </div>
          <div className="flex space-x-4">
            <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
            <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
          </div>
        </div>
        
        {/* Sections skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl shadow-lg p-6 bg-white">
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-20 bg-gray-100 animate-pulse rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleAddSection = async () => {
    if (!boardId || !userId || !newSectionTitle.trim()) return;
    await addSection(boardId, userId, newSectionTitle);
    setNewSectionTitle("");
    triggerConfetti();
  };

  const handleUpdateSectionTitle = async (
    sectionId: string,
    newTitle: string
  ) => {
    if (!boardId || !userId) return;
    await updateSection(boardId, sectionId, userId, { title: newTitle });
    // setEditingSectionId(null);
  };

  const handleToggleBoardVisibility = async () => {
    if (!boardId || !userId || !board) return;

    const newVisibility =
      board.boardVisibility === "visible" ? "hidden" : "visible";
    await toggleBoardVisibility(boardId, userId, newVisibility);
  };

  if (!board || !userId) return <LoadingUI />;

  const isCreator = board.creatorId === userId;
  const isBoardVisible = board.boardVisibility !== "hidden";

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <nav className="flex items-center mb-2 text-sm font-medium">
              <Link
                to="/boards"
                className={`flex items-center hover:text-indigo-600 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                <HomeIcon size={16} className="mr-2" />
                Home
              </Link>
              <ChevronRightIcon size={16} className="mx-2" />
              <span className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>{board.title}</span>
            </nav>
            <h1 className="text-4xl font-bold">{board.title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
               onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-700'}`}
            >
              {isDarkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>
            
            {/* Board Visibility Toggle for Creator */}
            {isCreator && (
              <Tooltip
                position="bottom"
                trigger={
                  <button
                    onClick={handleToggleBoardVisibility}
                    className={`
                      p-2 rounded-full
                      ${isBoardVisible ? (isDarkMode ? "bg-green-700" : "bg-green-500") : (isDarkMode ? "bg-red-700" : "bg-red-500")} 
                      text-white flex items-center justify-center
                      transition-all duration-300 hover:scale-105
                      ${!isBoardVisible ? "animate-pulse" : ""}
                    `}
                  >
                    {isBoardVisible ? (
                      <EyeIcon size={20} />
                    ) : (
                      <EyeOffIcon size={20} />
                    )}
                  </button>
                }
                content={
                  isBoardVisible
                    ? "Hide board content from other team members"
                    : "Make board content visible to all team members"
                }
              />
            )}
          </div>
        </div>

        {/* Board Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {board.sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              isBoardVisible={isBoardVisible}
              boardId={boardId??''}
              userId={userId}
              isDark={isDarkMode}
              isCreator={isCreator}
              onUpdateTitle={handleUpdateSectionTitle}
            />
          ))}

          {/* Add Section Button */}
          {isCreator && (
            <div
              className={`rounded-xl shadow-lg p-6 
              border-2 border-dashed
              transition-all duration-300
              ${isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>Add Section</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddSection();
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Section title"
                  className={`w-full p-3 border rounded-lg
                    transition-all duration-300 
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
                <button
                  type="submit"
                  className={`w-full p-3 rounded-lg
                    flex items-center justify-center
                    transition-all duration-300 
                    hover:scale-[1.02] active:scale-95
                    font-medium
                    ${isDarkMode
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    }`}
                >
                  <PlusIcon size={18} className="mr-2" /> Add Section
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;