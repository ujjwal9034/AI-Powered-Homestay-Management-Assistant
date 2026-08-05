import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { chatWithGlobalConcierge } from '../services/api';
import { Bot, Send, X, AlertCircle } from 'lucide-react';

export default function GlobalConcierge() {
  const { darkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Hello! I am your StayWise AI Concierge. 🤖 I can help you search properties, plan itineraries, or learn about tourist destinations in India. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  if (!isAuthenticated) return null; // Only show for logged in users

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send chat request (exclude first welcome message)
      const res = await chatWithGlobalConcierge(userMessage.text, messages.slice(1));
      if (res.success) {
        setMessages((prev) => [...prev, { role: 'model', text: res.response }]);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Sorry, I am having trouble connecting to StayWise concierge services right now.';
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: errorMsg, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full animate-ping" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full" />
          
          {/* Tooltip on hover */}
          <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-dark-950 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-white/10 whitespace-nowrap">
            Chat with AI Concierge 🤖
          </span>
        </button>
      )}

      {/* Floating Chat Box Panel */}
      {isOpen && (
        <div
          className={`w-80 sm:w-96 h-[460px] rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-fadeIn ${
            darkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3.5 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-300" />
              <div>
                <h4 className="font-heading font-bold text-sm">StayWise AI Concierge</h4>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-primary-200">Online & Ready</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors cursor-pointer p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className={`flex-1 p-4 overflow-y-auto space-y-3.5 ${darkMode ? 'bg-dark-900/50' : 'bg-gray-50/50'}`}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 max-w-[85%] ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {m.role !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`rounded-2xl p-3 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary-500 text-white rounded-tr-none'
                      : m.isError
                      ? 'bg-red-500/10 border border-red-500/20 text-red-500 rounded-tl-none flex items-center gap-1.5'
                      : darkMode
                      ? 'bg-dark-800 text-gray-200 rounded-tl-none border border-gray-700'
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-150'
                  }`}
                >
                  {m.isError && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{m.text}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className={`rounded-2xl p-3 text-xs rounded-tl-none border ${
                  darkMode ? 'bg-dark-800 border-gray-700 text-gray-400' : 'bg-white border-gray-150 text-gray-500'
                }`}>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSubmit} className={`p-3 border-t shrink-0 flex items-center gap-2 ${
            darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'
          }`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Concierge about local stays or cities..."
              className={`flex-1 rounded-xl border px-3.5 py-2 text-xs focus:outline-none focus:ring-1 transition-all ${
                darkMode
                  ? 'bg-dark-900 border-gray-650 text-gray-200 focus:ring-primary-500 focus:border-primary-500'
                  : 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-primary-500 focus:border-primary-400'
              }`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-primary-500 text-white disabled:opacity-50 hover:bg-primary-600 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
