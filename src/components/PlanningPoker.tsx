// src/components/PlanningPoker/index.tsx
import React, { 
  useState, 
  useEffect, 
  useCallback, 
  memo, 
  useMemo 
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase/config";
import { 
  Users, 
  Eye, 
  RefreshCw, 
  ChevronLeft, 
  Sun, 
  Moon 
} from "lucide-react";
import { 
  PlayerCard,  
  StoryPointCardsGrid, 
  VotingStats, 
} from "./PokerCards";
import { useDarkMode } from "../context/DarkModeContext";
import { 
  DEFAULT_STORY_POINTS,
  PlayerData, 
  StoryPoint, 
  SuitType 
} from "../types/poker.types";
import { toast } from "sonner"; // Add toast notifications
import { B2 } from "@letele/playing-cards";

// Type definitions
type RoomData = {
  players: Record<string, PlayerData>;
  revealed: boolean;
  createdBy: string;
};

// Utility functions
const getRandomSuit = (): SuitType => {
  const suits: SuitType[] = ["spades", "hearts", "diamonds", "clubs"];
  return suits[Math.floor(Math.random() * suits.length)];
};

// Memoized components (extracted to separate files in a real project)
const Header = memo(({ 
  navigate, 
  isDarkMode, 
  toggleDarkMode 
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
));

const Controls = memo(({ 
  playerCount, 
  isOwner, 
  revealed, 
  onReveal, 
  onReset, 
  isDarkMode,
  isLoading
}: { 
  playerCount: number; 
  isOwner: boolean; 
  revealed: boolean; 
  onReveal: () => void; 
  onReset: () => void; 
  isDarkMode: boolean; 
  isLoading: boolean;
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
        Players ({isLoading ? "..." : playerCount})
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
));

const UserNamePrompt = ({ 
  onSubmit, 
  isDarkMode 
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
              maxLength={20}
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
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const [players, setPlayers] = useState<Record<string, PlayerData>>({});
  const [selectedPoint, setSelectedPoint] = useState<StoryPoint | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [joined, setJoined] = useState(false);
  const [selectedSuit, setSelectedSuit] = useState<SuitType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storedName = localStorage.getItem("userName");

  // Memoized derived values
  const playerCount = useMemo(() => Object.keys(players).length, [players]);
  const currentPlayer = useMemo(() => 
    storedName ? players[storedName] : null, 
    [players, storedName]
  );
    
  const joinSession = useCallback(async (name: string) => {
    if (!name.trim() || !userId || !roomId) return;

    const roomRef = doc(db, "planningPoker", roomId);
    const playerData: PlayerData = {
      name,
      userId,
      vote: null,
      suit: null,
      joinedAt: Timestamp.now(),
      isOwner: false,
    };

    try {
      await updateDoc(roomRef, {
        [`players.${name}`]: playerData,
      });
      setJoined(true);
      toast.success(`Joined room as ${name}`);
    } catch (error) {
      console.error("Error joining session:", error);
      toast.error("Failed to join room");
      setJoined(false);
    }
  }, [userId, roomId]);

  const vote = useCallback(async (points: number) => {
    if (!storedName || !roomId || revealed) return;
  
    const roomRef = doc(db, "planningPoker", roomId);
    const suit = getRandomSuit();
    
    try {
      await updateDoc(roomRef, {
        [`players.${storedName}`]: {
          ...players[storedName],
          vote: points,
          suit
        }
      });
      
      setSelectedPoint(points);
      setSelectedSuit(suit);
      
      toast.success("Vote submitted");
    } catch (error) {
      console.error('Error voting:', error);
      toast.error("Failed to submit vote");
    }
  }, [roomId, storedName, revealed, players]);

  useEffect(() => {
    if (storedName && !joined && roomId) {
      joinSession(storedName);
    }
  }, [roomId, storedName, joined, joinSession]);


  // Room subscription effect
  useEffect(() => {
    if (!roomId || !userId) return;

    setIsLoading(true);
    const roomRef = doc(db, "planningPoker", roomId);
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onSnapshot(
        roomRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const roomData = docSnap.data() as RoomData;
           
            setPlayers(roomData?.players || {});
            setRevealed(roomData?.revealed || false);
            setIsOwner(roomData?.createdBy === userId);

            if (storedName && roomData?.players?.[storedName]) {
              setSelectedPoint(roomData.players[storedName].vote);
            }
            // Set loading to false after data is loaded
            setTimeout(() => setIsLoading(false), 300); // Small delay for animation
          }else{
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Error in room subscription:", error);
          toast.error("Error connecting to room");
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error setting up room subscription:", error);
      toast.error("Failed to connect to room");
      setIsLoading(false);
    }

    return () => unsubscribe?.();
  }, [roomId, userId, storedName]);

  // Reveal and reset handlers
  const handleReveal = useCallback(async () => {
    if (!isOwner || !roomId) return;
    try {
      await updateDoc(doc(db, "planningPoker", roomId), { revealed: true });
      toast.info("Votes revealed");
    } catch (error) {
      console.error("Error revealing votes:", error);
      toast.error("Failed to reveal votes");
    }
  }, [isOwner, roomId]);

  const handleReset = useCallback(async () => {
    if (!isOwner || !roomId) return;
    const resetPlayers = Object.fromEntries(
      Object.entries(players).map(([key, player]) => [
        key,
        { ...player, vote: null, suit: null }
      ])
    );

    try {
      setSelectedPoint(null);
      await updateDoc(doc(db, "planningPoker", roomId), {
        players: resetPlayers,
        revealed: false,
      });
      toast.success("Session reset");
    } catch (error) {
      console.error("Error resetting session:", error);
      toast.error("Failed to reset session");
    }
  }, [isOwner, roomId, players]);

  // Loading and authentication states
  if (!roomId) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50"
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!storedName) {
    return (
      <UserNamePrompt
        onSubmit={joinSession}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50"
    }`}>
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <Header
          navigate={navigate}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <Controls
          playerCount={playerCount}
          isOwner={isOwner}
          revealed={revealed}
          onReveal={handleReveal}
          onReset={handleReset}
          isDarkMode={isDarkMode}
          isLoading={isLoading}
        />

        {revealed && (
          <div className={`mt-6 rounded-lg p-4 ${
            isDarkMode ? "bg-gray-800/50" : "bg-white"
          }`}>
            <VotingStats
              votes={players}
              revealed={revealed}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="max-w-5xl w-full">
            <div className={`rounded-lg p-6 ${
              isDarkMode ? "bg-gray-800/50" : "bg-white"
            }`}>
              <h2 className="text-xl font-bold mb-6">Story Points</h2>
              <StoryPointCardsGrid 
                points={DEFAULT_STORY_POINTS}
                selectedPoint={selectedPoint}
                onSelect={vote}
                disabled={revealed || currentPlayer?.vote !== null}
                loading={isLoading}
              />
            </div>
          </div>

          <div className="w-full lg:w-2/4">
            <div className={`sticky top-4 rounded-lg p-4 ${
              isDarkMode ? "bg-gray-800/50" : "bg-white"
            }`}>
              <h2 className="text-xl font-bold mb-4">
              Players ({isLoading ? "..." : playerCount})
              </h2>
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {isLoading ? (
                  // Show loading skeletons for players
                  Array(3).fill(0).map((_, i) => (
                    <div 
                      key={i} 
                      className={`animate-pulse flex p-3 ${
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-100"
                      }`}
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 ml-3 space-y-2">
                        <div className={`h-4 ${isDarkMode ? "bg-gray-600" : "bg-gray-200"} rounded w-1/3`}></div>
                        <div className={`h-3 ${isDarkMode ? "bg-gray-600" : "bg-gray-200"} rounded w-1/4`}></div>
                      </div>
                      <div className="w-14 h-18">
                        <B2 style={{ width: "100%", height: "100%" }} />
                      </div>
                    </div>
                  ))
                ) : (
                  Object.entries(players).map(([name, data]) => (
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
                      roomId={roomId}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PlanningPoker);