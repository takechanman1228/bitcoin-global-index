const ccxt = require('ccxt')
const rp = require('request-promise')
const google = require('googleapis')
const dateFormat = require('dateformat')
const fusiontables = google.fusiontables('v2')
const key = require('./jbi-your.json')
const apiKey = 'AIzaSyD5SspH8gZYBYlld6sN5Ofv-ayZ2sHCvyk'

let jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/fusiontables', 'https://www.googleapis.com/auth/fusiontables'],
  null
)

// USD
var gemini = ccxt.gemini()
var bitstamp = ccxt.bitstamp()
var gdax = ccxt.gdax()
var lakebtc = ccxt.lakebtc()
var kraken = ccxt.kraken()
// USDT
var bitfinex = ccxt.bitfinex() // Bittrex support USDT & USD
var poloniex = ccxt.poloniex()
var binance = ccxt.binance()
var hitbtc = ccxt.hitbtc2()
// JPY
var coincheck = ccxt.coincheck()
var zaif = ccxt.zaif()
var bitflyer = ccxt.bitflyer()
var quoine = ccxt.quoine()
// KRW
var bithumb = ccxt.bithumb()
// support korbit
// support coinone

class TickData {
  constructor(currency, id, bid, ask, volume, timestamp) {
    this.currency = currency
    this.id = id
    this.bid = bid
    this.ask = ask
    this.volume = volume
    this.timestamp = timestamp
  }
}

