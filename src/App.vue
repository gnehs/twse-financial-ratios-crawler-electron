<script setup>
import StepsWrapper from './components/StepsWrapper.vue'
import { ref } from 'vue'
const infoDialog = ref(false)
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>證交所財務比率擷取工具</v-app-bar-title>
      <template v-slot:append>
        <v-btn icon="mdi-information-outline" @click="infoDialog = true"></v-btn>
      </template>
    </v-app-bar>
    <v-main>
      <StepsWrapper />
    </v-main>
    <v-dialog v-model="infoDialog" max-width="512px">
      <v-card>
        <v-card-title>證交所財務比率擷取工具</v-card-title>
        <v-card-text>
          透過指定的股票代號清單自動抓取財務比率資訊，並自動計算平均
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="infoDialog = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>