import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { chatWithGlobalConcierge } from '../services/api';
import { Bot, Send, X, AlertCircle, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  { text: 'Suggest a 3-day itinerary in Goa 🏖️', label: 'Goa Itinerary' },
  { text: 'What is the best time of year to visit Shimla? ❄️', label: 'Shimla Weather' },
  { text: 'Create a quick packing list for a weekend hill station trip 🥾', label: 'Packing Checklist' },
  { text: 'What are some famous local dishes I must try in India? 🍲', label: 'Local Food' },
];

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

  const executeConciergeChat = async (promptText) => {
    if (!promptText.trim() || loading) return;

    const userMessage = { role: 'user', text: promptText.trim() };
    setMessages((prev) => [...prev, userMessage]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const currentInput = input;
    setInput('');
    await executeConciergeChat(currentInput);
  };

  const handleSuggestionClick = async (suggestionText) => {
    await executeConciergeChat(suggestionText);
  };

  return (
    <div className="font-sans">
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
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

      {/* Slide-out Drawer Panel overlay backdrop */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`fixed right-0 top-0 bottom-0 w-full sm:w-[450px] z-50 shadow-2xl flex flex-col transition-all duration-300 transform translate-x-0 ${
              darkMode ? 'bg-dark-800/95 border-l border-gray-700/60 text-white' : 'bg-white/95 border-l border-gray-200/60 text-gray-800'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-5 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Bot className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm tracking-wide flex items-center gap-1.5">
                    StayWise AI Concierge <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-primary-200 font-medium">Smart AI Copilot Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages list */}
            <div className={`flex-1 p-6 overflow-y-auto space-y-4 ${darkMode ? 'bg-dark-900/40' : 'bg-gray-50/40'}`}>
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[90%] ${
                    m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  {m.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0 shadow-sm">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-none'
                        : m.isError
                        ? 'bg-red-500/10 border border-red-500/20 text-red-500 rounded-tl-none flex items-center gap-1.5'
                        : darkMode
                        ? 'bg-dark-850 text-gray-200 rounded-tl-none border border-gray-700/50'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-150'
                    }`}
                  >
                    {m.isError && <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{m.text}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 max-w-[90%] animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className={`rounded-2xl p-4 text-xs rounded-tl-none border ${
                    darkMode ? 'bg-dark-850 border-gray-700/50 text-gray-400' : 'bg-white border-gray-150 text-gray-500'
                  }`}>
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions Chips drawer */}
            {messages.length === 1 && !loading && (
              <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-850 bg-dark-900/20' : 'border-gray-150 bg-gray-50/50'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Suggested Queries
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleSuggestionClick(item.text)}
                      className={`text-left p-2.5 rounded-xl border text-[11px] font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                        darkMode
                          ? 'bg-dark-850 border-gray-700/50 hover:bg-dark-700 text-gray-300 hover:text-white'
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-primary-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form input */}
            <form onSubmit={handleSubmit} className={`p-4 border-t shrink-0 flex items-center gap-2 ${
              darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'
            }`}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Plan itinerary, weather forecast, destinations..."
                className={`flex-1 rounded-xl border px-4 py-3 text-xs focus:outline-none focus:ring-2 transition-all ${
                  darkMode
                    ? 'bg-dark-900 border-gray-700 text-gray-200 focus:ring-primary-500/30 focus:border-primary-500'
                    : 'bg-gray-50 border-gray-250 text-gray-800 focus:ring-primary-500/20 focus:border-primary-400'
                }`}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 rounded-xl bg-primary-500 text-white disabled:opacity-50 hover:bg-primary-600 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
