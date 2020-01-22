<template>
  <div id="wrapper" ref="wrapper">
    <svg id="meter">
      <circle v-for="(stroke, index) in strokes" :key="index" id="low" class="range" :r="radius" cx="50%" cy="50%"
        :stroke="stroke.color" :stroke-width="stroke.width" :stroke-dasharray="computeStrokes(index)" fill="none" />
    </svg>
    <img id="meter_needle" src="~assets/gauge-needle.svg" alt="">
  </div>
</template>

<script>
export default {
  name: 'Gauge',
  props: {
    radius: { type: Number, default: 100 },
    strokes: {
      type: Array,
      default: () => [{
        color: String,
        width: { type: Number, default: 30 },
      }],
    },
  },
  computed: {
    circumference () {
      return 2 * Math.PI * this.radius;
    },
  },
  mounted () {
    this.setWrapperDimensions();
  },
  methods: {
    setWrapperDimensions () {
      const wrapperDimension = 2 * this.radius + 100;
      this.$refs.wrapper.style.width = `${wrapperDimension}px`;
      this.$refs.wrapper.style.height = `${wrapperDimension}px`;
    },
    computeStrokes (index) {
      const semiCircumference = this.circumference / 2;
      if (index === 0) return `${semiCircumference}, ${this.circumference}`;
      return `${(this.strokes.length - index) * semiCircumference / this.strokes.length}, ${this.circumference}`;
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
</style>
