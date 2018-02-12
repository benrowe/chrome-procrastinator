<template>
  <i>icon</i>
</template>

<script lang="ts">
import Vue from 'vue'

export enum Type {
  default
}

export default Vue.extend({
  props: {
    type: Type.default
  }
})
</script>
