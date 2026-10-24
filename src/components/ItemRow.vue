<template>
  <div class="item-row" :class="{ done: item.done, expanded: open }">
    <div class="item-main" @click="open = !open">
      <button class="checkbox" @click.stop="toggleItem(item.id)">
        <span v-if="item.done">✓</span>
      </button>
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
      <div class="item-meta" @click.stop>
        <input
          type="date"
          class="meta-input"
          v-model="localDate"
          @change="save"
        />
        <div class="time-range">
          <input
            type="time"
            class="meta-input"
            v-model="localTimeFrom"
            placeholder="from"
            @change="save"
          />
          <span class="time-sep">→</span>
          <input
            type="time"
            class="meta-input"
            v-model="localTimeTo"
            placeholder="to"
            @change="save"
          />
        </div>
        <button class="icon-btn danger small" title="Delete" @click.stop="deleteItem(item.id)">×</button>
      </div>
    </div>

    <div v-if="open" class="item-detail" @click.stop>
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
