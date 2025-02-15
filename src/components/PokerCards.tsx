// PokerCards.tsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
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
} from "@letele/playing-cards";
import { useDarkMode } from "../context/DarkModeContext";
import {
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
  CrownIcon,
} from "lucide-react";

// Type definitions
export type SuitType = "spades" | "hearts" | "diamonds" | "clubs";

// Mapping of story points to specific card components
const CARD_MAPPING = {
  //   0: { suit: 'H', value: 'a' },   // Ace of Hearts
  1: { suit: "S", value: "1" }, // 1 of Spades
  2: { suit: "D", value: "2" }, // 2 of Diamonds
  3: { suit: "C", value: "3" }, // 3 of Clubs
  5: { suit: "S", value: "5" }, // 5 of Spades
  8: { suit: "H", value: "8" }, // 8 of Hearts
  13: { suit: "D", value: "j" }, // Jack of Diamonds
  21: { suit: "C", value: "q" }, // Queen of Clubs
  34: { suit: "S", value: "k" }, // King of Spades
  "?": null, // Special case for unknown
};

interface PlayerData {
  name: string;
  userId: string;
  vote: number | null;
  suit: SuitType;
  joinedAt: Date;
  isOwner: boolean;
}

interface VotingStatsProps {
  votes: Record<string, PlayerData>;
  revealed: boolean;
  isDarkMode: boolean;
}

// Constants and utilities
export const SUITS: SuitType[] = ["spades", "hearts", "diamonds", "clubs"];

// Dynamically get card component
const getCardComponent = (suit: string, value: string) => {
  const cardMap = {
    H: { a: Ha, "2": H2, "3": H3, "5": H5, "8": H8, j: Hj, q: Hq, k: Hk },
    D: { "2": D2, "3": D3, "5": D5, "8": D8, j: Dj, q: Dq, k: Dk },
    C: { "2": C2, "3": C3, "5": C5, "8": C8, j: Cj, q: Cq, k: Ck },
    S: { "1": Sa, "2": S2, "3": S3, "5": S5, "8": S8, j: Sj, q: Sq, k: Sk },
  };

  return cardMap[suit]?.[value] || null;
};

const getSuitForValue = (point: number): string => {
  const suits = ["H", "D", "C", "S"];
  return suits[Math.floor(Math.abs(point) % 4)];
};

const formatCardValue = (point: number | null): number | string => {
  if (point === null) return "?";

  // Map story points to card values
  const storyPointMapping: { [key: number]: number | string } = {
    1: "a", // Ace for 0
    2: 2,
    3: 3,
    5: 5,
    8: 8,
    13: "j", // Jack for 13
    21: "q", // Queen for 21
    34: "k", // King for 34
    "?": "j2", // Special case for unknown/joker
  };

  return storyPointMapping[point] || point;
};

interface CardProps {
  value: number | "?";
  suit?: SuitType;
  revealed?: boolean;
  selected?: boolean;
  isDarkMode?: boolean;
  className?: string;
}

const BaseCard: React.FC<CardProps> = ({
  value,
  suit,
  revealed = true,
  selected = false,
  isDarkMode = false,
  className = "",
}) => {
  // Determine card component
  const cardMapping = value !== "?" ? CARD_MAPPING[value] : null;
  const CardComponent = cardMapping
    ? getCardComponent(cardMapping.suit, cardMapping.value)
    : value === "?"
    ? J2
    : B1;

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 180 }}
      animate={{ opacity: 1, rotateY: 0 }}
      exit={{ opacity: 0, rotateY: 180 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`
        relative w-full h-full transform-gpu transition-all duration-300
        ${selected ? "ring-2 ring-blue-500 scale-105" : ""}
        overflow-hidden
        ${className}
      `}
    >
      {!revealed ? (
        <B1 style={{ width: "100%", height: "100%" }} />
      ) : (
        <CardComponent style={{ width: "100%", height: "100%" }} />
      )}
    </motion.div>
  );
};

