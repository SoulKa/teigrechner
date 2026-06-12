<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import onionSlice from '@/image/onion-slice.png'

const props = defineProps<{
  pizzaCount: number
  emoji?: string
  enabled?: boolean
}>()

interface Snowflake {
  id: number
  left: number
  top: number
  animationDuration: number
  fontSize: number
  opacity: number
  rotation: number
  emoji: string
  flipping: boolean
}

interface Particle {
  id: number
  x: number
  y: number
  angle: number
  distance: number
  size: number
  color: string
  image?: string
  emoji?: string
  spin?: number
  initialRotation?: number
  duration?: number
}

const snowflakes = ref<Snowflake[]>([])
const particles = ref<Particle[]>([])
let nextId = 0
let intervalId: number | undefined

const createSnowflake = () => {
  if (props.enabled === false) return
  if (snowflakes.value.length >= props.pizzaCount * 8) {
    return
  }

  const snowflake: Snowflake = {
    id: nextId++,
    left: Math.random() * 100,
    top: -50,
    animationDuration: 5 + Math.random() * 10, // 5-15 seconds
    fontSize: 20 + Math.random() * 30, // 20-50px
    opacity: 0.6 + Math.random() * 0.4, // 0.6-1.0
    rotation: Math.random() * 360,
    emoji: props.emoji ?? '🍕',
    flipping: false,
  }
  snowflakes.value.push(snowflake)

  // Remove snowflake after animation completes
  setTimeout(() => {
    const index = snowflakes.value.findIndex((s) => s.id === snowflake.id)
    if (index > -1) {
      snowflakes.value.splice(index, 1)
    }
  }, snowflake.animationDuration * 1000)
}

const FLIP_DURATION = 400

watch(
  () => props.emoji,
  (newEmoji) => {
    snowflakes.value.forEach((s) => {
      s.flipping = true
    })
    setTimeout(() => {
      snowflakes.value.forEach((s) => {
        s.emoji = newEmoji ?? '🍕'
      })
    }, FLIP_DURATION / 2)
    setTimeout(() => {
      snowflakes.value.forEach((s) => {
        s.flipping = false
      })
    }, FLIP_DURATION)
  },
)

onMounted(() => {
  // Create snowflakes every 300ms
  intervalId = window.setInterval(createSnowflake, 300)
})

onUnmounted(() => {
  clearInterval(intervalId)
  intervalId = undefined
})

const explodePizza = (event: MouseEvent, snowflake: Snowflake) => {
  // Get click position
  const x = event.clientX
  const y = event.clientY

  // Remove pizza immediately
  const index = snowflakes.value.findIndex((s) => s.id === snowflake.id)
  if (index > -1) {
    snowflakes.value.splice(index, 1)
  }

  if (snowflake.emoji === '🧅') {
    const sliceCount = 8 + Math.floor(Math.random() * 6) // 8-13 slices
    for (let i = 0; i < sliceCount; i++) {
      const angle = (Math.PI * 2 * i) / sliceCount + (Math.random() - 0.5) * 0.3
      particles.value.push({
        id: nextId++,
        x,
        y,
        angle,
        distance: 100 + Math.random() * 80,
        size: 20 + Math.random() * 16, // 20-36px
        color: '',
        image: onionSlice,
        spin: (Math.random() - 0.5) * 720,
      })
    }
    setTimeout(() => {
      const cutoff = nextId - sliceCount
      particles.value = particles.value.filter((p) => p.id >= cutoff || p.image !== onionSlice)
    }, 1000)
  } else {
    const sliceCount = 6
    for (let i = 0; i < sliceCount; i++) {
      const angle = (i * 60 - 90) * (Math.PI / 180)
      particles.value.push({
        id: nextId++,
        x,
        y,
        angle,
        distance: 80 + Math.random() * 100,
        size: 28,
        color: '',
        emoji: '🍕',
        initialRotation: i * 60,
        spin: (Math.random() - 0.5) * 540,
        duration: 0.7 + Math.random() * 0.8,
      })
    }
    setTimeout(() => {
      const cutoff = nextId - sliceCount
      particles.value = particles.value.filter((p) => p.id >= cutoff)
    }, 1500)
  }
}
</script>

