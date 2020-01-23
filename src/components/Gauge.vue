<template>
  <div id="wrapper" ref="wrapper">
    <svg id="meter">
      <circle class="range" :r="radius" cx="50%" cy="50%" stroke="#930F59" :stroke-dasharray="strokes.first"
        fill="none" />
      <circle class="range" :r="radius" cx="50%" cy="50%" stroke="#F29400" :stroke-dasharray="strokes.second"
        fill="none" />
      <circle class="range" :r="radius" cx="50%" cy="50%" stroke="#D0D0D0" :stroke-dasharray="strokes.third"
        fill="none" />
    </svg>
    <img id="meter_needle" src="~assets/gauge-needle.svg" alt="">
  </div>
</template>

<script>
export default {
  name: 'Gauge',
  props: {
    radius: { type: Number, default: 100 },
  },
  computed: {
    circumference () {
      return 2 * Math.PI * this.radius;
    },
    strokes () {
      const semiCircumference = this.circumference / 2;

      return {
        first: `${semiCircumference}, ${this.circumference}`,
        second: `${semiCircumference / 3 * 2}, ${this.circumference}`,
        third: `${semiCircumference / 3}, ${this.circumference}`,
      }
    },
  },
  mounted () {
    this.setWrapperDimensions();
  },
  methods: {
    setWrapperDimensions () {
      const wrapperDimension = 2 * this.radius + 100;
      this.$refs.wrapper.style.width = `${wrapperDimension}px`
      this.$refs.wrapper.style.height = `${wrapperDimension}px`
    },
  },
}
</script>

<style lang="stylus" scoped>
  #wrapper
    position: relative

  #meter
    width: 100%
    height: 100%
    transform: rotateX(180deg)

  #meter_needle
    height: 35%
    left: 0
    margin: auto
    position: absolute
    right: 0
    top: 15%
    transform-origin: bottom center
    transform: rotate(340deg)

  .range
    stroke-width: 30
</style>
