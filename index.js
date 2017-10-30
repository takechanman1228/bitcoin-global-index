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
  constructor(id, bid, ask, volume, timestamp) {
    this.id = id
    this.bid = bid
    this.ask = ask
    this.volume = volume
    this.timestamp = timestamp
  }
}

async function fetchBitstamp() {
  let ticker = await bitstamp.fetchTicker('BTC/USD')
  return new TickData(bitstamp.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchLakebtc() {
  let ticker = await lakebtc.fetchTicker('BTC/USD')
  return new TickData(lakebtc.id, ticker['bid'], ticker['ask'], ticker['quoteVolume'], ticker['timestamp'])
}

async function fetchGemini() {
  let ticker = await gemini.fetchTicker('BTC/USD')
  return new TickData(gemini.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchGdax() {
  let ticker = await gdax.fetchTicker('BTC/USD')
  return new TickData(gdax.id, ticker['bid'], ticker['ask'], ticker['quoteVolume'], ticker['timestamp'])
}

async function fetchBitfinex() {
  let ticker = await bitfinex.fetchTicker('BTC/USD')
  return new TickData(bitfinex.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchPoloniex() {
  let ticker = await poloniex.fetchTicker('BTC/USDT')
  return new TickData(poloniex.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchBinance() {
  let ticker = await binance.fetchTicker('BTC/USDT')
  return new TickData(binance.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchHitbtc() {
  let ticker = await hitbtc.fetchTicker('BTC/USD')
  return new TickData('hitbtc', ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchCoincheck() {
  let ticker = await coincheck.fetchTicker('BTC/JPY')
  return new TickData(coincheck.id, ticker['bid'], ticker['ask'], ticker['quoteVolume'], ticker['timestamp'])
}

async function fetchBitflyer() {
  let ticker = await bitflyer.fetchTicker('BTC/JPY')
  return new TickData(bitflyer.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchQuoine() {
  let ticker = await quoine.fetchTicker('BTC/JPY')
  return new TickData(quoine.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchZaif() {
  let ticker = await zaif.fetchTicker('BTC/JPY')
  return new TickData(zaif.id, ticker['bid'], ticker['ask'], ticker['quoteVolume'], ticker['timestamp'])
}

async function fetchBithumb() {
  let ticker = await bithumb.fetchTicker('BTC/KRW')
  return new TickData(bithumb.id, ticker['bid'], ticker['ask'], ticker['quoteVolume'], ticker['timestamp'])
}

async function fetchKorbit() {
  let ticker = await rp({
    uri: 'https://api.korbit.co.kr/v1/ticker/detailed?currency_pair=btc_krw',
    json: true
  })
  return new TickData('korbit', Number(ticker['bid']), Number(ticker['ask']), Number(ticker['volume']), Number(ticker['timestamp']))
}

async function fetchCoinone() {
  let ticker = await rp({
    uri: 'https://api.coinone.co.kr/ticker?currency=btc',
    json: true
  })
  return new TickData('coinone', Number(ticker['last']), Number(ticker['last']), Number(ticker['volume']), ticker['timestamp'])
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

function uploadToFusionTable(tickDataArray) {
  let now = Date(tickDataArray[0].timestamp)
  let date = dateFormat(now ,"UTC:yyyy/mm/dd HH:MM:ss")

  let key_array = [].concat(...tickDataArray.map(tick => [(tick.id+'_bid'), (tick.id+'_ask'), (tick.id+'_volume')]))
  let key = key_array.join(',')
  let valueArray = [].concat(...tickDataArray.map(tick => [tick.bid, tick.ask, tick.volume]))
  let value = valueArray.join(',')
  let fusionTableId = "1GvvslUCdWxK_Ll1VZP3SzxRJXmwTEHEADdue34cu"
  var sql = `INSERT INTO ${fusionTableId} (date, ${key}) VALUES ('${date}', ${value})`

  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err)
      throw err
    }

    fusiontables.query.sql({auth: jwtClient, sql: sql, key: apiKey}, (err, res) => {
      if (err) {
          console.log(err)
          throw err
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
      let results = await fetchAllTickData()
      uploadToFusionTable(results)
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
