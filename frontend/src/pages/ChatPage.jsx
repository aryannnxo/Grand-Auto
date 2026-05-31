import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, User as UserIcon, MessageSquare, CarFront, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const API = "http://localhost:5000";

const ChatPage = ({ isNested = false }) => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const token = localStorage.getItem("token");
  const currentUserEmail = localStorage.getItem("userEmail");
  // Assuming we need current user ID, we might need to decode token or just use email to differentiate if we don't have ID in localstorage. 
  // Let's get current user ID from the first conversation's participant that matches our email.
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchConversations();
  }, []);

  useEffect(() => {
    // If there's a chatId in URL, try to select it
    const params = new URLSearchParams(location.search);
    const chatId = params.get("chatId");
    if (chatId && conversations.length > 0) {
      const chat = conversations.find(c => c._id === chatId);
      if (chat) {
        handleSelectChat(chat);
      }
    } else if (!activeChat && conversations.length > 0) {
      // Auto select first chat
      handleSelectChat(conversations[0]);
    }
  }, [location.search, conversations]);

  // Polling for active chat messages
  useEffect(() => {
    if (!activeChat) return;

    fetchMessages(activeChat._id);
    const interval = setInterval(() => {
      fetchMessages(activeChat._id, true);
      // Also silently update conversations to get latest unread status
      fetchConversations(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await axios.get(`${API}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
      
      // Determine current user ID if not set
      if (!currentUserId && res.data.length > 0) {
        // Find which participant we are
        const conv = res.data[0];
        if (conv.customer.email === currentUserEmail) {
          setCurrentUserId(conv.customer._id);
        } else if (conv.owner.email === currentUserEmail) {
          setCurrentUserId(conv.owner._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchMessages = async (chatId, silent = false) => {
    try {
      const res = await axios.get(`${API}/api/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      
      // Mark as read
      await axios.patch(`${API}/api/chats/${chatId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    // Update URL without reload
    navigate(`${location.pathname}?chatId=${chat._id}`, { replace: true });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const tempText = inputText;
    setInputText("");

    try {
      const res = await axios.post(`${API}/api/chats/${activeChat._id}/messages`, 
        { text: tempText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => [...prev, res.data]);
      fetchConversations(true); // Update last message in list
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
      setInputText(tempText);
    }
  };

  const getOtherUser = (chat) => {
    if (!chat || !currentUserId) return {};
    return chat.customer._id === currentUserId ? chat.owner : chat.customer;
  };

  const chatContent = (
    <>
      {/* Left Side: Conversation List */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-lg font-bold font-heading flex items-center gap-2">
              <MessageSquare size={18} className="text-primary-500" /> Messages
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No conversations yet.
              </div>
            ) : (
              conversations.map((chat) => {
                const otherUser = getOtherUser(chat);
                const isUnread = chat.unreadBy.includes(currentUserId);
                const isActive = activeChat?._id === chat._id;
                
                return (
                  <div 
                    key={chat._id} 
                    onClick={() => handleSelectChat(chat)}
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${isActive ? 'bg-primary-50 border-primary-100' : 'hover:bg-slate-50'} relative`}
                  >
                    {isUnread && !isActive && (
                      <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                    )}
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate pr-4">{otherUser.name || 'User'}</h4>
                      {chat.lastMessageAt && (
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(chat.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2 truncate">
                      <CarFront size={12} className="text-slate-400" />
                      <span className="truncate">{chat.vehicle?.brand} {chat.vehicle?.model}</span>
                    </div>
                    <p className={`text-xs truncate ${isUnread && !isActive ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div className={`w-full md:w-2/3 lg:w-3/4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{getOtherUser(activeChat).name || 'User'}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <CarFront size={12} /> {activeChat.vehicle?.year} {activeChat.vehicle?.brand} {activeChat.vehicle?.model}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm mt-10">
                    No messages here yet. Send a message to start!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === currentUserId;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMe 
                            ? 'bg-primary-500 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-100' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 m-0"
                    autoComplete="off"
                  />
                  <Button type="submit" variant="primary" disabled={!inputText.trim()} className="px-6 rounded-xl">
                    <Send size={18} />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
    </>
  );

  if (isNested) {
    return (
      <div className="flex-1 w-full flex gap-6 overflow-hidden h-[calc(100vh-140px)]">
        {chatContent}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body flex flex-col h-screen overflow-hidden">
      <Navbar />
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 lg:p-8 flex gap-6 overflow-hidden pt-24 h-full">
        {chatContent}
      </main>
    </div>
  );
};

export default ChatPage;
