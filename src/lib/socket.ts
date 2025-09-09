import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      // Clean up existing socket if any
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }

      this.token = token;
      
      this.socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3003', {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to server');
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server:', reason);
        // Only attempt reconnection for certain reasons
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect manually
          this.socket?.connect();
        }
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a conversation room
  joinConversation(jobId: string, otherUserId: string) {
    this.socket?.emit('join_conversation', {
      job_id: jobId,
      other_user_id: otherUserId,
    });
  }

  // Leave a conversation room
  leaveConversation(jobId: string, otherUserId: string) {
    this.socket?.emit('leave_conversation', {
      job_id: jobId,
      other_user_id: otherUserId,
    });
  }

  // Send a message
  sendMessage(jobId: string, receiverId: string, message: string) {
    this.socket?.emit('send_message', {
      job_id: jobId,
      receiver_id: receiverId,
      message,
    });
  }

  // Mark messages as read
  markAsRead(jobId: string) {
    this.socket?.emit('mark_as_read', { job_id: jobId });
  }

  // Typing indicators
  startTyping(jobId: string, otherUserId: string) {
    this.socket?.emit('typing', {
      job_id: jobId,
      other_user_id: otherUserId,
    });
  }

  stopTyping(jobId: string, otherUserId: string) {
    this.socket?.emit('stop_typing', {
      job_id: jobId,
      other_user_id: otherUserId,
    });
  }

  // Event listeners
  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new_message', callback);
  }

  onMessageNotification(callback: (notification: any) => void) {
    this.socket?.on('message_notification', callback);
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket?.on('user_typing', callback);
  }

  onUserStopTyping(callback: (data: any) => void) {
    this.socket?.on('user_stop_typing', callback);
  }

  onMessagesRead(callback: (data: any) => void) {
    this.socket?.on('messages_read', callback);
  }

  // Remove event listeners
  offNewMessage(callback?: (message: any) => void) {
    this.socket?.off('new_message', callback);
  }

  offMessageNotification(callback?: (notification: any) => void) {
    this.socket?.off('message_notification', callback);
  }

  offUserTyping(callback?: (data: any) => void) {
    this.socket?.off('user_typing', callback);
  }

  offUserStopTyping(callback?: (data: any) => void) {
    this.socket?.off('user_stop_typing', callback);
  }

  offMessagesRead(callback?: (data: any) => void) {
    this.socket?.off('messages_read', callback);
  }

  // Admin notification listeners
  onAdminNotification(callback: (notification: any) => void) {
    this.socket?.on('admin_notification', callback);
  }

  offAdminNotification(callback?: (notification: any) => void) {
    this.socket?.off('admin_notification', callback);
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();