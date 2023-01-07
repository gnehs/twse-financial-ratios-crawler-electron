<script setup>
import StepsWrapper from './components/StepsWrapper.vue'
import { ref } from 'vue'
import { ipcRenderer } from 'electron';
import UpdateChecker from './components/UpdateChecker.vue'
const infoDialog = ref(false)
const version = ref('')
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
        <UpdateChecker :version="version" v-if="version!=''" />
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
          <v-card-subtitle v-if="version != ''">v{{ version }}</v-card-subtitle>
        </v-card-item>

        <v-card-text>
          透過指定的股票代號清單自動抓取財務比率資訊，計算平均並將結果匯出成 Excel 檔案，也能自動產出提供圖表，方便使用者分析財務比率。
          <br />
          <br />
          <div class="text-h6">使用教學</div>
          <video controls muted autoplay loop style="width: 100%;border-radius: 16px;">
            <source src="/preview.mp4" type="video/mp4">
          </video>
          <div class="text-h6">相關連結</div>
          <ul>
            <li><a href="https://github.com/gnehs/twse-financial-ratios-crawler-electron" target="_blank">GitHub</a></li>
            <li><a href="https://github.com/gnehs/twse-financial-ratios-crawler-electron/blob/main/privacy.md" target="_blank">隱私權政策</a></li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="infoDialog = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>