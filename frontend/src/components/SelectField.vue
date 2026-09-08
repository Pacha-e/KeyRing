<script setup lang="ts" generic="T extends string | number">
// Desplegable propio del proyecto.
//
// El <select> nativo no permite dar estilo a su lista de opciones: la dibuja el
// sistema operativo, por eso se veía plana y ajena al resto de la interfaz.
// Aquí la lista se dibuja con HTML, y a cambio hay que devolver a mano lo que el
// nativo daba gratis: navegación con el teclado, cierre al hacer clic fuera y
// los roles ARIA para que un lector de pantalla lo anuncie como un selector.
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'

// Es genérico para que el valor conserve su tipo: al enlazarlo con v-model a un
// campo de tipo PropertyType, lo que sale del selector sigue siendo
// PropertyType y no una cadena cualquiera.
export interface SelectOption<V extends string | number = string | number> {
  value: V
  label: string
}

// Contador de módulo para enlazar cada etiqueta con su botón. No se usa el id
// que pueda venir de fuera porque el mismo selector aparece varias veces por
// página y los id tienen que ser únicos en todo el documento.
let instanceCount = 0
const labelId = `select-label-${++instanceCount}`

const props = withDefaults(
  defineProps<{
    /** Opciones, como objetos { value, label } o como valores sueltos. */
    options?: (SelectOption<T> | T)[]
    modelValue?: T
    /** Texto de la etiqueta. Se dibuja encima del control. */
    label?: string
    /**
     * 'form' para los formularios, 'filter' para las barras de filtro, donde la
     * etiqueta va en versalitas pequeñas como encabezado del control.
     */
    labelVariant?: 'form' | 'filter'
    /** Qué mostrar mientras no haya nada elegido. */
    placeholder?: string
  }>(),
  {
    options: () => [],
    // Sin valor por defecto: el tipo lo decide quien usa el componente y aquí no
    // hay ningún valor que sirva para todos. Sin elección, se muestra el
    // placeholder.
    modelValue: undefined,
    label: '',
    labelVariant: 'form',
    placeholder: 'Selecciona una opción',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: T] }>()

/** Las opciones, siempre como objetos, vengan como vengan. */
const items = computed<SelectOption<T>[]>(() =>
  props.options.map((option) =>
    typeof option === 'object' ? option : { value: option, label: String(option) },
  ),
)

const isOpen = ref(false)
const highlighted = ref(0)
const rootEl = ref<HTMLElement | null>(null)
const listEl = ref<HTMLElement | null>(null)

const selectedIndex = computed(() => items.value.findIndex((o) => o.value === props.modelValue))
const selectedLabel = computed(() => items.value[selectedIndex.value]?.label ?? '')

/** Deja visible la opción resaltada cuando la lista tiene scroll. */
function revealHighlighted(): void {
  listEl.value?.children[highlighted.value]?.scrollIntoView({ block: 'nearest' })
}

function open(): void {
  isOpen.value = true
  highlighted.value = selectedIndex.value >= 0 ? selectedIndex.value : 0
  void nextTick(revealHighlighted)
}

function close(): void {
  isOpen.value = false
}

/**
 * Elige una opción y cierra la lista.
 * @param index posición de la opción dentro de la lista
 */
function choose(index: number): void {
  const option = items.value[index]
  if (!option) return
  emit('update:modelValue', option.value)
  close()
}

/**
 * Mueve el resaltado, dando la vuelta al llegar a los extremos.
 * @param step 1 para bajar, -1 para subir
 */
function move(step: number): void {
  if (!isOpen.value) {
    open()
    return
  }
  const total = items.value.length
  if (total === 0) return
  highlighted.value = (highlighted.value + step + total) % total
  void nextTick(revealHighlighted)
}

/**
 * Teclado del selector, con el mismo comportamiento que el control nativo.
 * @param event pulsación recibida por el botón
 */
function onKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      move(-1)
      break
    case 'Home':
      if (!isOpen.value) return
      event.preventDefault()
      highlighted.value = 0
      void nextTick(revealHighlighted)
      break
    case 'End':
      if (!isOpen.value) return
      event.preventDefault()
      highlighted.value = items.value.length - 1
      void nextTick(revealHighlighted)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (isOpen.value) choose(highlighted.value)
      else open()
      break
    case 'Escape':
      close()
      break
    case 'Tab':
      close()
      break
  }
}

/**
 * Cierra la lista cuando se pulsa fuera del componente.
 * @param event pulsación en cualquier punto del documento
 */
function onPointerDownOutside(event: PointerEvent): void {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) close()
}

// El listener global solo existe mientras la lista está abierta.
watch(isOpen, (open) => {
  if (open) document.addEventListener('pointerdown', onPointerDownOutside)
  else document.removeEventListener('pointerdown', onPointerDownOutside)
})

onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDownOutside))
</script>

<template>
  <div ref="rootEl" class="relative flex flex-col gap-1.5">
    <span
      v-if="label"
      :id="labelId"
      :class="
        labelVariant === 'filter'
          ? 'text-xs font-semibold tracking-wide text-slate-500 uppercase'
          : 'text-sm font-medium text-ink'
      "
    >
      {{ label }}
    </span>

    <button
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-labelledby="label ? labelId : undefined"
      class="flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-left text-sm text-ink shadow-sm transition hover:border-slate-400 focus:outline-2 focus:outline-primary"
      :class="isOpen ? 'border-primary' : 'border-slate-300'"
      @click="isOpen ? close() : open()"
      @keydown="onKeydown"
    >
      <span :class="selectedLabel ? '' : 'text-slate-400'">
        {{ selectedLabel || placeholder }}
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
      :aria-labelledby="label ? labelId : undefined"
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
        No hay opciones disponibles
      </li>
    </ul>
  </div>
</template>
