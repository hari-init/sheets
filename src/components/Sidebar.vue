<template>
  <aside class="sidebar">

    <header class="side-head">
      <span class="wordmark">Sheets</span>
      <div class="head-actions">
        <button class="ico" title="New folder" @click="addFolder">
          <svg viewBox="0 0 16 16"><path d="M1.75 4.25a1 1 0 0 1 1-1h2.9l1.2 1.5h5.4a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H2.75a1 1 0 0 1-1-1z"/><path d="M8 7.5v3M6.5 9h3"/></svg>
        </button>
      </div>
    </header>

    <nav class="tree">
      <div
        v-for="folder in store.folders"
        :key="folder.id"
        class="folder-block"
      >
        <!-- folder row -->
        <div
          class="row folder"
          :class="{ open: store.activeFolderId === folder.id }"
          @click="selectFolder(folder.id)"
        >
          <span class="caret">›</span>
          <span
            v-if="editingFolderId === folder.id"
            class="name editing"
            contenteditable="true"
            ref="folderInput"
            @blur="commitFolderRename(folder.id, $event)"
            @keydown.enter.prevent="commitFolderRename(folder.id, $event)"
            @keydown.escape="cancelFolderRename"
            @click.stop
          ></span>
          <span v-else class="name folder-name" @dblclick.stop="startFolderRename(folder)">{{ folder.name }}</span>
          <span class="act" title="Delete folder" @click.stop="removeFolder(folder.id)">
            <svg viewBox="0 0 16 16"><path d="M3.5 4.5h9M6 4.5V3h4v1.5M6.5 7v5M9.5 7v5M4.5 4.5l.5 8h6l.5-8"/></svg>
          </span>
        </div>

        <!-- sheet rows (shown when folder open) -->
        <template v-if="store.activeFolderId === folder.id">
          <div
            v-for="sheet in sheetsFor(folder.id)"
            :key="sheet.id"
            class="row note"
            :class="{ active: store.activeSheetId === sheet.id }"
            @click="selectSheet(sheet.id)"
          >
            <span
              v-if="editingSheetId === sheet.id"
              class="name editing"
              contenteditable="true"
              ref="sheetInput"
              @blur="commitSheetRename(sheet.id, $event)"
              @keydown.enter.prevent="commitSheetRename(sheet.id, $event)"
              @keydown.escape="cancelSheetRename"
              @click.stop
            ></span>
            <span v-else class="name" @dblclick.stop="startSheetRename(sheet)">{{ sheet.name }}</span>
            <span class="act" title="Delete sheet" @click.stop="removeSheet(sheet.id)">
              <svg viewBox="0 0 16 16"><path d="M3.5 4.5h9M6 4.5V3h4v1.5M6.5 7v5M9.5 7v5M4.5 4.5l.5 8h6l.5-8"/></svg>
            </span>
          </div>

          <div class="row new-row" @click.stop="addSheet(folder.id)">
            <svg class="new-icon" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>
            <span class="name">New sheet</span>
          </div>
        </template>
      </div>

      <div v-if="store.folders.length === 0" class="empty-hint">No folders yet.</div>
    </nav>

    <footer class="side-foot">
      <div class="foot-row">
        <span class="foot-label">Theme</span>
        <div class="foot-spacer"></div>
        <button class="seg" :class="{ on: store.theme === 'auto' }"  @click="store.theme = 'auto'">Auto</button>
        <button class="seg" :class="{ on: store.theme === 'light' }" @click="store.theme = 'light'">Light</button>
        <button class="seg" :class="{ on: store.theme === 'dark' }"  @click="store.theme = 'dark'">Dark</button>
      </div>
      <div class="foot-row">
        <span class="foot-label">Color</span>
        <div class="foot-spacer"></div>
        <button class="seg" :class="{ on: store.palette === 'warm' }" @click="store.palette = 'warm'">Warm</button>
        <button class="seg" :class="{ on: store.palette === 'cool' }" @click="store.palette = 'cool'">Cool</button>
        <button class="seg" :class="{ on: store.palette === 'mono' }" @click="store.palette = 'mono'">Mono</button>
      </div>
    </footer>

  </aside>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import {
  store,
  createFolder, renameFolder, deleteFolder,
  createSheet, renameSheet, deleteSheet,
} from '../stores/app.js'

const emit = defineEmits(['sheet-selected'])

const folderInput = ref(null)
const sheetInput = ref(null)
const editingFolderId = ref(null)
const editingSheetId = ref(null)

function sheetsFor(folderId) {
  return store.sheets.filter(s => s.folderId === folderId)
}

function selectFolder(id) {
  if (store.activeFolderId === id) {
    store.activeFolderId = null
  } else {
    store.activeFolderId = id
    const sheets = sheetsFor(id)
    if (sheets.length) store.activeSheetId = sheets[0].id
  }
}

function selectSheet(id) {
  store.activeSheetId = id
  store.view = 'sheet'
  emit('sheet-selected')
}

// folder rename
function addFolder() {
  createFolder('New folder')
  nextTick(() => {
    const f = store.folders.find(f => f.id === store.activeFolderId)
    if (f) startFolderRename(f)
  })
}
function startFolderRename(folder) {
  editingFolderId.value = folder.id
  nextTick(() => {
    const el = folderInput.value
    if (el) {
      el.textContent = folder.name
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)
    }
  })
}
function commitFolderRename(id, e) {
  const name = e.target.textContent.trim()
  if (name) renameFolder(id, name)
  editingFolderId.value = null
}
function cancelFolderRename() { editingFolderId.value = null }
function removeFolder(id) {
  if (confirm('Delete folder and all its sheets?')) deleteFolder(id)
}

// sheet rename
function addSheet(folderId) {
  createSheet(folderId, 'New sheet')
  nextTick(() => {
    const s = store.sheets.find(s => s.id === store.activeSheetId)
    if (s) startSheetRename(s)
  })
}
function startSheetRename(sheet) {
  editingSheetId.value = sheet.id
  nextTick(() => {
    const el = sheetInput.value
    if (el) {
      el.textContent = sheet.name
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)
    }
  })
}
function commitSheetRename(id, e) {
  const name = e.target.textContent.trim()
  if (name) renameSheet(id, name)
  editingSheetId.value = null
}
function cancelSheetRename() { editingSheetId.value = null }
function removeSheet(id) {
  if (confirm('Delete sheet and all its items?')) deleteSheet(id)
}
</script>
