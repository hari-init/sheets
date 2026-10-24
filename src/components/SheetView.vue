<template>
  <div class="sheet-view">
    <div v-if="!sheet" class="empty-state">
      <span class="label">NO SHEET SELECTED</span>
    </div>

    <template v-else>
      <div class="sheet-header">
        <input
          class="sheet-title"
          v-model="sheetName"
          @blur="renameSheet(sheet.id, sheetName)"
          @keydown.enter.prevent="descRef?.focus()"
        />
        <div class="sheet-stats">
          <span class="label">{{ doneCount }}/{{ total }} DONE</span>
        </div>
      </div>

      <textarea
        ref="descRef"
        class="sheet-description"
        v-model="sheetDesc"
        placeholder="Sheet description…"
        rows="2"
        @blur="updateSheet(sheet.id, { description: sheetDesc })"
      ></textarea>

      <div class="item-list">
        <ItemRow
          v-for="item in items"
          :key="item.id"
          :item="item"
          @new-below="addBelow(item.id)"
          @delete-self="removeSelf(item.id)"
        />
      </div>

      <button class="add-item-btn" @click="addItem">+ add item</button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { store, createItem, deleteItem, renameSheet, updateSheet } from '../stores/app.js'
import ItemRow from './ItemRow.vue'

const descRef = ref(null)

const sheet = computed(() =>
  store.sheets.find(s => s.id === store.activeSheetId) || null
)

const sheetName = ref(sheet.value?.name || '')
const sheetDesc = ref(sheet.value?.description || '')

watch(() => sheet.value?.name, v => { sheetName.value = v || '' })
watch(() => sheet.value?.description, v => { sheetDesc.value = v || '' })

const items = computed(() =>
  store.items.filter(i => i.sheetId === store.activeSheetId)
)
const total = computed(() => items.value.length)
const doneCount = computed(() => items.value.filter(i => i.done).length)

function addItem() {
  if (!sheet.value) return
  createItem(store.activeSheetId)
}

function addBelow(afterId) {
  if (!sheet.value) return
  const idx = store.items.findIndex(i => i.id === afterId)
  const newId = createItem(store.activeSheetId)
  const newIdx = store.items.findIndex(i => i.id === newId)
  if (newIdx !== -1 && idx !== -1) {
    const [item] = store.items.splice(newIdx, 1)
    store.items.splice(idx + 1, 0, item)
  }
}

function removeSelf(id) {
  deleteItem(id)
}
</script>
