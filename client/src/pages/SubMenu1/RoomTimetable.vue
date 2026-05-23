<template>
  <main class="selector-page">
    <section class="selector-panel">
      <header class="page-header">
        <div>
          <p>Timetable</p>
          <h1>Room Timetable</h1>
        </div>
        <span class="count-badge">{{ filteredRooms.length }} rooms</span>
      </header>

      <input
        v-model.trim="searchText"
        class="search-input"
        type="text"
        placeholder="Search room..."
      />

      <div class="option-grid">
        <label
          v-for="room in filteredRooms"
          :key="room.room_id"
          class="option-card"
          :class="{ selected: selectedRoom === room.room_id }"
        >
          <input type="radio" :value="room.room_id" v-model="selectedRoom" />
          <span>{{ room.room_name }}</span>
        </label>
      </div>

      <button type="button" class="primary-btn" :disabled="!selectedRoom" @click="searchSchedule">
        View Timetable
      </button>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      roomList: [],
      selectedRoom: '',
      searchText: ''
    };
  },
  computed: {
    filteredRooms() {
      const keyword = this.searchText.toLowerCase();
      if (!keyword) return this.roomList;
      return this.roomList.filter(room =>
        String(room.room_name || '').toLowerCase().includes(keyword)
      );
    }
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
.selector-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.selector-panel {
  max-width: 820px;
  margin: 0 auto;
  border: 1px solid #d1e0e5;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(25, 54, 69, 0.12);
  box-sizing: border-box;
  padding: 26px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.page-header p {
  color: #0d6b78;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  color: #122635;
  font-size: 32px;
  letter-spacing: 0;
  margin: 0;
}

.count-badge {
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #f7fafb;
  color: #27485b;
  font-weight: 700;
  padding: 9px 12px;
}

.search-input {
  width: 100%;
  height: 44px;
  border: 1px solid #b8cad3;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 15px;
  margin-top: 22px;
  padding: 0 12px;
}

.option-grid {
  max-height: 460px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
  overflow-y: auto;
  margin-top: 18px;
}

.option-card {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #d7e2e7;
  border-radius: 6px;
  background: #fff;
  color: #243f51;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 9px;
}

.option-card:hover,
.option-card.selected {
  border-color: #0b7285;
  background: #e0f1f2;
  color: #0a5260;
}

.option-card span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-card input {
  accent-color: #0b7285;
}

.primary-btn {
  height: 48px;
  border: none;
  border-radius: 6px;
  background: #0b7285;
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  margin-top: 22px;
  padding: 0 22px;
}

.primary-btn:disabled {
  background: #c7d2d8;
  color: #607683;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .selector-panel {
    padding: 20px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-btn {
    width: 100%;
  }
}
</style>
