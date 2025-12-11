<template>
  <Teleport to="body">
    <Transition name="loading-sequence">
      <div 
        v-if="show" 
        class="loading-sequence"
        :class="{ 'reduced-motion': prefersReducedMotion, 'brand-reveal-active': showBrandReveal }"
        :style="{ '--cursor-x': `${cursorX}px`, '--cursor-y': `${cursorY}px` }"
      >
        <!-- White screen background -->
        <div class="loading-background"></div>

        <!-- Loading HUD Container -->
        <div class="loading-hud">
          <!-- Progress Bar with Details - Refactored structure -->
          <div class="loader-container">
            <div class="progress-tracker">
              <div 
                class="progress-fill" 
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
            
            <!-- Status Panel: Primary Info and Secondary Info -->
            <div class="status-panel">
              <!-- Primary Info: Loading Label with Percentage -->
              <div class="primary-info">
                <img 
                  class="status-icon" 
                  src="/loading-triangles.svg" 
                  alt=""
                  aria-hidden="true"
                />
                <div class="status-label">LOADING - {{ progress }}%</div>
              </div>
              
              <!-- Secondary Info: Animated Terms -->
              <div class="secondary-info desktop-only">
                <Transition name="fade" mode="out-in">
                  <div 
                    :key="currentTermIndex"
                    class="term-display"
                  >
                    <div class="term-text">{{ animatedTerms[currentTermIndex] }}</div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <!-- Audio Enable Button - Refactored structure -->
          <div 
            class="audio-control"
            :style="{ transform: `translate3d(${mouseX}px, ${mouseY}px, 0)` }"
          >
            <div class="control-wrapper">
              <!-- Ring SVG - Desktop -->
              <img 
                class="desktop-only" 
                src="/loading-audio-cta-ring.svg" 
                alt=""
                aria-hidden="true"
              />
              <!-- Ring SVG - Mobile -->
              <img 
                class="mobile-only" 
                src="/loading-audio-cta-ring-m.svg" 
                alt=""
                aria-hidden="true"
              />
              <!-- Audio Button -->
              <button 
                class="audio-button"
                @click="handleAudioEnable"
                aria-label="Click to enable audio"
              >
                <div class="audio-line"></div>
                <div class="audio-line"></div>
                <div class="audio-line"></div>
                <div class="audio-line"></div>
                <div class="audio-line"></div>
              </button>
              <!-- Label Text -->
              <div class="audio-label">Click to enable sound</div>
            </div>
          </div>
        </div>

        <!-- Brand Reveal Animation - CSS-based instead of GSAP -->
        <div 
          v-if="showBrandReveal"
          class="brand-reveal"
        >
          <div class="brand-reveal-content">
            <h1 class="brand-name">d3mo</h1>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  complete: []
}>()

// Composables
const { progress: progressComputed, isComplete: isCompleteComputed, startTracking, reset: resetProgress } = useLoadingProgress()

// Unwrap computed values for template use
const progress = computed(() => progressComputed.value)
const isComplete = computed(() => isCompleteComputed.value)

// State
const showBrandReveal = ref(false)
const prefersReducedMotion = ref(false)
const currentTermIndex = ref(0)
const startTime = ref<number | null>(null)
const MIN_DISPLAY_DURATION = 3500 // Minimum 3.5 seconds display time (ensures brand reveal is visible)
const mouseX = ref(0)
const mouseY = ref(0)
const cursorX = ref(0)
const cursorY = ref(0)

// Animated terms for scrolling
const animatedTerms = [
  'LOADING',
  'PREPARING',
  'INITIALIZING',
  'CONNECTING',
  'SYNCHRONIZING',
  'OPTIMIZING',
  'READY'
]

// Terms animation using requestAnimationFrame instead of setInterval
let termsAnimationFrame: number | null = null
let lastTermSwitch = 0
const TERM_SWITCH_INTERVAL = 800

/**
 * Detect prefers-reduced-motion preference
 */
const detectReducedMotion = (): void => {
  if (typeof window === 'undefined') return
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = mediaQuery.matches

  // Listen for changes
  const handleChange = (e: MediaQueryListEvent) => {
    prefersReducedMotion.value = e.matches
  }
  mediaQuery.addEventListener('change', handleChange)
}

/**
 * Animate terms - using requestAnimationFrame instead of setInterval
 */
const animateTerms = (): void => {
  if (prefersReducedMotion.value) {
    // Show static term when reduced motion
    currentTermIndex.value = 0
    return
  }

  // Clear any existing animation frame
  if (termsAnimationFrame !== null) {
    cancelAnimationFrame(termsAnimationFrame)
  }

  let termIndex = 0
  lastTermSwitch = Date.now()
  
  const animate = (): void => {
    const now = Date.now()
    if (now - lastTermSwitch >= TERM_SWITCH_INTERVAL) {
      currentTermIndex.value = termIndex
      termIndex = (termIndex + 1) % animatedTerms.length
      lastTermSwitch = now
    }
    termsAnimationFrame = requestAnimationFrame(animate)
  }
  
  // Initial term
  currentTermIndex.value = 0
  termsAnimationFrame = requestAnimationFrame(animate)
}