async function fetchBitstamp() {
  let ticker = await bitstamp.fetchTicker('BTC/USD')
  return new TickData('USD', bitstamp.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchLakebtc() {
  let ticker = await lakebtc.fetchTicker('BTC/USD')
  return new TickData('USD', lakebtc.id, ticker['bid'], ticker['ask'], ticker['quoteVolume'], ticker['timestamp'])
}

async function fetchGemini() {
  let ticker = await gemini.fetchTicker('BTC/USD')
  return new TickData('USD', gemini.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchGdax() {
  let ticker = await gdax.fetchTicker('BTC/USD')
  return new TickData('USD', gdax.id, ticker['bid'], ticker['ask'], ticker['quoteVolume'], ticker['timestamp'])
}

async function fetchBitfinex() {
  let ticker = await bitfinex.fetchTicker('BTC/USD')
  return new TickData('USD', bitfinex.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchPoloniex() {
  let ticker = await poloniex.fetchTicker('BTC/USDT')
  return new TickData('USD', poloniex.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchBinance() {
  let ticker = await binance.fetchTicker('BTC/USDT')
  return new TickData('USD', binance.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchHitbtc() {
  let ticker = await hitbtc.fetchTicker('BTC/USD')
  return new TickData('USD', 'hitbtc', ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchCoincheck() {
  let ticker = await coincheck.fetchTicker('BTC/JPY')
  return new TickData('JPY', coincheck.id, ticker['bid'], ticker['ask'], ticker['quoteVolume'], ticker['timestamp'])
}

async function fetchBitflyer() {
  let ticker = await bitflyer.fetchTicker('BTC/JPY')
  return new TickData('JPY', bitflyer.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchQuoine() {
  let ticker = await quoine.fetchTicker('BTC/JPY')
  return new TickData('JPY', quoine.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchZaif() {
  let ticker = await zaif.fetchTicker('BTC/JPY')
  return new TickData('JPY', zaif.id, ticker['bid'], ticker['ask'], ticker['quoteVolume'], ticker['timestamp'])
}

async function fetchBithumb() {
  let ticker = await bithumb.fetchTicker('BTC/KRW')
  return new TickData('KRW', bithumb.id, ticker['bid'], ticker['ask'], ticker['quoteVolume'], ticker['timestamp'])
}

async function fetchKorbit() {
  let ticker = await rp({
    uri: 'https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=btc_krw',
    json: true
  })
  return new TickData('KRW', 'korbit', Number(ticker['bid']), Number(ticker['ask']), Number(ticker['volume']), Number(ticker['timestamp']))
}

async function fetchCoinone() {
  let ticker = await rp({
    uri: 'https://api.coinone.co.kr/ticker?currency=btc',
    json: true
  })
  return new TickData('KRW', 'coinone', Number(ticker['last']), Number(ticker['last']), Number(ticker['volume']), ticker['timestamp'])
}


function sum(tickdataArray) {
  return tickdataArray.reduce((sum, tick) => sum + tick.volume, 0)
}

function weight(tickdataArray) {
  return tickdataArray.reduce((sum, tick) => sum + tick.volume * tick.ask, 0)
}

function weightedAverage(tickdataArray) {
  return weight(tickdataArray) / sum(tickdataArray)
}


async function fetchAllTickData() {
  return await Promise.all([
    fetchBitstamp(),
    fetchLakebtc(),
    fetchGemini(),
    fetchGdax(),
    fetchBitfinex(),
    fetchPoloniex(),
    fetchBinance(),
    fetchHitbtc(),
    fetchCoincheck(),
    fetchBitflyer(),
    fetchQuoine(),
    fetchZaif(),
    fetchBithumb(),
    fetchKorbit(),
    fetchCoinone()
  ])
}

function uploadToFusionTable(tickDataArray, rates, bitcoinIndexes) {
  let now = Date(tickDataArray[1].timestamp)
  let date = dateFormat(now ,"UTC:yyyy/mm/dd HH:MM:ss")
  rateKey = 'USD_JPY, USD_KRW, JPY_USD, JPY_KRW, KRW_USD, KRW_JPY'
  rateValue = [rates['USD_JPY'], rates['USD_KRW'], rates['JPY_USD'], rates['JPY_KRW'], rates['KRW_USD'], rates['KRW_JPY']].join(',')

  indexKey = 'JBI, KRBI, USBI, USDTBI'
  indexValue = bitcoinIndexes.join(',')

  let key_array = [].concat(...tickDataArray.map(tick => [(tick.id+'_bid'), (tick.id+'_ask'), (tick.id+'_volume')]))
  let tickKey = key_array.join(',')
  let key = `date, ${indexKey}, ${rateKey}, ${tickKey}`
  console.log(key)
  let valueArray = [].concat(...tickDataArray.map(tick => [tick.bid, tick.ask, tick.volume]))
  let tickValue = valueArray.join(',')
  let value = `'${date}', ${indexValue}, ${rateValue}, ${tickValue}`
  console.log(value)
  let fusionTableId = "1GvvslUCdWxK_Ll1VZP3SzxRJXmwTEHEADdue34cu"
  var sql = `INSERT INTO ${fusionTableId} (${key}) VALUES (${value})`

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

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

async function main() {
  while (true) {
    try {
      let rates = await rp({uri: 'https://inagoflyer.appspot.com/fxrate', json: true})
      let results = await fetchAllTickData()
      jpyTick = results.filter(tick => ['coincheck', 'quoine', 'zaif', 'bitflyer'].includes(tick.id))
      krwTick = results.filter(tick => ['bithumb', 'korbit', 'coinone'].includes(tick.id))
      usTick = results.filter(tick => ['gemini', 'bitstamp', 'gdax', 'lakebtc', 'kraken', 'bitfinex'].includes(tick.id))
      usdtTick = results.filter(tick => ['bitfinex', 'poloniex', 'binance', 'hitbtc'].includes(tick.id))
      let krbi = weightedAverage(krwTick)
      let jbi = weightedAverage(jpyTick)
      let usbi = weightedAverage(usTick)
      let usdtbi = weightedAverage(usdtTick)
      bitcoinIndexes = [jbi, krbi, usbi, usdtbi]
      uploadToFusionTable(results, rates, bitcoinIndexes)
    } catch (error) {
      console.log(error);
      await sleep(5)
      continue
    }
    // wait 1 minute
    await sleep(60 * 1000)
  }
}

main()
