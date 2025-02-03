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
  <div class="app-inner">
    <ThemeSwitcher />
    <div class="screen">
      <div class="screen__container">
        <div class="row row--main">
          <div class="column column--1-3">
            <div class="card">
              <img
                class="card__image"
                src="./assets/card-image.png"
                alt="..."
              >
              <div class="card__title skeleton skeleton--title skeleton-90"></div>
              <div class="card__text skeleton skeleton--text skeleton-75"></div>
              <div class="card__text skeleton skeleton--text skeleton-95"></div>
              <div class="card__text skeleton skeleton--text skeleton-80"></div>
              <div class="card__text skeleton skeleton--text skeleton-75"></div>
              <div class="card__text skeleton skeleton--text skeleton-60"></div>
              <div class="card__text skeleton skeleton--text skeleton-45"></div>
            </div>
          </div>
          <div class="column column--2-3">
            <div class="inventory">
              <div
                class="inventory__grid"
                @drop="drop"
                @dragover.prevent="dragOver"
                @dragend="dragEnd"
              >

                <div
                  v-for="(cell, index) in inventoryArray"
                  :key="index"
                  :id="String(index)"
                  :class="{ 'active': cell.active, 'dragging': draggedItemIndex === index }"
                  draggable="true"
                  class="inventory__cell custom-cursor"
                  @dragstart="dragStart(index, $event)"
                  @click="openInventoryPopup(cell.id)"
                >
                  <div
                    :class="['inventory__icon', cell.color]"
                    v-if="cell.count"
                  ></div>
                  <span
                    class="inventory__count"
                    v-if="cell.count"
                  >{{ cell.count }}</span>
                </div>
              </div>
              <div
                class="inventory__popup inventory__popup--item popup"
                :class="{ 'inventory__popup--open': isInventoryPopupOpen }"
              >
                <button
                  class="inventory--close"
                  @click="closeInventoryPopup()"
                >
                  <CiCloseBig />
                </button>
                <div class="inventory__image">
                  <div class="popup__icon-wrapper">
                    <div
                      class="inventory__icon popup__icon"
                      :class="currentCell.color"
                    ></div>
                  </div>
                </div>
                <div class="inventory__content">
                  <div class="inventory__title skeleton skeleton--title"></div>
                  <div class="inventory__text skeleton skeleton--text"></div>
                  <div class="inventory__text skeleton skeleton--text"></div>
                  <div class="inventory__text skeleton skeleton--text"></div>
                  <div class="inventory__text skeleton skeleton--text"></div>
                  <div class="inventory__text skeleton skeleton--text"></div>
                </div>
                <button
                  class="btn inventory__delete btn-primary"
                  @click="isInventoryFormOpen = true"
                >Удалить предмет</button>
                <form
                  class="inventory__form"
                  :class="{ 'inventory__form--open': isInventoryFormOpen }"
                >
                  <input
                    class="inventory__input"
                    type="number"
                    placeholder="Введите количество"
                    v-model="currentCell.count"
                    :max="currentCell.maxValue"
                    min="0"
                  >
                  <div class="inventory__buttons">
                    <button
                      class="btn inventory__button btn-secondary"
                      @click.prevent="isInventoryFormOpen = false"
                    >Отмена</button>
                    <button
                      class="btn inventory__button btn-primary"
                      @click.prevent="decreaseCellCount(currentCell.id)"
                    >Подтвердить</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div
          class="row row--footer"
          :class="{ 'show': isBottomCardOpen, 'close': !isBottomCardOpen }"
        >
          <div class="column">
            <div class="card">
              <div class="textarea skeleton skeleton--textarea"></div>
              <button
                class="btn card__btn--close"
                @click="isBottomCardOpen = false"
              >
                <CiCloseBig />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
</template>

<style lang="scss">
:root {
  --color-test: rgb(74, 74, 77);

  --color-primary-red: #FA7272;
  --color-hover-red: #F88;
  --color-primary-white: 255, 255, 255;
  --color-secondary-white: 220, 220, 222;
  --color-primary-black: 45, 45, 45;
  --color-hover-black: 74, 74, 74;
  --color-primary-green: #7FAA65;
  --color-secondary-green: #b8d99851;
  --color-primary-yellow: #AA9765;
  --color-secondary-yellow: #d9bb9859;
  --color-primary-violet: #656CAA;
  --color-secondary-violet: #7480ed59;


  --color-primary-border: #4D4D4D;
  --color-primary: var(--color-primary-red);
  --color-primary-hover: var(var(--color-hover-red));
  --color-secondary: var(--color-primary-white);
  --color-primary-bg: #1d1d1d;
  --color-secondary-bg: 38, 38, 38;
  --color-hover-backgound: var(--color-hover-black);

  --font-size-base: 16px;
  --skeleton-gradient: linear-gradient(90deg, #3C3C3C 0%, #444 51.04%, #333 100%)
}

.light {
  --color-primary-bg: rgba(var(--color-primary-white), .9);
  --color-secondary-bg: var(--color-secondary-white);
  --color-secondary: var(--color-primary-black);
}

*,
::before,
::after {
  box-sizing: border-box;
}

input,
textarea,
select,
button {
  font: inherit;
  padding: 0;
  margin: 0;
}

button {
  outline: none;
  border: none;
  transition: transform .2s ease;
}

button:focus,
button:hover {
  outline: 0;
  border: 0;
}

:where(h1,
  h2,
  h3,
  h4,
  h5,
  h6):where([class]) {
  margin-block: 0;
}

#app {
  padding: 0;
  margin: 0;
  max-width: unset;
  width: 100vw;
  height: 100svh;

  background: var(--color-primary-bg);

  display: flex;
  justify-content: center;
}

