<template>
  <div class="item-row" :class="{ done: item.done, expanded: open }">

    <div class="item-main">
      <button class="checkbox" @click.stop="toggleItem(item.id)">
        <span v-if="item.done">✓</span>
      </button>

      <div class="item-body" @click="open = !open">
        <input
          class="item-text"
          :class="{ done: item.done }"
          v-model="localText"
          placeholder="Task…"
          @click.stop
          @blur="save"
          @keydown.enter.prevent="$emit('new-below')"
          @keydown.backspace="onBackspace"
        />
        <span v-if="localDate || localTimeFrom" class="item-date-chip" :class="{ 'has-date': localDate }">
          {{ localDate ? fmtDate(localDate) : '' }}{{ localDate && localTimeFrom ? ' · ' : '' }}{{ localTimeFrom }}{{ localTimeTo ? ' → ' + localTimeTo : '' }}
        </span>
      </div>

      <!-- desktop: inline date/time -->
      <div class="item-meta" @click.stop>
        <input type="date" class="meta-input" v-model="localDate" @change="save" />
        <div class="time-range">
          <input type="time" class="meta-input" v-model="localTimeFrom" @change="save" />
          <span class="time-sep">→</span>
          <input type="time" class="meta-input" v-model="localTimeTo" @change="save" />
        </div>
        <button class="icon-btn" @click.stop="deleteItem(item.id)">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3.5 4.5h9M6 4.5V3h4v1.5M6.5 7v5M9.5 7v5M4.5 4.5l.5 8h6l.5-8"/>
          </svg>
        </button>
      </div>

      <!-- mobile: expand chevron -->
      <button class="item-chevron" @click.stop="open = !open">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="!open" d="M6 9l6 6 6-6"/>
          <path v-else        d="M6 15l6-6 6 6"/>
        </svg>
      </button>
    </div>

    <div v-if="open" class="item-detail" @click.stop>

      <!-- tappable chips — native input overlaid invisibly on top -->
      <div class="detail-fields">
        <div class="field-chip">
          <span class="field-chip-label">DATE</span>
          <span class="field-chip-val" :class="{ empty: !localDate }">{{ localDate ? fmtDate(localDate) : 'None' }}</span>
          <input type="date" class="picker-overlay" v-model="localDate" @change="save" />
        </div>

        <div class="field-chip">
          <span class="field-chip-label">FROM</span>
          <span class="field-chip-val" :class="{ empty: !localTimeFrom }">{{ localTimeFrom || '—' }}</span>
          <input type="time" class="picker-overlay" v-model="localTimeFrom" @change="save" />
        </div>

        <div class="field-chip">
          <span class="field-chip-label">TO</span>
          <span class="field-chip-val" :class="{ empty: !localTimeTo }">{{ localTimeTo || '—' }}</span>
          <input type="time" class="picker-overlay" v-model="localTimeTo" @change="save" />
        </div>

        <button class="delete-chip" @click.stop="deleteItem(item.id)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>
          </svg>
        </button>
      </div>

      <!-- plain text note -->
      <textarea
        class="description-area"
        v-model="localDesc"
        placeholder="Add notes…"
        @input="saveDesc"
        @blur="save"
        rows="3"
      ></textarea>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { toggleItem, updateItem, deleteItem } from '../stores/app.js'

const props = defineProps({ item: Object })
const emit = defineEmits(['new-below', 'delete-self'])

const open       = ref(false)
const localText  = ref(props.item.text)
const localDate  = ref(props.item.dueDate || '')
const localTimeFrom = ref(props.item.timeFrom || '')
const localTimeTo   = ref(props.item.timeTo  || '')
const localDesc  = ref(props.item.description || '')

watch(() => props.item.text,        v => { localText.value = v })
watch(() => props.item.dueDate,     v => { localDate.value = v || '' })
watch(() => props.item.timeFrom,    v => { localTimeFrom.value = v || '' })
watch(() => props.item.timeTo,      v => { localTimeTo.value = v || '' })
watch(() => props.item.description, v => { localDesc.value = v || '' })

function save() {
  updateItem(props.item.id, {
    text:        localText.value,
    dueDate:     localDate.value,
    timeFrom:    localTimeFrom.value,
    timeTo:      localTimeTo.value,
    description: localDesc.value,
  })
}

function saveDesc() {
  updateItem(props.item.id, { description: localDesc.value })
}

function onBackspace(e) {
  if (localText.value === '') {
    e.preventDefault()
    emit('delete-self')
  }
}

function fmtDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T12:00:00')
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
