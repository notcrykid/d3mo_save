<template>
  <div class="productShowcase" :class="{ 'reduced-motion': prefersReducedMotion }" @keydown="handleKeydown" tabindex="0">
    <img data-component="nav-up" class="productShowcase__arrowUp" src="/svg/arrow-down.svg" alt="" ref="arrowUpRef">
    <img data-component="nav-down" class="productShowcase__arrowDown" src="/svg/arrow-down.svg" alt="" ref="arrowDownRef">
    <div data-component="primary-section" class="productShowcase__section--primary" ref="leftGroupRef">
      <div data-component="primary-viewport" class="productShowcase__viewport">
        <div v-for="(item, index) in leftItemsComputed" :key="'left-' + index" class="productShowcase__card" :ref="(el) => setLeftItemRef(el, index)" :style="getItemBackgroundStyle(item, index, 'left')" @click="handleItemClick(index, -1)" />
      </div>
    </div>
    <div data-component="secondary-section" class="productShowcase__section--secondary" ref="rightGroupRef">
      <div data-component="secondary-viewport" class="productShowcase__viewport">
        <div v-for="(item, index) in rightItemsComputed" :key="'right-' + index" class="productShowcase__card" :ref="(el) => setRightItemRef(el, index)" :style="getItemBackgroundStyle(item, index, 'right')" @click="handleItemClick(index, 1)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { useBreakpoint } from '~/composables/useBreakpoint'
import { useDeviceCapability } from '~/composables/useDeviceCapability'

interface Product {
  id: string | number
  name?: string
  image?: string
}

interface TweenState {
  inPr: number
  outPr: number
  outRotPr: number
  indexPr: number
}

const props = withDefaults(defineProps<{
  items?: Product[]
  leftItems?: Product[]
  rightItems?: Product[]
  autoPlay?: boolean
  nextItemDuration?: number
}>(), {
  items: () => [],
  leftItems: () => [],
  rightItems: () => [],
  autoPlay: true,
  nextItemDuration: undefined
})

const emit = defineEmits<{ select: [item: Product] }>()
const { isMobile, isDesktop } = useBreakpoint()
const { prefersReducedMotion } = useDeviceCapability()

const leftItemsComputed = computed(() => props.leftItems.length > 0 ? props.leftItems : props.items)
const rightItemsComputed = computed(() => props.rightItems.length > 0 ? props.rightItems : props.items)

const leftGroupRef = ref<HTMLElement | null>(null)
const rightGroupRef = ref<HTMLElement | null>(null)
const leftItemsRefs = ref<Map<number, HTMLElement>>(new Map())
const rightItemsRefs = ref<Map<number, HTMLElement>>(new Map())
const arrowUpRef = ref<HTMLElement | null>(null)
const arrowDownRef = ref<HTMLElement | null>(null)
const active = ref(false)
const currentIndex = ref(0)
const loopDelay = ref<ReturnType<typeof gsap.delayedCall> | null>(null)
const tweens = ref<TweenState>({ inPr: 0, outPr: 0, outRotPr: 0, indexPr: 0 })

const isDesktopValue = computed(() => isDesktop.value)
const nextItemDuration = computed(() => props.nextItemDuration !== undefined ? props.nextItemDuration : (isDesktopValue.value ? 2.5 : 1.8))

const ANIMATION_CONFIG = { horizontalStep: 120.0, depthStep: -75, initialOffset: 25.0, mobileHorizontalStep: 90, mobileDepthStep: -55, mobileInitialOffset: 20 }
const PLACEHOLDER_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
]

function normalizePosition(v: number, max: number): number { return (v % max) / max }
function setLeftItemRef(el: unknown, index: number) { if (el) leftItemsRefs.value.set(index, el as HTMLElement); else leftItemsRefs.value.delete(index) }
function setRightItemRef(el: unknown, index: number) { if (el) rightItemsRefs.value.set(index, el as HTMLElement); else rightItemsRefs.value.delete(index) }
function getItemBackgroundStyle(item: Product, index: number, side: string) {
  if (item.image) return { backgroundImage: 'url(' + item.image + ')' }
  return { backgroundImage: PLACEHOLDER_COLORS[(index + (side === 'right' ? 3 : 0)) % PLACEHOLDER_COLORS.length] }
}

