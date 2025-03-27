<template>
  <div class="chat-container">

    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h2>更改用戶信息</h2>
        <div class="form-group">
          <label>Case Code</label>
          <input v-model="editInfo.CASE_CODE" type="text">
        </div>
        <div class="form-group">
          <label>電話號碼</label>
          <input v-model="editInfo.PHONE_NO" type="tel">
        </div>
        <div class="form-group">
          <label>名稱</label>
          <input v-model="editInfo.USERNAME" type="text">
        </div>
        <div class="form-group">
          <label>姓名</label>
          <input v-model="editInfo.FIRST_NAME" type="text">
        </div>
        <div class="form-group">
          <label>姓氏</label>
          <input v-model="editInfo.LAST_NAME" type="text">
        </div>
        <div class="form-group">
          <label>暱稱</label>
          <input v-model="editInfo.UPDATED_FULL_NAME" type="text">
        </div>
        <div class="form-group">
        <label>狀態</label>
          <select v-model="editInfo.STATUS">
            <option value=""></option>
            <option value="訂閱中">訂閱中</option>
            <option value="取消訂閱">未訂閱</option>
          </select>
        </div>
        <div class="form-group">
          <label>住址</label>
          <input v-model="editInfo.ADDRESS" type="text">
        </div>
        <div class="modal-buttons">
          <button @click="saveEdit" class="save-btn">保存修改</button>
          <button @click="showEditModal = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>



    <div class="chat-header">
      <button class="logo-button" @click="goToAESC">
        <span class="logo-text">Asian Energy Studies Centre</span>
      </button>
      <div class="header-room-title">{{ currentRoomName }}</div>
      <button class="edit-button" @click="handleEdit">
        更改信息
      </button>
      <button class="delete-button" @click="handleDelete">
        刪除聊天室
      </button>
    </div>
    
    <div class="chat-sidebar">
      <div class="search-box">
        <input type="text" placeholder="Search by Phone Number / Case Code" v-model="searchQuery">
      </div>
      <div class="chat-rooms">
        <div v-for="room in filteredRooms" 
             :key="room.roomId" 
             class="room-item" 
             :class="{ active: currentRoom === room.roomId }"
             @click="selectRoom(room.roomId)">
          <div class="room-avatar">{{ room.roomName[0] }}</div>
          <div class="room-info">
            <div class="room-name">{{ room.roomName }}</div>
            <div class="last-message">{{ room.lastMessage.content }}</div>
          </div>
          <div class="room-time">{{ room.lastMessage.timestamp }}</div>
        </div>
      </div>
    </div>

    <div class="chat-main">
      <div class="messages-container" ref="messageContainer">
        <div v-for="message in currentMessages" 
          :key="message._id" 
          :class="['message', message.senderId !== currentUserId ? 'sent' : 'received']">
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-time">
            {{ message.timestamp }}
          </div>
        </div>
      </div>
    </div>
    <button class="floating-whatsapp" @click="openWhatsApp">
      <span>WhatsApp</span>
    </button>
  </div>
</template>

