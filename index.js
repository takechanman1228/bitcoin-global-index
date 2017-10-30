const ccxt = require('ccxt');

var bitfinex = ccxt.bitfinex()
var gemini = ccxt.gemini()
var bitstamp = ccxt.bitstamp()
var gdax = ccxt.gdax()
var lakebtc = ccxt.lakebtc()
var coincheck = ccxt.coincheck()
var zaif = ccxt.zaif()
var bitflyer = ccxt.bitflyer()
var quoine = ccxt.quoine()

async function main() {
  let ccticker = await coincheck.fetchTicker('BTC/JPY')
  let bfticker = await bitflyer.fetchTicker('BTC/JPY')
  let qticker = await quoine.fetchTicker('BTC/JPY')
  let zticker = await zaif.fetchTicker('BTC/JPY')
  console.log(ccticker)
}

main();
