<template>
  <div class="home-page-layout">
    <!-- Canvas Three.js Background (100% viewport, z-index basso) -->
    <div 
      class="webgl-viewport canvas-container"
      ref="canvasContainer"
    >
      <canvas 
        ref="canvas"
        data-renderer="webgl"
        class="three-canvas"
      ></canvas>
    </div>

    <!-- Top Navigation (hamburger | navigazione centrale | SIGN IN) - sempre visibile -->
    <nav 
      class="top-navigation"
      :class="{ 
        'scrolled': isScrolled,
        'menu-open': isFullscreenMenuOpen 
      }"
    >
      <div class="nav-content">
        <!-- Hamburger Menu (sinistra) - hidden when menu is open -->
        <button 
          v-show="!isFullscreenMenuOpen"
          class="hamburger-button"
          @click="toggleFullscreenMenu"
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="burger-menu-overlay"
          type="button"
          ref="hamburgerButtonRef"
        >
          <span class="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <!-- Navigation centrale - hidden when menu is open -->
        <nav 
          v-show="!isFullscreenMenuOpen"
          class="center-navigation"
        >
          <a
            v-for="(item, index) in centerNavItems"
            :key="index"
            :href="item.href"
            class="nav-item"
            @click.prevent="handleNavClick(item)"
          >
            {{ item.label }}
          </a>
        </nav>

        <!-- SIGN IN Button (destra) - always visible per AC5 -->
        <button 
          class="sign-in-button"
          :class="{ 'sign-in-button--menu-open': isFullscreenMenuOpen }"
          @click="handleSignInClick"
          aria-label="Sign in"
          type="button"
        >
          SIGN IN
        </button>
      </div>
    </nav>

    <!-- Contenuto principale dinamico - sezioni scrollabili -->
    <div class="dynamic-content">
      <slot />
    </div>

    <!-- Editorial Burger Menu Overlay (Story 2-2) -->
    <BurgerMenuOverlay 
      id="burger-menu-overlay"
      :is-open="isFullscreenMenuOpen"
      @close="closeFullscreenMenu"
      @nav-click="handleMenuNavClick"
      @search="handleMenuSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import BurgerMenuOverlay from '~/components/navigation/BurgerMenuOverlay.vue'
import { useDeviceCapability } from '~/composables/useDeviceCapability'
import { useBreakpoint } from '~/composables/useBreakpoint'

interface NavItem {
  label: string
  href: string
  action?: () => void
  group?: 'primary' | 'user' | 'utilities'
}

// Props
const props = defineProps<{
  centerNavItems?: NavItem[]
}>()

const emit = defineEmits<{
  signInClick: []
  navClick: [item: NavItem]
  menuSearch: [query: string]
}>()

// Device capability detection for performance optimization
const { isMobile } = useBreakpoint()
const { isLowEnd, prefersReducedMotion } = useDeviceCapability()

// Default center navigation items - Homepage sections
// These are scroll anchors to homepage sections, not separate pages
const defaultCenterNavItems: NavItem[] = [
  { label: 'Intro', href: '#intro' },
  { label: 'Best Seller', href: '#collection' },
  { label: 'Footer', href: '#footer' }
]

const centerNavItems = computed(() => props.centerNavItems || defaultCenterNavItems)

// Refs
const canvasContainer = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const hamburgerButtonRef = ref<HTMLButtonElement | null>(null)

// State
const isFullscreenMenuOpen = ref(false)
const isScrolled = ref(false)

// Three.js instances
let THREE: typeof import('three') | null = null
let scene: any = null
let camera: any = null
let renderer: any = null
let animationId: number | null = null
let resizeHandler: (() => void) | null = null

/**
 * Factory function to create WebGL renderer
 */
const createRenderer = (canvasElement: HTMLCanvasElement, width: number, height: number): any => {
  if (!THREE) return null
  const rendererInstance = new THREE.WebGLRenderer({ 
    canvas: canvasElement,
    antialias: true,
    alpha: false
  })
  rendererInstance.setSize(width, height)
  rendererInstance.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  rendererInstance.setClearColor(0xFCFCFC, 1)
  return rendererInstance
}

/**
 * Factory function to create perspective camera
 */
const createCamera = (width: number, height: number): any => {
  if (!THREE) return null
  const cameraInstance = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  cameraInstance.position.z = 5
  return cameraInstance
}

/**
 * Factory function to create scene with lighting
 */
const createScene = (): any => {
  if (!THREE) return null
  const sceneInstance = new THREE.Scene()
  sceneInstance.background = new THREE.Color(0xFCFCFC) // Cream White

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  sceneInstance.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(5, 5, 5)
  sceneInstance.add(directionalLight)

  return sceneInstance
}

