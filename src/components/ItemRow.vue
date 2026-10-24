<template>
  <div class="item-row" :class="{ done: item.done, expanded: open }">

    <div class="item-main">
      <button class="checkbox" @click.stop="toggleItem(item.id)" aria-label="Toggle done">
        <span v-if="item.done">✓</span>
      </button>

      <!-- body: tapping expands/collapses -->
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
        <!-- compact date/time hint below text — only when values are set -->
        <span
          v-if="localDate || localTimeFrom"
          class="item-date-chip"
          :class="{ 'has-date': localDate }"
        >{{ localDate }}{{ localDate && localTimeFrom ? ' · ' : '' }}{{ localTimeFrom }}{{ localTimeTo ? ' → ' + localTimeTo : '' }}</span>
      </div>

      <!-- desktop: inline meta -->
      <div class="item-meta" @click.stop>
        <input type="date" class="meta-input" v-model="localDate" @change="save" />
        <div class="time-range">
          <input type="time" class="meta-input" v-model="localTimeFrom" @change="save" />
          <span class="time-sep">→</span>
          <input type="time" class="meta-input" v-model="localTimeTo" @change="save" />
        </div>
        <button class="icon-btn" title="Delete" @click.stop="deleteItem(item.id)">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3.5 4.5h9M6 4.5V3h4v1.5M6.5 7v5M9.5 7v5M4.5 4.5l.5 8h6l.5-8"/>
          </svg>
        </button>
      </div>

      <!-- mobile: chevron tap target -->
      <button class="item-chevron" @click="open = !open" :aria-label="open ? 'Collapse' : 'Expand'">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="!open" d="M5.5 6.5 8 9l2.5-2.5"/>
          <path v-else d="M5.5 9.5 8 7l2.5 2.5"/>
        </svg>
      </button>
    </div>

    <!-- expanded detail -->
    <div v-if="open" class="item-detail" @click.stop>

      <!-- mobile full meta -->
      <div class="item-detail-meta">
        <label class="field-group">
          <span class="field-label">DATE</span>
          <input type="date" class="field-input" v-model="localDate" @change="save" />
        </label>
        <label class="field-group">
          <span class="field-label">FROM</span>
          <input type="time" class="field-input" v-model="localTimeFrom" @change="save" />
        </label>
        <label class="field-group">
          <span class="field-label">TO</span>
          <input type="time" class="field-input" v-model="localTimeTo" @change="save" />
        </label>
        <button class="delete-btn" @click.stop="deleteItem(item.id)" title="Delete task">
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

onMounted(() => {
  if (editor.value && props.item.description) {
    editor.value.innerHTML = props.item.description
  }
})

watch(() => props.item.text, v => { localText.value = v })
watch(() => props.item.dueDate, v => { localDate.value = v })
watch(() => props.item.timeFrom, v => { localTimeFrom.value = v || '' })
watch(() => props.item.timeTo, v => { localTimeTo.value = v || '' })
watch(open, val => {
  if (val) nextTick(() => {
    if (editor.value && props.item.description && !editor.value.innerHTML) {
      editor.value.innerHTML = props.item.description
    }
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
</script>
