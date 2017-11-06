const ccxt = require('ccxt')
const rp = require('request-promise')
const TickData = require('./tickData')

var gemini = new ccxt.gemini()
var bitstamp = new ccxt.bitstamp()
var gdax = new ccxt.gdax()
var lakebtc = new ccxt.lakebtc()
var kraken = new ccxt.kraken()
// USDT
var bitfinex = new ccxt.bitfinex() // Bittrex support USDT & USD
var poloniex = new ccxt.poloniex()
var binance = new ccxt.binance()
var hitbtc = new ccxt.hitbtc2()
var bittrex = new ccxt.bittrex()
// JPY
var coincheck = new ccxt.coincheck()
var zaif = new ccxt.zaif()
var bitflyer = new ccxt.bitflyer()
var quoine = new ccxt.quoine()
// KRW
var bithumb = new ccxt.bithumb()
// support korbit
// support coinone

async function fetchBittrex() {
  let ticker = await bittrex.fetchTicker('BTC/USDT')
  return new TickData('USD', bittrex.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
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
  return new TickData('USD', gdax.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
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

async function fetchQuoineJPY() {
  let ticker = await quoine.fetchTicker('BTC/JPY')
  return new TickData('JPY', quoine.id, ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
}

async function fetchQuoineUSD() {
  let ticker = await quoine.fetchTicker('BTC/USD')
  return new TickData('USD', 'quoine-usd', ticker['bid'], ticker['ask'], ticker['baseVolume'], ticker['timestamp'])
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

async function fetchAllTickData() {
  return await Promise.all([
    fetchBittrex(),
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
    fetchQuoineJPY(),
    fetchQuoineUSD(),
    fetchZaif(),
    fetchBithumb(),
    fetchKorbit(),
    fetchCoinone()
  ])
}

module.exports = fetchAllTickData