<script>
import axios from 'axios'
import { reactive } from 'vue'
import '@/assets/styles/chat.css'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default {
  name: 'chat-component',
  data() {
    return {
      currentUserId: '1',
      currentRoom: null,
      searchQuery: '',
      rooms: [],
      messages: reactive({}),

      showEditModal: false,
      editInfo: {
      USER_ID: '',
      PHONE_NO: '',
      CASE_CODE: '',
      FIRST_NAME: '',
      LAST_NAME: '',
      USERNAME: '',
      UPDATED_FULL_NAME: '',
      TITLE: '',
      ADDRESS: '',
      ROLE: '',
      STATUS: ''
    }
    }
  },
  computed: {
    filteredRooms() {
      // search bar is empty
      if (!this.searchQuery) {
        return this.rooms;
      }
      
      // i think no need to fix --> fp = FP
      // const searchLower = this.searchQuery.toLowerCase();
      const searchQuery = this.searchQuery;
      return this.rooms.filter(room => {
        const phoneNo = room.roomId ? String(room.roomId) : '';
        const caseCode = room.caseCode ? String(room.caseCode) : '';
        const userName = room.roomName ? String(room.roomName) : '';
        
        return phoneNo.includes(searchQuery) || 
              caseCode.includes(searchQuery) || 
              userName.includes(searchQuery);
      });
    },

    currentMessages() {
      return this.messages[this.currentRoom] || []
    },
    currentRoomName() {
      const currentRoom = this.rooms.find(room => room.roomId === this.currentRoom);
      return currentRoom ? `${currentRoom.roomName}  ${currentRoom.roomId}` : '聊天室';
    }
  },
  methods: {
    // load message when clicking the room
    async selectRoom(roomId) {
      this.currentRoom = roomId
      await this.fetchMessages(roomId)
      
      this.$nextTick(() => {
        const container = this.$refs.messageContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },
    openWhatsApp() {
      window.open('https://web.whatsapp.com/', '_blank')
    },

    async fetchAllUsers() {
      try {
        const response = await api.get('/api/users');
        
        if (response.data.success) {
          this.rooms = response.data.data
          .filter(user => user["Phone Number"]) // only users with phone number
          .map(user => ({
            roomId: user["Phone Number"],
            // updated full name > Name >  First NAME & LAST NAME
            roomName: user["updated full name"] || user.Name || `${user["First NAME"] || ''} ${user["LAST NAME"] || ''}`.trim() || '未命名用戶',
            caseCode: user["Case Code"] || '',
            lastMessage: {
              content: user["Case Code"] || '',
              timestamp: ''
            },
            userInfo: user
          }));
          
          if (this.rooms.length > 0 && !this.currentRoom) {
            await this.selectRoom(this.rooms[0].roomId);
          }
        } else {
          console.error('fetchAllUsers error:' + response.data.message);
        }
      } catch (error) {
        console.error(error);
      }
    },

    async fetchRealChatRooms() {
      try {
        const response = await api.get('/api/chat/rooms');
        if (response.data.success) {
          const chatRooms = response.data.data;
          
          for (let i = 0; i < chatRooms.length; i++) {
            const chatRoom = chatRooms[i];
            const roomId = chatRoom.roomId ? String(chatRoom.roomId) : '';
            const roomIndex = this.rooms.findIndex(function(r) { 
              return r.roomId === roomId;
            });
            
            if (roomIndex !== -1) {
              this.rooms[roomIndex].lastMessage = chatRoom.lastMessage || this.rooms[roomIndex].lastMessage;
              
              if (chatRoom.userInfo) {
                this.rooms[roomIndex].userInfo = {
                  ...this.rooms[roomIndex].userInfo,
                  ...chatRoom.userInfo
                };
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    },

    async fetchMessages(roomId) {
      try {
        const response = await api.get(`/api/chat/rooms/${roomId}/messages`);

        if (response.data.success) {
          const { userInfo, messages } = response.data.data;
          this.messages[roomId] = messages || [];
          
          if (userInfo) {
            const roomIndex = this.rooms.findIndex(r => r.roomId === roomId);
            if (roomIndex !== -1) {
              this.rooms[roomIndex] = {
                ...this.rooms[roomIndex],
                caseCode: userInfo["Case Code"] || '',
                phoneNo: userInfo["Phone Number"] || roomId,
                userInfo: userInfo
              };
            }
          }
        } else {
          console.error('fetchMessages： API有問題:', response.data.message);
        }
      } catch (error) {
        console.error('fetchMessages： 獲取訊息失敗:', error);
      }
    },
    
    handleDelete() {
    // 獲取當前聊天室信息
      const currentRoom = this.rooms.find(room => room.roomId === this.currentRoom);
            
      const confirmMessage = `確定要刪除與 ${currentRoom.roomName} (${currentRoom.roomId}) 的聊天室嗎？`;
      
      if (confirm(confirmMessage)) {
        console.log('刪除聊天室:', this.currentRoom);
        // 仲未有 Delete の API
        // const response = await api.delete(`/api/chat/rooms/${this.currentRoom}`);
      }
    },
    async handleEdit() {
      try {        
        const currentRoomData = this.rooms.find(room => room.roomId === this.currentRoom);
        
        let userData = currentRoomData.userInfo || {};
        try {
          const response = await api.get(`/api/users/${this.currentRoom}`);
          if (response.data.success) {
            userData = response.data.data;
          } else {
            console.warn('handleEdit :', response.data.message);
          }
        } catch (error) {
          console.error('handleEdit :', error);
        }
        
        this.editInfo = {
          USER_ID: userData._id || this.currentRoom,
          PHONE_NO: userData["Phone Number"] || this.currentRoom,
          CASE_CODE: userData["Case Code"] || '',
          FIRST_NAME: userData["First NAME"] || '',
          LAST_NAME: userData["LAST NAME"] || '',
          USERNAME: userData.Name || '',
          UPDATED_FULL_NAME: userData["updated full name"] || '',
          ADDRESS: userData.Address || '',
          STATUS: userData.Status || '訂閱中'
        };
        this.showEditModal = true;
      } catch (error) {
        alert('handleEdit : ' + error.message);
      }
    },

    async saveEdit() {
      try {
        
        const phoneNo = this.editInfo.PHONE_NO;
        const response = await api.put(`/api/users/${phoneNo}`, this.editInfo);
        
        if (response.data.success) {
          this.showEditModal = false;
          alert('用戶資料已更新');
          await this.fetchAllUsers();
          await this.selectRoom(this.currentRoom);
        } else {
          alert('更新失敗: ' + response.data.message);
        }
      } catch (error) {
        console.error('更新用戶資料失敗:', error);
      }
    },
    
    goToAESC() {
      window.open('https://www.aesc-hkbu.org/about-us', '_blank')
    },
    
  },

  async created() {
    // 只獲取所有用戶資料，然後獲取真實聊天記錄
    await this.fetchAllUsers();
    await this.fetchRealChatRooms();
  }
}
</script>
