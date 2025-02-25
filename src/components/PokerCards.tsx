import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  H2,
  H3,
  H5,
  H8,
  Hj,
  Hq,
  Hk,
  D2,
  D3,
  D5,
  D8,
  Dj,
  Dq,
  Dk,
  C2,
  C3,
  C5,
  C8,
  Cj,
  Cq,
  Ck,
  S2,
  S3,
  S5,
  S8,
  Sj,
  Sq,
  Sk,
  J2,
  B1,
  B2,
  Ha,
  Sa,
  H10,
  C10
} from "@letele/playing-cards";
import { useDarkMode } from "../context/DarkModeContext";
import {
  Check,
  CheckCircle2,
  Circle,
  Crown,
  PenSquare,
  X,
} from "lucide-react";
import {
  CardValue,
  DEFAULT_STORY_POINTS,
  PlayerData,
  StoryPoint,
  Suit,
  SuitType,
} from "../types/poker.types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase/config";

// Types

interface CardType {
  suit: string;
  value: string;
}

interface VotingStatsProps {
  votes: Record<string, PlayerData>;
  revealed: boolean;
  isDarkMode: boolean;
}

interface CardProps {
  value: StoryPoint;
  suit?: SuitType;
  revealed?: boolean;
  selected?: boolean;
  isDarkMode?: boolean;
  className?: string;
  loading?: boolean;
}

interface StoryPointCardProps {
  point: StoryPoint;
  revealed?: boolean;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface StoryPointCardDeckProps {
  selectedPoint: StoryPoint;
  onSelectPoint: (point: number | "?") => void;
  disabled?: boolean;
}

interface PlayerCardProps {
  name: string;
  data: PlayerData;
  revealed: boolean;
  isDarkMode: boolean;
  roomId:string;
}

const CARD_MAPPING: Record<number | string, CardType | null> = {
  1: { suit: "S", value: "1" },
  2: { suit: "D", value: "2" },
  3: { suit: "C", value: "3" },
  5: { suit: "S", value: "5" },
  8: { suit: "H", value: "8" },
  10: { suit: "C", value: "10" },
  11: { suit: "S", value: "j" },
  13: { suit: "D", value: "k" },
  "?": null,
};

const CARD_COMPONENTS: Record<
  Suit,
  Partial<Record<CardValue, React.ComponentType>>
> = {
  H: { a: Ha, "2": H2, "3": H3, "5": H5, "8": H8, "10": H10, j: Hj, q: Hq, k: Hk },
  D: { "2": D2, "3": D3, "5": D5, "8": D8, j: Dj, q: Dq, k: Dk },
  C: { "2": C2, "3": C3, "5": C5, "8": C8, "10": C10, j: Cj, q: Cq, k: Ck },
  S: { "1": Sa, "2": S2, "3": S3, "5": S5, "8": S8, j: Sj, q: Sq, k: Sk },
};

// Utilities
const getCardComponent = (
  suit: Suit,
  value: CardValue
): React.ComponentType | null => CARD_COMPONENTS[suit]?.[value] || null;

const formatCardValue = (point: StoryPoint): string | number => {
  if (point === null) return "?";

  const STORY_POINT_MAPPING: Record<string | number, string | number> = {
    1: "a",
    2: 2,
    3: 3,
    5: 5,
    8: 8,
    10: 10,
    11: "j",
    13: "k",
    21: "q",
    34: "k",
    "?": "j2",
  };

  return STORY_POINT_MAPPING[point] || point;
};

const getTimeSinceJoined = (joinedAt: PlayerData["joinedAt"]): string => {
  let timestamp: number;

  if (joinedAt instanceof Date) {
    timestamp = joinedAt.getTime();
  } else if (typeof joinedAt === "string") {
    timestamp = new Date(joinedAt).getTime();
  } else if (typeof joinedAt === "object" && "seconds" in joinedAt) {
    timestamp = joinedAt.seconds * 1000;
  } else {
    return "recently";
  }

  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  return `${Math.floor(diffMins / 60)}h ago`;
};

// Components
const BaseCard: React.FC<CardProps> = ({
  value,
  revealed = true,
  selected = false,
  className = "",
  loading = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const CardComponent = React.useMemo(() => {
    if (value === "?") return J2;
    const mapping = CARD_MAPPING[value];
    if (!mapping) return B1;
    return (
      getCardComponent(mapping.suit as Suit, mapping.value as CardValue) || B1
    );
  }, [value]);

   // Simulate loading completion after components are ready
   useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300); // Small delay to ensure smooth transition
    
    return () => clearTimeout(timer);
  }, []);
  
    // Calculate what to show based on loading and reveal state
    const showCardBack = loading || !isLoaded || !revealed;
  
     // Disable the 3D flip animation during loading to avoid Safari issues
  const animations = !loading && isLoaded ? {
    initial: { opacity: 0, rotateY: 180 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 180 },
    transition: { type: "spring", stiffness: 300 }
  } : {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  };
  
  return (
    <motion.div
      {...animations}
      className={`
        relative w-full h-full transition-all duration-300
        ${selected ? "ring-2 ring-blue-500 scale-105" : ""}
        overflow-hidden
        ${className}
        -webkit-backface-visibility: ${isLoaded ? 'hidden' : 'visible'};
        -webkit-transform-style: ${isLoaded ? 'preserve-3d' : 'flat'};
        -webkit-perspective: 1000;
        transform-style: ${isLoaded ? 'preserve-3d' : 'flat'};
        backface-visibility: ${isLoaded ? 'hidden' : 'visible'};
      `}
      style={{
        WebkitTransformStyle: isLoaded ? "preserve-3d" : "flat",
        WebkitBackfaceVisibility: isLoaded ? "hidden" : "visible"
      }}
    >
      <div className="w-full h-full relative z-0">
        {showCardBack ? (
          <div className="w-full h-full">
            <B2 style={{ width: "100%", height: "100%", display: "block" }} />
            {/* {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-md">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )} */}
          </div>
        ) : (
          <CardComponent style={{ width: "100%", height: "100%", display: "block" }} />
        )}
      </div>
    </motion.div>
  );
};

