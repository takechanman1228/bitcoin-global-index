const ccxt = require('ccxt')
const rp = require('request-promise')
const TickData = require('./tickData')

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
var bittrex = ccxt.bittrex()
// JPY
var coincheck = ccxt.coincheck()
var zaif = ccxt.zaif()
var bitflyer = ccxt.bitflyer()
var quoine = ccxt.quoine()
// KRW
var bithumb = ccxt.bithumb()
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
    fetchQuoine(),
    fetchZaif(),
    fetchBithumb(),
    fetchKorbit(),
    fetchCoinone()
  ])
}

module.exports = fetchAllTickData
