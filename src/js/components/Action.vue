<template>
  <button type="button" :title="tooltip"><slot></slot></button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: ['tooltip']
})
</script>
