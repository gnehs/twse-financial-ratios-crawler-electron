<script setup>
import { storeToRefs } from 'pinia'
import { useStepStore } from '@/stores/step'
const stepStore = useStepStore()
const { step } = storeToRefs(stepStore)
</script>
<template>
  <v-card width="512" class="my-4">
    <template v-slot:title>
      嗨！
    </template>

    <template v-slot:text>
      本工具可擷取證交所上市公司財務比率資料，僅需選擇目標股票與產業即可擷取資料，並可將資料整理並匯出成 Excel 檔案。
    </template>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="tonal" color="primary" append-icon="mdi-arrow-right" @click="step = 'Config'">
        開始使用
      </v-btn>
    </v-card-actions>

  </v-card>
</template>