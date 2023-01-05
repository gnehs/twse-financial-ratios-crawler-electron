<script setup>
import StepsWrapper from './components/StepsWrapper.vue'
console.log("[App.vue]", `Hello world from Electron ${process.versions.electron}!`)
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>證交所財務比率擷取工具</v-app-bar-title>
      <template v-slot:append>
        <v-btn icon="mdi-information-outline"></v-btn>
      </template>
    </v-app-bar>
    <v-main>
      <StepsWrapper />
    </v-main>
  </v-app>
</template>