.app-inner {
  display: flex;
  align-items: center;
}

.custom-cursor:hover {
  cursor: url('./assets/akar-cursor.svg'), auto;
}

.custom-cursor:active {
  cursor: url('./assets/hand-grab.svg'), auto;
}

.btn {
  padding: 0;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  font-family: 'SFProDisplay';
}

.drag-image {
  // cursor: 'grab' !important;
  position: relative;
  border-radius: 24px;
  height: 100px;
  width: 105px;
  border: 1px solid var(--color-primary-border);
  background-color: rgb(var(--color-secondary-bg));

  .inventory__count {
    display: none;
  }
}

.drag-image::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  background-image: url("./assets/hand-grab.svg");
}

.skeleton {
  background: var(--skeleton-gradient);
  background-size: 100% 100%;
  background-position: center;
  animation: skeleton-pulse 1.5s infinite linear;
  opacity: 0.7;
  /* Adjust opacity as needed */
}

.skeleton-100 {
  width: 100%;
}

.skeleton-95 {
  width: 95%;
}

.skeleton-80 {
  width: 80%;
}

.skeleton-75 {
  width: 75%;
}

.skeleton-60 {
  width: 60%;
}

.skeleton-45 {
  width: 45%;
}

.skeleton--title {
  height: 26px;
  width: 190px;
  margin-top: 20px;
  margin-bottom: 24px;
  border-radius: 10px;
}

.skeleton--text {
  height: 10px;
  // width: 95%;
  margin-bottom: 16px;
  border-radius: 10px;
}

.skeleton--button {
  height: 10px;
  width: 120px;
  border-radius: 5px;
}

.skeleton--textarea {
  height: 36px;
  width: 699px;
  border-radius: 5px;
  margin-right: auto;
  margin-left: 4px;
}

@keyframes skeleton-pulse {
  0% {
    background-size: 100% 50%;
  }

  50% {
    background-size: 200% 50%;
  }

  100% {
    background-size: 100% 50%;
  }
}


// - главный блок, контейнер для всего экрана.
.screen {
  // временные свойства
  border: 1px solid var(--color-primary-border);

  display: flex;
  justify-content: center;

  &__container {
    height: 660px;

    margin: 0 auto;
    padding: 30px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 24px;

  }

  @media (max-width: 1024px) {
    max-width: 90%;
  }

  @media (max-width: 768px) {
    max-width: 100%;
  }
}

// - ряд, используется для управления расположением блоков.
.row {
  display: flex;
  gap: 1.5rem;
}

.row--main {
  flex: 1 1 500px;
}

.row--footer {
  flex: 1 1 72px;
}

.close {
  transition: opacity .3s ease-in-out, backdrop-filter .3s ease-in-out;
  opacity: 0;
  backdrop-filter: blur(15px);
}

.show {
  opacity: 1;
  backdrop-filter: blur(0px);
}

// - колонка, используется для управления шириной блоков.
.column {
  flex-grow: 1;
}

.column__inner {
  padding: 18px;
  position: relative;
}

.column--1-3 {
  width: 236px;
}

.column--2-3 {
  width: 523px;
}

.card,
.inventory {
  border: 1px solid var(--color-primary-border);
  border-radius: 12px;
  height: 100%;
  background: rgb(var(--color-secondary-bg));

}

// - карточка, первый главный блок.
.card {
  padding: 18px 14px;

  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
}

// - изображение в карточке.
.card__image {
  width: 100%;
}

// - заголовок в карточке.
.card__title {}

// - текст в карточке.
.card__text {}

// - кнопка в карточке.
.card__button {}

// - инвентарь, второй главный блок.
.inventory {
  position: relative;
  overflow: hidden;
  overflow: hidden;
}

// - сетка инвентаря.
.inventory__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  height: 100%;
}

