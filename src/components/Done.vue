<script setup>
import { storeToRefs } from 'pinia'
import { useStepStore } from '@/stores/step'
import { useFormStore } from '@/stores/form'
import Charts from './Charts.vue'
const stepStore = useStepStore()
const formStore = useFormStore()
const { step } = storeToRefs(stepStore)
const { fileLink, results } = storeToRefs(formStore)
function dowaload() {
  let link = document.createElement('a');
  link.href = fileLink.value;
  link.download = `財務比率_${new Date().toLocaleString()}.xlsx`;
  link.click();
}
</script>
<template>
  <div>
    <v-card width="512" class="my-4">
      <template v-slot:title>
        完成！
      </template>

      <template v-slot:text>
        擷取完成，請點選下方按鈕儲存 Excel 檔案，或是檢視並儲存下方的圖表。
        <br />
        <br />
        備註：點選圖表右上角的選單按鈕，可將圖表儲存成 PNG、SVG 或 CSV 檔案，建議儲存成 SVG 檔案。
      </template>
      <v-card-actions>
        <v-btn color="primary" prepend-icon="mdi-arrow-left" @click="step = 'GettingStarted'">
          再來一次
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" color="primary" append-icon="mdi-content-save-outline" @click="dowaload">
          儲存檔案
        </v-btn>
      </v-card-actions>

    </v-card>
    <Charts />
  </div>
</template>