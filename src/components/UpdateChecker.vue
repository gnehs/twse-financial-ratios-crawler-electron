<script setup>
import { ref, defineProps, computed } from 'vue'
const dialog = ref(false)
const { version } = defineProps(['version'])
const latestVersion = ref(null)
const isLatest = computed(() => {
  if (latestVersion.value == null) { return true }
  let { tag_name } = latestVersion.value
  return tag_name == version
})
async function checkUpdate() {
  let releases = await fetch('https://api.github.com/repos/gnehs/twse-financial-ratios-crawler-electron/releases').then(e => e.json())
  latestVersion.value = releases[0]
}
checkUpdate()
</script>
<template>
  <v-dialog
    v-model="dialog" max-width="400">
    <template v-slot:activator="{ props }">
      <v-badge
        color="error"
        v-if="!isLatest"
        dot>
        <v-btn
          color="primary"
          variant="tonal"
          v-bind="props"
          prepend-icon="mdi-cellphone-arrow-down">
          軟體更新
        </v-btn>
      </v-badge>
    </template>

    <v-card>
      <v-card-title>
        有可用的軟體更新 (v{{ version }})
      </v-card-title>
      <v-card-text>
        請點選下方的連結下載最新版本
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="tonal" href="https://github.com/gnehs/twse-financial-ratios-crawler-electron/releases/latest"
          target="_blank">下載</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>