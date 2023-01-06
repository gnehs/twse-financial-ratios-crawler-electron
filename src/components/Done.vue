<script setup>
import { storeToRefs } from 'pinia'
import { useStepStore } from '@/stores/step'
import { useFormStore } from '@/stores/form'
const stepStore = useStepStore()
const formStore = useFormStore()
const { step } = storeToRefs(stepStore)
const { fileLink } = storeToRefs(formStore)
function dowaload() {
  let link = document.createElement('a');
  link.href = fileLink.value;
  link.download = `財務比率_${new Date().toLocaleString()}.xlsx`;
  link.click();
}
</script>
<template>
  <v-card width="512" class="my-4">
    <template v-slot:title>
      完成！
    </template>

    <template v-slot:text>
      擷取完成，請點選下方按鈕儲存 Excel 檔案。
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
</template>