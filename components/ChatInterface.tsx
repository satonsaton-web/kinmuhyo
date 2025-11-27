import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage, Member } from '../types';
import { generateScheduleResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  members: Member[];
  onUpdateSchedule?: (updates: any[]) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ members, onUpdateSchedule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'こんにちは！勤務表アシスタントです。「明日の空き状況は？」などの質問や、「佐藤さんを月曜日にCナレに変更」といった更新指示も可能です。',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Gemini
      const fullResponse = await generateScheduleResponse(userMsg.text, members, new Date());
      
      let displayText = fullResponse;
      
      // Parse for JSON command block
      // Regex matches content between ```json and ```
      const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          const command = JSON.parse(jsonMatch[1]);
          if (command.action === 'update_schedule' && Array.isArray(command.updates) && onUpdateSchedule) {
             onUpdateSchedule(command.updates);
             // Remove JSON from display text to keep chat clean
             displayText = fullResponse.replace(/```json[\s\S]*?```/, '').trim();
             if (!displayText) displayText = "シフトを更新しました。";
          }
        } catch (e) {
          console.error("Failed to parse AI command", e);
        }
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: displayText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "エラーが発生しました。",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 group"
          aria-label="Open AI Chat"
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-96 max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 transform origin-bottom-right z-50 border border-slate-200
        ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ height: '500px' }}
      >
        {/* Header */}
        <div className="bg-brand-600 px-4 py-3 rounded-t-2xl flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-semibold">AI アシスタント</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-2">
                 <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                 <span className="text-xs text-slate-400">考え中...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100 rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="指示を入力 (例: 月曜をCナレに変更)"
              className="flex-1 px-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-brand-500 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};