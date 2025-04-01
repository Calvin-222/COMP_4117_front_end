import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(url) {
    // 如果沒有提供 URL，使用環境變量中的 API URL
    if (!url) {
      url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO 已連接', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO 已斷開連接');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO 連接錯誤:', error);
      this.connected = false;
    });

    return this.socket;
  }

  joinRoom(roomId) {
    if (!this.socket || !this.connected) {
      console.error('Socket.IO 未連接，無法加入房間');
      return;
    }
    
    console.log(`加入房間: ${roomId}`);
    this.socket.emit('join-room', roomId);
  }

  leaveRoom(roomId) {
    if (!this.socket || !this.connected) {
      console.error('Socket.IO 未連接，無法離開房間');
      return;
    }
    
    console.log(`離開房間: ${roomId}`);
    this.socket.emit('leave-room', roomId);
  }

  onNewMessage(callback) {
    if (!this.socket) return;
    this.socket.on('new-message', callback);
  }

  onMessageNotification(callback) {
    if (!this.socket) return;
    this.socket.on('message-notification', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

// 創建單例實例
const socketService = new SocketService();
export default socketService;