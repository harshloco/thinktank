import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { nanoid } from 'nanoid';
import { 
  RocketIcon, 
  Users, 
  SparklesIcon, 
  SunIcon, 
  MoonIcon, 
  PaletteIcon 
} from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';
import confetti from 'canvas-confetti';
import { getUserPlanningPokerRooms } from '../../services/firebase/poker';
import { PlanningPokerRoom } from '../../types/poker.types';

interface RoomSkeletonProps {
  isDarkMode: boolean;
}

const RoomSkeleton: React.FC<RoomSkeletonProps> = ({ isDarkMode }) => (
  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 animate-pulse`}>
    <div className={`h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-3/4 mb-4`}></div>
    <div className={`h-4 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-1/2`}></div>
  </div>
);

interface PlanningPokerLandingProps {
  userId: string;
} 


const PlanningPokerLanding: React.FC<PlanningPokerLandingProps> = ({ userId }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [rooms, setRooms] = useState<PlanningPokerRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const storedName = localStorage.getItem('userName');
  const [showNameInput, setShowNameInput] = useState(!storedName);
  const [userName, setUserName] = useState(storedName || '');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const userRooms = await getUserPlanningPokerRooms(userId);
        setRooms(userRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [userId]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9d5e5', '#eeac99']
    });
  };

  const createPokerRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = showNameInput ? userName : storedName;
    
    if (!name?.trim() || !userId) return;

    if (showNameInput) {
      localStorage.setItem('userName', userName);
      setShowNameInput(false);
    }

    const roomId = nanoid(10);
    await setDoc(doc(db, 'planningPoker', roomId), {
      createdAt: new Date(),
      createdBy: userId,
      players: {
        [name]: {
          name: name,
          userId: userId,
          vote: null,
          joinedAt: new Date(),
          isOwner: true
        }
      },
      revealed: false
    });

    triggerConfetti();
    navigate(`/poker/${roomId}`);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} p-6 transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto">
        {/* Header with Dark Mode Toggle and Board Link */}
        <div className="flex justify-end space-x-2 mb-4">
          <Link 
            to="/boards" 
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {/* <BoardIcon size={20} /> */}
            Boards
          </Link>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-gray-700'
            }`}
          >
            {isDarkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <RocketIcon className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mr-3`} size={40} />
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Planning Poker
            </h1>
          </div>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Estimate and plan with your team in real-time
          </p>
        </div>

        {/* Create Room Form */}
        <form onSubmit={createPokerRoom} className="mb-8 max-w-md mx-auto animate-slide-up">
          <div className="flex flex-col space-y-4">
            {showNameInput && (
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'border-blue-200 text-gray-900'
                }`}
              />
            )}
            <div className="flex shadow-lg">
              <button 
                type="submit"
                disabled={!userId || (showNameInput && !userName.trim())}
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center group disabled:opacity-50"
              >
                <Users size={20} className="mr-2 group-hover:rotate-12 transition-transform" />
                Create Room {storedName ? `as ${storedName}` : ''}
              </button>
            </div>
          </div>
        </form>

        {/* Rooms List */}
        <div className="animate-fade-in">
          <h2 className={`text-2xl font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <Users className="mr-3 text-purple-500" size={24} />
            My Poker Rooms
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(key => (
                <RoomSkeleton key={key} isDarkMode={isDarkMode} />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className={`text-center p-8 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <PaletteIcon size={64} className="mx-auto mb-4 text-gray-300 animate-bounce" />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                No poker rooms yet. Create your first room to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Link 
                  to={`/poker/${room.id}`} 
                  key={room.id}
                  className={`rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:-translate-y-2 group ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <SparklesIcon size={24} className="mr-3 text-yellow-500 group-hover:rotate-12 transition-transform" />
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Poker Room
                      </h3>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created {room.createdAt.toDate().toLocaleDateString()}
                    </div>
                    <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                      {Object.keys(room.players || {}).length} players
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningPokerLanding;