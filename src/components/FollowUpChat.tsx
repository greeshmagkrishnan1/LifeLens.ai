import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Sparkles, CornerDownLeft, Loader2, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types/analysis';
import { AnalysisService } from '../services/api';

interface FollowUpChatProps {
  imageBase64: string;
  mimeType: string;
  suggestedQuestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  'Why do you think this?',
  'What should I check first?',
  'Explain this more simply',
  'What are the biggest risks?',
  'What else could this be?',
];

export const FollowUpChat: React.FC<FollowUpChatProps> = ({
  imageBase64,
  mimeType,
  suggestedQuestions = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const allSuggestions = Array.from(
    new Set([...suggestedQuestions, ...DEFAULT_SUGGESTIONS])
  ).slice(0, 6);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setError(null);
    setInputValue('');

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const reply = await AnalysisService.sendFollowUp(
        imageBase64,
        mimeType,
        [...messages, userMsg],
        text
      );

      const assistantMsg: ChatMessage = {
        id: 'reply_' + Date.now(),
        role: 'assistant',
        text: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Failed to get follow up answer:', err);
      setError(err?.message || 'Could not get answer. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Conversational Follow-Up</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800/40">
              Image In Context
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Ask targeted questions about specific details, alternative hypotheses, or safety verification.
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="mb-6">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Suggested Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {allSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(suggestion)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/70 hover:border-cyan-500/50 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message History */}
      {messages.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/20'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-xs whitespace-pre-wrap'
                }`}
              >
                {msg.text}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-2xl rounded-tl-xs p-3.5 flex items-center space-x-2 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>LifeLens is analyzing your question against the image...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => handleSendMessage()}
            className="text-xs font-semibold underline text-rose-200 hover:text-white ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Input box */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this image (e.g. 'What else could this be?')"
          disabled={isLoading}
          className="w-full pl-4 pr-24 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 transition-colors disabled:opacity-50"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputValue.trim()}
          className="absolute right-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-40 disabled:hover:from-cyan-500 disabled:hover:to-indigo-600"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <CornerDownLeft className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
