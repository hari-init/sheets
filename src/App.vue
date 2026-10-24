<template>
  <div class="app" :class="{ 'side-hidden': !sideOpen }">

    <Sidebar @sheet-selected="onSheetSelected" />

    <div class="workspace">
      <!-- topbar — always visible, desktop + mobile -->
      <div class="topbar">
        <button class="ico" @click="sideOpen = !sideOpen" title="Toggle sidebar">
          <span class="bars"></span>
        </button>

        <div class="breadcrumb">
          <span v-if="activeFolder" class="bc-folder">{{ activeFolder.name }}</span>
          <span v-if="activeFolder && activeSheet" class="bc-sep">›</span>
          <span v-if="activeSheet" class="bc-sheet">{{ activeSheet.name }}</span>
          <span v-if="store.view === 'calendar'" class="bc-sheet">Calendar</span>
        </div>

        <div class="topbar-actions">
          <button
            class="tb-pill"
            :class="{ active: store.view === 'sheet' }"
            @click="store.view = 'sheet'"
          >Sheets</button>
          <button
            class="tb-pill"
            :class="{ active: store.view === 'calendar' }"
            @click="store.view = 'calendar'"
          >Calendar</button>
        </div>
      </div>

      <main class="main">
        <SheetView v-if="store.view === 'sheet'" />
        <CalendarView v-else />
      </main>
    </div>

    <!-- mobile backdrop -->
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
  store.view === 'sheet'
    ? store.sheets.find(s => s.id === store.activeSheetId) || null
    : null
)

function onSheetSelected() {
  if (isMobile.value) sideOpen.value = false
}

// theme + palette → <html> data attributes
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
