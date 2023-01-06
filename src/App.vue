<script setup>
import StepsWrapper from './components/StepsWrapper.vue'
import { ref } from 'vue'
import { ipcRenderer } from 'electron';
const infoDialog = ref(false)
const version = ref('0.0.0')
ipcRenderer.on('main-process-message', (_event, args) => {
  console.log('[Receive Main-process message]:', args);
  if (args[0] == 'version') {
    version.value = args[1]
  }
});
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>財務比率擷取工具</v-app-bar-title>
      <template v-slot:append>
        <v-btn icon="mdi-information-outline" @click="infoDialog = true"></v-btn>
      </template>
    </v-app-bar>
    <v-main>
      <StepsWrapper />
    </v-main>
    <v-dialog v-model="infoDialog" max-width="512px">
      <v-card>

        <v-card-item>
          <v-card-title>財務比率擷取工具</v-card-title>
          <v-card-subtitle>v{{ version }}</v-card-subtitle>
        </v-card-item>

        <v-card-text>
          透過指定的股票代號清單自動抓取財務比率資訊，並自動計算平均
          <br />
          <br />
          <div class="text-h6">使用教學</div>
          <video controls muted autoplay loop style="width: 100%;border-radius: 16px;">
            <source src="/preview.mp4" type="video/mp4">
          </video>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="infoDialog = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>