function applyDirection(x: number, dir: number): number { return dir === -1 ? x : -x }
function calculateCardTransforms(dir: number, itemsRefs: Map<number, HTMLElement>, itemsArray: Product[]) {
  if (typeof window === 'undefined') return
  const Xt = isDesktopValue.value
  const totalItems = itemsArray.length
  if (totalItems === 0) return
  const horizontalStep = Xt ? ANIMATION_CONFIG.horizontalStep : ANIMATION_CONFIG.mobileHorizontalStep
  const depthStep = Xt ? ANIMATION_CONFIG.depthStep : ANIMATION_CONFIG.mobileDepthStep
  const initialOffset = Xt ? ANIMATION_CONFIG.initialOffset : ANIMATION_CONFIG.mobileInitialOffset
  itemsRefs.forEach((el, n) => {
    if (!el) return
    const normalizedPos = normalizePosition(tweens.value.indexPr + n, totalItems)
    const itemIndex = Math.floor(normalizedPos * totalItems)
    const z = itemIndex * depthStep
    let x = initialOffset + (itemIndex * -horizontalStep)
    x = applyDirection(x, dir)
    const entryX = dir === -1 ? 200 : -200
    const animatedX = initialOffset + (x - initialOffset) * tweens.value.inPr
    const finalX = animatedX + (entryX - animatedX) * tweens.value.outPr
    const animatedZ = z * tweens.value.inPr
    const opacity = (() => {
      if (itemIndex === 0) return 1
      if (itemIndex >= totalItems - 1) return 0
      return Math.max(0, 0.88 - ((itemIndex - 1) * 0.12))
    })() * tweens.value.inPr
    el.style.opacity = String(opacity)
    el.style.zIndex = String(totalItems - itemIndex)
    el.style.transform = `rotateY(0deg) translate3d(${finalX}px, 0px, ${animatedZ}px)`
  })
}

function updateArrows() {
  if (arrowUpRef.value) { arrowUpRef.value.style.opacity = String(tweens.value.inPr); arrowUpRef.value.style.transform = 'translate3d(0px, 0px, 0px) rotate(180deg)' }
  if (arrowDownRef.value) { arrowDownRef.value.style.opacity = String(tweens.value.inPr); arrowDownRef.value.style.transform = 'translate3d(0px, 0px, 0px)' }
}

function setupTimelines() {
  if (prefersReducedMotion.value) { tweens.value.inPr = 1; tweens.value.outPr = 0; tweens.value.outRotPr = 0; return }
  gsap.to(tweens.value, { inPr: 1, duration: 0.65, ease: 'power2.out', onUpdate: () => { calculateCardTransforms(-1, leftItemsRefs.value, leftItemsComputed.value); calculateCardTransforms(1, rightItemsRefs.value, rightItemsComputed.value); updateArrows() } })
}

function loopCards() {
  if (!props.autoPlay || prefersReducedMotion.value) return
  const maxItems = Math.max(leftItemsComputed.value.length, rightItemsComputed.value.length)
  if (maxItems === 0) return
  currentIndex.value = (currentIndex.value + 1) % maxItems
  gsap.to(tweens.value, { indexPr: currentIndex.value, duration: 1.5, ease: 'power3.inOut', onUpdate: () => { calculateCardTransforms(-1, leftItemsRefs.value, leftItemsComputed.value); calculateCardTransforms(1, rightItemsRefs.value, rightItemsComputed.value) } })
  if (loopDelay.value) loopDelay.value.kill()
  loopDelay.value = gsap.delayedCall(nextItemDuration.value, loopCards)
}

function init() {
  if (typeof window === 'undefined') return
  if (leftItemsComputed.value.length === 0 && rightItemsComputed.value.length === 0) return
  active.value = true
  nextTick(() => { calculateCardTransforms(-1, leftItemsRefs.value, leftItemsComputed.value); calculateCardTransforms(1, rightItemsRefs.value, rightItemsComputed.value); setupTimelines(); if (props.autoPlay && !prefersReducedMotion.value) loopDelay.value = gsap.delayedCall(nextItemDuration.value, loopCards) })
}