<template>
  <div class="pizza-snow">
    <div
      v-for="snowflake in snowflakes"
      :key="snowflake.id"
      class="pizza"
      :style="{
        left: `${snowflake.left}%`,
        animationDuration: `${snowflake.animationDuration}s`,
        fontSize: `${snowflake.fontSize}px`,
        opacity: snowflake.opacity,
        transform: `rotate(${snowflake.rotation}deg)`,
      }"
      @click="(e) => explodePizza(e, snowflake)"
    >
      <div
        v-if="snowflake.emoji === '🍕'"
        class="emoji pizza-wheel"
        :class="{ flipping: snowflake.flipping }"
      >
        <span
          v-for="i in 6"
          :key="i"
          class="pizza-slice"
          :style="{ transform: `rotate(${(i - 1) * 60}deg)` }"
          >🍕</span
        >
      </div>
      <span v-else class="emoji" :class="{ flipping: snowflake.flipping }">{{
        snowflake.emoji
      }}</span>
    </div>
    <template v-for="particle in particles" :key="particle.id">
      <img
        v-if="particle.image"
        class="particle particle-image"
        :src="particle.image"
        :style="{
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          '--angle': `${particle.angle}rad`,
          '--distance': `${particle.distance}px`,
          '--spin': `${particle.spin ?? 0}deg`,
        }"
      />
      <span
        v-else-if="particle.emoji"
        class="particle particle-emoji"
        :style="{
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          fontSize: `${particle.size}px`,
          '--angle': `${particle.angle}rad`,
          '--distance': `${particle.distance}px`,
          '--spin': `${particle.spin ?? 0}deg`,
          '--initial-rotation': `${particle.initialRotation ?? 0}deg`,
          '--duration': particle.duration ? `${particle.duration}s` : '1s',
        }"
        >{{ particle.emoji }}</span
      >
      <div
        v-else
        class="particle"
        :style="{
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          backgroundColor: particle.color,
          '--angle': `${particle.angle}rad`,
          '--distance': `${particle.distance}px`,
        }"
      />
    </template>
  </div>
</template>

<style scoped>
.pizza-snow {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 9999;
  pointer-events: none;
}

.pizza {
  position: absolute;
  top: -50px;
  animation: fall linear forwards;
  user-select: none;
  cursor: pointer;
  pointer-events: auto;
  transition: filter 0.1s;
}

.pizza:hover {
  filter: brightness(1.2);
}

.emoji {
  display: inline-block;
}

.pizza-wheel {
  display: inline-grid;
}

.pizza-slice {
  grid-area: 1 / 1;
  display: inline-block;
  transform-origin: 70% 80%;
  font-size: 0.6em;
}

.emoji.flipping {
  animation: emoji-flip v-bind('FLIP_DURATION + "ms"') linear forwards;
}

@keyframes emoji-flip {
  0% {
    transform: scaleX(1);
  }
  40% {
    transform: scaleX(0);
  }
  60% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

.particle {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  animation: burst 0.8s ease-out forwards;
}

.particle-image {
  border-radius: 0;
  background: none;
  animation: burst-image 1s ease-out forwards;
}

.particle-emoji {
  position: fixed;
  pointer-events: none;
  line-height: 1;
  animation: burst-emoji var(--duration, 1s) ease-out forwards;
}

@keyframes burst-emoji {
  0% {
    transform: translate(0, 0) rotate(var(--initial-rotation));
    opacity: 1;
  }
  100% {
    transform: translate(
        calc(cos(var(--angle)) * var(--distance)),
        calc(sin(var(--angle)) * var(--distance))
      )
      rotate(calc(var(--initial-rotation) + var(--spin)));
    opacity: 0;
  }
}

@keyframes burst-image {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(
        calc(cos(var(--angle)) * var(--distance)),
        calc(sin(var(--angle)) * var(--distance))
      )
      scale(0.4) rotate(var(--spin));
    opacity: 0;
  }
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(720deg);
  }
}

@keyframes burst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(
        calc(cos(var(--angle)) * var(--distance)),
        calc(sin(var(--angle)) * var(--distance))
      )
      scale(0);
    opacity: 0;
  }
}
</style>
