import { reactive, watch } from 'vue'

const STORAGE_KEY = 'sheets-app-v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function defaultState() {
  const folderId = crypto.randomUUID()
  const sheetId = crypto.randomUUID()
  return {
    folders: [{ id: folderId, name: 'Inbox' }],
    sheets: [{ id: sheetId, folderId, name: 'Getting started', description: '' }],
    items: [
      {
        id: crypto.randomUUID(),
        sheetId,
        text: 'Add your first task',
        description: '',
        done: false,
        dueDate: '',
        timeFrom: '',
        timeTo: '',
        createdAt: Date.now(),
      },
    ],
    activeFolderId: folderId,
    activeSheetId: sheetId,
    view: 'sheet',
    theme: 'auto',
    palette: 'warm',
  }
}

function mergeDefaults(saved) {
  const def = defaultState()
  // top-level keys only — don't stomp data arrays
  for (const k of ['theme', 'palette', 'view', 'activeFolderId', 'activeSheetId']) {
    if (!(k in saved)) saved[k] = def[k]
  }
  // backfill missing item fields
  for (const item of saved.items || []) {
    if (!('timeFrom' in item)) item.timeFrom = item.dueTime || ''
    if (!('timeTo' in item)) item.timeTo = ''
    if (!('description' in item)) item.description = ''
  }
  // backfill missing sheet fields
  for (const sheet of saved.sheets || []) {
    if (!('description' in sheet)) sheet.description = ''
  }
  return saved
}

const saved = load()
export const store = reactive(saved ? mergeDefaults(saved) : defaultState())

watch(
  store,
  () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  },
  { deep: true }
)

// Folder actions
export function createFolder(name) {
  const id = crypto.randomUUID()
  store.folders.push({ id, name })
  store.activeFolderId = id
  store.activeSheetId = null
}

export function renameFolder(id, name) {
  const f = store.folders.find(f => f.id === id)
  if (f) f.name = name
}

export function deleteFolder(id) {
  const sheetIds = store.sheets.filter(s => s.folderId === id).map(s => s.id)
  store.items = store.items.filter(i => !sheetIds.includes(i.sheetId))
  store.sheets = store.sheets.filter(s => s.folderId !== id)
  store.folders = store.folders.filter(f => f.id !== id)
  if (store.activeFolderId === id) {
    store.activeFolderId = store.folders[0]?.id || null
    store.activeSheetId = null
  }
}

// Sheet actions
export function createSheet(folderId, name) {
  const id = crypto.randomUUID()
  store.sheets.push({ id, folderId, name, description: '' })
  store.activeSheetId = id
}

export function renameSheet(id, name) {
  const s = store.sheets.find(s => s.id === id)
  if (s) s.name = name
}

export function updateSheet(id, patch) {
  const s = store.sheets.find(s => s.id === id)
  if (s) Object.assign(s, patch)
}

export function deleteSheet(id) {
  store.items = store.items.filter(i => i.sheetId !== id)
  const sheet = store.sheets.find(s => s.id === id)
  store.sheets = store.sheets.filter(s => s.id !== id)
  if (store.activeSheetId === id) {
    const siblings = store.sheets.filter(s => s.folderId === sheet?.folderId)
    store.activeSheetId = siblings[0]?.id || null
  }
}

// Item actions
export function createItem(sheetId) {
  const id = crypto.randomUUID()
  store.items.push({
    id,
    sheetId,
    text: '',
    description: '',
    done: false,
    dueDate: '',
    timeFrom: '',
    timeTo: '',
    createdAt: Date.now(),
  })
  return id
}

export function updateItem(id, patch) {
  const item = store.items.find(i => i.id === id)
  if (item) Object.assign(item, patch)
}

export function deleteItem(id) {
  store.items = store.items.filter(i => i.id !== id)
}

export function toggleItem(id) {
  const item = store.items.find(i => i.id === id)
  if (item) item.done = !item.done
}
