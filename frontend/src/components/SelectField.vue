<script setup lang="ts">
// --- External imports ---
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

// --- Internal imports ---
import type { SelectOption } from '../interfaces/SelectOption';
import AppIcon from './AppIcon.vue';

// --- Props and emits ---
const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>();

const props = withDefaults(
  defineProps<{
    label?: string;
    labelVariant?: 'form' | 'filter';
    modelValue?: string | number;
    options?: (SelectOption | string | number)[];
    placeholder?: string;
  }>(),
  {
    label: '',
    labelVariant: 'form',
    modelValue: undefined,
    options: () => [],
    placeholder: 'Select an option',
  },
);

// --- State ---
const highlighted = ref(0);
let instanceCount = 0;
const isOpen = ref(false);
const labelId = `select-label-${++instanceCount}`;
const listEl = ref<HTMLElement | null>(null);
const rootEl = ref<HTMLElement | null>(null);

// --- Computed ---
const items = computed<SelectOption[]>(() =>
  props.options.map((option) =>
    typeof option === 'object' ? option : { value: option, label: String(option) },
  ),
);

const selectedIndex = computed(() => items.value.findIndex((o) => o.value === props.modelValue));
const selectedLabel = computed(() => items.value[selectedIndex.value]?.label ?? '');

// --- Methods ---
function choose(index: number): void {
  const option = items.value[index];
  if (!option) return;
  emit('update:modelValue', option.value);
  close();
}

function close(): void {
  isOpen.value = false;
}

function move(step: number): void {
  if (!isOpen.value) {
    open();
    return;
  }
  const total = items.value.length;
  if (total === 0) return;
  highlighted.value = (highlighted.value + step + total) % total;
  void nextTick(revealHighlighted);
}

function onKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      move(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      move(-1);
      break;
    case 'Home':
      if (!isOpen.value) return;
      event.preventDefault();
      highlighted.value = 0;
      void nextTick(revealHighlighted);
      break;
    case 'End':
      if (!isOpen.value) return;
      event.preventDefault();
      highlighted.value = items.value.length - 1;
      void nextTick(revealHighlighted);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (isOpen.value) choose(highlighted.value);
      else open();
      break;
    case 'Escape':
      close();
      break;
    case 'Tab':
      close();
      break;
  }
}

function onPointerDownOutside(event: PointerEvent): void {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) close();
}

function open(): void {
  isOpen.value = true;
  highlighted.value = selectedIndex.value >= 0 ? selectedIndex.value : 0;
  void nextTick(revealHighlighted);
}

/** Scroll the highlighted option into view when the list is scrollable. */
function revealHighlighted(): void {
  listEl.value?.children[highlighted.value]?.scrollIntoView({ block: 'nearest' });
}

// --- Lifecycle ---
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDownOutside));

watch(isOpen, (open) => {
  if (open) document.addEventListener('pointerdown', onPointerDownOutside);
  else document.removeEventListener('pointerdown', onPointerDownOutside);
});
</script>

<template>
  <div ref="rootEl" class="relative flex flex-col gap-1.5">
    <span
      v-if="props.label"
      :id="labelId"
      :class="
        props.labelVariant === 'filter'
          ? 'text-xs font-semibold tracking-wide text-slate-500 uppercase'
          : 'text-sm font-medium text-ink'
      "
    >
      {{ props.label }}
    </span>

    <button
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-labelledby="props.label ? labelId : undefined"
      class="flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-left text-sm text-ink shadow-sm transition hover:border-slate-400 focus:outline-2 focus:outline-primary"
      :class="isOpen ? 'border-primary' : 'border-slate-300'"
      @click="isOpen ? close() : open()"
      @keydown="onKeydown"
    >
      <span :class="selectedLabel ? '' : 'text-slate-400'">
        {{ selectedLabel || props.placeholder }}
      </span>
      <AppIcon
        name="chevron"
        :size="16"
        class="shrink-0 text-slate-400 transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <ul
      v-if="isOpen"
      ref="listEl"
      role="listbox"
      :aria-labelledby="props.label ? labelId : undefined"
      class="absolute top-full right-0 left-0 z-20 mt-1 max-h-60 list-none overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
    >
      <li
        v-for="(option, index) in items"
        :key="String(option.value)"
        role="option"
        :aria-selected="index === selectedIndex"
        class="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors"
        :class="[
          index === highlighted ? 'bg-primary/10 text-primary-dark' : 'text-ink',
          index === selectedIndex ? 'font-medium' : '',
        ]"
        @mouseenter="highlighted = index"
        @click="choose(index)"
      >
        {{ option.label }}
        <AppIcon v-if="index === selectedIndex" name="check" :size="15" class="shrink-0" />
      </li>

      <li v-if="items.length === 0" class="px-3 py-2 text-sm text-slate-400">
        No options available
      </li>
    </ul>
  </div>
</template>