/**
 * Handle audio enable button click
 */
const handleAudioEnable = (): void => {
  // Placeholder for audio enable functionality
  // Can be implemented in future story
  console.log('Audio enable clicked')
}

/**
 * Handle mouse movement - Refactored: normalized algorithm instead of pixel offset
 * Uses normalized 0-1 range with max offset calculation
 */
const handleMouseMove = (e: MouseEvent): void => {
  if (prefersReducedMotion.value) return
  
  // Normalize mouse position to -1 to 1 range
  const normalizedX = (e.clientX / window.innerWidth) * 2 - 1
  const normalizedY = (e.clientY / window.innerHeight) * 2 - 1
  
  // Calculate max offset (30% of smaller viewport dimension)
  const maxOffset = Math.min(window.innerWidth, window.innerHeight) * 0.3
  
  // Apply normalized offset
  mouseX.value = normalizedX * maxOffset
  mouseY.value = normalizedY * maxOffset
  
  // Track cursor position for custom cursor (using CSS custom properties)
  cursorX.value = e.clientX
  cursorY.value = e.clientY
}

/**
 * Start brand reveal animation - Refactored: CSS animations instead of GSAP
 */
const startBrandReveal = (): void => {
  showBrandReveal.value = true

  // Calculate remaining time to ensure minimum display duration
  const elapsed = startTime.value ? Date.now() - startTime.value : 0
  const remainingTime = Math.max(0, MIN_DISPLAY_DURATION - elapsed)

  if (prefersReducedMotion.value) {
    // Skip animation, just show and transition
    // But ensure minimum display duration for brand reveal visibility
    setTimeout(() => {
      completeLoading()
    }, Math.max(1500, remainingTime))
    return
  }

  // CSS animation will handle the reveal (800ms)
  // Ensure brand reveal is visible for at least 1500ms after animation completes
  const animationDuration = 800
  const minDisplayAfterAnimation = 1500
  
  // Calculate wait time to ensure brand reveal is visible for minDisplayAfterAnimation
  // after the CSS animation completes (which starts when showBrandReveal becomes true)
  // Total time needed: animationDuration + minDisplayAfterAnimation
  const totalBrandRevealTime = animationDuration + minDisplayAfterAnimation
  
  // Wait for the full brand reveal duration (animation + display)
  setTimeout(() => {
    completeLoading()
  }, totalBrandRevealTime)
}

/**
 * Complete loading sequence
 */
const completeLoading = (): void => {
  // Cleanup
  cleanup()
  
  // Emit complete event
  emit('complete')
}

/**
 * Cleanup resources
 */
const cleanup = (): void => {
  // Clear terms animation frame
  if (termsAnimationFrame !== null) {
    cancelAnimationFrame(termsAnimationFrame)
    termsAnimationFrame = null
  }

  // Reset progress
  resetProgress()
}

// Watch for progress completion
watch(isComplete, (newValue) => {
  if (newValue && props.show) {
    startBrandReveal()
  }
})

// Watch for show prop changes
watch(() => props.show, (newValue) => {
  if (newValue) {
    // Record start time for minimum display duration
    startTime.value = Date.now()
    
    // Start tracking progress
    startTracking()
    
    // Add mouse move listener for audio button tracking
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove)
    }
    
    nextTick(() => {
      animateTerms()
    })
  } else {
    cleanup()
    startTime.value = null
    
    // Remove mouse move listener
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleMouseMove)
    }
    
    // Reset mouse position
    mouseX.value = 0
    mouseY.value = 0
    cursorX.value = 0
    cursorY.value = 0
  }
})

onMounted(() => {
  detectReducedMotion()
  
  if (props.show) {
    // Record start time for minimum display duration
    startTime.value = Date.now()
    
    // Add mouse move listener for audio button tracking
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove)
    }
    
    startTracking()
    nextTick(() => {
      animateTerms()
    })
  }
})

onBeforeUnmount(() => {
  cleanup()
  
  // Remove mouse move listener
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<style scoped>
.loading-sequence {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: none;
}

.loading-sequence::before {
  content: '';
  position: fixed;
  left: var(--cursor-x, 0);
  top: var(--cursor-y, 0);
  width: 6px;
  height: 6px;
  background-color: var(--color-primary-ink);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  will-change: transform;
  mix-blend-mode: difference;
  opacity: 0.8;
}

.loading-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #FCFCFC; /* Cream White - bg/base */
  z-index: 1;
}

.loading-hud {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 600px;
  padding: var(--spacing-xl);
}

/* Progress Tracker - Refactored: width percentage instead of scaleX */
.progress-tracker {
  width: 100%;
  height: 2px;
  background-color: var(--color-neutral-surface);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  width: 0%;
  background-color: var(--color-primary-ink);
  transition: width 0.1s linear;
}

.loading-sequence.reduced-motion .progress-fill {
  transition: none;
}

/* Loader Container - Refactored structure */
.loader-container {
  position: relative;
  width: 100%;
}

/* Status Panel - Refactored structure */
.status-panel {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin-top: 8px;
}

.status-panel .primary-info {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
}

.status-panel .primary-info .status-icon {
  width: 16px;
  height: 16px;
  display: block;
  flex-shrink: 0;
}

.status-panel .primary-info .status-label {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-primary-ink);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1;
}

