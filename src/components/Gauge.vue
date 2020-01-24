<template>
  <div class="gauge">
    <div class="gauge-container" ref="wrapper">
      <svg id="meter">
        <path :d="this.first" fill="none" stroke="#D0D0D0" stroke-width="8" />
        <path :d="this.second" fill="none" stroke="#E6C6D6" stroke-width="8" />
        <path :d="this.third" fill="none" stroke="#E2007A" stroke-width="8" />
        <text :x="maxLabel.x" :y="maxLabel.y" class="gauge-limit">{{ max }}%</text>
        <text :x="minLabel.x" :y="minLabel.y" class="gauge-limit">{{ min }}%</text>
        <text :x="intermediateMinLabel.x" :y="intermediateMinLabel.y" class="gauge-limit">
          {{ Math.round(intermediateMin) }}%</text>
        <text :x="intermediateMaxLabel.x" :y="intermediateMaxLabel.y" class="gauge-limit">
          {{ Math.round(intermediateMax) }}%
        </text>
      </svg>
      <img id="meter_needle" src="~assets/gauge-needle.svg" alt="" :style="`transform: rotate(${needleAngle}deg)`">
    </div>
    <div class="gauge-title text-weight-bold">
      {{ title }} ({{ roundFrenchPercentage(value, 2) }})
    </div>
  </div>
</template>

<script>
import { roundFrenchPercentage } from '../helpers/utils';

export default {
  name: 'Gauge',
  props: {
    max: { type: Number, default: 15 },
    min: { type: Number, default: 5 },
    value: { type: Number, default: 7.5 },
    title: { type: String, default: '' },
  },
  data () {
    return {
      radius: 70,
    };
  },
  computed: {
    reference () {
      return (this.max + this.min) / 2;
    },
    range () {
      return this.max - this.reference;
    },
    intermediateMin () {
      return this.min + (this.max - this.min) / 3;
    },
    intermediateMax () {
      return this.max - (this.max - this.min) / 3;
    },
    needleAngle () {
      return (this.reference - Math.max(Math.min(this.value, this.max), this.min)) / this.range * 90;
    },
    minLabel () {
      return { x: 2 * this.radius + 5, y: this.radius };
    },
    intermediateMaxLabel () {
      return { x: this.radius / 2 - 23, y: this.radius * (1 - Math.sqrt(3) / 2) };
    },
    intermediateMinLabel () {
      return { x: this.radius * 3 / 2 + 7, y: this.radius * (1 - Math.sqrt(3) / 2) };
    },
    maxLabel () {
      return { x: -21, y: this.radius };
    },
    first () {
      const origin = `0,${this.radius}`;
      const control = `0,${-this.radius / Math.sqrt(3)}`;
      const end = `${this.radius / 2},${-this.radius * Math.sqrt(3) / 2}`;
      return `M${origin} q${control} ${end}`
    },
    second () {
      const origin = `${this.radius / 2},${this.radius * (1 - Math.sqrt(3) / 2)}`;
      const control = `${this.radius / 2},${-this.radius * (Math.sqrt(3) / 6)}`;
      const end = `${this.radius},0`;
      return `M${origin} q${control} ${end}`
    },
    third () {
      const origin = `${this.radius * 2},${this.radius}`;
      const control = `0,${-this.radius / Math.sqrt(3)}`;
      const end = `${-this.radius / 2},${-this.radius * Math.sqrt(3) / 2}`;
      return `M${origin} q${control} ${end}`
    },
  },
  mounted () {
    this.setWrapperDimensions();
  },
  methods: {
    setWrapperDimensions () {
      this.$refs.wrapper.style.width = `${2 * this.radius}px`
      this.$refs.wrapper.style.height = `${this.radius}px`
    },
    roundFrenchPercentage,
  },
}
</script>

<style lang="stylus" scoped>
  .gauge
    display: flex;
    align-items: center;
    flex-direction: column;
    &-container
      position: relative
    &-limit
      font-size: 9px

  #meter
    width: 100%
    height: 100%
    overflow: visible

  #meter_needle
    position: absolute;
    transform-origin: bottom center;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto
    height: 100%
</style>
