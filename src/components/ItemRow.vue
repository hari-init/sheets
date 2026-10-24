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
        <span
          v-if="localDate || localTimeFrom"
          class="item-date-chip"
          :class="{ 'has-date': localDate }"
        >{{ localDate ? fmtDate(localDate) : '' }}{{ localDate && localTimeFrom ? ' · ' : '' }}{{ localTimeFrom }}{{ localTimeTo ? ' → ' + localTimeTo : '' }}</span>
      </div>

      <!-- desktop meta -->
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

      <button class="item-chevron" @click="open = !open">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="!open" d="M5.5 6.5 8 9l2.5-2.5"/>
          <path v-else        d="M5.5 9.5 8 7l2.5 2.5"/>
        </svg>
      </button>
    </div>

    <div v-if="open" class="item-detail" @click.stop>

      <!-- mobile: tappable field chips that trigger native pickers -->
      <div class="detail-fields">
        <div class="field-chip" @click="tap(dateRef)">
          <span class="field-chip-label">DATE</span>
          <span class="field-chip-val" :class="{ empty: !localDate }">
            {{ localDate ? fmtDate(localDate) : 'None' }}
          </span>
          <input ref="dateRef" type="date" v-model="localDate" @change="save" class="picker-ghost" tabindex="-1" />
        </div>

        <div class="field-chip" @click="tap(fromRef)">
          <span class="field-chip-label">FROM</span>
          <span class="field-chip-val" :class="{ empty: !localTimeFrom }">
            {{ localTimeFrom || '—' }}
          </span>
          <input ref="fromRef" type="time" v-model="localTimeFrom" @change="save" class="picker-ghost" tabindex="-1" />
        </div>

        <div class="field-chip" @click="tap(toRef)">
          <span class="field-chip-label">TO</span>
          <span class="field-chip-val" :class="{ empty: !localTimeTo }">
            {{ localTimeTo || '—' }}
          </span>
          <input ref="toRef" type="time" v-model="localTimeTo" @change="save" class="picker-ghost" tabindex="-1" />
        </div>

        <button class="delete-chip" @click.stop="deleteItem(item.id)">
          <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3.5 4.5h9M6 4.5V3h4v1.5M6.5 7v5M9.5 7v5M4.5 4.5l.5 8h6l.5-8"/>
          </svg>
        </button>
      </div>

      <div class="format-bar">
        <button @mousedown.prevent="exec('bold')"><b>B</b></button>
        <button @mousedown.prevent="exec('italic')"><i>I</i></button>
        <button @mousedown.prevent="exec('underline')"><u>U</u></button>
        <button @mousedown.prevent="exec('strikeThrough')"><s>S</s></button>
        <span class="sep">|</span>
        <button @mousedown.prevent="exec('insertUnorderedList')">• list</button>
        <button @mousedown.prevent="exec('insertOrderedList')"># list</button>
      </div>

      <div
        ref="editor"
        class="description-editor"
        contenteditable="true"
        :data-placeholder="'Add notes…'"
        @input="onDescInput"
        @blur="save"
      ></div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { toggleItem, updateItem, deleteItem } from '../stores/app.js'

const props = defineProps({ item: Object })
const emit = defineEmits(['new-below', 'delete-self'])

const open = ref(false)
const localText = ref(props.item.text)
const localDate = ref(props.item.dueDate)
const localTimeFrom = ref(props.item.timeFrom || '')
const localTimeTo = ref(props.item.timeTo || '')
const editor = ref(null)
const dateRef = ref(null)
const fromRef = ref(null)
const toRef  = ref(null)

onMounted(() => {
  if (editor.value && props.item.description) {
    editor.value.innerHTML = props.item.description
  }
})

watch(() => props.item.text,     v => { localText.value = v })
watch(() => props.item.dueDate,  v => { localDate.value = v })
watch(() => props.item.timeFrom, v => { localTimeFrom.value = v || '' })
watch(() => props.item.timeTo,   v => { localTimeTo.value = v || '' })
watch(open, val => {
  if (val) nextTick(() => {
    if (editor.value && props.item.description && !editor.value.innerHTML)
      editor.value.innerHTML = props.item.description
  })
})

function save() {
  updateItem(props.item.id, {
    text: localText.value,
    dueDate: localDate.value,
    timeFrom: localTimeFrom.value,
    timeTo: localTimeTo.value,
    description: editor.value?.innerHTML || props.item.description,
  })
}

function onDescInput() {
  updateItem(props.item.id, { description: editor.value.innerHTML })
}

function onBackspace(e) {
  if (localText.value === '') {
    e.preventDefault()
    emit('delete-self')
  }
}

function exec(cmd) {
  document.execCommand(cmd, false, null)
  editor.value?.focus()
}

// trigger the hidden native picker
function tap(inputRef) {
  const el = inputRef?.value
  if (!el) return
  try { el.showPicker() } catch { el.click() }
}

function fmtDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T12:00:00')
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
