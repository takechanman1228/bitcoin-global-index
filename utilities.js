function sum(tickdataArray) {
  return tickdataArray.reduce((sum, tick) => sum + tick.volume, 0)
}

function weight(tickdataArray) {
  return tickdataArray.reduce((sum, tick) => sum + tick.volume * tick.ask, 0)
}

function weightedAverage(tickdataArray) {
  return weight(tickdataArray) / sum(tickdataArray)
}

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

module.exports = {weightedAverage, sleep}
