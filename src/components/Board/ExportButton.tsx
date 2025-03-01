// src/components/Board/ExportButton.tsx
import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, FileSpreadsheet, FileText, X } from 'lucide-react';
import { Board } from '../../types/board.types';
import { exportToPdf } from '../../services/export/pdf';
import { exportToExcel } from '../../services/export/excel';

interface ExportButtonProps {
  board: Board;
  isOwner: boolean;
}

export default function ExportButton({ board, isOwner }: ExportButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  // Update dark mode state when theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Only render the export button if the user is the owner
  if (!isOwner) return null;

  const handleExportToPdf = async () => {
    try {
      await exportToPdf(board);
      setShowOptions(false);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      // You could add a toast notification here
    }
  };

  const handleExportToExcel = async () => {
    try {
      await exportToExcel(board);
      setShowOptions(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      // You could add a toast notification here
    }
  };

   return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={`flex items-center justify-center px-3 py-2 rounded-md 
        transition-all duration-300 
        hover:scale-[1.02] active:scale-95
        font-medium ${
          isDarkMode 
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
        }`}
        aria-label="Export board"
      >
        <ArrowDownToLine size={18} />
        {!isMobile && <span className="ml-1">Export</span>}
      </button>

      {showOptions && (
        <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`flex justify-between items-center p-2 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Export Options
            </span>
            <button 
              onClick={() => setShowOptions(false)} 
              className={isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-2">
            <button
              onClick={handleExportToPdf}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isDarkMode 
                  ? 'hover:bg-indigo-800 text-gray-200' 
                  : 'hover:bg-indigo-50 text-gray-800'
              }`}
            >
              <FileText size={18} className="text-indigo-500" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportToExcel}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isDarkMode 
                  ? 'hover:bg-indigo-800 text-gray-200' 
                  : 'hover:bg-indigo-50 text-gray-800'
              }`}
            >
              <FileSpreadsheet size={18} className="text-indigo-500" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