function handleItemClick(index: number, dir: number) {
  const items = dir === -1 ? leftItemsComputed.value : rightItemsComputed.value
  const selectedItem = items[index]
  if (!selectedItem) return
  if (prefersReducedMotion.value) { emit('select', selectedItem); return }
  currentIndex.value = index
  gsap.to(tweens.value, { indexPr: index, duration: 1.1, ease: 'power3.inOut', onUpdate: () => { calculateCardTransforms(-1, leftItemsRefs.value, leftItemsComputed.value); calculateCardTransforms(1, rightItemsRefs.value, rightItemsComputed.value) }, onComplete: () => { emit('select', selectedItem) } })
}

function handleKeydown(e: KeyboardEvent) {
  if (prefersReducedMotion.value) return
  const maxItems = Math.max(leftItemsComputed.value.length, rightItemsComputed.value.length)
  if (maxItems === 0) return
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); handleItemClick((currentIndex.value - 1 + maxItems) % maxItems, -1) }
  else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); handleItemClick((currentIndex.value + 1) % maxItems, 1) }
}

watch([() => props.items, () => props.leftItems, () => props.rightItems], () => { if (leftItemsComputed.value.length > 0 || rightItemsComputed.value.length > 0) init() }, { immediate: true })
watch(isDesktop, () => { nextTick(() => { calculateCardTransforms(-1, leftItemsRefs.value, leftItemsComputed.value); calculateCardTransforms(1, rightItemsRefs.value, rightItemsComputed.value) }) })
onMounted(() => { if (leftItemsComputed.value.length > 0 || rightItemsComputed.value.length > 0) init() })
onBeforeUnmount(() => { if (loopDelay.value) loopDelay.value.kill(); active.value = false })
defineExpose({ isMobile, isDesktop })
</script>

<style scoped>
.productShowcase { color: #000; contain: content; display: flex; flex: 0 0 auto; height: 100%; position: relative; width: 100%; }
@media only screen and (max-width: 767px) { .productShowcase { perspective: 500px; } }
.productShowcase__arrowDown, .productShowcase__arrowUp { left: 50%; margin-left: -0.7rem; position: absolute; width: 1.2rem; will-change: transform; z-index: 10; opacity: 0; }
@media only screen and (min-width: 768px) { .productShowcase__arrowDown, .productShowcase__arrowUp { margin-left: -0.8rem; width: 1.6rem; } }
.productShowcase__arrowUp { margin-top: 13rem; top: 50%; transform: rotate(180deg); }
@media only screen and (min-width: 768px) { .productShowcase__arrowUp { margin-top: 22rem; } }
.productShowcase__arrowDown { bottom: 50%; margin-bottom: 13rem; }
@media only screen and (min-width: 768px) { .productShowcase__arrowDown { margin-bottom: 22rem; } }
.productShowcase__section--primary, .productShowcase__section--secondary { align-items: center; display: flex; position: relative; transform-style: preserve-3d; width: 50%; }
@media only screen and (min-width: 768px) { .productShowcase__section--primary, .productShowcase__section--secondary { overflow: hidden; } }
.productShowcase__viewport { contain: layout; height: 20.9589rem; position: relative; transform-style: preserve-3d; width: 100%; }
@media only screen and (min-width: 768px) { .productShowcase__viewport { height: 16.2842rem; perspective: 500px; } }
@media only screen and (min-width: 768px) { .productShowcase__section--primary .productShowcase__viewport { perspective-origin: 100% 50%; } .productShowcase__section--secondary .productShowcase__viewport { perspective-origin: 0% 50%; } }
.productShowcase__section--primary .productShowcase__card { right: 0; }
.productShowcase__section--secondary .productShowcase__card { left: 0; }
.productShowcase__card { aspect-ratio: 219 / 255; backface-visibility: hidden; background-position: 50% center; background-repeat: no-repeat; background-size: cover; position: absolute; transform-style: preserve-3d; width: 18rem; will-change: transform, opacity; cursor: pointer; top: 50%; margin-top: -10.4795rem; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
@media only screen and (min-width: 768px) { .productShowcase__card { width: 13.9805rem; margin-top: -8.1421rem; } }
.productShowcase.reduced-motion .productShowcase__card { transition: transform 0.5s ease, opacity 0.5s ease; }
@media (hover: none) and (pointer: coarse) { .productShowcase__card { touch-action: pan-y; } }
</style>

