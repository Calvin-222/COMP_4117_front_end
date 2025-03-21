<template>
  <div class="chat-container">



    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h2>更改用戶信息</h2>
        <div class="form-group">
          <label>Case Code</label>
          <input v-model="editInfo.name" type="text" placeholder="請輸入姓名">
        </div>
        <div class="form-group">
          <label>姓名</label>
          <input v-model="editInfo.name" type="text" placeholder="請輸入姓名">
        </div>
        <div class="form-group">
          <label>電話號碼 1</label>
          <input v-model="editInfo.phone" type="text" placeholder="請輸入電話號碼">
        </div>
        <div class="form-group">
          <label>電話號碼 2</label>
          <input v-model="editInfo.phone" type="text" placeholder="請輸入電話號碼">
        </div>
        <div class="form-group">
          <label>電話號碼 3</label>
          <input v-model="editInfo.phone" type="text" placeholder="請輸入電話號碼">
        </div>
        <div class="form-group">
          <label>Status</label>
          <input v-model="editInfo.phone" type="text" placeholder="請輸入電話號碼">
        </div>
        <div class="form-group">
          <label>住址</label>
          <input v-model="editInfo.address" type="text" placeholder="請輸入住址">
        </div>
        <div class="modal-buttons">
          <button @click="saveEdit" class="save-btn">保存修改</button>
          <button @click="showEditModal = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>



    <div class="chat-header">
      <button class="logo-button" @click="goToAESC">
        <img src="@/AESC logo.png" alt="AESC Logo" class="aesc-logo">
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
             :class="['message', message.senderId === currentUserId ? 'sent' : 'received']">
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

// 創建 axios 實例並設定基本配置
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

