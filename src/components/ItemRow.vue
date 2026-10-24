<template>
  <div class="item-row" :class="{ done: item.done, expanded: open }">

    <!-- collapsed row -->
    <div class="item-main">
      <button class="checkbox" @click.stop="toggleItem(item.id)" aria-label="Toggle done">
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
        <!-- mobile: compact date chip under text -->
        <span
          class="item-date-chip"
          :class="{ 'has-date': localDate }"
          v-if="localDate || localTimeFrom"
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
        <button class="icon-btn danger small" title="Delete" @click.stop="deleteItem(item.id)">×</button>
      </div>

      <!-- mobile: expand toggle -->
      <button class="item-expand-btn" @click="open = !open" :aria-label="open ? 'Collapse' : 'Expand'">
        {{ open ? '▲' : '▼' }}
      </button>
    </div>

    <!-- expanded detail -->
    <div v-if="open" class="item-detail" @click.stop>

      <!-- mobile: full meta in the detail -->
      <div class="item-detail-meta">
        <input type="date" class="meta-input" v-model="localDate" @change="save" />
        <div class="time-range">
          <input type="time" class="meta-input" v-model="localTimeFrom" @change="save" />
          <span class="time-sep">→</span>
          <input type="time" class="meta-input" v-model="localTimeTo" @change="save" />
        </div>
        <button class="icon-btn danger item-delete-btn" title="Delete" @click.stop="deleteItem(item.id)">×</button>
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
