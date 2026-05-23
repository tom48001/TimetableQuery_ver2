<template>
  <main class="selector-page">
    <section class="selector-panel">
      <header class="page-header">
        <div>
          <h1>各房間上課時間表</h1>
        </div>
        <span class="count-badge">{{ filteredRooms.length }} / {{ roomList.length }} rooms</span>
      </header>

      <div class="toolbar">
        <input
          v-model.trim="searchText"
          class="search-input"
          type="text"
          placeholder="搜尋房間，例如 301、音樂室、操場"
        />

        <div class="floor-tabs" aria-label="room filters">
          <button
            v-for="filter in roomFilters"
            :key="filter.value"
            type="button"
            :class="{ active: selectedFilter === filter.value }"
            @click="selectedFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div class="room-list" v-if="filteredRooms.length">
        <label
          v-for="room in filteredRooms"
          :key="room.room_id"
          class="room-card"
          :class="{ selected: selectedRoom === room.room_id }"
        >
          <input type="radio" :value="room.room_id" v-model="selectedRoom" />
          <span class="room-code">{{ roomCode(room.room_name) }}</span>
          <span class="room-name">{{ roomLabel(room.room_name) }}</span>
        </label>
      </div>

      <p v-else class="empty-message">找不到房間</p>

      <footer class="footer-actions">
        <span>{{ selectedRoomName || '請先選擇一個房間' }}</span>
        <button type="button" class="primary-btn" :disabled="!selectedRoom" @click="searchSchedule">
          查看時間表
        </button>
      </footer>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const ROOM_FILTERS = [
  { label: '全部', value: 'all' },
  { label: '1/F', value: '1' },
  { label: '2/F', value: '2' },
  { label: '3/F', value: '3' },
  { label: '4/F', value: '4' },
  { label: '5/F', value: '5' },
  { label: '6/F+', value: '6plus' },
  { label: '7/F+', value: '7plus' },
  { label: '特別室', value: 'special' }
];

export default {
  data() {
    return {
      roomList: [],
      selectedRoom: '',
      searchText: '',
      selectedFilter: 'all',
      roomFilters: ROOM_FILTERS
    };
  },
  computed: {
    filteredRooms() {
      const keyword = this.searchText.toLowerCase();

      return this.roomList.filter(room => {
        const roomName = String(room.room_name || '');
        const lowerName = roomName.toLowerCase();
        const matchesSearch = !keyword || lowerName.includes(keyword);
        const matchesFilter = this.matchesFilter(roomName);
        return matchesSearch && matchesFilter;
      });
    },
    selectedRoomName() {
      const selected = this.roomList.find(room => room.room_id === this.selectedRoom);
      return selected ? selected.room_name : '';
    }
  },
  mounted() {
    this.loadRooms();
  },
  methods: {
    roomCode(roomName) {
      const match = String(roomName || '').match(/^(\S+)/);
      return match ? match[1] : roomName;
    },
    roomLabel(roomName) {
      const code = this.roomCode(roomName);
      return String(roomName || '').replace(code, '').trim() || '課室';
    },
    matchesFilter(roomName) {
      if (this.selectedFilter === 'all') return true;

      const code = this.roomCode(roomName);
      const firstDigit = code.match(/^\d/) ? code.charAt(0) : '';

      if (this.selectedFilter === '6plus') {
        return ['6'].includes(firstDigit);
      }

      if (this.selectedFilter === '7plus') {
        return ['7'].includes(firstDigit);
      }

      if (this.selectedFilter === 'special') {
        return !firstDigit;
      }

      return firstDigit === this.selectedFilter;
    },
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
  max-width: 980px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  box-sizing: border-box;
  padding: 26px;
}

.page-header,
.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.page-header p {
  color: var(--primary);
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  color: var(--text);
  font-size: 32px;
  letter-spacing: 0;
  margin: 0;
}

.count-badge {
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--text-muted);
  font-weight: 800;
  padding: 9px 14px;
  white-space: nowrap;
}

.toolbar {
  display: grid;
  gap: 12px;
  margin-top: 22px;
}

.search-input {
  width: 100%;
  height: 44px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  box-sizing: border-box;
  color: var(--text);
  font-size: 15px;
  padding: 0 12px;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(11, 114, 133, 0.13);
  outline: none;
}

.floor-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.floor-tabs button {
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #fff;
  color: var(--text-muted);
  cursor: pointer;
  font-weight: 800;
  padding: 0 14px;
}

.floor-tabs button:hover,
.floor-tabs button.active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: #0a5260;
}

.room-list {
  max-height: 480px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  margin-top: 18px;
  padding: 12px;
}

.room-card {
  min-height: 52px;
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 9px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  color: var(--text);
  cursor: pointer;
  padding: 9px 11px;
}

.room-card:hover,
.room-card.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.room-card input {
  accent-color: var(--primary);
}

.room-code {
  min-width: 46px;
  border-radius: 999px;
  background: #e7f4f6;
  color: #0a5260;
  font-weight: 800;
  padding: 5px 8px;
  text-align: center;
}

.room-name {
  min-width: 0;
  color: var(--text);
  font-size: 14px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-message {
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  color: var(--text-muted);
  margin: 18px 0 0;
  padding: 28px;
  text-align: center;
}

.footer-actions {
  color: var(--text-muted);
  font-weight: 700;
  margin-top: 18px;
}

.primary-btn {
  height: 48px;
  border: none;
  border-radius: 6px;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 800;
  padding: 0 22px;
}

.primary-btn:hover:not(:disabled) {
  background: var(--primary-dark);
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

  .page-header,
  .footer-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .room-list {
    grid-template-columns: 1fr;
  }

  .primary-btn {
    width: 100%;
  }
}
</style>
