<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="label">FOLDERS</span>
      <button class="icon-btn" title="New folder" @click="addFolder">+</button>
    </div>

    <div class="folder-list">
      <div
        v-for="folder in store.folders"
        :key="folder.id"
        class="folder-group"
      >
        <div
          class="folder-row"
          :class="{ active: store.activeFolderId === folder.id }"
          @click="selectFolder(folder.id)"
        >
          <span
            v-if="editingFolderId === folder.id"
            class="folder-name-input-wrap"
            @click.stop
          >
            <input
              ref="folderInput"
              v-model="editingFolderName"
              class="inline-input"
              @blur="commitFolderRename(folder.id)"
              @keydown.enter="commitFolderRename(folder.id)"
              @keydown.escape="cancelFolderRename"
            />
          </span>
          <span v-else class="folder-name" @dblclick.stop="startFolderRename(folder)">
            {{ folder.name }}
          </span>
          <button
            class="icon-btn danger small"
            title="Delete folder"
            @click.stop="removeFolder(folder.id)"
          >×</button>
        </div>

        <div v-if="store.activeFolderId === folder.id" class="sheet-list">
          <div
            v-for="sheet in sheetsFor(folder.id)"
            :key="sheet.id"
            class="sheet-row"
            :class="{ active: store.activeSheetId === sheet.id }"
            @click="selectSheet(sheet.id)"
          >
            <span
              v-if="editingSheetId === sheet.id"
              @click.stop
            >
              <input
                ref="sheetInput"
                v-model="editingSheetName"
                class="inline-input"
                @blur="commitSheetRename(sheet.id)"
                @keydown.enter="commitSheetRename(sheet.id)"
                @keydown.escape="cancelSheetRename"
              />
            </span>
            <span v-else class="sheet-name" @dblclick.stop="startSheetRename(sheet)">
              — {{ sheet.name }}
            </span>
            <button
              class="icon-btn danger small"
              title="Delete sheet"
              @click.stop="removeSheet(sheet.id)"
            >×</button>
          </div>

          <button class="new-sheet-btn" @click.stop="addSheet(folder.id)">
            + new sheet
          </button>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="view-toggles">
        <button
          class="view-toggle"
          :class="{ active: store.view === 'sheet' }"
          @click="store.view = 'sheet'"
        >SHEETS</button>
        <button
          class="view-toggle"
          :class="{ active: store.view === 'calendar' }"
          @click="store.view = 'calendar'"
        >CALENDAR</button>
      </div>

      <div class="settings-row">
        <span class="settings-label">THEME</span>
        <div class="seg-group">
          <button class="seg" :class="{ on: store.theme === 'auto' }"  @click="store.theme = 'auto'">Auto</button>
          <button class="seg" :class="{ on: store.theme === 'light' }" @click="store.theme = 'light'">Light</button>
          <button class="seg" :class="{ on: store.theme === 'dark' }"  @click="store.theme = 'dark'">Dark</button>
        </div>
      </div>

      <div class="settings-row">
        <span class="settings-label">COLOR</span>
        <div class="seg-group">
          <button class="seg" :class="{ on: store.palette === 'warm' }"  @click="store.palette = 'warm'">Warm</button>
          <button class="seg" :class="{ on: store.palette === 'cool' }"  @click="store.palette = 'cool'">Cool</button>
          <button class="seg" :class="{ on: store.palette === 'mono' }"  @click="store.palette = 'mono'">Mono</button>
        </div>
      </div>
    </div>
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
const editingFolderName = ref('')
const editingSheetId = ref(null)
const editingSheetName = ref('')

function sheetsFor(folderId) {
  return store.sheets.filter(s => s.folderId === folderId)
}

function selectFolder(id) {
  store.activeFolderId = id
  const sheets = sheetsFor(id)
  store.activeSheetId = sheets[0]?.id || null
}

function selectSheet(id) {
  store.activeSheetId = id
  store.view = 'sheet'
  emit('sheet-selected')
}

function addFolder() {
  createFolder('New folder')
  nextTick(() => {
    const f = store.folders.find(f => f.id === store.activeFolderId)
    if (f) startFolderRename(f)
  })
}

function startFolderRename(folder) {
  editingFolderId.value = folder.id
  editingFolderName.value = folder.name
  nextTick(() => folderInput.value?.focus())
}
function commitFolderRename(id) {
  if (editingFolderName.value.trim()) renameFolder(id, editingFolderName.value.trim())
  editingFolderId.value = null
}
function cancelFolderRename() { editingFolderId.value = null }
function removeFolder(id) {
  if (confirm('Delete folder and all its sheets?')) deleteFolder(id)
}

function addSheet(folderId) {
  createSheet(folderId, 'New sheet')
  nextTick(() => {
    const s = store.sheets.find(s => s.id === store.activeSheetId)
    if (s) startSheetRename(s)
  })
}

function startSheetRename(sheet) {
  editingSheetId.value = sheet.id
  editingSheetName.value = sheet.name
  nextTick(() => sheetInput.value?.focus())
}
function commitSheetRename(id) {
  if (editingSheetName.value.trim()) renameSheet(id, editingSheetName.value.trim())
  editingSheetId.value = null
}
function cancelSheetRename() { editingSheetId.value = null }
function removeSheet(id) {
  if (confirm('Delete sheet and all its items?')) deleteSheet(id)
}
</script>
