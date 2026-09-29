<template>
  <main class="selector-page">
    <section class="selector-panel">
      <header class="page-header"><div><h1>{{ tr('Room Timetable', '\u623f\u9593\u6642\u9593\u8868') }}</h1></div><span class="count-badge">{{ roomSelectionLabel }}</span></header>
      <div class="toolbar">
        <input v-model.trim="searchText" class="search-input" type="text" :placeholder="tr('Search room, e.g. 301 or Room...', '\u641c\u5c0b\u623f\u9593\uff0c\u4f8b\u5982 301 \u6216 Room...')" />
        <div class="floor-tabs" aria-label="room filters">
          <button v-for="filter in roomFilters" :key="filter.value" type="button" :class="{ active: selectedFilter === filter.value }" @click="selectedFilter = filter.value">{{ filter.label }}</button>
        </div>
      </div>
      <p v-if="searchText && filteredRooms.length" class="search-feedback">{{ roomSearchResultLabel }}</p>
      <div class="room-list" v-if="filteredRooms.length">
        <label v-for="room in filteredRooms" :key="room.room_id" class="room-card" :class="{ selected: selectedRoom === room.room_id }" :title="localizedRoomName(room)">
          <input type="radio" :value="room.room_id" v-model="selectedRoom" />
          <span class="room-code">{{ roomCode(room.room_name) }}</span>
          <span v-if="roomLabel(room)" class="room-name">{{ roomLabel(room) }}</span>
        </label>
      </div>
      <p v-else class="empty-message">{{ emptyRoomResultLabel }}</p>
      <footer class="footer-actions">
        <span>{{ selectedRoomName || tr('Please select a room', '\u8acb\u9078\u64c7\u623f\u9593') }}</span>
        <button type="button" class="primary-btn" :disabled="!selectedRoom" @click="searchSchedule">{{ roomViewButtonLabel }}</button>
      </footer>
    </section>
  </main>
</template>

<script>
import axios from 'axios';
import { roomLabel as formatRoomLabel } from '../../utils/timetableLabels';

export default {
  data() { return { roomList: [], selectedRoom: '', searchText: '', selectedFilter: 'all' }; },
  computed: {
    roomFilters() {
      return [
        { label: this.tr('All', '全部'), value: 'all' },
        { label: '1/F', value: '1' }, { label: '2/F', value: '2' }, { label: '3/F', value: '3' },
        { label: '4/F', value: '4' }, { label: '5/F', value: '5' }, { label: '6/F+', value: '6plus' },
        { label: '7/F+', value: '7plus' }, { label: this.tr('Special', '\u7279\u5225\u5ba4'), value: 'special' }
      ];
    },
    filteredRooms() {
      const keyword = this.searchText.toLowerCase();
      return this.roomList.filter(room => {
        const roomName = String(room.room_name || '');
        const lowerName = [roomName, room.room_name_zh, room.room_name_en]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return (!keyword || lowerName.includes(keyword)) && this.matchesFilter(roomName);
      });
    },
    selectedRoomName() {
      const selected = this.roomList.find(room => room.room_id === this.selectedRoom);
      return selected ? this.localizedRoomName(selected) : '';
    },
    roomSelectionLabel() {
      return this.selectedRoom ? this.tr('1 room selected', '\u5df2\u9078 1 \u500b\u623f\u9593') : this.tr('No room selected', '\u672a\u9078\u64c7\u623f\u9593');
    },
    roomSearchResultLabel() {
      const count = this.filteredRooms.length;
      return this.tr(`Found ${count} room${count === 1 ? '' : 's'}`, `\u627e\u5230 ${count} \u500b\u623f\u9593`);
    },
    emptyRoomResultLabel() {
      if (!this.searchText) return this.tr('No rooms found', '\u627e\u4e0d\u5230\u623f\u9593');
      return this.tr(`No rooms match "${this.searchText}"`, `\u627e\u4e0d\u5230\u7b26\u5408\u300c${this.searchText}\u300d\u7684\u623f\u9593`);
    },
    roomViewButtonLabel() {
      return this.selectedRoomName
        ? this.tr(`View ${this.selectedRoomName} timetable`, `\u67e5\u770b ${this.selectedRoomName} \u6642\u9593\u8868`)
        : this.tr('View Timetable', '\u67e5\u770b\u6642\u9593\u8868');
    }
  },
  mounted() { this.loadRooms(); },
  methods: {
    tr(en, zh) { return this.$lang.locale === 'en' ? en : zh; },
    roomCode(roomName) { const match = String(roomName || '').match(/^([A-Za-z]?\d+[A-Za-z]?|G\d+[A-Za-z]?)\b/); return match ? match[1] : ''; },
    localizedRoomName(room) {
      const localizedName = this.$lang.locale === 'en' ? room.room_name_en : room.room_name_zh;
      return String(localizedName || room.room_name || '').trim();
    },
    roomLabel(room) {
      const roomName = this.localizedRoomName(room);
      const code = this.roomCode(room.room_name) || this.roomCode(roomName);
      const label = code ? roomName.replace(code, '').trim() : roomName;
      return label ? formatRoomLabel(label, this.$lang.locale) : '';
    },
    matchesFilter(roomName) {
      if (this.selectedFilter === 'all') return true;
      const code = this.roomCode(roomName);
      const firstDigit = code.match(/^\d/) ? code.charAt(0) : '';
      if (this.selectedFilter === '6plus') return ['6'].includes(firstDigit);
      if (this.selectedFilter === '7plus') return ['7'].includes(firstDigit);
      if (this.selectedFilter === 'special') return !firstDigit;
      return firstDigit === this.selectedFilter;
    },
    async loadRooms() { const token = localStorage.getItem('token'); const res = await axios.get('/api/rooms', { headers: { Authorization: `Bearer ${token}` } }); this.roomList = res.data; },
    searchSchedule() { this.$router.push({ name: 'RoomTimetableResult', query: { roomId: this.selectedRoom, roomName: this.selectedRoomName } }); }
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
  height: 480px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  grid-auto-rows: min-content;
  align-content: start;
  gap: 8px;
  overflow-y: scroll;
  scrollbar-gutter: stable;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  margin-top: 18px;
  padding: 10px;
}

.search-feedback { color: var(--text-muted); font-size: 13px; font-weight: 700; margin: 12px 0 -6px; }

.room-card {
  min-height: 45px;
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 7px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  color: var(--text);
  cursor: pointer;
  padding: 7px 9px;
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
  min-width: 42px;
  border-radius: 999px;
  background: #e7f4f6;
  color: #0a5260;
  font-weight: 800;
  font-size: 12px;
  padding: 4px 7px;
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