export const StoryPointCard: React.FC<{
  point: number | "?";
  revealed?: boolean;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}> = ({
  point,
  revealed = true,
  selected = false,
  onClick,
  disabled = false,
}) => {
  const { isDarkMode } = useDarkMode();

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full max-w-[120px] aspect-[3/4]
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${selected ? "z-10" : ""}
      `}
    >
      <BaseCard
        value={point}
        revealed={revealed}
        selected={selected}
        isDarkMode={isDarkMode}
        className="w-full h-full"
      />
    </motion.button>
  );
};

// Predefined set of story point cards
export const DEFAULT_STORY_POINTS = [1, 2, 3, 5, 8, 13, "?"];

export const StoryPointCardDeck: React.FC<{
  selectedPoint: number | "?" | null;
  onSelectPoint: (point: number | "?") => void;
  disabled?: boolean;
}> = ({ selectedPoint, onSelectPoint, disabled }) => {
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

export const PlayerCard: React.FC<{
    name: string;
    data: PlayerData & { currentUserId?: string };
    revealed: boolean;
    isDarkMode: boolean;
  }> = ({ name, data, revealed, isDarkMode }) => {
    // Calculate time since joining
    const getTimeSinceJoined = (joinedAt: Date | string | { seconds: number, nanoseconds?: number }) => {
      let timestamp: number;
  
      // Handle different input types
      if (joinedAt instanceof Date) {
        timestamp = joinedAt.getTime();
      } else if (typeof joinedAt === 'string') {
        timestamp = new Date(joinedAt).getTime();
      } else if (typeof joinedAt === 'object' && 'seconds' in joinedAt) {
        // Firestore timestamp-like object
        timestamp = joinedAt.seconds * 1000;
      } else {
        return 'recently';
      }
  
      const now = new Date();
      const diffMs = now.getTime() - timestamp;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ago`;
    };
  
    // Determine if the current user can see this player's vote
    const canSeeVote = revealed || 
      (data.currentUserId && data.userId === data.currentUserId);
  
    // Determine card component
    const cardMapping = data.vote !== null ? CARD_MAPPING[data.vote] : null;
    const CardComponent = cardMapping 
      ? getCardComponent(cardMapping.suit, cardMapping.value)
      : data.vote === null 
      ? B1 
      : J2;
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          flex items-center justify-between p-3
          ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700/70' : 'bg-gray-100 hover:bg-gray-200'}
          transition-colors duration-200 group
          relative
        `}
      >
        {/* Owner Crown */}
        {data.isOwner && (
          <CrownIcon 
            size={16} 
            className={`
              absolute top-1 left-1 
              ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}
              opacity-70
            `}
          />
        )}
  
        {/* Player Info */}
        <div className="flex-grow flex items-center space-x-3">
          {/* Voting Status Indicator */}
          <div className="w-8 flex justify-center">
            {data.vote === null ? (
              <CircleIcon 
                size={20} 
                className={`
                  ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}
                `}
              />
            ) : canSeeVote ? (
              <CheckCircle2Icon 
                size={20} 
                className={`
                  ${isDarkMode ? 'text-green-400' : 'text-green-600'}
                `}
              />
            ) : (
              <ClockIcon 
                size={20} 
                className={`
                  ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}
                  animate-pulse
                `}
              />
            )}
          </div>
  
          {/* Name and Joined Time */}
          <div>
            <div 
              className={`
                font-medium flex items-center 
                ${isDarkMode ? 'text-white' : 'text-gray-800'}
              `}
            >
              {name}
            </div>
            <div 
              className={`
                text-xs
                ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
              `}
            >
              Joined {getTimeSinceJoined(data.joinedAt)}
            </div>
          </div>
        </div>
  
        {/* Vote Card */}
        <div 
          className={`
            w-14 h-18 overflow-hidden 
            ${revealed && data.vote === null ? 'opacity-30' : ''}
            transition-opacity duration-300
          `}
        >
          {canSeeVote ? (
            <div className="w-full h-full">
              <CardComponent style={{ width: '100%', height: '100%' }} />
            </div>
          ) : (
            <div className="w-full h-full">
              <B2 style={{ width: '100%', height: '100%' }} />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

// Voting Stats Component
export const VotingStats: React.FC<VotingStatsProps> = ({
  votes,
  revealed,
  isDarkMode,
}) => {
  if (!revealed) return null;

  const voteStats = React.useMemo(() => {
    const votesArray = Object.values(votes)
      .filter((player) => player.vote !== null)
      .map((player) => player.vote as number);

    const voteGroups = Object.entries(votes).reduce((acc, [name, player]) => {
      if (player.vote !== null) {
        acc[player.vote] = [...(acc[player.vote] || []), name];
      }
      return acc;
    }, {} as Record<number, string[]>);

    const voteCounts = votesArray.reduce((acc, vote) => {
      acc[vote] = (acc[vote] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      chartData: Object.entries(voteCounts)
        .map(([value, count]) => ({
          value: formatCardValue(Number(value)),
          count,
          percentage: Math.round((count / votesArray.length) * 100),
          players: voteGroups[Number(value)] || [],
        }))
        .sort((a, b) => Number(a.value) - Number(b.value)),
      consensus: Object.entries(voteCounts).reduce(
        (prev, [value, count]) =>
          count > (prev?.count || 0) ? { value, count } : prev,
        null as null | { value: string; count: number }
      ),
    };
  }, [votes]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-6 rounded-lg
        ${isDarkMode ? "bg-gray-800/50" : "bg-white"}
      `}
    >
      <h3
        className={`text-xl font-bold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Voting Results
      </h3>

      {voteStats.consensus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            mb-6 p-4 rounded-lg
            ${
              isDarkMode
                ? "bg-blue-900/30 text-blue-100"
                : "bg-blue-50 text-blue-800"
            }
          `}
        >
          <div className="font-medium">
            Consensus: {formatCardValue(Number(voteStats.consensus.value))}{" "}
            points
          </div>
          <div className="text-sm opacity-80">
            {voteStats.consensus.count} votes (
            {Math.round(
              (voteStats.consensus.count / Object.keys(votes).length) * 100
            )}
            % agreement)
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
              content={({ payload, active }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      className={`
                      p-3 rounded-lg shadow-lg
                      ${
                        isDarkMode
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-900"
                      }
                    `}
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
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default StoryPointCard;
