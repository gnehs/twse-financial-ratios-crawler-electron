<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStepStore } from '@/stores/step'
import { useFormStore } from '@/stores/form'
import cheerio from 'cheerio'
import cheerioTableparser from 'cheerio-tableparser'
import nodeFetch from 'node-fetch'
import * as XLSX from 'xlsx'
const stepStore = useStepStore()
const formStore = useFormStore()
const { step } = storeToRefs(stepStore)
const {
  useCommonEra,
  results,
  stockList,
  fileLink,
  period,
  targetList,
  targetCatgory,
  targetCatgoryList
} = storeToRefs(formStore)
const status = ref([{ time: new Date(), text: '正在擷取，請勿關閉視窗' }])
const delay = s => new Promise(resolve => setTimeout(resolve, s * 1000))
const captureList = ref([...new Set([...targetList.value, ...targetCatgoryList.value])])
const doneCount = ref(0)
const errorMessage = ref(null)
const progress = computed(() => (doneCount.value / (captureList.value.length * Math.ceil(period.value / 3) * 5 * 10) * 100).toFixed(2))
// 剩餘時間
const remainingTime = computed(() => {
  const time = (captureList.value.length * Math.ceil(period.value / 3) * 5 * 10 - doneCount.value) * 0.1
  const hour = Math.floor(time / 3600)
  const minute = Math.floor((time - hour * 3600) / 60)
  const second = Math.floor(time - hour * 3600 - minute * 60)
  return `${hour ? `${hour} 小時` : ''}${minute ? ` ${minute} 分鐘` : ''}${second ? ` ${second} 秒` : ''}`
})
function parseYear(year) {
  return parseInt(year.toString().replace('年度', '')) + (useCommonEra.value ? 1911 : 0)
}
async function fetchFinancialReport(code, year) {
  for (let i = 0; i < 50; i++) {
    await delay(0.1)

    doneCount.value++
  }
  const url = 'https://mops.twse.com.tw/mops/web/ajax_t05st22'
  const params = {
    encodeURIComponent: 1,
    run: 'Y',
    step: 1,
    TYPEK: 'sii',
    year: year,
    isnew: false,
    co_id: code,
    firstin: 1,
    off: 1,
    ifrs: 'Y',
  }
  let urlencodedParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
  // let { data } = await axios.post(url, urlencodedParams)
  if (!year) {
    urlencodedParams = `encodeURIComponent=1&run=Y&step=1&TYPEK=sii&year=&isnew=true&co_id=${code}&firstin=1&off=1&ifrs=Y`
  }
  let data = await nodeFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: urlencodedParams
  }).then(res => res.text())
  if (data.includes(`資料庫中查無需求資料`)) return {}
  let $ = cheerio.load(data)
  cheerioTableparser($)
  let table = $('table[style]').parsetable(true, true, true)
  table.shift()
  let headers = table.shift()
  headers[0] = '年度'
  let result = {}
  let y
  table.map((row, index) => {
    row.forEach((value, index) => {
      if (index == 0) {
        y = parseYear(value)
        result[y] = {}
      }
      else {
        result[y][headers[index]] = value
      }
    })
  })
  return result
}
function log(text) {
  console.log(text)
  let status_value = [{ time: new Date(), text }, ...status.value]
  status.value = status_value
}
async function getResult(code, name) {
  let res = await fetchFinancialReport(code)
  for (let i = 0; i < (Math.ceil(period.value / 3) - 1); i++) {
    let year = Object.keys(res)[0]
    if (useCommonEra.value) year -= 1911
    year -= 1
    let res2 = await fetchFinancialReport(code, year)
    res = { ...res2, ...res }
  }
  res = Object.entries(res).slice(period.value * -1).reduce((acc, [year, value]) => {
    acc[year] = value
    return acc
  }, {})
  return res
}

function accDiv(arg1, arg2) {
  let t1 = 0, t2 = 0, r1, r2;
  try {
    t1 = arg1.toString().split('.')[1].length
  } catch (e) { }
  try {
    t2 = arg2.toString().split('.')[1].length
  } catch (e) { }

  r1 = Number(arg1.toString().replace('.', ''))
  r2 = Number(arg2.toString().replace('.', ''))
  return (r1 / r2) * Math.pow(10, t2 - t1)
}

function add(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}

