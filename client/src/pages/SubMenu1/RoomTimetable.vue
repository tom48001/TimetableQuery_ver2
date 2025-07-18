<template>
  <div class="container">
    <h1>各房間上課時間表</h1>
    <label>選擇房間：</label>
    <select v-model="selectedRoom">
      <option disabled value="">請選擇</option>
      <option v-for="room in roomList" :key="room.room_id" :value="room.room_id">
        {{ room.room_name }}
      </option>
    </select>
    <button @click="searchSchedule" :disabled="!selectedRoom">查詢</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      roomList: [],
      selectedRoom: ''
    };
  },
  mounted() {
    this.loadRooms();
  },
  methods: {
    async loadRooms() {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.roomList = res.data;
    },
    searchSchedule() {
      this.$router.push({
        name: 'RoomTimetableResult',
        query: { roomId: this.selectedRoom }
      });
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
  text-align: center;
}
select {
  margin: 10px;
  padding: 6px;
}
button {
  padding: 8px 16px;
}
</style>
