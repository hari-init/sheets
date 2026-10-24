<template>
  <div class="app" :class="{ 'side-open': sideOpen }">

    <!-- mobile header -->
    <header class="mobile-header">
      <button class="hamburger" @click="sideOpen = !sideOpen" :aria-label="sideOpen ? 'Close menu' : 'Open menu'">
        <span></span><span></span><span></span>
      </button>
      <span class="mobile-title">{{ activeTitle }}</span>
      <div class="mobile-view-toggle">
        <button :class="{ active: store.view === 'sheet' }" @click="store.view = 'sheet'; sideOpen = false">SHEETS</button>
        <button :class="{ active: store.view === 'calendar' }" @click="store.view = 'calendar'; sideOpen = false">CAL</button>
      </div>
    </header>

    <!-- sidebar overlay backdrop -->
    <div v-if="sideOpen" class="sidebar-backdrop" @click="sideOpen = false"></div>

    <Sidebar :class="{ open: sideOpen }" @sheet-selected="sideOpen = false" />

    <main class="main">
      <SheetView v-if="store.view === 'sheet'" />
      <CalendarView v-else />
    </main>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { store } from './stores/app.js'
import Sidebar from './components/Sidebar.vue'
import SheetView from './components/SheetView.vue'
import CalendarView from './components/CalendarView.vue'

const sideOpen = ref(false)

const activeTitle = computed(() => {
  if (store.view === 'calendar') return 'Calendar'
  const sheet = store.sheets.find(s => s.id === store.activeSheetId)
  if (sheet) return sheet.name
  const folder = store.folders.find(f => f.id === store.activeFolderId)
  return folder?.name || 'Sheets'
})

// apply theme + palette to <html> as data attributes (same pattern as Paper)
const mq = window.matchMedia('(prefers-color-scheme: dark)')

function applyTheme() {
  const dark =
    store.theme === 'dark' ||
    (store.theme === 'auto' && mq.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

function applyPalette() {
  document.documentElement.dataset.palette = store.palette
}

watch(() => store.theme, applyTheme, { immediate: true })
watch(() => store.palette, applyPalette, { immediate: true })
mq.addEventListener('change', applyTheme)
</script>
