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
  <div class="d-flex justify-center align-center h-100">
    <GettingStarted v-if="step == 'GettingStarted'" />
    <Config v-if="step == 'Config'" />
    <Capture v-if="step == 'Capture'" />
    <Done v-if="step == 'Done'" />
  </div>
</template>