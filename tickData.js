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

module.exports = TickData
