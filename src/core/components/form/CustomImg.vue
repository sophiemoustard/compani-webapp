<template>
  <div class="thumbnail">
    <img :src="link" :alt="alt">
  </div>
</template>

<script>
import gdrive from '@api/GoogleDrive';
export default {
  name: 'custom-img',
  props: {
    imageSource: { type: String, required: true },
    alt: { type: String, required: true },
    cloudinaryStorage: { type: Boolean, default: false },
  },
  data () {
    return {
      link: '',
    }
  },
  mounted () {
    this.getThumbnailUrl();
  },
  watch: {
    imageSource () { this.getThumbnailUrl(); },
  },
  methods: {
    async getThumbnailUrl () {
      try {
        if (!this.cloudinaryStorage) {
          const file = await gdrive.getFileById({ id: this.imageSource });
          this.link = file.data.data.file.thumbnailLink;
        } else this.link = this.imageSource;
      } catch (e) {
        console.error(e);
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  .thumbnail
    position: relative
    width: 150px
    height: 150px
    overflow: hidden

  .thumbnail img
    position: absolute
    left: 50%
    top: 50%
    height: 100%
    width: auto
    -webkit-transform: translate(-50%,-50%);
    -ms-transform: translate(-50%,-50%);
    transform: translate(-50%,-50%);

</style>
