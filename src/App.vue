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
        <v-card-item>
          <v-card-title>證交所財務比率擷取工具</v-card-title>
          <v-card-subtitle>This is a subtitle</v-card-subtitle>
        </v-card-item>

        <v-card-text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="infoDialog = false">Close Dialog</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>