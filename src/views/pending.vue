<template>
  <div class="pending-container">
    <h1>Pending Users</h1>
    <div v-if="pendingUsers.length === 0" class="no-pending">No pending users.</div>
    <div v-for="user in pendingUsers" :key="user.phoneNumber" class="pending-user">
      <div class="user-info">
        <div class="user-avatar">{{ user.phoneNumber[0] }}</div>
        <div class="user-details">
          <p class="user-phone"><strong>Phone:</strong> {{ user.phoneNumber }}</p>
          <p class="user-message"><strong>Message:</strong> {{ user.message }}</p>
        </div>
      </div>
      <div class="user-actions">
        <button @click="acceptUser(user.phoneNumber, user.message)" class="accept-btn">Accept</button>
        <button @click="rejectUser(user.phoneNumber)" class="reject-btn">Reject</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PendingUsers",
  data() {
    return {
      pendingUsers: [],
    };
  },
  methods: {
    async fetchPendingUsers() {
      try {
        console.log("Fetching pending users...");
        const response = await axios.get("/api/pending");
        if (response.data.success) {
          console.log("Pending users fetched:", response.data.data);
          this.pendingUsers = response.data.data;
        } else {
          console.error("Failed to fetch pending users:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching pending users:", error);
      }
    },
    async acceptUser(phoneNumber, message) {
      try {
        await axios.post("/api/pending/accept", { phoneNumber, message });
        this.pendingUsers = this.pendingUsers.filter((user) => user.phoneNumber !== phoneNumber);
        alert(`User with phone number ${phoneNumber} has been accepted.`);
      } catch (error) {
        console.error("Error accepting user:", error);
        alert("Failed to accept user.");
      }
    },
    async rejectUser(phoneNumber) {
      try {
        await axios.post("/api/pending/reject", { phoneNumber });
        this.pendingUsers = this.pendingUsers.filter((user) => user.phoneNumber !== phoneNumber);
        alert(`User with phone number ${phoneNumber} has been rejected.`);
      } catch (error) {
        console.error("Error rejecting user:", error);
        alert("Failed to reject user.");
      }
    },
  },
  created() {
    this.fetchPendingUsers();
  },
};
</script>

<style>
.pending-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f0f2f5;
  height: 100vh;
  overflow-y: auto;
}

h1 {
  color: #128c7e;
  margin-bottom: 20px;
}

.no-pending {
  color: #666;
  font-size: 1.2rem;
  margin-top: 20px;
}

.pending-user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 50px;
  height: 50px;
  background-color: #128c7e;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 15px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-phone,
.user-message {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.accept-btn,
.reject-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.accept-btn {
  background-color: #128c7e;
  color: white;
}

.accept-btn:hover {
  background-color: #0d6d5d;
}

.reject-btn {
  background-color: #ff5252;
  color: white;
}

.reject-btn:hover {
  background-color: #e60000;
}
</style>
