<template>
  <div class="app" :class="{ 'side-hidden': !sideOpen }">

    <Sidebar @sheet-selected="sideOpen = false" />

    <div class="workspace">

      <!-- topbar -->
      <div class="topbar">
        <button class="ico" @click="sideOpen = !sideOpen" title="Toggle sidebar">
          <span class="bars"></span>
        </button>
        <div class="topbar-title">
          <span v-if="activeSheet && store.view === 'sheet'">{{ activeSheet.name }}</span>
          <span v-else-if="store.view === 'calendar'">Calendar</span>
          <span v-else-if="activeFolder">{{ activeFolder.name }}</span>
          <span v-else>Sheets</span>
        </div>
        <div class="topbar-actions">
          <!-- desktop view toggle -->
          <button class="tb-pill" :class="{ active: store.view === 'sheet' }" @click="store.view = 'sheet'">Sheets</button>
          <button class="tb-pill" :class="{ active: store.view === 'calendar' }" @click="store.view = 'calendar'">Calendar</button>
        </div>
      </div>

      <main class="main">
        <SheetView v-if="store.view === 'sheet'" />
        <CalendarView v-else />
      </main>

      <!-- mobile bottom tab bar -->
      <nav class="tab-bar">
        <button class="tab" :class="{ active: store.view === 'sheet' }" @click="store.view = 'sheet'">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 9h6M9 13h6M9 17h4"/>
          </svg>
          <span>Sheets</span>
        </button>
        <button class="tab" :class="{ active: store.view === 'calendar' }" @click="store.view = 'calendar'">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <span>Calendar</span>
        </button>
      </nav>
    </div>

    <!-- mobile sidebar backdrop -->
    <div v-if="sideOpen && isMobile" class="scrim" @click="sideOpen = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { store } from './stores/app.js'
import Sidebar from './components/Sidebar.vue'
import SheetView from './components/SheetView.vue'
import CalendarView from './components/CalendarView.vue'

const MOBILE_BP = 640
const isMobile = ref(window.innerWidth <= MOBILE_BP)
const sideOpen = ref(!isMobile.value)

function onResize() {
  const mobile = window.innerWidth <= MOBILE_BP
  if (mobile !== isMobile.value) {
    isMobile.value = mobile
    sideOpen.value = !mobile
  }
}
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const activeFolder = computed(() =>
  store.folders.find(f => f.id === store.activeFolderId) || null
)
const activeSheet = computed(() =>
  store.sheets.find(s => s.id === store.activeSheetId) || null
)

// theme + palette → html attributes
const mq = window.matchMedia('(prefers-color-scheme: dark)')
function applyTheme() {
  const dark = store.theme === 'dark' || (store.theme === 'auto' && mq.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}
function applyPalette() {
  document.documentElement.dataset.palette = store.palette
}
watch(() => store.theme, applyTheme, { immediate: true })
watch(() => store.palette, applyPalette, { immediate: true })
mq.addEventListener('change', applyTheme)
</script>
