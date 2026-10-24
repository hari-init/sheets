<template>
  <div class="calendar-view">
    <div class="cal-header">
      <button class="icon-btn" @click="prevMonth">‹</button>
      <span class="cal-title">{{ monthLabel }}</span>
      <button class="icon-btn" @click="nextMonth">›</button>
      <button class="today-btn" @click="goToday">TODAY</button>
    </div>

    <div class="cal-grid">
      <div class="day-label" v-for="d in DAYS" :key="d">{{ d }}</div>

      <div
        v-for="cell in cells"
        :key="cell.key"
        class="cal-cell"
        :class="{
          'other-month': !cell.inMonth,
          'is-today': cell.isToday,
          'has-items': cell.items.length > 0,
        }"
        @click="selectDay(cell)"
      >
        <span class="day-num">{{ cell.day }}</span>
        <div class="day-dots">
          <span
            v-for="item in cell.items.slice(0, 3)"
            :key="item.id"
            class="dot"
            :class="{ done: item.done }"
            :title="item.text"
          ></span>
          <span v-if="cell.items.length > 3" class="dot-more">+{{ cell.items.length - 3 }}</span>
        </div>
      </div>
    </div>

    <div v-if="selectedDay" class="day-panel">
      <div class="day-panel-header">
        <span class="label">{{ selectedDayLabel }}</span>
        <button class="icon-btn small" @click="selectedDay = null">×</button>
      </div>

      <div v-if="selectedDayItems.length === 0" class="empty-day">
        <span class="label muted">NO TASKS</span>
      </div>

      <div v-else class="day-item-list">
        <div
          v-for="item in selectedDayItems"
          :key="item.id"
          class="day-item"
          :class="{ done: item.done }"
        >
          <button class="checkbox small" @click="toggleItem(item.id)">
            <span v-if="item.done">✓</span>
          </button>
          <div class="day-item-body">
            <span class="day-item-text">{{ item.text || '—' }}</span>
            <span class="day-item-meta label">
              {{ sheetName(item.sheetId) }}
              <template v-if="item.dueTime"> · {{ item.dueTime }}</template>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store, toggleItem } from '../stores/app.js'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth()) // 0-indexed
const selectedDay = ref(null)

const monthLabel = computed(() => {
  return new Date(viewYear.value, viewMonth.value, 1)
    .toLocaleDateString('en-CA', { year: 'numeric', month: 'long' })
    .toUpperCase()
})

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
  selectedDay.value = null
}
function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
  selectedDay.value = null
}
function goToday() {
  viewYear.value = today.getFullYear()
  viewMonth.value = today.getMonth()
  selectedDay.value = null
}

const cells = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstDay = new Date(year, month, 1)
  // Monday-start: getDay() returns 0=Sun,1=Mon... convert to Mon=0
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const result = []
  // leading days from prev month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrev - i
    const dateStr = toDateStr(year, month - 1, d)
    result.push({ key: `prev-${d}`, day: d, inMonth: false, isToday: false, dateStr, items: itemsFor(dateStr) })
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(year, month, d)
    const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
    result.push({ key: `cur-${d}`, day: d, inMonth: true, isToday, dateStr, items: itemsFor(dateStr) })
  }
  // trailing days
  const rem = 42 - result.length
  for (let d = 1; d <= rem; d++) {
    const dateStr = toDateStr(year, month + 1, d)
    result.push({ key: `next-${d}`, day: d, inMonth: false, isToday: false, dateStr, items: itemsFor(dateStr) })
  }
  return result
})

function toDateStr(year, month, day) {
  const d = new Date(year, month, day)
  return d.toISOString().slice(0, 10)
}

function itemsFor(dateStr) {
  return store.items.filter(i => i.dueDate === dateStr)
}

function selectDay(cell) {
  selectedDay.value = cell
}

const selectedDayItems = computed(() => {
  if (!selectedDay.value) return []
  return itemsFor(selectedDay.value.dateStr)
})

const selectedDayLabel = computed(() => {
  if (!selectedDay.value) return ''
  return new Date(selectedDay.value.dateStr + 'T12:00:00')
    .toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    .toUpperCase()
})

function sheetName(sheetId) {
  return store.sheets.find(s => s.id === sheetId)?.name || '—'
}
</script>
