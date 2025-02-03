<script setup lang="ts">
import { ref } from 'vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import CiCloseBig from './components/CiCloseBig.vue'

// Интерфейс для элемента инвентаря
interface InventoryItem {
  id: number;
  color: string;
  count: number;
  active: boolean;
}

const isInventoryPopupOpen = ref(false)
const isInventoryFormOpen = ref(false)
const isBottomCardOpen = ref(true)

const inventoryArray = ref<InventoryItem[]>([
  { id: 1, color: 'inventory__icon--green', count: 10, active: false },
  { id: 2, color: 'inventory__icon--yellow', count: 5, active: false },
  { id: 3, color: 'inventory__icon--violet', count: 12, active: false },
  ...Array.from({ length: 22 }, (_, index) => ({
    id: index + 4,
    color: '',
    count: 0,
    active: false
  }))
])

// Изменил тип для currentCell, убрал null для id
const currentCell = ref<InventoryItem & { maxValue: number }>({
  id: 0,  // Заменил null на 0
  color: '',
  count: 0,
  maxValue: 0,
  active: false
})

const draggedItemIndex = ref(-1)

// Сохранение в localStorage
const saveToLocalStorage = (key: string, data: any): void => {
  try {
    const serializedData = JSON.stringify(data)
    localStorage.setItem(key, serializedData)
  } catch (error) {
    console.error("Could not save to localStorage", error)
  }
}

// Загрузка из localStorage
const loadFromLocalStorage = <T>(key: string): T | undefined => {
  try {
    const serializedData = localStorage.getItem(key)
    return serializedData ? JSON.parse(serializedData) : undefined
  } catch (error) {
    console.error("Could not load from localStorage", error)
    return undefined
  }
}

// Загрузка сохраненного массива инвентаря
const savedInventoryArray = loadFromLocalStorage<InventoryItem[]>('inventoryArray')
if (savedInventoryArray) {
  inventoryArray.value = savedInventoryArray
}

// Обработчики drag and drop
const dragStart = (index: number, event: DragEvent): void => {
  document.body.style.cursor = 'help'
  draggedItemIndex.value = index

  const draggedElement = event.target as HTMLElement
  const dragImage = draggedElement.cloneNode(true) as HTMLElement

  dragImage.style.position = 'absolute'
  dragImage.style.zIndex = '-9999'
  dragImage.classList.add('drag-image')
  document.body.appendChild(dragImage)

  if (event.dataTransfer) {
    event.dataTransfer.setDragImage(dragImage, 70, 70)
  }
}

const dragOver = (event: DragEvent): void => {
  event.preventDefault()
}

const drop = (event: DragEvent): void => {
  event.preventDefault()

  const target = event.target as HTMLElement
  const index = Number(target.id)

  if (draggedItemIndex.value !== index && draggedItemIndex.value !== -1) {
    const array = JSON.parse(JSON.stringify(inventoryArray.value))

    const temp = array[index]
    array[index] = array[draggedItemIndex.value]
    array[draggedItemIndex.value] = temp

    inventoryArray.value = array
    saveToLocalStorage('inventoryArray', array)
  }
  draggedItemIndex.value = -1
}

const dragEnd = (event?: DragEvent): void => {
  document.body.style.cursor = 'auto'
  draggedItemIndex.value = -1

  if (event?.target) {
    (event.target as HTMLElement).style.opacity = '1'
  }

  const dragImage = document.querySelector('.drag-image')
  if (dragImage) {
    dragImage.remove()
  }
}

// Открытие popup инвентаря
// Убрал второй аргумент из вызова функции
const openInventoryPopup = (id: number): void => {
  const foundCell = inventoryArray.value.find(cell => cell.id === id)
  if (foundCell) {
    if (!isInventoryPopupOpen.value && foundCell.count) {
      isInventoryPopupOpen.value = true
      setCellValue(foundCell)
    } else if (isInventoryPopupOpen.value && foundCell.count === 0) {
      closeInventoryPopup()
    } else if (isInventoryPopupOpen.value && foundCell.count) {
      closeInventoryPopup()
      setTimeout(() => {
        isInventoryPopupOpen.value = true
        setCellValue(foundCell)
      }, 300)
    }
  }
}

// Установка значения текущей ячейки
const setCellValue = (foundCell: InventoryItem): void => {
  currentCell.value = { ...foundCell, maxValue: foundCell.count, active: true }
}

// Закрытие popup инвентаря
// Убрал аргумент из функции
const closeInventoryPopup = (): void => {
  inventoryArray.value.forEach(cell => cell.active = false)
  isInventoryPopupOpen.value = false
}

// Уменьшение количества в ячейке
// Упростил функцию, убрав лишние аргументы
const decreaseCellCount = (id: number): void => {
  const foundCell = inventoryArray.value.find(cell => cell.id === id)
  if (foundCell) {
    foundCell.count -= currentCell.value.count
    isInventoryFormOpen.value = false
    setTimeout(() => {
      isInventoryPopupOpen.value = false
    }, 200)
    saveToLocalStorage('inventoryArray', inventoryArray.value)
  }
}
</script>

<template>
    <button
        @click="toggleTheme"
        class="theme-switcher"
    >
    <div class="theme-icon">
        <Moon  v-if="isLight"/>
        <Sun v-else />
    </div>
    </button>
</template>

<style lang="scss">
.theme-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  padding: 5px;
  background-color: rgb(var(--color-primary-bg), .1);
  transition: background-color .3s ease, transform .3s ease;
}
.theme-switcher:hover {
    background-color: rgb(var(--color-secondary), .1);
}
.theme-switcher:active {
    transform: scale(0.3);
    background-color: blue;
}
</style>