.status-panel .secondary-info {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
}

.status-panel .secondary-info .term-display {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-primary-ink);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1;
  white-space: nowrap;
}

.status-panel .secondary-info .term-display .term-text {
  opacity: 0.7;
}

/* Fade transition for terms */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Audio Control - Refactored structure */
.audio-control {
  position: absolute;
  left: 50%;
  top: 50%;
  will-change: transform;
  z-index: 3;
  pointer-events: auto;
  transform: translate(-50%, -50%);
}

.audio-control .control-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 59px;
  height: 59px;
}

.audio-control .control-wrapper img {
  position: absolute;
  width: 59px;
  height: 59px;
  pointer-events: none;
  top: 0;
  left: 0;
}

.audio-control .control-wrapper .desktop-only {
  display: block;
}

.audio-control .control-wrapper .mobile-only {
  display: none;
}

@media (max-width: 767px) {
  .audio-control .control-wrapper .desktop-only {
    display: none;
  }
  
  .audio-control .control-wrapper .mobile-only {
    display: block;
  }
}

/* Audio Button - Refactored naming */
.audio-button {
  position: relative;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  z-index: 2;
}

.audio-button .audio-line {
  width: 2px;
  height: 16px;
  background-color: var(--color-primary-ink);
  transform-origin: center;
  transform: scale(1, 0.2);
  transition: transform 0.1s ease;
}

.audio-button:hover .audio-line {
  transform: scale(1, 0.5);
}

/* Animate lines on hover/interaction */
.audio-button:hover .audio-line:nth-child(1) {
  animation: audioLine1 0.6s ease-in-out infinite;
}

.audio-button:hover .audio-line:nth-child(2) {
  animation: audioLine2 0.6s ease-in-out infinite;
}

.audio-button:hover .audio-line:nth-child(3) {
  animation: audioLine3 0.6s ease-in-out infinite;
}

.audio-button:hover .audio-line:nth-child(4) {
  animation: audioLine4 0.6s ease-in-out infinite;
}

.audio-button:hover .audio-line:nth-child(5) {
  animation: audioLine5 0.6s ease-in-out infinite;
}

@keyframes audioLine1 {
  0%, 100% { transform: scale(1, 0.2); }
  50% { transform: scale(1, 0.8); }
}

@keyframes audioLine2 {
  0%, 100% { transform: scale(1, 0.3); }
  50% { transform: scale(1, 0.9); }
}

@keyframes audioLine3 {
  0%, 100% { transform: scale(1, 0.4); }
  50% { transform: scale(1, 1); }
}

@keyframes audioLine4 {
  0%, 100% { transform: scale(1, 0.35); }
  50% { transform: scale(1, 0.95); }
}

@keyframes audioLine5 {
  0%, 100% { transform: scale(1, 0.25); }
  50% { transform: scale(1, 0.85); }
}

.audio-button:focus {
  outline: 2px solid var(--color-border-strong);
  outline-offset: 2px;
}

/* Audio Label - Refactored naming */
.audio-control .audio-label {
  position: absolute;
  top: 100%;
  margin-top: 10px;
  width: 59px;
  font-family: var(--font-secondary);
  font-size: 5px;
  color: var(--color-primary-ink);
  text-transform: none;
  letter-spacing: -0.02em;
  text-align: center;
  white-space: nowrap;
  line-height: 1.2;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  overflow: visible;
}

/* Brand Reveal - CSS animations instead of GSAP */
.brand-reveal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FCFCFC;
}

.brand-reveal-content {
  text-align: center;
  opacity: 0;
  transform: scale(0.8);
  animation: brandRevealAnimation 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.loading-sequence.brand-reveal-active .brand-reveal-content {
  animation-play-state: running;
}

@keyframes brandRevealAnimation {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.brand-name {
  font-family: var(--font-primary);
  font-size: var(--font-size-h1);
  color: var(--color-primary-ink);
  font-weight: 700;
  margin: 0;
}

/* Reduced Motion Support */
.loading-sequence.reduced-motion .brand-reveal-content {
  animation: none;
  opacity: 1;
  transform: scale(1);
}

/* Transitions */
.loading-sequence-enter-active,
.loading-sequence-leave-active {
  transition: opacity 0.3s ease;
}

.loading-sequence-enter-from,
.loading-sequence-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .loading-sequence-enter-active,
  .loading-sequence-leave-active {
    transition: none;
  }
  
  .brand-reveal-content {
    animation: none;
    opacity: 1;
    transform: scale(1);
  }
}
</style>
