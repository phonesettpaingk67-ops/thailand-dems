'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistant({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMsg = user?.role === 'admin' 
        ? "👋 Hello Admin! I'm DEMS AI Assistant. I can help you manage disasters, shelters, volunteers, and more. What would you like to do today?"
        : "👋 Hello! I'm DEMS AI Assistant. I'm here to help you stay safe during emergencies. How can I assist you today?";
      
      setMessages([{
        id: 1,
        text: welcomeMsg,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, user]);

  // AI Knowledge Base
  const getAIResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // Emergency keywords
    if (msg.includes('emergency') || msg.includes('help') || msg.includes('urgent')) {
      return {
        text: "🚨 **EMERGENCY ASSISTANCE**\n\n" +
              "1. **Call Emergency Services**: 1669 (Thailand)\n" +
              "2. **Find Nearest Shelter**: Check the Shelters page\n" +
              "3. **Report Disaster**: Use the Report page\n" +
              "4. **Evacuation Route**: Go to Evacuation Planning\n\n" +
              "Stay calm and follow official instructions. Do you need specific help?",
        quickActions: [
          { label: '🏠 Find Shelter', page: '/shelters' },
          { label: '📍 Report Emergency', page: '/report' },
          { label: '🚗 Evacuation Route', page: '/evacuation' }
        ]
      };
    }

    // Disaster information
    if (msg.includes('disaster') || msg.includes('what disaster') || msg.includes('active disaster')) {
      if (user?.role === 'admin') {
        return {
          text: "📊 **Disaster Management (Admin)**\n\n" +
                "As an admin, you can:\n" +
                "• View all active disasters on the Dashboard\n" +
                "• Create new disaster reports\n" +
                "• Update disaster status and severity\n" +
                "• Assign resources and volunteers\n" +
                "• Monitor affected populations\n\n" +
                "Would you like to manage disasters now?",
          quickActions: [
            { label: '📊 View Dashboard', page: '/' },
            { label: '🔥 Manage Disasters', page: '/disasters' },
            { label: '➕ Create Disaster', page: '/admin/disasters/create' }
          ]
        };
      } else {
        return {
          text: "🔥 **Current Disasters**\n\n" +
                "You can view active disasters on the:\n" +
                "• **Dashboard** - Overview of all disasters\n" +
                "• **Disasters Page** - Detailed list with map\n" +
                "• **Weather Page** - Weather-related warnings\n\n" +
                "Check these pages to stay informed about nearby emergencies.",
          quickActions: [
            { label: '📊 Dashboard', page: '/' },
            { label: '🔥 View Disasters', page: '/disasters' },
            { label: '🌤️ Weather Alerts', page: '/weather' }
          ]
        };
      }
    }

    // Shelter queries
    if (msg.includes('shelter') || msg.includes('safe place') || msg.includes('evacuat')) {
      return {
        text: "🏠 **Emergency Shelters**\n\n" +
              "Find safe shelters near you:\n" +
              "• View available shelters and capacity\n" +
              "• Check facilities (food, medical, etc.)\n" +
              "• Get directions to nearest shelter\n" +
              "• See current occupancy levels\n\n" +
              (user?.role === 'admin' 
                ? "As admin, you can also create and manage shelters."
                : "Contact shelter staff for assistance."),
        quickActions: [
          { label: '🏠 Find Shelters', page: '/shelters' },
          { label: '🚗 Plan Evacuation', page: '/evacuation' }
        ]
      };
    }

    // Volunteer queries
    if (msg.includes('volunteer') || msg.includes('help others') || msg.includes('join')) {
      if (user?.role === 'admin') {
        return {
          text: "👥 **Volunteer Management (Admin)**\n\n" +
                "Manage volunteers:\n" +
                "• View all registered volunteers\n" +
                "• Assign volunteers to disasters\n" +
                "• Track volunteer assignments\n" +
                "• Manage volunteer skills and availability\n\n" +
                "Go to Volunteers page to manage.",
          quickActions: [
            { label: '👥 Manage Volunteers', page: '/volunteers' },
            { label: '➕ Add Volunteer', page: '/admin/volunteers' }
          ]
        };
      } else {
        return {
          text: "❤️ **Volunteer Program**\n\n" +
                "Thank you for wanting to help!\n\n" +
                "To volunteer:\n" +
                "• Visit the Volunteer Portal\n" +
                "• Register your skills and availability\n" +
                "• View available assignments\n" +
                "• Track your volunteer hours\n\n" +
                "Every bit of help makes a difference!",
          quickActions: [
            { label: '👥 Volunteer Portal', page: '/volunteer-portal' },
            { label: '📊 My Dashboard', page: '/volunteer-dashboard' }
          ]
        };
      }
    }

    // Weather queries
    if (msg.includes('weather') || msg.includes('forecast') || msg.includes('rain') || msg.includes('storm')) {
      return {
        text: "🌤️ **Weather Information**\n\n" +
              "Check current weather and forecasts:\n" +
              "• Real-time weather conditions\n" +
              "• 5-day forecast\n" +
              "• Severe weather alerts\n" +
              "• Regional weather patterns\n\n" +
              "Stay informed about weather conditions in your area.",
        quickActions: [
          { label: '🌤️ View Weather', page: '/weather' }
        ]
      };
    }

    // Supplies (Admin only)
    if (msg.includes('supplies') || msg.includes('resource') || msg.includes('stock')) {
      if (user?.role === 'admin') {
        return {
          text: "📦 **Supply Management (Admin)**\n\n" +
                "Manage emergency supplies:\n" +
                "• Track inventory levels\n" +
                "• Monitor critical supplies\n" +
                "• Add/update supply records\n" +
                "• View supply distribution\n\n" +
                "Keep emergency supplies well-stocked!",
          quickActions: [
            { label: '📦 Manage Supplies', page: '/supplies' }
          ]
        };
      } else {
        return {
          text: "📦 **Emergency Supplies**\n\n" +
                "For supply information, please:\n" +
                "• Contact your local emergency office\n" +
                "• Visit the nearest shelter\n" +
                "• Call emergency hotline: 1669\n\n" +
                "Shelters have basic supplies available.",
          quickActions: [
            { label: '🏠 Find Shelter', page: '/shelters' }
          ]
        };
      }
    }

    // Reports
    if (msg.includes('report') || msg.includes('submit') || msg.includes('alert about')) {
      return {
        text: "📍 **Report an Emergency**\n\n" +
              "Help us stay informed:\n" +
              "• Report disasters in your area\n" +
              "• Upload photos of damage\n" +
              "• Mark location on map\n" +
              "• Describe the situation\n\n" +
              "Your reports help us respond faster!",
        quickActions: [
          { label: '📍 Submit Report', page: '/report' }
        ]
      };
    }

    // Agencies (Admin)
    if (msg.includes('agenc') || msg.includes('partner') || msg.includes('organization')) {
      if (user?.role === 'admin') {
        return {
          text: "🏛️ **Agency Management (Admin)**\n\n" +
                "Coordinate with partner agencies:\n" +
                "• View all registered agencies\n" +
                "• Activate agencies for disasters\n" +
                "• Track agency resources\n" +
                "• Manage MOUs and agreements\n\n" +
                "Collaboration saves lives!",
          quickActions: [
            { label: '🏛️ Manage Agencies', page: '/admin/agencies' }
          ]
        };
      }
    }

    // How to use system
    if (msg.includes('how to') || msg.includes('guide') || msg.includes('tutorial') || msg.includes('help me use')) {
      const userGuide = user?.role === 'admin' 
        ? "**Admin Guide:**\n\n" +
          "1. **Dashboard** - Overview of all system data\n" +
          "2. **Disasters** - Manage disaster events\n" +
          "3. **Shelters** - Create and monitor shelters\n" +
          "4. **Supplies** - Track emergency supplies\n" +
          "5. **Volunteers** - Coordinate volunteer efforts\n" +
          "6. **Admin Menu** - Advanced management tools\n\n" +
          "Click the 👑 icon in header for admin features."
        : "**User Guide:**\n\n" +
          "1. **Dashboard** - See current emergencies\n" +
          "2. **Disasters** - View active disasters nearby\n" +
          "3. **Weather** - Check weather warnings\n" +
          "4. **Evacuation** - Plan safe routes\n" +
          "5. **Report** - Submit emergency reports\n\n" +
          "Use the menu to navigate between pages.";

      return {
        text: "📖 " + userGuide,
        quickActions: [
          { label: '🏠 Go to Dashboard', page: '/' }
        ]
      };
    }

    // Default helpful response
    return {
      text: "🤔 I can help you with:\n\n" +
            (user?.role === 'admin' 
              ? "**Admin Functions:**\n" +
                "• Managing disasters and alerts\n" +
                "• Coordinating shelters and supplies\n" +
                "• Organizing volunteers and agencies\n" +
                "• Viewing system reports and stats\n\n"
              : "**Citizen Services:**\n" +
                "• Finding emergency shelters\n" +
                "• Viewing active disasters\n" +
                "• Planning evacuation routes\n" +
                "• Reporting emergencies\n" +
                "• Checking weather alerts\n" +
                "• Volunteering to help\n\n"
            ) +
            "Try asking: \"Find shelter\", \"Active disasters\", \"How to evacuate\", or \"How to report emergency\"",
      quickActions: user?.role === 'admin' 
        ? [
            { label: '📊 Dashboard', page: '/' },
            { label: '🔥 Disasters', page: '/disasters' },
            { label: '⚙️ Admin Panel', page: '/admin/agencies' }
          ]
        : [
            { label: '🏠 Find Shelter', page: '/shelters' },
            { label: '📍 Report Emergency', page: '/report' },
            { label: '🚗 Evacuation', page: '/evacuation' }
          ]
    };
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = getAIResponse(inputMessage);
      const botMsg = {
        id: Date.now() + 1,
        text: aiResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        quickActions: aiResponse.quickActions
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay 1-2 seconds
  };

  const handleQuickAction = (page) => {
    window.location.href = page;
  };

  const suggestedQuestions = user?.role === 'admin' 
    ? [
        "📊 Show me active disasters",
        "👥 How to manage volunteers?",
        "🏠 Shelter management guide",
        "📦 Check supply levels"
      ]
    : [
        "🏠 Find nearest shelter",
        "🚨 What to do in emergency?",
        "🚗 Plan evacuation route",
        "📍 Report a disaster"
      ];

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <span className="text-3xl">✕</span>
        ) : (
          <span className="text-3xl">🤖</span>
        )}
        {!isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-200px)] bg-slate-800 rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">DEMS AI Assistant</h3>
                  <p className="text-blue-100 text-xs">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    
                    {/* Quick Actions */}
                    {message.quickActions && message.quickActions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(action.page)}
                            className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors border border-white/20"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 bg-slate-800 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.slice(0, 2).map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputMessage(question.replace(/^[🔥🏠📊👥🚨🚗📍📦]/g, '').trim())}
                      className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 border border-white/10 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-slate-800 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-transform font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
