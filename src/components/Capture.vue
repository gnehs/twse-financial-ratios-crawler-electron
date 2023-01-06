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
  stockList,
  fileLink,
  period,
  targetList,
  targetCatgory,
  targetCatgoryList
} = storeToRefs(formStore)
const status = ref(['開始擷取'])
const delay = s => new Promise(resolve => setTimeout(resolve, s * 1000))
const captureList = ref([...new Set([...targetList.value, ...targetCatgoryList.value])])
const results = ref({})
const doneCount = ref(0)
const progress = computed(() => doneCount.value / (captureList.value.length * Math.ceil(period.value / 3)) * 100)
function parseYear(year) {
  return parseInt(year.toString().replace('年度', '')) + (useCommonEra.value ? 1911 : 0)
}
async function fetchFinancialReport(code, year) {
  await delay(5)
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
  let status_value = [text, ...status.value]
  status.value = status_value.slice(0, 5)
}
async function getResult(code, name) {
  let res = await fetchFinancialReport(code)
  doneCount.value++
  for (let i = 0; i < (Math.ceil(period.value / 3) - 1); i++) {
    let year = Object.keys(res)[0]
    if (useCommonEra.value) year -= 1911
    year -= 1
    let res2 = await fetchFinancialReport(code, year)
    res = { ...res2, ...res }
    doneCount.value++
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
  for (let { name, code } of captureList.value) {
    let done = false
    let retryCount = 0
    while (!done && retryCount < 3) {
      try {
        results.value[code] = await getResult(code, name)
        done = true
        log(`已擷取 ${code} ${name}`)
      } catch (e) {
        log(`擷取 ${code} ${name} 失敗，正在重試⋯`)
        retryCount++
      }
    }
  }

  log(`正在計算平均值⋯`)
  let average = {}
  for (let { code } of captureList.value) {
    for (let year in results.value[code]) {
      if (!average[year]) average[year] = {}
      for (let key in results.value[code][year]) {
        if (!average[year][key]) average[year][key] = []
        if (results.value[code][year][key] != 'NA') average[year][key].push(results.value[code][year][key])
      }
    }
  }
  for (let year in average) {
    for (let key in average[year]) {
      let len = average[year][key].length
      let sum = 0
      let count = 0
      if (len) {
        average[year][key].map(x => parseFloat(x)).forEach(val => {
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
      let row = [`${code} ${name}`]
      for (let year of years) {
        try {
          row.push(parseFloat(results.value[code][year][rate]))
        } catch (e) {
          row.push('NA')
        }
      }
      result.push(row)
    }
    let row = [`產業平均`]
    for (let year of years) {
      try {
        row.push(parseFloat(average[year][rate]))
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
  function jsonToSheet(json, code) {
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
        row.push(parseFloat(json[year][key]))
      }
      data.push(row)
    }

    let sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, code.toString());
  }

  jsonToSheet(average, '平均')

  for (let { code, name } of captureList.value) {
    jsonToSheet(results.value[code], `${code} ${name}`)
  }

  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
  fileLink.value = URL.createObjectURL(new Blob([s2ab(XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' }))], { type: "application/octet-stream" }))
  step.value = 'Done'
}
onMounted(() => {
  capture()
})
</script>
<template>
  <div class="text-center" style="width: calc(100vw - 32px);max-width: 512px;">
    <div>正在擷取，請勿關閉視窗</div>
    <v-progress-linear color="primary" :model-value="progress" class="my-2" />
    <div class="status" v-for="item of status">{{ item }}</div>
  </div>
</template>
<style lang="sass" scoped>
.status
  font-size: 12px
  color: #999
  margin-top: 4px
</style>