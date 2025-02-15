//PlanningPoker.tsx
import React, { useState, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc, DocumentData } from "firebase/firestore";
import { db } from "../services/firebase/config";
import { Users, Eye, RefreshCw, ChevronLeft, Sun, Moon } from "lucide-react";
import { PlayerCard, StoryPointCard, VotingStats } from "./PokerCards";
import { useDarkMode } from "../context/DarkModeContext";
import { SuitType, SUITS } from "./PokerCards";
import { Sq } from "@letele/playing-cards";
// Type definitions
type PlayerData = {
  name: string;
  userId: string;
  vote: number | null;
  suit: string | null;
  joinedAt: Date;
};

type RoomData = {
  players: Record<string, PlayerData>;
  revealed: boolean;
  createdBy: string;
};
type Suit = "♠" | "♥" | "♦" | "♣";

const STORY_POINTS = [1, 2, 3, 5, 8, 13, "?"];

// Consistent suit generation
const getConsistentSuit = (value: number): SuitType => {
  return SUITS[Math.floor((value * 13) % 4)];
};

// Memoized components for better performance
const MemoizedPlayingCard = memo(PlayerCard);
const MemoizedStoryPointCard = memo(StoryPointCard);

// Memoized header component
const Header = memo(
  ({
    navigate,
    isDarkMode,
    toggleDarkMode,
  }: {
    navigate: (path: string) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
  }) => (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={() => navigate("/poker")}
        className={`flex items-center text-sm ${
          isDarkMode
            ? "text-gray-300 hover:text-white"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <ChevronLeft className="mr-2" size={20} />
        Back to Planning Poker
      </button>
      <button
        onClick={toggleDarkMode}
        className={`p-2 rounded-full transition-colors ${
          isDarkMode
            ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  )
);

// Memoized controls component
const Controls = memo(
  ({
    playerCount,
    isOwner,
    revealed,
    onReveal,
    onReset,
    isDarkMode,
  }: {
    playerCount: number;
    isOwner: boolean;
    revealed: boolean;
    onReveal: () => void;
    onReset: () => void;
    isDarkMode: boolean;
  }) => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
      <div className="flex items-center space-x-2">
        <Users
          className={`w-5 h-5 ${
            isDarkMode ? "text-blue-400" : "text-blue-500"
          }`}
        />
        <span
          className={`font-medium ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Players: {playerCount}
        </span>
      </div>

      {isOwner && (
        <div className="flex space-x-2">
          <button
            onClick={onReveal}
            disabled={revealed}
            className={`flex items-center px-4 py-2 rounded-md transition-colors 
            ${
              revealed
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Reveal
          </button>
          <button
            onClick={onReset}
            className={`flex items-center px-4 py-2 rounded-md transition-colors 
            ${
              isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
        </div>
      )}
    </div>
  )
);

// Memoized player card component
const PlayingCard = memo(
  ({
    name,
    data,
    revealed,
    isDarkMode,
  }: {
    name: string;
    data: PlayerData;
    revealed: boolean;
    isDarkMode: boolean;
  }) => (
    <div
      className={`flex items-center justify-between p-4 rounded-lg ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div>
        <div
          className={`font-medium ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          {name}
        </div>
        <div
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {data.vote !== null ? "✓ Voted" : "Not voted"}
        </div>
      </div>
      <MemoizedPlayingCard
        value={data.vote}
        suit={data.suit}
        revealed={revealed}
        selected={false}
        isDarkMode={isDarkMode}
        className="shadow-md"
      />
    </div>
  )
);

// Username Prompt Component
const UserNamePrompt = ({
  onSubmit,
  isDarkMode,
}: {
  onSubmit: (name: string) => void;
  isDarkMode: boolean;
}) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      localStorage.setItem("userName", trimmedName);
      onSubmit(trimmedName);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50"
      }`}
    >
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-4">
            <label
              htmlFor="username"
              className={`block text-lg font-bold mb-2 ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Enter Your Name
            </label>
            <input
              id="username"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "text-gray-700"
              }`}
              required
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className={`w-full py-2 rounded transition-colors ${
                name.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!name.trim()}
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PlanningPoker: React.FC<{ userId: string }> = ({ userId }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<Record<string, PlayerData>>({});
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [joined, setJoined] = useState(false);
  const storedName = localStorage.getItem("userName");
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);

  // Memoized join session function
  const joinSession = useCallback(
    async (name: string) => {
      if (!name.trim() || !userId || !roomId) return;

      const roomRef = doc(db, "planningPoker", roomId);
      const playerData: PlayerData = {
        name: name,
        userId: userId,
        vote: null,
        suit: null,
        joinedAt: new Date(),
      };

      try {
        await updateDoc(roomRef, {
          [`players.${name}`]: playerData,
        });
        setJoined(true);
      } catch (error) {
        console.error("Error joining session:", error);
        setJoined(false);
      }
    },
    [userId, roomId]
  );

  // Auto-join if we have a stored name
  useEffect(() => {
    if (storedName && !joined && roomId) {
      joinSession(storedName);
    }
  }, [roomId, storedName, joined, joinSession]);

  // Memoized vote function with optimistic update
  const vote = useCallback(
    async (points: number) => {
      if (!storedName || !roomId || revealed) return;

      const suit = getConsistentSuit(points);
      const roomRef = doc(db, "planningPoker", roomId);
      setSelectedSuit(suit);

      // Optimistic update
      setSelectedPoint(points);
      setPlayers((prev) => ({
        ...prev,
        [storedName]: {
          ...prev[storedName],
          vote: points,
          suit: suit,
        },
      }));

      try {
        await updateDoc(roomRef, {
          [`players.${storedName}.vote`]: points,
          [`players.${storedName}.suit`]: suit,
        });
      } catch (error) {
        console.error("Error voting:", error);
        // Rollback optimistic update on error
        setSelectedPoint(null);
        setPlayers((prev) => {
          const updatedPlayers = { ...prev };
          if (updatedPlayers[storedName]) {
            updatedPlayers[storedName].vote = null;
            updatedPlayers[storedName].suit = null;
          }
          return updatedPlayers;
        });
      }
    },
    [roomId, storedName, revealed]
  );

  // Effect for room subscription with error handling
  useEffect(() => {
    if (!roomId || !userId) return;

    const roomRef = doc(db, "planningPoker", roomId);
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onSnapshot(
        roomRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const roomData = docSnap.data() as RoomData;
            setSession(roomData);
            setPlayers(roomData?.players || {});
            setRevealed(roomData?.revealed || false);
            setIsOwner(roomData?.createdBy === userId);

            // Sync selected point with server state
            if (storedName && roomData?.players?.[storedName]) {
              setSelectedPoint(roomData.players[storedName].vote);
            }
          }
        },
        (error) => {
          console.error("Error in room subscription:", error);
        }
      );
    } catch (error) {
      console.error("Error setting up room subscription:", error);
    }

    return () => unsubscribe?.();
  }, [roomId, userId, storedName]);

  // Memoized handlers
  const handleReveal = useCallback(async () => {
    if (!isOwner || !roomId) return;
    const roomRef = doc(db, "planningPoker", roomId);
    try {
      await updateDoc(roomRef, { revealed: true });
    } catch (error) {
      console.error("Error revealing votes:", error);
    }
  }, [isOwner, roomId]);

  const handleReset = useCallback(async () => {
    if (!isOwner || !roomId) return;
    const roomRef = doc(db, "planningPoker", roomId);
    const resetPlayers = Object.keys(players).reduce((acc, key) => {
      acc[key] = { ...players[key], vote: null, suit: null };
      return acc;
    }, {} as Record<string, PlayerData>);

    try {
      setSelectedPoint(null);
      await updateDoc(roomRef, {
        players: resetPlayers,
        revealed: false,
      });
    } catch (error) {
      console.error("Error resetting session:", error);
    }
  }, [isOwner, roomId, players]);

  // If no room ID or stored name, prompt for username
  if (!roomId) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // If no stored name, show username prompt
  if (!storedName) {
    return (
      <UserNamePrompt
        onSubmit={(name) => joinSession(name)}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50"
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <Header
          navigate={navigate}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <Controls
          playerCount={Object.keys(players).length}
          isOwner={isOwner}
          revealed={revealed}
          onReveal={handleReveal}
          onReset={handleReset}
          isDarkMode={isDarkMode}
        />

        {revealed && (
          <div
            className={`mt-6 rounded-lg p-4 ${
              isDarkMode ? "bg-gray-800/50" : "bg-white"
            }`}
          >
            <VotingStats
              votes={players}
              revealed={revealed}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Story Points Grid */}
          <div className="max-w-5xl w-full ">
            <div className="w-full ">
              <div
                className={`rounded-lg p-6 ${
                  isDarkMode ? "bg-gray-800/50" : "bg-white"
                }`}
              >
                <h2 className="text-xl font-bold mb-6">Story Points</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
                  {STORY_POINTS.map((point) => (
                    <StoryPointCard
                      key={point}
                      point={point}
                      selected={selectedPoint === point}
                      onClick={() => vote(point)}
                      disabled={revealed}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Players List */}
          <div className="w-full lg:w-2/4">
            <div
              className={`sticky top-4 rounded-lg p-4 ${
                isDarkMode ? "bg-gray-800/50" : "bg-white"
              }`}
            >
              <h2 className="text-xl font-bold mb-4">
                Players ({Object.keys(players).length})
              </h2>
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {Object.entries(players).map(([name, data]) => (
                  <PlayerCard
                    key={name}
                    name={name}
                    data={{
                      ...data,
                      currentUserId: userId,
                      suit: data.vote !== null ? data.suit : selectedSuit,
                    }}
                    revealed={revealed}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PlanningPoker);
