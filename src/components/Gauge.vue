<template>
  <div class="gauge-container" ref="wrapper">
    <svg id="meter">
      <path :d="this.first" fill="none" stroke="#E2007A" stroke-width="8" />
      <path :d="this.second" fill="none" stroke="#E6C6D6" stroke-width="8" />
      <path :d="this.third" fill="none" stroke="#D0D0D0" stroke-width="8" />
      <circle cx="100" cy="100" r="1" fill="black" style="position: fixed"/>
    </svg>
    <img id="meter_needle" src="~assets/gauge-needle.svg" alt="" :style="`transform: rotate(${needleAngle}deg)`">
  </div>
</template>

<script>
export default {
  name: 'Gauge',
  props: {
    max: { type: Number, default: 15 },
    min: { type: Number, default: 5 },
    value: { type: Number, default: 7.5 },
  },
  data () {
    return {
      radius: 70,
    }
  },
  computed: {
    reference () {
      return (this.max + this.min) / 2;
    },
    range () {
      return this.max - this.reference;
    },
    needleAngle () {
      return (this.reference - Math.max(Math.min(this.value, this.max), this.min)) / this.range * 90;
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
  },
}
</script>

<style lang="stylus" scoped>
  .gauge-container
      position: relative

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
