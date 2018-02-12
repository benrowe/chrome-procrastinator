<template>
  <div class="root">
    <a v-for="action in actions" href=""><Icon />{{action.title}}</a>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Icon from "./Icon.vue";

export default Vue.extend({
  props: [
    'actions'
  ],
  components: {
    Icon
  },
  mounted() {
      console.log(this.actions);
  }
});
</script>

<style lang="scss" scoped>
.root {
    background: red;
}
</style>

