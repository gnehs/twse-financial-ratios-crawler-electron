import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useFormStore = defineStore('form', () => {
  const useCommonEra = ref(true)
  const stockList = ref(null)
  const period = ref(3)
  const targetList = ref([])
  const targetCatgory = ref(null)
  const targetCatgoryList = ref([])
  return {
    useCommonEra,
    stockList,
    period,
    targetList,
    targetCatgory,
    targetCatgoryList
  }
})