async function capture() {
  errorMessage.value = ''
  for (let { name, code } of captureList.value) {
    let done = false
    let retryCount = 0
    while (!done && retryCount < 3) {
      try {
        results.value[code] = await getResult(code, name)
        done = true
        log(`已擷取 ${name}`)
      } catch (e) {
        log(`擷取 ${name} 失敗，正在重試⋯`)
        retryCount++
        doneCount.value -= 50
      }
    }
  }

  try {
    log(`正在計算平均值⋯`)
    let average = {}
    for (let { code } of captureList.value) {
      for (let year in results.value[code]) {
        if (!average[year]) average[year] = {}
        for (let key in results.value[code][year]) {
          if (!average[year][key]) average[year][key] = []
          average[year][key].push(results.value[code][year][key])
        }
      }
    }
    for (let year in average) {
      for (let key in average[year]) {
        let len = average[year][key].length
        let sum = 0
        let count = 0
        if (len) {
          average[year][key]
            .filter(x => !isNaN(x))
            .map(x => parseFloat(x.replace(/\,/g, ''))).forEach(val => {
              sum = add(sum, val)
              count++
            })
          average[year][key] = accDiv(sum, count).toFixed(2)
        } else {
          average[year][key] = 'NA'
        }
      }
    }

    // create excel
    let workbook = XLSX.utils.book_new();
    // 適用於圖表的資料
    let ratesHeader = Object.keys(Object.values(Object.values(results.value)[0])[0])
    let years = Object.keys(Object.values(results.value)[0])
    let result = []
    for (let rate of ratesHeader) {
      result.push([rate])
      result.push([`年度`, ...years])
      for (let { code, name } of targetList.value) {
        let row = [name]
        for (let year of years) {
          try {
            row.push(parseFloat(results.value[code][year][rate].replace(/\,/g, '')))
          } catch (e) {
            row.push('NA')
          }
        }
        result.push(row)
      }
      let row = [`產業平均`]
      for (let year of years) {
        try {
          row.push(parseFloat(average[year][rate].replace(/\,/g, '')))
        } catch (e) {
          row.push('NA')
        }
      }
      result.push(row)
      result.push([])
    }
    let sheet = XLSX.utils.aoa_to_sheet(result);
    XLSX.utils.book_append_sheet(workbook, sheet, '圖表資料');
    // 股票與平均
    function jsonToSheet(json, sheetName) {
      if (!json) return
      let headers = Object.keys(json[Object.keys(json)[0]])
      let data = []
      let row = ['年份']
      for (let year in json) {
        row.push(year)
      }
      data.push(row)
      for (let key of headers) {
        row = [key]
        for (let year in json) {
          if (json[year][key] !== 'NA')
            row.push(parseFloat(json[year][key].replace(/\,/g, '')))
          else
            row.push(json[year][key])
        }
        data.push(row)
      }

      let sheet = XLSX.utils.aoa_to_sheet(data);
      sheetName = sheetName.replace(/\\|\/|\?|\*|\[|\]/g, '')
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    }

    jsonToSheet(average, '平均')

    for (let { code, name } of captureList.value) {
      jsonToSheet(results.value[code], name)
    }

    function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
    results.value['平均'] = average
    fileLink.value = URL.createObjectURL(new Blob([s2ab(XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' }))], { type: "application/octet-stream" }))
    step.value = 'Done'
  } catch (e) {
    console.error(e)
    errorMessage.value = e.toString()
  }
}
onMounted(() => {
  capture()
})
function reload() {
  window.location.reload()
}
</script>
<template>
  <div style="width: calc(100vw - 32px);max-width: 512px;">
    <v-alert class="my-4" type="error" title="發生了錯誤！" v-if="errorMessage">
      很抱歉發生了錯誤，請重新再試一次，若您持續發生此錯誤請提供下列錯誤資訊給開發者
      <br />
      <pre style="white-space: pre-wrap;">
period:
{{ period }}
targetList:
{{ targetList }}
captureList:
{{ captureList }}
errorMessage:
{{ errorMessage }}
      </pre>
      <v-btn color="primary" @click="reload">重試</v-btn>
    </v-alert>
    <v-card class="pa-4 my-4" v-else>
      <div class="d-flex justify-space-between align-end">
        <div class="progress">{{ progress }}%</div>
        <div class="text-right text-caption">剩餘時間<br />{{ remainingTime|| '即將完成' }}</div>
      </div>
      <v-progress-linear color="primary" :model-value="progress" class="my-2" />
      <div class="status-items">
        <div class="status" v-for="item of status">
          <div class="text">
            {{ item.text }}
          </div>
          <div class="time">
            {{ item.time.toLocaleTimeString("zh-TW", { hour12: false }) }}
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>
<style lang="sass" scoped>
.progress
  font-size: 36px
  text-align: right
.status-items
  height: 110px
  overflow-y: auto
  &::-webkit-scrollbar
    width: 0
    height: 0
  &::-webkit-scrollbar-track
    background: transparent
  &::-webkit-scrollbar-thumb
    background: transparent
  &:hover
    padding-right: 4px
    transition: padding-right 0.2s
    &::-webkit-scrollbar
      width: 4px
      height: 4px
    &::-webkit-scrollbar-track
      background: #ddd
    &::-webkit-scrollbar-thumb
      background: #aaa
.status
  font-size: 12px
  margin-top: 4px
  text-align: left
  color: #333
  display: grid
  grid-template-columns: 3fr 1fr
  .time
    text-align: right
  &+.status
    color: #999
</style>