// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   RocketIcon, 
//   Users, 
//   SparklesIcon,
//   SunIcon, 
//   MoonIcon,
//   LayoutDashboardIcon,
//   SquareAsterisk
// } from 'lucide-react';
// import { useDarkMode } from '../../context/DarkModeContext';
// import confetti from 'canvas-confetti';

// const FeatureCard = ({ icon, title, description, onClick, isDarkMode }) => (
//   <button
//     onClick={onClick}
//     className={`w-full p-8 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl ${
//       isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
//     }`}
//   >
//     <div className="flex flex-col items-center text-center space-y-4">
//       <div className="p-4 rounded-full bg-blue-500 bg-opacity-10">
//         {icon}
//       </div>
//       <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
//         {title}
//       </h3>
//       <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//         {description}
//       </p>
//     </div>
//   </button>
// );

// const NameInputModal = ({ isOpen, onSubmit, isDarkMode }) => {
//   const [name, setName] = useState('');

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className={`w-full max-w-md p-6 rounded-xl shadow-xl ${
//         isDarkMode ? 'bg-gray-800' : 'bg-white'
//       }`}>
//         <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
//           Welcome to ThinkTank!
//         </h2>
//         <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//           Please enter your name to get started
//         </p>
//         <form onSubmit={(e) => {
//           e.preventDefault();
//           if (name.trim()) onSubmit(name);
//         }}>
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Your name"
//             className={`w-full p-3 mb-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//               isDarkMode 
//                 ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                 : 'border-gray-200 text-gray-900'
//             }`}
//           />
//           <button
//             type="submit"
//             disabled={!name.trim()}
//             className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
//           >
//             Continue
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// const UnifiedLanding = ({ userId }) => {
//   const { isDarkMode, toggleDarkMode } = useDarkMode();
//   const [showNameModal, setShowNameModal] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const userName = localStorage.getItem('userName');
//     if (!userName) {
//       setShowNameModal(true);
//     }
//   }, []);

//   const handleNameSubmit = (name) => {
//     localStorage.setItem('userName', name);
//     setShowNameModal(false);
//     triggerConfetti();
//   };

//   const triggerConfetti = () => {
//     confetti({
//       particleCount: 150,
//       spread: 70,
//       origin: { y: 0.6 },
//       colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9d5e5', '#eeac99']
//     });
//   };

//   return (
//     <div className={`min-h-screen ${
//       isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'
//     } p-6 transition-colors duration-300`}>
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-end mb-4">
//           <button
//             onClick={toggleDarkMode}
//             className={`p-2 rounded-full transition-colors ${
//               isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-gray-700'
//             }`}
//           >
//             {isDarkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
//           </button>
//         </div>

//         {/* Hero Section */}
//         <div className="text-center mb-16 animate-fade-in">
//           <div className="flex items-center justify-center mb-6">
//             <RocketIcon className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mr-3`} size={48} />
//             <h1 className={`text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
//               ThinkTank
//             </h1>
//           </div>
//           <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
//             Enhance team collaboration with powerful tools for retrospectives and planning
//           </p>
//         </div>

//         {/* Features Grid */}
//         <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
//           <FeatureCard
//             icon={<LayoutDashboardIcon size={32} className="text-blue-500" />}
//             title="Retrospective Boards"
//             description="Collaborate and reflect with your team using interactive retrospective boards"
//             onClick={() => navigate('/boards')}
//             isDarkMode={isDarkMode}
//           />
//           <FeatureCard
//             icon={<SquareAsterisk size={32} className="text-purple-500" />}
//             title="Planning Poker"
//             description="Estimate and plan with your team using real-time planning poker sessions"
//             onClick={() => navigate('/poker')}
//             isDarkMode={isDarkMode}
//           />
//         </div>

