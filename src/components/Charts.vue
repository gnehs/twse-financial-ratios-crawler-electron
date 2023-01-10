<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFormStore } from '@/stores/form'
const formStore = useFormStore()
const { results, targetList } = storeToRefs(formStore)
const charts = ref(
  Object.keys(
    Object.values(results.value['平均'])[0]
  ).map(rate => {
    return {
      rate,
      options: {
        chart: {
          id: rate,
          toolbar: {
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false,
            },
            export: {
              png: {
                filename: `財務比率_${rate}_${new Date().toLocaleString()}`,
              },
              svg: {
                filename: `財務比率_${rate}_${new Date().toLocaleString()}`,
              },
              csv: {
                filename: `財務比率_${rate}_${new Date().toLocaleString()}`,
              },
            },
          },
          animations: {
            enabled: false
          },
        },
        xaxis: {
          categories: Object.keys(results.value['平均'])
        }
      },
      series: [
        {
          name: '產業平均',
          data: Object.values(results.value['平均']).map(x => x[rate].replace(/\,/g, ''))
        },
        ...targetList.value.map(({ code, name }) => ({
          name,
          data: Object.values(results.value[code]).map(x => x[rate].replace(/\,/g, ''))
        }))
      ]
    }
  })
)
</script>
<template>
  <div><v-card width="512" class="my-4" v-for="item of charts">
      <template v-slot:title>
        {{ item.rate }}
      </template>
      <apexchart width="500" type="line" :options="item.options" :series="item.series"></apexchart>
    </v-card>
  </div>
</template>