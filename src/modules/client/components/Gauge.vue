<template>
  <div class="gauge">
    <div class="gauge-container" ref="wrapper">
      <svg id="meter">
        <defs>
          <linearGradient id="linear" x1="5%" y1="0%" x2="70%" y2="0%" spreadMethod="pad">
            <stop offset="0%" :stop-color="maximum.color" />
            <stop offset="100%" :stop-color="intermediateMax.color" />
          </linearGradient>
          <linearGradient id="linear2" x1="5%" y1="0%" x2="70%" y2="0%" spreadMethod="pad">
            <stop offset="0%" :stop-color="intermediateMax.color" />
            <stop offset="100%" :stop-color="intermediateMin.color" />
          </linearGradient>
          <linearGradient id="linear3" x1="5%" y1="0%" x2="70%" y2="0%" spreadMethod="pad">
            <stop offset="0%" :stop-color="intermediateMin.color" />
            <stop offset="100%" :stop-color="minimum.color" />
          </linearGradient>
        </defs>
        <path :d="this.first" fill="none" :stroke="getStrokeUrl('linear')" stroke-width="8" opacity="0.6" />
        <path :d="this.second" fill="none" :stroke="getStrokeUrl('linear2')" stroke-width="8" opacity="0.6" />
        <path :d="this.third" fill="none" :stroke="getStrokeUrl('linear3')" stroke-width="8" opacity="0.6" />
        <text :x="maximum.x" :y="maximum.y" class="gauge-limit">{{ maximum.value }}%</text>
        <text :x="minimum.x" :y="minimum.y" class="gauge-limit">{{ minimum.value }}%</text>
        <text :x="intermediateMin.x" :y="intermediateMin.y" class="gauge-limit">
          {{ Math.round(intermediateMin.value) }}%</text>
        <text :x="intermediateMax.x" :y="intermediateMax.y" class="gauge-limit">
          {{ Math.round(intermediateMax.value) }}%
        </text>
      </svg>
      <img id="meter_needle" src="~assets/gauge-needle.svg" alt="" :style="`transform: rotate(${needleAngle}deg)`">
    </div>
    <slot name="title" />
  </div>
</template>

<script>
import { roundFrenchPercentage } from '@helpers/utils';

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
      return this.$q.platform.is.mobile ? 35 : 55;
    },
    reference () {
      return (this.max + this.min) / 2;
    },
    range () {
      return this.max - this.reference;
    },
    minimum () {
      return {
        value: this.min,
        x: 2 * this.radius + 5,
        y: this.radius,
        color: '#9EE945',
      };
    },
    intermediateMin () {
      return {
        value: this.min + (this.max - this.min) / 3,
        x: this.radius * 3 / 2 + 7,
        y: this.radius * (1 - Math.sqrt(3) / 2),
        color: '#FCF100',
      };
    },
    intermediateMax () {
      return {
        value: this.max - (this.max - this.min) / 3,
        x: this.radius / 2 - 23,
        y: this.radius * (1 - Math.sqrt(3) / 2),
        color: '#F29400',
      };
    },
    maximum () {
      return {
        value: this.max,
        x: -21,
        y: this.radius,
        color: '#e20009',
      };
    },
    needleAngle () {
      return (this.reference - Math.max(Math.min(this.value, this.max), this.min)) / this.range * 90;
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
    getStrokeUrl (id) {
      return `url(${this.$route.fullPath}#${id})`;
    },
    roundFrenchPercentage,
  },
};
</script>

<style lang="sass" scoped>
  .gauge
    display: flex
    align-items: center
    flex-direction: column
    &-container
      position: relative
    &-limit
      font-size: 9px

  #meter
    width: 100%
    height: 100%
    overflow: visible

  #meter_needle
    position: absolute
    transform-origin: bottom center
    bottom: 0
    left: 0
    right: 0
    margin: auto
    height: 100%
</style>