// - ячейка инвентаря.
.inventory__cell {
  border: 1px solid var(--color-primary-border);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

}

.inventory__cell.active {
  background-color: var(--color-hover-backgound);
}

.inventory__icon {
  width: 48px;
  height: 48px;
  position: relative;
}

.inventory__icon::after {
  content: '';
  position: absolute;
  bottom: 12.5%;
  left: 12.5%;

  width: 100%;
  height: 100%;
  backdrop-filter: blur(6px);
}

.inventory__icon::before {
  content: '';
  position: absolute;
  bottom: 12.5%;
  left: 12.5%;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(6px);
}

.inventory__icon--green {
  background-color: var(--color-primary-green);
}

.inventory__icon--green::after {
  background-color: var(--color-secondary-green);
}

.inventory__icon--yellow {
  background-color: var(--color-primary-yellow);
}

.inventory__icon--yellow::after {
  background-color: var(--color-secondary-yellow);
}

.inventory__icon--violet {
  background-color: var(--color-primary-violet);
}

.inventory__icon--violet::after {
  background-color: var(--color-secondary-violet);
}

// - количество предметов в инвентаре.
.inventory__count {
  position: absolute;
  right: 0;
  bottom: 0;

  border: 1px solid var(--color-primary-border);
  border-bottom: none;
  border-right: none;
  border-top-left-radius: 6px;
  display: inline-block;
  width: 16px;
  height: 16px;
  color: rgb(var(--color-secondary));
  font-family: Inter;
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

// - всплывающее окно в инвентаре.
.inventory__popup {
  position: absolute;
  left: 100%;
  top: 0;
  z-index: 100;
  height: 100%;
  width: 250px;
  border-left: 1px solid var(--color-primary-border);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(var(--color-secondary-bg), .5);
  backdrop-filter: blur(8px);

  transition: transform .3s ease-in-out, opacity 1s ease-in-out;
  will-change: transform;
  transform: translateX(0%);
  opacity: 1;
}

.inventory__popup--open {
  transform: translateX(-100%);
  opacity: 1;
}

// - всплывающее окно для информации о предмете.
.inventory__popup--item {}

.inventory__image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup__icon-wrapper {
  width: calc(121px * 1.125);
  height: calc(121px * 1.125);
  display: flex;
  align-items: end;
}

.popup__icon {
  width: 115px;
  height: 115px;
}

// - всплывающее окно для удаления предмета.
.inventory__popup--delete {
  transform: translateX(100%)
}

.inventory__content {
  padding: 16px 0;
  border-top: 1px solid var(--color-primary-border);
  border-bottom: 1px solid var(--color-primary-border);
}

// - кнопка удаления предмета.
.inventory__delete {
  width: 220px;
  height: 40px;
  margin: 18px 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// - форма для ввода количества предметов.
.inventory__form {
  position: absolute;
  bottom: 0;
  top: 100%;

  width: 100%;
  height: 133px;
  padding: 20px;
  border: 1px solid var(--color-primary-border);
  background: rgba(var(--color-secondary-bg), .85);
  backdrop-filter: blur(8px);

  display: flex;
  flex-direction: column;
  gap: 20px;

  transform: translateY(0%);
  transition: transform .3s ease-in-out;
}

.inventory__form--open {
  transform: translateY(-100%);
}

// - поле ввода количества предметов.
.inventory__input {
  width: 210px;
  height: 40px;
  flex-shrink: 0;
  padding: 11px;

  border-radius: 4px;
  border: 1px solid var(--color-primary-border);
  background: rgb(var(--color-secondary-bg));
  color: rgb(var(--color-secondary));
}

// - контейнер для кнопок формы.
.inventory__buttons {
  display: flex;
  justify-content: center;
  gap: 5px;
}

// - кнопка в форме.
.inventory__button {
  border-radius: 8px;
  padding: 8px 20px;
  // font-family: "SF Pro Display";
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.inventory__button:hover {
  background-color: rgb(var(--color-hover-black));
}

// - третий главный блок, имитация textarea.
.textarea {}

// - кнопка закрытия textarea.
.card__btn--close,
.inventory--close {
  position: absolute;
  width: 24px;
  height: 24px;
  top: 8px;
  right: 8px;
  font-size: 30px;
  font-weight: 300;
  color: rgb(var(--color-secondary));
  background-color: transparent;

  display: flex;
  justify-content: center;
  align-items: center;
}

.card__btn--close:hover,
.inventory--close:hover {
  transform: scale(1.05) rotate(90deg);
}

.btn-primary {
  background-color: var(--color-primary-red);
}

.btn-primary:hover {
  background-color: var(--color-hover-red);
}

.btn-secondary {
  background-color: rgb(var(--color-secondary));
  color: var(--color-primary-bg);
}
</style>
