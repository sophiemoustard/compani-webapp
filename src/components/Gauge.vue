<template>
  <div class="gauge">
    <div class="gauge-container" ref="wrapper">
      <svg id="meter">
        <defs>
          <linearGradient id="linear" x1="5%" y1="0%" x2="70%" y2="0%" spreadMethod="pad">
            <stop offset="0%" :stop-color="maxColor"/>
            <stop offset="100%" :stop-color="intermediateMaxColor"/>
          </linearGradient>
          <linearGradient id="linear2" x1="5%" y1="0%" x2="70%" y2="0%" spreadMethod="pad">
            <stop offset="0%" :stop-color="intermediateMaxColor"/>
            <stop offset="100%" :stop-color="intermediateMinColor"/>
          </linearGradient>
          <linearGradient id="linear3" x1="5%" y1="0%" x2="70%" y2="0%" spreadMethod="pad">
            <stop offset="0%" :stop-color="intermediateMinColor"/>
            <stop offset="100%" :stop-color="minColor"/>
          </linearGradient>
        </defs>
        <path :d="this.first" fill="none" stroke="url(#linear)" stroke-width="8" opacity="0.4" />
        <path :d="this.second" fill="none" stroke="url(#linear2)" stroke-width="8" opacity="0.4" />
        <path :d="this.third" fill="none" stroke="url(#linear3)" stroke-width="8" opacity="0.4" />
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
    <slot name="title" />
  </div>
</template>

<script>
import { roundFrenchPercentage } from '../helpers/utils';

export default {
  name: 'Gauge',
  props: {
    max: { type: Number, default: 100 },
    min: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
    title: { type: String, default: '' },
  },
  computed: {
    radius () {
      return this.$q.platform.is.mobile ? 40 : 70;
    },
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
    intermediateMinLabel () {
      return { x: this.radius * 3 / 2 + 7, y: this.radius * (1 - Math.sqrt(3) / 2) };
    },
    maxLabel () {
      return { x: -21, y: this.radius };
    },
    intermediateMaxLabel () {
      return { x: this.radius / 2 - 23, y: this.radius * (1 - Math.sqrt(3) / 2) };
    },
    minColor () {
      return '#9EE945';
    },
    intermediateMinColor () {
      return '#fcf100';
    },
    intermediateMaxColor () {
      return '#F29400';
    },
    maxColor () {
      return '#F25700';
    },
    first () {
      const origin = `0,${this.radius}`;
      const control = `0,${-this.radius / Math.sqrt(3)}`;
      const end = `${this.radius / 2},${-this.radius * Math.sqrt(3) / 2}`;

      return `M${origin} q${control} ${end}`;
    },
    second () {
      const origin = `${this.radius / 2},${this.radius * (1 - Math.sqrt(3) / 2)}`;
      const control = `${this.radius / 2},${-this.radius * (Math.sqrt(3) / 6)}`;
      const end = `${this.radius},0`;

      return `M${origin} q${control} ${end}`;
    },
    third () {
      const origin = `${this.radius * 2},${this.radius}`;
      const control = `0,${-this.radius / Math.sqrt(3)}`;
      const end = `${-this.radius / 2},${-this.radius * Math.sqrt(3) / 2}`;

      return `M${origin} q${control} ${end}`;
    },
  },
  mounted () {
    this.setWrapperDimensions();
  },
  methods: {
    setWrapperDimensions () {
      this.$refs.wrapper.style.width = `${2 * this.radius}px`;
      this.$refs.wrapper.style.height = `${this.radius}px`;
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
