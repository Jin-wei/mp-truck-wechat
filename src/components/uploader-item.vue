<template>
  <li class="weui-uploader__file weui-uploader__file_status" :style="style">
  </li>
</template>

<script>
export default {
  props: {
    backgroundImage: {
      type: String,
      default: ''
    }
  },
  computed: {
    style () {
      return {
        backgroundImage: `url(${this.backgroundImage})`
      }
    }
  }
}
</script>
