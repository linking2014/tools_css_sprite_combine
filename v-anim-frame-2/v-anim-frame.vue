<template>
  <div
    class="frame_wrap"
    :class="{
      frame_end: status === 'end',
      frame_ending: status === 'ending',
      frame_stop: infiniteNumber === 0,
      'anim-reverse': props.reverse,
      'anim-normal': !props.reverse,
    }"
    :style="wrapStyle"
    ref="elRef"
    @animationend="onAnimEnd"
    @animationiteration="onAnimIteration"
  />
</template>

<script setup>
import {computed, reactive, toRefs, watch, ref} from 'vue'

const props = defineProps({
  reverse: { type: Boolean, default: false },
  unit: { type: String, default: 'px' }, // web 推荐 px/vmin
  pause: { type: Boolean, default: false },
  url: { type: String, default: '' },
  count: { type: [Number, String], default: 0 },
  width: { type: [Number, String], default: 0 },
  height: { type: [Number, String], default: 0 },
  duration: { type: [Number, String], default: 0 }, // 单帧时长（秒）
  loop: { type: [Number, String], default: 'infinite' },
  pointerEvents: { type: String, default: 'auto' },
})

const emit = defineEmits(['animend','animiteration'])

const status = ref('')
const iterationCount = ref(0)
const elRef = ref(null)

const numeric = (v, d=0) => {
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? n : d
}

const widthNum = computed(() => numeric(props.width))
const heightNum = computed(() => numeric(props.height))
const countNum = computed(() => Math.max(0, numeric(props.count)))
const durationNum = computed(() => Math.max(0, numeric(props.duration)))
const loopVal = computed(() => props.loop)

const infiniteNumber = computed(() => {
  if (String(loopVal.value) === 'infinite') return Infinity
  const n = numeric(loopVal.value, 0)
  return n
})

watch(() => props.loop, (val) => {
  if (String(val) === 'infinite') {
    status.value = ''
    iterationCount.value = 0
  } else {
    status.value = 'ending'
  }
})

function vmin(px) {
  const size = (Number(px) * 2) / 7.5
  return Number.isFinite(size) ? `${size}vmin` : '0vmin'
}

const unitValue = (n) => {
  if (props.unit === 'rpx') {
    // 近似: 1rpx ~ (2/7.5)vmin。web 无 rpx，做近似支持
    return vmin(n)
  }
  if (props.unit === 'vmin') return `${n}vmin`
  return `${n}px`
}

const wrapStyle = computed(() => ({
  backgroundImage: props.url ? `url(${props.url})` : 'none',
  pointerEvents: props.pointerEvents,
  '--animPause': props.pause ? 'paused' : 'running',
  '--animName': props.reverse ? 'animFrameReverse' : 'animFrame',
  '--width': unitValue(widthNum.value),
  '--height': unitValue(heightNum.value),
  '--count': String(countNum.value),
  '--duration': String(durationNum.value),
  '--loop': String(loopVal.value),
  '--steps': String(Math.max(1, countNum.value - 1)),
}))

function restartAnimation() {
  status.value = ''
  iterationCount.value = 0
  const el = elRef.value
  if (!el) return
  try {
    el.style.animation = 'none'
    void el.offsetHeight
    el.style.animation = ''
  } catch (_) {}
}

watch([
  () => props.duration,
  () => props.count,
  () => props.reverse,
  () => props.loop,
  () => props.url,
  () => props.width,
  () => props.height,
], () => {
  if (!props.pause) restartAnimation()
})

function onAnimEnd() {
  status.value = 'end'
  iterationCount.value = 0
  emit('animend', { data: iterationCount.value })
}

function onAnimIteration() {
  iterationCount.value += 1
  emit('animiteration', { data: iterationCount.value })
}
</script>

<style>
@keyframes animFrame {
  from { background-position-x: 0; }
  to { background-position-x: calc(var(--width) * (var(--count) - 1) * -1); }
}

@keyframes animFrameReverse {
  from { background-position-x: calc(var(--width) * (var(--count) - 1) * -1); }
  to { background-position-x: 0; }
}
</style>

<style scoped>
.frame_wrap {
  width: var(--width);
  height: var(--height);
  background-position: 0 0;
  background-size: calc(var(--width) * var(--count)) var(--height);
  /* 拆分 animation 以避免与类名切换冲突 */
  animation-duration: calc(var(--duration) * 1s);
  animation-timing-function: steps(var(--steps), start);
  animation-iteration-count: var(--loop);
  animation-play-state: var(--animPause) !important;
  animation-fill-mode: forwards !important;
  transition: opacity 300ms;
}

.frame_wrap.anim-normal { animation-name: animFrame; }
.frame_wrap.anim-reverse { animation-name: animFrameReverse; }

.frame_wrap.frame_end {
  animation-play-state: paused !important;
}

.frame_wrap.frame_stop {
  animation: none;
}

.frame_wrap.frame_ending {
  pointer-events: none !important;
}
</style>


