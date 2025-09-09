"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socketService } from '@/lib/socket';
import { useAuthStore } from '@/store/auth';

interface SocketContextType {
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  joinConversation: (jobId: string, otherUserId: string) => void;
  leaveConversation: (jobId: string, otherUserId: string) => void;
  sendMessage: (jobId: string, receiverId: string, message: string) => void;
  markAsRead: (jobId: string) => void;
  startTyping: (jobId: string, otherUserId: string) => void;
  stopTyping: (jobId: string, otherUserId: string) => void;
  onNewMessage: (callback: (message: any) => void) => void;
  onMessageNotification: (callback: (notification: any) => void) => void;
  onUserTyping: (callback: (data: any) => void) => void;
  onUserStopTyping: (callback: (data: any) => void) => void;
  onMessagesRead: (callback: (data: any) => void) => void;
  onAdminNotification: (callback: (notification: any) => void) => void;
  offNewMessage: (callback?: (message: any) => void) => void;
  offMessageNotification: (callback?: (notification: any) => void) => void;
  offUserTyping: (callback?: (data: any) => void) => void;
  offUserStopTyping: (callback?: (data: any) => void) => void;
  offMessagesRead: (callback?: (data: any) => void) => void;
  offAdminNotification: (callback?: (notification: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { token, user } = useAuthStore();

  const connect = useCallback(async () => {
    if (!token || connected || connecting) return;

    setConnecting(true);
    try {
      await socketService.connect(token);
      setConnected(true);
      console.log('Socket connected successfully');
    } catch (error) {
      console.error('Failed to connect socket:', error);
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  }, [token, connected, connecting]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setConnected(false);
    setConnecting(false);
  }, []);

  useEffect(() => {
    if (token && user && !connected) {
      connect();
    } else if (!token || !user) {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, user]); // Remove connect, disconnect from dependencies to prevent loop

  const joinConversation = useCallback((jobId: string, otherUserId: string) => {
    socketService.joinConversation(jobId, otherUserId);
  }, []);

  const leaveConversation = useCallback((jobId: string, otherUserId: string) => {
    socketService.leaveConversation(jobId, otherUserId);
  }, []);

  const sendMessage = useCallback((jobId: string, receiverId: string, message: string) => {
    socketService.sendMessage(jobId, receiverId, message);
  }, []);

  const markAsRead = useCallback((jobId: string) => {
    socketService.markAsRead(jobId);
  }, []);

  const startTyping = useCallback((jobId: string, otherUserId: string) => {
    socketService.startTyping(jobId, otherUserId);
  }, []);

  const stopTyping = useCallback((jobId: string, otherUserId: string) => {
    socketService.stopTyping(jobId, otherUserId);
  }, []);

  const onNewMessage = useCallback((callback: (message: any) => void) => {
    socketService.onNewMessage(callback);
  }, []);

  const onMessageNotification = useCallback((callback: (notification: any) => void) => {
    socketService.onMessageNotification(callback);
  }, []);

  const onUserTyping = useCallback((callback: (data: any) => void) => {
    socketService.onUserTyping(callback);
  }, []);

  const onUserStopTyping = useCallback((callback: (data: any) => void) => {
    socketService.onUserStopTyping(callback);
  }, []);

  const onMessagesRead = useCallback((callback: (data: any) => void) => {
    socketService.onMessagesRead(callback);
  }, []);

  const offNewMessage = useCallback((callback?: (message: any) => void) => {
    socketService.offNewMessage(callback);
  }, []);

  const offMessageNotification = useCallback((callback?: (notification: any) => void) => {
    socketService.offMessageNotification(callback);
  }, []);

  const offUserTyping = useCallback((callback?: (data: any) => void) => {
    socketService.offUserTyping(callback);
  }, []);

  const offUserStopTyping = useCallback((callback?: (data: any) => void) => {
    socketService.offUserStopTyping(callback);
  }, []);

  const offMessagesRead = useCallback((callback?: (data: any) => void) => {
    socketService.offMessagesRead(callback);
  }, []);

  const onAdminNotification = useCallback((callback: (notification: any) => void) => {
    socketService.onAdminNotification(callback);
  }, []);

  const offAdminNotification = useCallback((callback?: (notification: any) => void) => {
    socketService.offAdminNotification(callback);
  }, []);

  const value: SocketContextType = {
    connected,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    onNewMessage,
    onMessageNotification,
    onUserTyping,
    onUserStopTyping,
    onMessagesRead,
    onAdminNotification,
    offNewMessage,
    offMessageNotification,
    offUserTyping,
    offUserStopTyping,
    offMessagesRead,
    offAdminNotification,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};