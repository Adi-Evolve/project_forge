import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  edited?: boolean;
  reactions?: { [emoji: string]: string[] };
}

interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'project';
  participants: string[];
  avatar?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  isPinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  chats: Chat[];
  messages: { [chatId: string]: ChatMessage[] };
  activeChat: Chat | null;
  onlineUsers: string[];
  isConnected: boolean;
  typingUsers: { [chatId: string]: string[] };
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  isUserOnline: (userId: string) => boolean;
  getLastMessage: (chat: Chat) => ChatMessage | null;
  loading: boolean;
  error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: ChatMessage[] }>({});
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: string[] }>({});

  // Mock data for development
  useEffect(() => {
    if (!user) return;

    // Initialize with mock data
    const mockChats: Chat[] = [
      {
        id: 'chat-1',
        name: 'Project Team',
        type: 'group',
        participants: ['user-1', 'user-2', 'user-3'],
        unreadCount: 3,
        isActive: true,
        isPinned: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        id: 'chat-2',
        name: 'Sarah Wilson',
        type: 'direct',
        participants: ['user-1', 'user-2'],
        unreadCount: 1,
        isActive: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date(),
      },
      {
        id: 'chat-3',
        name: 'Development Discussion',
        type: 'project',
        participants: ['user-1', 'user-4', 'user-5'],
        unreadCount: 0,
        isActive: true,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date(),
      }
    ];

    const mockMessages: { [chatId: string]: ChatMessage[] } = {
      'chat-1': [
        {
          id: 'msg-1',
          senderId: 'user-2',
          senderName: 'Sarah Wilson',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b68da6e0?w=100',
          content: 'Hey team! How is the project progress coming along?',
          timestamp: new Date('2024-01-01T10:00:00'),
          type: 'text',
        },
        {
          id: 'msg-2',
          senderId: 'user-1',
          senderName: 'John Doe',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          content: 'Making good progress! Almost finished with the frontend implementation.',
          timestamp: new Date('2024-01-01T10:05:00'),
          type: 'text',
        },
        {
          id: 'msg-3',
          senderId: 'user-3',
          senderName: 'Mike Johnson',
          senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          content: 'Great! I\'ve completed the API endpoints. Ready for integration.',
          timestamp: new Date('2024-01-01T10:10:00'),
          type: 'text',
          reactions: { '👍': ['user-1', 'user-2'], '🚀': ['user-1'] }
        }
      ],
      'chat-2': [
        {
          id: 'msg-4',
          senderId: 'user-2',
          senderName: 'Sarah Wilson',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b68da6e0?w=100',
          content: 'Hi! Are you available for a quick call?',
          timestamp: new Date('2024-01-02T14:30:00'),
          type: 'text',
        }
      ]
    };

    setChats(mockChats);
    setMessages(mockMessages);
    setOnlineUsers(['user-2', 'user-4']);
    setLoading(false);
  }, [user]);

  const sendMessage = async (chatId: string, content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!user || !content.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.user_metadata?.full_name || user.email || 'User',
      senderAvatar: user.user_metadata?.avatar_url,
      content: content.trim(),
      timestamp: new Date(),
      type,
    };

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage]
    }));

    // Update chat's last message and timestamp
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
        : chat
    ));

    // In a real app, you would send this to your backend/Supabase
    try {
      // await supabase.from('chat_messages').insert({
      //   chat_id: chatId,
      //   sender_id: user.id,
      //   content,
      //   type,
      // });
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    setMessages(prev => {
      const newMessages = { ...prev };
      Object.keys(newMessages).forEach(chatId => {
        newMessages[chatId] = newMessages[chatId].map(message => {
          if (message.id === messageId) {
            const reactions = { ...message.reactions };
            if (!reactions[emoji]) {
              reactions[emoji] = [];
            }
            
            if (reactions[emoji].includes(user.id)) {
              reactions[emoji] = reactions[emoji].filter(id => id !== user.id);
              if (reactions[emoji].length === 0) {
                delete reactions[emoji];
              }
            } else {
              reactions[emoji].push(user.id);
            }
            
            return { ...message, reactions };
          }
          return message;
        });
      });
      return newMessages;
    });

    // In a real app, save to backend
    try {
      // await supabase.from('message_reactions').upsert({
      //   message_id: messageId,
      //   user_id: user.id,
      //   emoji,
      // });
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const markAsRead = async (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, unreadCount: 0 }
        : chat
    ));

    // In a real app, mark as read in backend
    try {
      // await supabase.from('chat_participants')
      //   .update({ last_read_at: new Date().toISOString() })
      //   .eq('chat_id', chatId)
      //   .eq('user_id', user?.id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.includes(userId);
  };

  const getLastMessage = (chat: Chat): ChatMessage | null => {
    const chatMessages = messages[chat.id] || [];
    return chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;
  };

  const value: ChatContextType = {
    chats,
    messages,
    activeChat,
    onlineUsers,
    isConnected,
    typingUsers,
    setActiveChat,
    sendMessage,
    addReaction,
    markAsRead,
    isUserOnline,
    getLastMessage,
    loading,
    error,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}