export const StoryPointCardsGrid: React.FC<{
  points: StoryPoint[];
  selectedPoint: StoryPoint | null;
  onSelect: (point: number) => void;
  disabled: boolean;
  loading: boolean;
}> = ({ points, selectedPoint, onSelect, disabled, loading }) => {
 
  // Show proper number of loading cards during loading state
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
      {points.map((point) => (
        <StoryPointCard
          key={point}
          point={point}
          selected={selectedPoint === point}
          onClick={() => typeof point === 'number' && onSelect(point)}
          disabled={disabled}
          loading={loading}
        />
      ))}
    </div>
  );
};

export const StoryPointCard: React.FC<StoryPointCardProps> = ({
  point,
  revealed = true,
  selected = false,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { isDarkMode } = useDarkMode();

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.05 }}
      whileTap={disabled || loading ? {} : { scale: 0.95 }}
      onClick={loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`
        relative w-full max-w-[120px] aspect-[3/4]
        ${(disabled || loading) ? "opacity-80 cursor-not-allowed" : "cursor-pointer"}
        ${selected ? "z-10" : ""}
        overflow-visible
      `}
      style={{
        WebkitTransformStyle: "preserve-3d",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div className="w-full h-full relative">
        <BaseCard
          value={point}
          revealed={revealed}
          selected={selected}
          isDarkMode={isDarkMode}
          loading={loading}
        />
      </div>
    </motion.button>
  );
};

