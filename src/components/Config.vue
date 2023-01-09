<script setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useStepStore } from '@/stores/step'
import { useFormStore } from '@/stores/form'
import { RecycleScroller } from 'vue-virtual-scroller'
import nodeFetch from 'node-fetch'
const stepStore = useStepStore()
const formStore = useFormStore()
const { step } = storeToRefs(stepStore)
const {
  useCommonEra,
  stockList,
  period,
  targetList,
  targetCatgory,
  recommendCategoryList,
  targetCatgoryList
} = storeToRefs(formStore)

const targetStockDialog = ref(false)
const eta = ref(0)
const categoryList = ref([{ "value": "01", "name": "水泥工業" }, { "value": "02", "name": "食品工業" }, { "value": "03", "name": "塑膠工業" }, { "value": "04", "name": "紡織纖維" }, { "value": "05", "name": "電機機械" }, { "value": "06", "name": "電器電纜" }, { "value": "08", "name": "玻璃陶瓷" }, { "value": "09", "name": "造紙工業" }, { "value": "10", "name": "鋼鐵工業" }, { "value": "11", "name": "橡膠工業" }, { "value": "12", "name": "汽車工業" }, { "value": "13", "name": "電子工業" }, { "value": "14", "name": "建材營造業" }, { "value": "15", "name": "航運業" }, { "value": "16", "name": "觀光事業" }, { "value": "17", "name": "金融保險業" }, { "value": "18", "name": "貿易百貨業" }, { "value": "19", "name": "綜合" }, { "value": "20", "name": "其他業" }, { "value": "21", "name": "化學工業" }, { "value": "22", "name": "生技醫療業" }, { "value": "23", "name": "油電燃氣業" }, { "value": "24", "name": "半導體業" }, { "value": "25", "name": "電腦及週邊設備業" }, { "value": "26", "name": "光電業" }, { "value": "27", "name": "通信網路業" }, { "value": "28", "name": "電子零組件業" }, { "value": "29", "name": "電子通路業" }, { "value": "30", "name": "資訊服務業" }, { "value": "31", "name": "其他電子業" }, { "value": "32", "name": "文化創意業" }, { "value": "33", "name": "農業科技業" }, { "value": "34", "name": "電子商務" }])

async function getData() {
  try {
    let res = await nodeFetch('https://openapi.twse.com.tw/v1/opendata/t187ap03_L').then(res => res.json())
    stockList.value = res.map(item => ({
      name: `${item[`公司代號`]} ${item[`公司簡稱`]}`,
      code: item[`公司代號`],
      category: item[`產業別`],
    }))
  } catch (e) {
    alert(`無法取得股票清單，請檢查網路連線狀態後再試一次。`)
    await setTimeout(() => {
      getData()
    }, 5000)
  }
}
onMounted(() => {
  getData()
})
watch(targetList, () => {
  let cats = [...new Set(targetList.value.map(x => x.category))]
  recommendCategoryList.value = categoryList.value.filter(x => cats.includes(x.value))
  targetCatgory.value = cats[0]
})
watch(targetCatgory, () => {
  targetCatgoryList.value = stockList.value.filter(x => x.category === targetCatgory.value)
})
watch([targetCatgoryList, period], () => {
  let time = targetCatgoryList.value.length * Math.ceil(period.value / 3) * 5
  function secondToTime(second) {
    let h = Math.floor(second / 3600)
    let m = Math.floor((second - h * 3600) / 60)
    let s = second - h * 3600 - m * 60
    // use 時、分、秒 not : & ignore 0
    return `約${h ? ` ${h} 小時` : ''}${m ? ` ${m} 分鐘` : ''}${s ? ` ${s} 秒` : ''}`
  }
  eta.value = secondToTime(time)
})
function next() {
  if (targetList.value.length === 0) {
    return alert('請選擇目標股票')
  }
  if (targetCatgoryList.value.length === 0) {
    return alert('請選擇目標產業')
  }
  stepStore.step = 'Capture'
}
</script>
<template>

  <v-card width="512" class="my-4">
    <template v-if="stockList">
      <v-card-text>
        <div class="text-h6">目標</div>
        <div class="text-body mb-2">
          選擇目標，將會在匯出的資料中顯示所選之目標組合與產業平均
        </div>
        <v-chip
          class="mr-1 mb-2"
          v-for="item of targetList"
          closable
          :key="item.code"
          @click:close="targetList = targetList.filter(x => x.code !== item.code)">
          {{ item.name }}
        </v-chip>
        <v-btn block variant="tonal" color="primary" @click="targetStockDialog = true">
          選擇目標股票
        </v-btn>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-text>
        <div class="text-h6">產業</div>
        <div class="text-body mb-2">
          選擇要擷取的產業，將會在匯出的資料中顯示所選產業之產業平均
        </div>
        <v-radio-group v-model="targetCatgory" v-if="recommendCategoryList.length">
          <v-radio v-for="item of recommendCategoryList" :label="item.name" :value="item.value"></v-radio>
        </v-radio-group>
        <v-alert class="mb-4" v-else text="請先選擇目標股票" color="gray"></v-alert>

        <div class="text-body mb-2" v-if="targetCatgoryList.length">
          將會擷取下列股票來計算產業平均
        </div>
        <v-chip
          class="mr-1 mb-2"
          v-for="item of targetCatgoryList">
          {{ item.name }}
        </v-chip>

      </v-card-text>
      <v-divider></v-divider>
      <v-card-text>

        <div class="text-h6">擷取期間</div>
        <div class="text-body mb-2">
          選擇擷取的期間，較短的期間會加快擷取速度。
        </div>
        <v-select
          v-model="period"
          label="期間"
          :items="[{
            title: '近三年',
            value: 3
          },
          {
            title: '近五年',
            value: 5
          },
          {
            title: '近十年',
            value: 10
          }]"></v-select>

      </v-card-text>
      <v-divider></v-divider>
      <v-card-text>

        <div class="text-h6">其他</div>
        <v-checkbox label="將民國年轉換為西元年" v-model="useCommonEra" hide-details></v-checkbox>

      </v-card-text>
    </template>
    <div class="text-center mt-4" v-else>
      <v-progress-circular
        indeterminate
        color="primary" />
    </div>
    <v-divider></v-divider>
    <v-list>
      <v-list-item v-if="eta != 0"
        title="預計擷取時間"
        :subtitle="eta"></v-list-item>
      <v-list-item
        title="注意"
        subtitle="請保持網路連線穩定，否則會造成擷取失敗。"></v-list-item>
    </v-list>
    <v-card-actions>
      <v-btn variant="tonal" color="primary" append-icon="mdi-arrow-right" @click="next" block>
        開始擷取
      </v-btn>
    </v-card-actions>

  </v-card>
  <v-dialog v-model="targetStockDialog" max-width="400px">
    <v-card>

      <template v-slot:title>
        選擇目標股票
      </template>
      <template v-slot:text>

        <RecycleScroller
          class="scroller"
          :items="stockList"
          :item-size="48"
          key-field="code"
          hide-details
          v-slot="{ item }">
          <v-checkbox
            color="primary"
            v-model="targetList"
            :value="item">
            <template v-slot:label>{{ item.name.split(' ')[0] + ' ' }} <span class="ml-1"
                style="color: #000;">{{
                  item.name.split(' ')[1]
                }}</span></template>
          </v-checkbox>
        </RecycleScroller>
      </template>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" color="primary" @click="targetStockDialog = false">
          完成
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style lang="sass">
.scroller
  height: 100%
  max-height: 400px
  overflow-y: auto

</style>