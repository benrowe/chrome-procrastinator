<template>
  <div class="root">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Icon from "./Icon.vue";

export default Vue.extend({
  name: 'action-bar',
  props: [
    'actions'
  ],
  components: {
    Icon
  }
});
</script>

<style lang="scss" scoped>
</style>