export const StoryPointCardDeck: React.FC<StoryPointCardDeckProps> = ({
  selectedPoint,
  onSelectPoint,
  disabled,
}) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`
      grid grid-cols-5 gap-2 p-4 rounded-lg 
      ${isDarkMode ? "bg-gray-800" : "bg-white"}
      shadow-md max-w-xl mx-auto
    `}
    >
      {DEFAULT_STORY_POINTS.map((point) => (
        <StoryPointCard
          key={point}
          point={point}
          revealed={true}
          selected={selectedPoint === point}
          onClick={() => onSelectPoint(point)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

// export const PlayerCard: React.FC<PlayerCardProps> = ({
//   name,
//   data,
//   revealed,
//   isDarkMode,
// }) => {
//   const canSeeVote =
//     revealed || (data.currentUserId && data.userId === data.currentUserId);

//   const CardComponent = React.useMemo(() => {
//     if (data.vote === null) return B1;
//     const mapping = CARD_MAPPING[data.vote];
//     if (!mapping) return J2;
//     return (
//       getCardComponent(mapping.suit as Suit, mapping.value as CardValue) || B1
//     );
//   }, [data.vote]);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className={`
//         flex items-center justify-between p-3
//         ${
//           isDarkMode
//             ? "bg-gray-700/50 hover:bg-gray-700/70"
//             : "bg-gray-100 hover:bg-gray-200"
//         }
//         transition-colors duration-200 group relative
//       `}
//     >
//       {data.isOwner && (
//         <CrownIcon
//           size={16}
//           className={`absolute top-1 left-1 ${
//             isDarkMode ? "text-yellow-400" : "text-yellow-500"
//           } opacity-70`}
//         />
//       )}

//       <div className="flex-grow flex items-center space-x-3">
//         <div className="w-8 flex justify-center">
//           {data.vote === null ? (
//             <CircleIcon
//               size={20}
//               className={isDarkMode ? "text-gray-500" : "text-gray-400"}
//             />
//           ) : canSeeVote ? (
//             <CheckCircle2Icon
//               size={20}
//               className={isDarkMode ? "text-green-400" : "text-green-600"}
//             />
//           ) : (
//             <ClockIcon
//               size={20}
//               className={`${
//                 isDarkMode ? "text-blue-400" : "text-blue-600"
//               } animate-pulse`}
//             />
//           )}
//         </div>

//         <div>
//           <div
//             className={`font-medium flex items-center ${
//               isDarkMode ? "text-white" : "text-gray-800"
//             }`}
//           >
//             {name}
//           </div>
//           <div
//             className={`text-xs ${
//               isDarkMode ? "text-gray-400" : "text-gray-500"
//             }`}
//           >
//             Joined {getTimeSinceJoined(data.joinedAt)}
//           </div>
//         </div>
//       </div>

//       <div
//         className={`w-14 h-18 overflow-hidden ${
//           revealed && data.vote === null ? "opacity-30" : ""
//         } transition-opacity duration-300`}
//       >
//         {canSeeVote ? (
//           <div className="w-full h-full">
//             <CardComponent style={{ width: "100%", height: "100%" }} />
//           </div>
//         ) : (
//           <div className="w-full h-full">
//             <B2 style={{ width: "100%", height: "100%" }} />
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// };

export const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  data,
  revealed,
  isDarkMode,
  roomId // Add roomId to props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const isCurrentUser = data.currentUserId && data.userId === data.currentUserId;
  const canSeeVote = revealed || isCurrentUser;

  const CardComponent = React.useMemo(() => {
    if (data.vote === null) return B1;
    const mapping = CARD_MAPPING[data.vote];
    if (!mapping) return J2;
    return getCardComponent(mapping.suit as Suit, mapping.value as CardValue) || B1;
  }, [data.vote]);

  const handleNameChange = async () => {
    if (!newName.trim() || !isCurrentUser || newName === name) {
      setIsEditing(false);
      setNewName(name);
      return;
    }

    try {
      // Update the name in localStorage
      localStorage.setItem('userName', newName);

      // Update the name in Firestore
      const roomRef = doc(db, 'planningPoker', roomId);
      const playerData = {
        ...data,
        name: newName
      };

      // Remove old name entry and add new name entry
      await updateDoc(roomRef, {
        [`players.${name}`]: null,
        [`players.${newName}`]: playerData
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating name:', error);
      // Reset to original name on error
      setNewName(name);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        flex items-center justify-between p-3
        ${isDarkMode ? "bg-gray-700/50 hover:bg-gray-700/70" : "bg-gray-100 hover:bg-gray-200"}
        transition-colors duration-200 group relative
      `}
    >
      {data.isOwner && (
        <Crown
          size={16}
          className={`absolute top-1 left-1 ${
            isDarkMode ? "text-yellow-400" : "text-yellow-500"
          } opacity-70`}
        />
      )}

      <div className="flex-grow flex items-center space-x-3">
        <div className="w-8 flex justify-center">
          {data.vote === null ? (
            <Circle
              size={20}
              className={isDarkMode ? "text-gray-500" : "text-gray-400"}
            />
          ) : (
            <CheckCircle2
              size={20}
              className={isDarkMode ? "text-green-400" : "text-green-600"}
            />
          )}
        </div>

        <div className="flex-grow">
          <div className={`font-medium flex items-center ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            {isEditing ? (
              <div className="flex items-center space-x-2 w-full">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`
                    px-2 py-1 rounded text-sm w-full
                    ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'}
                    border ${isDarkMode ? 'border-gray-500' : 'border-gray-300'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  `}
                  maxLength={20}
                  autoFocus
                />
                <button
                  onClick={handleNameChange}
                  className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                >
                  <Check size={16} className="text-green-500" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(name);
                  }}
                  className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                >
                  <X size={16} className="text-red-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>{isCurrentUser ? 'You' : name}</span>
                {isCurrentUser && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                      ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <PenSquare size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Joined {getTimeSinceJoined(data.joinedAt)}
          </div>
        </div>
      </div>

      <div className={`w-14 h-18 overflow-hidden ${
        revealed && data.vote === null ? "opacity-30" : ""
      } transition-opacity duration-300`}>
        {canSeeVote && data.vote !== null ? (
          <div className="w-full h-full">
            <CardComponent style={{ width: "100%", height: "100%" }} />
          </div>
        ) : (
          <div className="w-full h-full">
            <B2 style={{ width: "100%", height: "100%" }} />
          </div>
        )}
      </div>
    </motion.div>
  );
};
export const VotingStats: React.FC<VotingStatsProps> = ({
  votes,
  revealed,
  isDarkMode,
 }) => {
  const voteStats = React.useMemo(() => {
    const votedPlayers = Object.values(votes).filter(
      (player): player is PlayerData & { vote: number } =>
        player.vote !== null && typeof player.vote === "number"
    );
 
    const voteGroups = votedPlayers.reduce<Record<number, string[]>>(
      (acc, player) => {
        acc[player.vote] = [...(acc[player.vote] || []), player.name];
        return acc;
      },
      {}
    );
 
    const voteCounts = votedPlayers.reduce<Record<number, number>>(
      (acc, player) => {
        acc[player.vote] = (acc[player.vote] || 0) + 1;
        return acc;
      },
      {}
    );
 
    const totalVoted = votedPlayers.length;
    const consensus = totalVoted > 0 ? 
      Object.entries(voteCounts).find(([, count]) => count === totalVoted) : 
      null;
 
    return {
      chartData: Object.entries(voteCounts)
        .map(([value, count]) => ({
          value: formatCardValue(Number(value)),
          count,
          percentage: Math.round((count / totalVoted) * 100),
          players: voteGroups[Number(value)] || [],
        }))
        .sort((a, b) => Number(a.value) - Number(b.value)),
      consensus: consensus ? { value: consensus[0], count: consensus[1] } : null,
      totalVoters: Object.keys(votes).length,
      totalVotes: totalVoted
    };
  }, [votes]);
 
  if (!revealed) return null;
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-800/50" : "bg-white"}`}
    >
      <h3
        className={`text-xl font-bold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Voting Results
      </h3>
 
      {voteStats.totalVotes === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-6 p-4 rounded-lg ${
            isDarkMode
              ? "bg-yellow-900/30 text-yellow-100"
              : "bg-yellow-50 text-yellow-800"
          }`}
        >
          <div className="font-medium">No votes submitted</div>
          <div className="text-sm opacity-80">
            Waiting for players to vote
          </div>
        </motion.div>
      ) : voteStats.consensus ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-6 p-4 rounded-lg ${
            isDarkMode
              ? "bg-green-900/30 text-green-100"
              : "bg-green-50 text-green-800"
          }`}
        >
          <div className="font-medium">
            Unanimous Decision: {formatCardValue(Number(voteStats.consensus.value))}{" "}
            points
          </div>
          <div className="text-sm opacity-80">
            All {voteStats.totalVotes} voting players agreed
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-6 p-4 rounded-lg ${
            isDarkMode
              ? "bg-yellow-900/30 text-yellow-100"
              : "bg-yellow-50 text-yellow-800"
          }`}
        >
          <div className="font-medium">No Consensus</div>
          <div className="text-sm opacity-80">
            Voting players need to reach unanimous agreement
          </div>
        </motion.div>
      )}
 
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={voteStats.chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              dataKey="value"
              stroke={isDarkMode ? "#9CA3AF" : "#4B5563"}
            />
            <YAxis stroke={isDarkMode ? "#9CA3AF" : "#4B5563"} />
            <Tooltip
              cursor={false}
              content={({ payload, active }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as {
                    value: string | number;
                    count: number;
                    percentage: number;
                    players: string[];
                  };
                  return (
                    <div
                      className={`p-3 rounded-lg shadow-lg ${
                        isDarkMode
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <div className="font-medium mb-1">
                        {data.value} points
                      </div>
                      <div className="text-sm mb-2">
                        {data.count} votes ({data.percentage}%)
                      </div>
                      <div className="text-xs">{data.players.join(", ")}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="count"
              fill={isDarkMode ? "#60A5FA" : "#3B82F6"}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
 };

export default StoryPointCard;
