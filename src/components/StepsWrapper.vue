<script setup>
import GettingStarted from './GettingStarted.vue'
import Config from './Config.vue'
import Capture from './Capture.vue'
import Done from './Done.vue'

import { storeToRefs } from 'pinia'
import { useStepStore } from '@/stores/step'
const stepStore = useStepStore()
const { step } = storeToRefs(stepStore)
</script>
<template>
  <div class="d-flex justify-center align-center h-100 steps-wrapper">
    <GettingStarted v-if="step == 'GettingStarted'" />
    <Config v-if="step == 'Config'" />
    <Capture v-if="step == 'Capture'" />
    <Done v-if="step == 'Done'" />
  </div>
</template>
<style lang="sass">
.steps-wrapper
  background-color: #f6f6f6
  background: radial-gradient(circle, transparent 20%, #f6f6f6 20%, #f6f6f6 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #f6f6f6 20%, #f6f6f6 80%, transparent 80%, transparent) 15px 15px, linear-gradient(#d5d5d5 1.2000000000000002px, transparent 1.2000000000000002px) 0 -0.6000000000000001px, linear-gradient(90deg, #d5d5d5 1.2000000000000002px, #f6f6f6 1.2000000000000002px) -0.6000000000000001px 0
  background-size: 30px 30px, 30px 30px, 15px 15px, 15px 15px
  background-attachment: fixed
</style>