//         {/* Features List */}
//         <div className={`mt-16 max-w-4xl mx-auto text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//           <h2 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
//             Why Choose ThinkTank?
//           </h2>
//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               {
//                 icon: <SparklesIcon className="text-yellow-500" />,
//                 title: "Real-time Updates",
//                 description: "See changes instantly as your team collaborates"
//               },
//               {
//                 icon: <Users className="text-green-500" />,
//                 title: "Team Friendly",
//                 description: "No sign-up required - just share and start working"
//               },
//               {
//                 icon: <RocketIcon className="text-blue-500" />,
//                 title: "Quick Setup",
//                 description: "Get started in seconds with our intuitive interface"
//               }
//             ].map((feature, index) => (
//               <div key={index} className="flex flex-col items-center">
//                 <div className="mb-4">
//                   {React.cloneElement(feature.icon, { size: 24 })}
//                 </div>
//                 <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
//                   {feature.title}
//                 </h3>
//                 <p className="text-sm">
//                   {feature.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <NameInputModal 
//         isOpen={showNameModal}
//         onSubmit={handleNameSubmit}
//         isDarkMode={isDarkMode}
//       />
//     </div>
//   );
// };

// export default UnifiedLanding;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RocketIcon, 
  Users, 
  SparklesIcon,
  SunIcon, 
  MoonIcon,
  LayoutDashboardIcon,
  SquareAsterisk,
} from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';
import confetti from 'canvas-confetti';

interface FeatureCardProps {
  icon: React.ReactElement<{ className?: string; size?: number }>;
  title: string;
  description: string;
  onClick: () => void;
  isDarkMode: boolean;
}

interface NameInputModalProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
  isDarkMode: boolean;
}

interface UnifiedLandingProps {
  userId?: string;
}

interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick, isDarkMode }) => (
  <button
    onClick={onClick}
    className={`w-full p-8 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl ${
      isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
    }`}
  >
    <div className="flex flex-col items-center text-center space-y-4">
      <div className={`p-4 rounded-full ${
        isDarkMode 
          ? 'bg-purple-800 bg-opacity-20' 
          : 'bg-purple-100'
      }`}>
        {React.cloneElement(icon, { 
          className: isDarkMode ? 'text-purple-300' : 'text-purple-600',
          size: icon.props.size
        })}
      </div>
      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        {title}
      </h3>
      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>
    </div>
  </button>
);

const NameInputModal: React.FC<NameInputModalProps> = ({ isOpen, onSubmit, isDarkMode }) => {
  const [name, setName] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-md p-6 rounded-xl shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Welcome to ThinkTank!
        </h2>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Please enter your name to get started
        </p>
        <form onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          if (name.trim()) onSubmit(name);
        }}>
          <input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Your name"
            className={`w-full p-3 mb-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'border-gray-200 text-gray-900'
            }`}
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

const UnifiedLanding: React.FC<UnifiedLandingProps> = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (!userName) {
      setShowNameModal(true);
    }
  }, []);

  const handleNameSubmit = (name: string): void => {
    localStorage.setItem('userName', name);
    setShowNameModal(false);
    triggerConfetti();
  };

  const triggerConfetti = (): void => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9d5e5', '#eeac99']
    });
  };

  const features: Feature[] = [
    {
      icon: <SparklesIcon className="text-yellow-500" />,
      title: "Real-time Updates",
      description: "See changes instantly as your team collaborates"
    },
    {
      icon: <Users className="text-green-500" />,
      title: "Team Friendly",
      description: "No sign-up required - just share and start working"
    },
    {
      icon: <RocketIcon className="text-blue-500" />,
      title: "Quick Setup",
      description: "Get started in seconds with our intuitive interface"
    }
  ];

  return (
    <div className={`min-h-screen ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'
    } p-6 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-gray-700'
            }`}
          >
            {isDarkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>
        </div>

        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <RocketIcon className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mr-3`} size={48} />
            <h1 className={`text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              ThinkTank
            </h1>
          </div>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Enhance team collaboration with powerful tools for retrospectives and planning
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FeatureCard
            icon={<LayoutDashboardIcon size={32} className="text-blue-500" />}
            title="Retrospective Boards"
            description="Collaborate and reflect with your team using interactive retrospective boards"
            onClick={() => navigate('/boards')}
            isDarkMode={isDarkMode}
          />
          <FeatureCard
            icon={<SquareAsterisk size={32} className="text-purple-500" />}
            title="Planning Poker"
            description="Estimate and plan with your team using real-time planning poker sessions"
            onClick={() => navigate('/poker')}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className={`mt-16 max-w-4xl mx-auto text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <h2 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Why Choose ThinkTank?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="mb-4">
                  {React.cloneElement(feature.icon, { })}
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {feature.title}
                </h3>
                <p className="text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NameInputModal 
        isOpen={showNameModal}
        onSubmit={handleNameSubmit}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default UnifiedLanding;