export default {
  name: 'chat-component',
  data() {
    return {
      currentUserId: '1',
      currentRoom: null,
      searchQuery: '',
      rooms: [],
      messages: reactive({}),  // 使用 reactive 確保響應式

      showEditModal: false,
      editInfo: {
        name: '',
        phone: '',
        address: ''
      }
    }
  },
  computed: {
    filteredRooms() {
      return this.rooms.filter(room => 
        room.roomName.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },
    currentMessages() {
      return this.messages[this.currentRoom] || []
    },
    currentRoomName() {
      const currentRoom = this.rooms.find(room => room.roomId === this.currentRoom)
      return currentRoom ? currentRoom.roomName : '聊天室'
    }
  },
  methods: {
    async selectRoom(roomId) {
      this.currentRoom = roomId
      await this.fetchMessages(roomId)  // 確保獲取到訊息
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    scrollToBottom() {
      const container = this.$refs.messageContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    openWhatsApp() {
      window.open('https://web.whatsapp.com/', '_blank')
    },

    async fetchRooms() {
      try {
        const response = await api.get('/api/chat/rooms')  // 修改 API 路徑
        console.log('正在獲取聊天室列表...')
        if (response.data.success) {
          this.rooms = response.data.data
          if (this.rooms.length > 0 && !this.currentRoom) {
            await this.selectRoom(this.rooms[0].roomId)
          }
        }
      } catch (error) {
        console.error('獲取房間列表失敗:', error.response || error)
      }
    },

    async fetchMessages(roomId) {
      try {
        const response = await api.get(`/api/chat/rooms/${roomId}/messages`)  // 修改 API 路徑
        console.log('正在獲取訊息...')
        if (response.data.success) {
          this.messages[roomId] = response.data.data
        }
      } catch (error) {
        console.error('獲取訊息失敗:', error)
      }
    },
    handleDelete() {
      if (confirm('確定要刪除此聊天室嗎？')) {
        console.log('刪除聊天室:', this.currentRoom)

      }
    },
    // handleEdit() {
    //   this.$router.push(`/edit/${this.currentRoom}`)
    // }

    handleEdit() {
      this.showEditModal = true
      // 獲取當前用戶信息
      this.fetchUserInfo()
    },
    async fetchUserInfo() {
      try {
        const response = await api.get(`/api/chat/rooms/${this.currentRoom}/info`)
        if (response.data.success) {
          this.editInfo = response.data.data
        }
      } catch (error) {
        console.error('獲取用戶信息失敗:', error)
      }
    },
    async saveEdit() {
      try {
        const response = await api.put(`/api/chat/rooms/${this.currentRoom}/info`, this.editInfo)
        if (response.data.success) {
          this.showEditModal = false
          // 可以添加成功提示
          alert('信息更新成功！')
        }
      } catch (error) {
        console.error('更新用戶信息失敗:', error)
      }
    },
    goToAESC() {
      window.open('https://www.aesc-hkbu.org/about-us', '_blank')
    },
    
  },

  async created() {
    await this.fetchRooms()
  }
}
</script>

<style scoped>
.chat-container {
  display: grid;
  grid-template-columns: 30% 70%;
  grid-template-rows: 60px 1fr;
  height: 100vh;
  width: 100vw;
  background-color: #f0f2f5;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.chat-header {
  grid-column: 1 / -1;
  background-color: #075e54;
  color: white;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 30% 70%; 
  align-items: center;
  height: 60px;
  position: relative;
}

.header-main-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 5;
  /* padding-left: 0px; */
}

.header-room-title {
  font-size: 1.2rem;
  margin: 0;
  padding-left: 20px;  /* 與聊天內容對齊 */
}

.chat-sidebar {
  grid-row: 2;
  grid-column: 1;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  min-width: 200px;  /* 設定最小寬度，避免太窄 */
}

.search-box {
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.search-box input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.chat-rooms {
  overflow-y: auto;
  flex: 1;
}

/* .room-item {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
} */

.room-item {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 10px;
  margin: 4px 8px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.room-item:hover {
  background-color: #f8f8f8;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.room-item.active {
  background-color: #e8e8e8;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  border-left: 5px solid #128C7E;
}

.room-avatar {
  width: 40px;
  height: 40px;
  background-color: #128C7E;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-weight: bold;
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.last-message {
  color: #666;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-time {
  color: #666;
  font-size: 0.8em;
}


.chat-main {
  grid-row: 2;
  grid-column: 2;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);  /* 修改這裡 */
  overflow: hidden;  /* 添加這行 */
}

.messages-container {
  flex: 1;
  overflow-y: auto;  /* 保持這個屬性 */
  padding: 20px 20px 80px 20px;
  background-image: url('@/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: calc(100vh - 60px);  /* 修改這裡，減去header高度 */
  max-height: calc(100vh - 60px);  /* 添加最大高度限制 */
  position: relative;  /* 添加這行 */
}

.message {
  margin: 10px 0;
  max-width: 70%;
  padding: 10px;
  border-radius: 10px;
  width: fit-content;  /* 讓寬度適應內容 */
  min-width: 100px;   /* 設定最小寬度 */
  word-wrap: break-word;  /* 確保長文字會換行 */
  white-space: pre-wrap;  /* 保留換行和空格 */
}

.message.sent {
  margin-left: auto;
  margin-right: 10px;
  background-color: #dcf8c6;
}

.message.received {
  margin-right: auto;
  margin-left: 10px;  /* 添加左側間距 */
  background-color: white;
}

.message-content {
  margin-bottom: 5px;
  font-size: 14px;
  line-height: 1.4;
}

.message-time {
  font-size: 0.8em;
  color: #666;
  text-align: right;
}

.floating-whatsapp {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #25D366;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.floating-whatsapp:hover {
  background-color: #128C7E;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.delete-button {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 16px;
  background-color: #128C7E;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background-color: #ff5252;
  right: 14px;
  font-size: 16px;
}

.edit-button {
  position: absolute;
  right: 140px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 16px;
  background-color: #128C7E;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.edit-button:hover {
  background-color: #f3c370;
  right: 135px;
  font-size: 16px;
}










.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.save-btn, .cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background-color: #128C7E;
  color: white;
}

.save-btn:hover {
  background-color: #0d6d5d;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #333;
}

.cancel-btn:hover {
  background-color: #d0d0d0;
}

.logo-button {
  background: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 5px;
  width: 150px;  /* 設定按鈕寬度 */
  height: 50px;  /* 設定按鈕高度 */
  display: flex;  /* 使用 flex 布局讓內容置中 */
  align-items: center;  /* 垂直置中 */
  justify-content: center;  /* 水平置中 */
  margin-left: 250px;
}

.logo-button:hover {
  box-shadow: 0 0 10px #37d5c3;
}

.aesc-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

</style>