/**
 * Initialize Three.js canvas background
 */
const initializeThreeJS = async (): Promise<void> => {
  if (!canvas.value || !canvasContainer.value || typeof window === 'undefined') return

  try {
    THREE = await import('three')
  } catch (error) {
    console.warn('Failed to load Three.js:', error)
    return
  }

  if (!THREE) return

  // Get dimensions
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight

  // Initialize in refactored order: Renderer → Camera → Scene
  renderer = createRenderer(canvas.value, width, height)
  if (!renderer) return

  camera = createCamera(width, height)
  if (!camera) return

  scene = createScene()
  if (!scene) return

  // Geometric shape with different geometry (Sphere instead of Box)
  // Reduce complexity on mobile/low-end devices for performance
  const isMobileDevice = isMobile.value
  const isLowEndDevice = isLowEnd.value
  const shouldReduceComplexity = isMobileDevice || isLowEndDevice || prefersReducedMotion.value
  
  // Reduce geometry complexity on mobile: fewer segments
  const geometrySegments = shouldReduceComplexity ? 16 : 32
  const geometry = new THREE.SphereGeometry(0.5, geometrySegments, geometrySegments)
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xD9BDBB, // Dusty Rose
    opacity: 0.1,
    transparent: true
  })
  
  const mesh = new THREE.Mesh(geometry, material)
  // Scale sphere to approximate BoxGeometry(1,1,1) visual size
  mesh.scale.set(2, 2, 2)
  scene.add(mesh)

  // Animation: Disable 3D rotation on mobile/low-end, use translate/scale only
  // Respect prefers-reduced-motion
  const shouldAnimate = !prefersReducedMotion.value
  const shouldUse3DRotation = shouldAnimate && !isMobileDevice && !isLowEndDevice
  
  const quaternion = new THREE.Quaternion()
  let rotationSpeed = 0.01
  let translateOffset = 0
  let translateDirection = 1

  // Animation loop with conditional rotation/translation
  const animate = (): void => {
    if (!scene || !camera || !renderer) return

    animationId = requestAnimationFrame(animate)
    
    if (shouldAnimate) {
      if (shouldUse3DRotation) {
        // Desktop: Full 3D rotation
        const axis = new THREE.Vector3(0.1, 0.2, 0).normalize()
        quaternion.setFromAxisAngle(axis, rotationSpeed)
        mesh.quaternion.multiplyQuaternions(quaternion, mesh.quaternion)
      } else {
        // Mobile/low-end: Simple translate/scale only (no 3D rotation)
        translateOffset += 0.005 * translateDirection
        if (Math.abs(translateOffset) > 0.1) {
          translateDirection *= -1
        }
        mesh.position.x = translateOffset
        mesh.position.y = translateOffset * 0.5
      }
    }
    
    renderer.render(scene, camera)
  }

  animate()

  // Handle resize
  resizeHandler = (): void => {
    if (!canvasContainer.value || !camera || !renderer) return
    const width = canvasContainer.value.clientWidth
    const height = canvasContainer.value.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  window.addEventListener('resize', resizeHandler)
}

/**
 * Cleanup Three.js
 */
const cleanupThreeJS = (): void => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  if (resizeHandler && typeof window !== 'undefined') {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }

  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  scene = null
  camera = null
  THREE = null
}

/**
 * Scroll handler per mostrare background sulla nav durante lo scroll
 */
const handleScroll = (): void => {
  if (typeof window === 'undefined') return
  const scrollY = window.scrollY || window.pageYOffset
  isScrolled.value = scrollY > 10 // Mostra background dopo 10px di scroll
}

/**
 * Menu handlers
 */
const toggleFullscreenMenu = (): void => {
  isFullscreenMenuOpen.value = !isFullscreenMenuOpen.value
}

const closeFullscreenMenu = (): void => {
  isFullscreenMenuOpen.value = false
}

const handleSignInClick = (): void => {
  emit('signInClick')
}

const handleNavClick = (item: NavItem) => {
  if (item.action) {
    item.action()
  }
  emit('navClick', item)
}

/**
 * Handle navigation click from BurgerMenuOverlay
 */
const handleMenuNavClick = (item: NavItem) => {
  // Close the menu first
  closeFullscreenMenu()
  // Emit nav click event
  emit('navClick', item)
}

/**
 * Handle search from BurgerMenuOverlay
 */
const handleMenuSearch = (query: string) => {
  emit('menuSearch', query)
  // Could also navigate to search results page
  // navigateTo(`/search?q=${encodeURIComponent(query)}`)
}

