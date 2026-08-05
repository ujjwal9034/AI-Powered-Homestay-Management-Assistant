import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { fetchChatContacts, fetchMessagesWithUser, sendPrivateMessage } from '../services/api'
import { Send, MessageSquare } from 'lucide-react'

export default function Inbox() {
  const { darkMode } = useTheme()
  const { user } = useAuth()
  const location = useLocation()
  const messagesEndRef = useRef(null)

  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Load chat contacts on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoadingContacts(true)
        const res = await fetchChatContacts()
        if (res.success) {
          const list = res.data || []
          setContacts(list)

          // Check if navigated with a specific host target from HomestayDetail
          const stateHost = location.state?.startChatWith
          if (stateHost) {
            const existing = list.find((c) => c._id === stateHost._id)
            if (existing) {
              setSelectedContact(existing)
            } else {
              // Add host dynamically to contacts temporarily
              setContacts((prev) => [stateHost, ...prev])
              setSelectedContact(stateHost)
            }
          } else if (list.length > 0) {
            setSelectedContact(list[0])
          }
        }
      } catch (err) {
        console.warn('Failed to load chat contacts:', err.message)
      } finally {
        setLoadingContacts(false)
      }
    }
    loadContacts()
  }, [location.state])

  // Load messages whenever selected contact changes
  useEffect(() => {
    if (!selectedContact) return

    const loadMessages = async () => {
      try {
        setLoadingMessages(true)
        const res = await fetchMessagesWithUser(selectedContact._id)
        if (res.success) {
          setMessages(res.data || [])
        }
      } catch (err) {
        console.warn('Failed to load messages:', err.message)
      } finally {
        setLoadingMessages(false)
      }
    }
    loadMessages()
    // Poll messages every 6 seconds for live chat feel
    const interval = setInterval(loadMessages, 6000)
    return () => clearInterval(interval)
  }, [selectedContact])

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() || !selectedContact) return

    const messageText = text
    setText('')

    try {
      const res = await sendPrivateMessage(selectedContact._id, messageText)
      if (res.success) {
        setMessages((prev) => [...prev, res.data])
      }
    } catch (err) {
      console.warn('Failed to send message:', err.message)
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className={`text-2xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          💬 Messenger Inbox
        </h1>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Connect and coordinate check-in instructions directly with owners or guests
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-12 rounded-3xl border overflow-hidden min-h-[600px] ${
        darkMode ? 'border-gray-800 bg-dark-800' : 'border-gray-200 bg-white'
      }`}>
        {/* Contacts Sidebar (4 Cols) */}
        <div className={`md:col-span-4 border-r ${
          darkMode ? 'border-gray-800 bg-dark-900/30' : 'border-gray-150 bg-gray-50/30'
        }`}>
          <div className={`p-4 border-b font-semibold text-xs uppercase tracking-wider ${
            darkMode ? 'border-gray-800 text-gray-400' : 'border-gray-150 text-gray-500'
          }`}>
            Conversations ({contacts.length})
          </div>

          <div className="overflow-y-auto max-h-[500px]">
            {loadingContacts ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-gray-500" />
                <p>No active conversations yet.</p>
                <p className="text-[10px]">Start a chat from any homestay profile page.</p>
              </div>
            ) : (
              contacts.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedContact(c)}
                  className={`w-full p-4 flex items-center gap-3 text-left border-b transition-colors cursor-pointer ${
                    selectedContact?._id === c._id
                      ? darkMode
                        ? 'bg-primary-950/20 border-primary-500/20'
                        : 'bg-primary-50 border-primary-100'
                      : darkMode
                      ? 'border-gray-800 hover:bg-dark-700/50'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {c.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="truncate flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {c.name}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                        c.role === 'owner'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {c.role === 'owner' ? 'Host' : 'Guest'}
                      </span>
                    </div>
                    <span className={`text-xs block truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {c.email}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Pane (8 Cols) */}
        <div className="md:col-span-8 flex flex-col min-h-[500px]">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className={`p-4 border-b flex items-center gap-3 ${
                darkMode ? 'border-gray-800 bg-dark-900/10' : 'border-gray-150 bg-gray-50/10'
              }`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {selectedContact.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedContact.name}
                  </h3>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {selectedContact.email}
                  </span>
                </div>
              </div>

              {/* Chat History Messages */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[420px] space-y-4">
                {loadingMessages && messages.length === 0 ? (
                  <div className="text-center text-xs text-gray-450">Loading message log...</div>
                ) : (
                  messages.map((m) => {
                    const isSelf = m.sender === user?._id
                    return (
                      <div
                        key={m._id}
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isSelf
                            ? 'bg-primary-500 text-white rounded-tr-none'
                            : darkMode
                            ? 'bg-dark-900 text-gray-200 border border-gray-800 rounded-tl-none'
                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          <p>{m.text}</p>
                          <span className={`text-[8px] mt-1.5 block text-right ${
                            isSelf ? 'text-white/60' : 'text-gray-400'
                          }`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className={`p-4 border-t ${
                darkMode ? 'border-gray-800 bg-dark-900/20' : 'border-gray-150 bg-gray-50/20'
              }`}>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Type your message here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={`w-full rounded-xl border pl-4 pr-12 py-3 text-xs focus:outline-none focus:ring-2 transition-all duration-200 ${
                      darkMode
                        ? 'bg-dark-900 border-gray-700 text-gray-100 focus:ring-primary-500/30 focus:border-primary-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:ring-primary-500/20 focus:border-primary-400'
                    }`}
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 top-2.5 p-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white cursor-pointer transition-colors active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="w-12 h-12 text-gray-500 mb-2" />
              <h3 className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                No Conversation Selected
              </h3>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Select a chat contact from the sidebar to begin messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
