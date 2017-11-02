const utilities = require('./utilities')
const weightedAverage = utilities.weightedAverage
const sleep = utilities.sleep
const rp = require('request-promise')
const google = require('googleapis')
const dateFormat = require('dateformat')
const fusiontables = google.fusiontables('v2')
const key = require('./jbi-your.json')
const apiKey = 'AIzaSyD5SspH8gZYBYlld6sN5Ofv-ayZ2sHCvyk'
const fetchAllTickData = require('./fetchAllTickData')
const TickData = require('./tickData')

let jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/fusiontables', 'https://www.googleapis.com/auth/fusiontables'],
  null
)

function insert(sql) {
  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err)
      throw err
    }

    fusiontables.query.sql({auth: jwtClient, sql: sql, key: apiKey}, (err, res) => {
      if (err) {
        console.log(err)
      } else {
        console.log(res)
      }
    })
  })
}

function createSql(tickDataArray, rates, bitcoinIndexes) {
  let now = Date(tickDataArray[1].timestamp)
  let date = dateFormat(now ,"UTC:yyyy/mm/dd HH:MM:ss")
  rateKey = 'USD_JPY, USD_KRW, JPY_USD, JPY_KRW, KRW_USD, KRW_JPY'
  rateValue = [rates['USD_JPY'], rates['USD_KRW'], rates['JPY_USD'], rates['JPY_KRW'], rates['KRW_USD'], rates['KRW_JPY']].join(',')

  indexKey = 'GLBI, JBI, KRBI, USBI, USDTBI'
  indexValue = bitcoinIndexes.join(',')

  let key_array = [].concat(...tickDataArray.map(tick => [(tick.id+'_bid'), (tick.id+'_ask'), (tick.id+'_volume')]))
  let tickKey = key_array.join(',')
  let key = `date, ${indexKey}, ${rateKey}, ${tickKey}`
  let valueArray = [].concat(...tickDataArray.map(tick => [tick.bid, tick.ask, tick.volume]))
  let tickValue = valueArray.join(',')
  let value = `'${date}', ${indexValue}, ${rateValue}, ${tickValue}`
  let fusionTableId = "1GvvslUCdWxK_Ll1VZP3SzxRJXmwTEHEADdue34cu"
  let sql = `INSERT INTO ${fusionTableId} (${key}) VALUES (${value})`
  return sql
}

async function main() {
  while (true) {
    try {
      let rates = await rp({uri: 'https://inagoflyer.appspot.com/fxrate', json: true})
      let results = await fetchAllTickData()
      jpyTick = results.filter(tick => ['coincheck', 'quoine', 'zaif', 'bitflyer'].includes(tick.id))
      krwTick = results.filter(tick => ['bithumb', 'korbit', 'coinone'].includes(tick.id))
      usTick = results.filter(tick => ['gemini', 'bitstamp', 'gdax', 'lakebtc', 'kraken', 'bitfinex'].includes(tick.id))
      usdtTick = results.filter(tick => ['bitfinex', 'poloniex', 'binance', 'hitbtc', 'bittrex'].includes(tick.id))
      let usdGlobalTick = results.map(tick => {
        if (tick.currency == 'JPY') {
          return new TickData('USD', tick.id, tick.bid * rates['JPY_USD'], tick.ask * rates['JPY_USD'], tick.volume, tick.timestamp)
        } else if (tick.currency == 'KRW') {
          return new TickData('USD', tick.id, tick.bid * rates['KRW_USD'], tick.ask * rates['KRW_USD'], tick.volume, tick.timestamp)
        }
        return tick
      })
      let krbi = weightedAverage(krwTick)
      let jbi = weightedAverage(jpyTick)
      let usbi = weightedAverage(usTick)
      let usdtbi = weightedAverage(usdtTick)
      let glbi = weightedAverage(usdGlobalTick)
      bitcoinIndexes = [glbi, jbi, krbi, usbi, usdtbi]
      let sql = createSql(results, rates, bitcoinIndexes)
      insert(sql)
    } catch (error) {
      console.log(error);
      await sleep(5 * 1000)
      continue
    }
    // wait 1 minute
    await sleep(60 * 1000)
  }
}

main()