onMounted(() => {
  // Listen to scroll events per mostrare background sulla nav
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial scroll position
  }
  
  nextTick(() => {
    initializeThreeJS().catch(error => {
      console.warn('Failed to initialize Three.js:', error)
    })
  })
})

onBeforeUnmount(() => {
  // Remove scroll listener
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
  }
  
  cleanupThreeJS()
})
</script>

<style scoped>
.home-page-layout {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

/* Canvas Three.js Background (100% viewport, z-index basso) */
.webgl-viewport {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* Dietro tutto */
  pointer-events: none;
  touch-action: none;
}

.three-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* Top Navigation - sempre visibile durante lo scroll */
.top-navigation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: var(--spacing-md) var(--spacing-lg);
  pointer-events: none;
  transition: background-color 0.3s ease, backdrop-filter 0.3s ease;
  background-color: transparent;
}

/* Background semi-trasparente quando si scrolla */
.top-navigation.scrolled {
  background-color: rgba(252, 252, 252, 0.95); /* Cream White con opacità */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* When burger menu is open - SignIn stays visible above overlay */
.top-navigation.menu-open {
  z-index: 10001; /* Above the menu overlay for SignIn button */
  background-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
  pointer-events: none; /* Allow clicks to pass through to menu */
}

.top-navigation.menu-open .nav-content {
  justify-content: flex-end; /* Push SignIn to the right */
  pointer-events: none; /* Allow clicks to pass through */
}

.top-navigation.menu-open .sign-in-button {
  pointer-events: auto; /* Only SignIn button is clickable */
  z-index: 10002; /* Ensure SignIn is above everything */
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
  margin: 0 auto;
  pointer-events: auto;
  width: 100%;
  gap: var(--spacing-lg);
}

/* Hamburger Menu (sinistra) */
.hamburger-button {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  color: var(--color-primary-ink);
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hamburger-button:hover {
  opacity: 0.7;
}

.hamburger-button:focus {
  outline: 2px solid var(--color-border-strong);
  outline-offset: 2px;
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 24px;
  height: 18px;
}

.hamburger-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--color-primary-ink);
  transition: all 0.2s ease;
}

/* Center Navigation (centro) */
.center-navigation {
  display: flex;
  gap: var(--spacing-xl);
  align-items: center;
  flex: 1;
  justify-content: center;
  padding: 0 var(--spacing-lg);
}

.nav-item {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-primary-ink);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: opacity 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
}

.nav-item:hover {
  opacity: 0.7;
}

.nav-item:focus {
  outline: 2px solid var(--color-border-strong);
  outline-offset: 2px;
}

/* SIGN IN Button (destra) */
.sign-in-button {
  background: none;
  border: 1px solid var(--color-primary-ink);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-primary-ink);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.2s ease;
  will-change: transform, background-color;
  flex-shrink: 0;
}

.sign-in-button:hover {
  background-color: var(--color-primary-ink);
  color: var(--color-bg-base);
  transform: translate3d(0, -2px, 0);
}

.sign-in-button:focus {
  outline: 2px solid var(--color-border-strong);
  outline-offset: 2px;
}

/* SignIn button when menu is open - positioned at top right, aligned with search bar */
.sign-in-button--menu-open {
  position: relative;
  z-index: 10002; /* Above menu overlay */
  /* Aligned with search container padding */
  margin: 0;
}

/* Dynamic Content - container per sezioni scrollabili */
.dynamic-content {
  position: relative;
  z-index: 10;
  width: 100%;
  /* Rimuove il centering per permettere sezioni multiple scrollabili */
  display: block;
  padding: 0;
}

/* Responsive Design */
@media (max-width: 1023px) {
  .center-navigation {
    gap: var(--spacing-lg);
    padding: 0 var(--spacing-md);
  }
  
  .nav-item {
    font-size: 11px;
  }
}

@media (max-width: 767px) {
  .top-navigation {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  /* Nascondere navigazione centrale su mobile */
  .center-navigation {
    display: none;
  }

  .nav-content {
    justify-content: space-between;
  }
  
  /* Touch target compliance: minimum 44x44px on mobile */
  .hamburger-button {
    min-width: 44px;
    min-height: 44px;
    padding: 12px; /* Ensure 44x44px touch target */
  }
  
  .sign-in-button {
    min-width: 44px;
    min-height: 44px;
    padding: 12px 16px; /* Ensure 44x44px touch target */
  }
  
  /* Dynamic content non ha più padding fisso, le sezioni gestiscono il proprio padding */
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .top-navigation,
  .hamburger-icon span,
  .nav-item,
  .sign-in-button {
    transition: none;
  }
}
</style>

