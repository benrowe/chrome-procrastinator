<template>
  <span class="cr">v.<a class="version" href="#">{{version}}</a></span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: ['version']
})
</script>
