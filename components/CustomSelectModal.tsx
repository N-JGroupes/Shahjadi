
import React, { useState, useMemo } from 'react';
import { Search, X, CheckCircle } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  options: Option[];
  onSelect: (value: string) => void;
  selectedValue: string;
  title: string;
  backgroundUrl: string;
}

const TEXT_COLORS = [
  'text-emerald-300', 'text-sky-300', 'text-amber-300', 'text-rose-300',
  'text-violet-300', 'text-cyan-300', 'text-pink-300', 'text-indigo-300',
  'text-orange-300', 'text-teal-300', 'text-lime-300', 'text-purple-300',
];

const CustomSelectModal: React.FC<Props> = ({ isOpen, onClose, options, onSelect, selectedValue, title, backgroundUrl }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  if (!isOpen) return null;

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cover bg-center animate-in fade-in duration-300" style={{ backgroundImage: `url(${backgroundUrl})` }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between p-5 border-b border-white/20">
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <button onClick={onClose} className="p-2 text-white bg-white/10 rounded-full active:scale-90 transition-transform">
            <X size={24} />
          </button>
        </header>

        {/* Search */}
        <div className="p-4 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="text-white/50" size={20} />
            </div>
            <input
              type="text"
              placeholder="এখানে খুঁজুন..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-5 py-4 bg-black/20 border-2 border-white/10 rounded-full text-white font-bold placeholder:text-white/50 outline-none focus:border-emerald-400/50 transition-all"
            />
          </div>
        </div>

        {/* Options List */}
        <div className="flex-grow overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {filteredOptions.map(option => {
              const originalIndex = options.findIndex(o => o.value === option.value);
              const colorClass = TEXT_COLORS[originalIndex % TEXT_COLORS.length];
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left p-5 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] border-2 ${
                    selectedValue === option.value 
                      ? 'bg-emerald-500/80 shadow-lg border-emerald-300' 
                      : 'bg-white/10 hover:bg-white/20 border-white/20'
                  }`}
                >
                  <span className={`font-bold text-lg ${selectedValue === option.value ? 'text-white' : colorClass}`}>{option.label}</span>
                  {selectedValue === option.value && <CheckCircle size={24} className="text-white" />}
                </button>
              );
            })}
             {filteredOptions.length === 0 && (
                <div className="text-center py-10 text-white/70 font-bold">
                    কোনো ফলাফল পাওয়া যায়নি।
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomSelectModal;
