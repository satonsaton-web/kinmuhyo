import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Search, Download, Users, Trash2, CheckCircle2 } from 'lucide-react';
import { generateMockMembers } from './services/mockDataService';
import { Member, ScheduleEntry, ShiftType } from './types';
import { SHIFT_COLORS } from './constants';
import { ShiftEditor } from './components/ShiftEditor';
import { ChatInterface } from './components/ChatInterface';
import { TutorialModal } from './components/TutorialModal';
import { ShiftCheckModal } from './components/ShiftCheckModal';
import { AuthModal } from './components/AuthModal';

// Days of week in Japanese
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const STORAGE_KEY = 'staff-sync-data-v1';

function App() {
  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditorAuthenticated, setIsEditorAuthenticated] = useState(false);
  const [showEditAuth, setShowEditAuth] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<{memberId: string, entry: ScheduleEntry} | null>(null);

  // Main App States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTutorial, setShowTutorial] = useState(false); // Default false, show after login
  
  // Modals
  const [editingEntry, setEditingEntry] = useState<{memberId: string, entry: ScheduleEntry} | null>(null);
  const [showShiftCheck, setShowShiftCheck] = useState(false);

  // Initialize Data
  useEffect(() => {
    if (!isAuthenticated) return; // Only load data if authenticated

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedMembers = JSON.parse(savedData);
        // Data migration check: ensure shifts is an array
        const migratedMembers = parsedMembers.map((m: any) => ({
          ...m,
          schedules: Object.fromEntries(
            Object.entries(m.schedules).map(([date, entry]: [string, any]) => {
              if (entry.shift && !entry.shifts) {
                return [date, { ...entry, shifts: [entry.shift] }];
              }
              return [date, entry];
            })
          )
        }));
        setMembers(migratedMembers);
      } catch (e) {
        console.error("Failed to load saved data", e);
        setMembers(generateMockMembers());
      }
    } else {
      setMembers(generateMockMembers());
      setShowTutorial(true); // Show tutorial only for new users
    }
  }, [isAuthenticated]);

  // Save to LocalStorage
  useEffect(() => {
    if (isAuthenticated && members.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    }
  }, [members, isAuthenticated]);

  // Calendar calculations
  const { year, month, daysArray } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return {
        date: i + 1,
        dayOfWeek: d.getDay(),
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
      };
    });
    return { year, month, daysInMonth, daysArray };
  }, [currentDate]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    return members.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [members, searchQuery]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // --- Auth & Edit Logic ---

  const handleCellClick = (memberId: string, dateStr: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    // Create default if missing
    const entry = member.schedules[dateStr] || {
      date: dateStr,
      shifts: [ShiftType.Off],
      note: ''
    };
    
    // Open editor directly; we will check auth when saving
    setEditingEntry({ memberId, entry });
  };

  const handleSaveAttempt = (newEntry: ScheduleEntry) => {
    if (!editingEntry) return;

    if (isEditorAuthenticated) {
      // Already authenticated, save directly
      executeSave(editingEntry.memberId, newEntry);
    } else {
      // Need auth, store pending save
      setPendingEdit({ memberId: editingEntry.memberId, entry: newEntry });
      setShowEditAuth(true);
    }
  };

  const handleEditAuthSuccess = () => {
    setIsEditorAuthenticated(true);
    setShowEditAuth(false);
    if (pendingEdit) {
      executeSave(pendingEdit.memberId, pendingEdit.entry);
      setPendingEdit(null);
    }
  };

  const executeSave = (memberId: string, newEntry: ScheduleEntry) => {
    setMembers(prevMembers => prevMembers.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          schedules: {
            ...member.schedules,
            [newEntry.date]: newEntry
          }
        };
      }
      return member;
    }));
    setEditingEntry(null); // Close editor after successful save
  };

  // Logic to handle updates from Chat
  const handleChatUpdate = (updates: any[]) => {
    setMembers(prevMembers => {
      const newMembers = [...prevMembers];
      
      updates.forEach(update => {
        const { name, date, shifts } = update;
        // Fuzzy match name
        const memberIndex = newMembers.findIndex(m => m.name.includes(name) || name.includes(m.name));
        
        if (memberIndex !== -1) {
          const member = newMembers[memberIndex];
          const existingEntry = member.schedules[date] || { date: date, shifts: [], note: '' };
          
          newMembers[memberIndex] = {
            ...member,
            schedules: {
              ...member.schedules,
              [date]: {
                ...existingEntry,
                shifts: shifts
              }
            }
          };
        }
      });
      return newMembers;
    });
  };

  const handleResetData = () => {
    if (!isEditorAuthenticated) {
      alert("データの初期化には編集権限が必要です。適当なセルを編集してログインしてください。");
      return;
    }
    if (window.confirm('全てのデータをリセットし、初期状態（デモデータ）に戻しますか？')) {
      const newMembers = generateMockMembers();
      setMembers(newMembers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMembers));
    }
  };

  // Helper styles
  const getDayColor = (dayIndex: number) => {
    if (dayIndex === 0) return 'text-rose-600 bg-rose-50'; // Sunday
    if (dayIndex === 6) return 'text-blue-600 bg-blue-50'; // Saturday
    return 'text-slate-600';
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr;
  };

  // --- Render ---

  if (!isAuthenticated) {
    return (
      <AuthModal 
        mode="view" 
        isOpen={true} 
        onSuccess={() => setIsAuthenticated(true)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="bg-brand-600 p-2 rounded-lg text-white">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">StaffSync AI</h1>
            <p className="text-xs text-slate-500">Intelligent Workforce Management</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="部員を検索..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-md transition shadow-sm text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <span className="px-3 font-semibold text-slate-700 w-32 text-center select-none">
              {year}年 {month + 1}月
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded-md transition shadow-sm text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShiftCheck(true)}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-colors border border-emerald-200"
              title="シフトチェック"
            >
              <CheckCircle2 size={18} />
              <span>チェック</span>
            </button>
             <button 
              onClick={handleResetData}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-rose-600 transition-colors mr-2 p-2"
              title="データを初期化"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Grid */}
      <main className="flex-1 overflow-auto relative custom-scrollbar">
        <div className="min-w-max pb-20">
          {/* Table Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm flex">
            {/* Corner Cell */}
            <div className="sticky left-0 z-20 bg-white w-48 min-w-[12rem] border-r border-slate-200 p-3 flex items-end pb-2 font-medium text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>部員一覧 ({members.length}名)</span>
              </div>
            </div>

            {/* Date Headers */}
            {daysArray.map((day) => {
              const isTodayColumn = isToday(day.dateStr);
              return (
                <div 
                  key={day.date} 
                  className={`flex-1 min-w-[4.5rem] p-2 text-center border-r border-slate-100 flex flex-col items-center justify-center 
                    ${getDayColor(day.dayOfWeek)}
                    ${isTodayColumn ? 'bg-yellow-50 ring-2 ring-inset ring-yellow-400 z-10' : ''}
                  `}
                >
                  <span className="text-xs font-medium opacity-70">{WEEKDAYS[day.dayOfWeek]}</span>
                  <span className="text-lg font-bold leading-none">{day.date}</span>
                </div>
              );
            })}
          </div>

          {/* Table Body */}
          {filteredMembers.map((member) => (
            <div key={member.id} className="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
              {/* Member Name (Sticky Column) */}
              <div className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors w-48 min-w-[12rem] border-r border-slate-200 p-3 flex items-center gap-3">
                <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                <div>
                  <div className="font-bold text-slate-800 text-sm">{member.name}</div>
                  <div className="text-xs text-slate-500">{member.role}</div>
                </div>
              </div>

              {/* Schedule Cells */}
              {daysArray.map((day) => {
                const entry = member.schedules[day.dateStr];
                const shifts = entry ? (entry.shifts || [entry.shift]) : [];
                const isTodayColumn = isToday(day.dateStr);
                
                // Check if any shift contains '休' (Rest/Off)
                const isOffDay = shifts.some((s: any) => s.includes('休'));
                
                return (
                  <div 
                    key={day.dateStr}
                    onClick={() => handleCellClick(member.id, day.dateStr)}
                    className={`
                      flex-1 min-w-[4.5rem] border-r border-slate-100 p-1 cursor-pointer relative h-32
                      ${isTodayColumn ? 'bg-yellow-50/30' : ''}
                      ${!isTodayColumn && isOffDay ? 'bg-slate-200/60' : ''} 
                    `}
                  >
                    {entry ? (
                      <div className="h-full w-full rounded-md p-1 flex flex-col items-start gap-1 overflow-hidden hover:bg-slate-100 transition-colors">
                        {/* Shifts */}
                        <div className="flex flex-wrap gap-1 w-full">
                          {shifts.map((s: any, idx: number) => (
                            <span 
                              key={idx}
                              className={`
                                text-[10px] px-1.5 py-0.5 rounded font-bold border truncate max-w-full
                                ${SHIFT_COLORS[s as ShiftType] || 'bg-gray-100 text-gray-700'}
                              `}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        {/* Note - allows multiple lines (whitespace-pre-wrap) */}
                        {entry.note && (
                          <p className="text-[10px] text-slate-600 leading-tight whitespace-pre-wrap break-all w-full line-clamp-4">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="h-full w-full rounded-md hover:bg-slate-100"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      {/* Editor Modal */}
      {editingEntry && (
        <ShiftEditor
          isOpen={!!editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveAttempt}
          initialEntry={editingEntry.entry}
          memberName={members.find(m => m.id === editingEntry.memberId)?.name || ''}
        />
      )}

      {/* Edit Auth Modal */}
      <AuthModal 
        mode="edit"
        isOpen={showEditAuth}
        onSuccess={handleEditAuthSuccess}
        onClose={() => setShowEditAuth(false)}
      />

      {/* Tutorial Modal */}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      
      {/* Shift Check Modal */}
      {showShiftCheck && <ShiftCheckModal members={members} date={currentDate} onClose={() => setShowShiftCheck(false)} />}

      {/* AI Chat Interface */}
      <ChatInterface members={members} onUpdateSchedule={handleChatUpdate} />
    </div>
  );
}

export default App;