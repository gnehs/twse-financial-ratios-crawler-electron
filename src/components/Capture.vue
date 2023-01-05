<script setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useStepStore } from '@/stores/step'
import { useFormStore } from '@/stores/form'
import nodeFetch from 'node-fetch'
const stepStore = useStepStore()
const formStore = useFormStore()
const { step } = storeToRefs(stepStore)
const {
  useCommonEra,
  stockList,
  period,
  targetList,
  targetCatgory,
  targetCatgoryList
} = storeToRefs(formStore)

</script>
<template>
  <div>正在擷取，請勿關閉視窗</div>
</template>