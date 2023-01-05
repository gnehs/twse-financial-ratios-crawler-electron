import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useStepStore = defineStore('step', () => {
  const step = ref('GettingStarted')
  return { step }
})