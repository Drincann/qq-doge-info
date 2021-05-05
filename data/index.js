const zlib = require('zlib');
const WebSocket = require('ws');

let ws = new WebSocket('wss://api.huobiasia.vip/ws');

let outData = {
  ask: 0,
  bid: 0,
}

let accessor = {
  get ask() {
    return outData.ask;
  },
  get bid() {
    return outData.bid;
  },
};

ws.on('message', async (data) => {
  try {
    if (data instanceof Buffer) {
      let parsed = JSON.parse(await unzip(data))


      if (parsed.ping) {
        ws.send(JSON.stringify({ pong: Date.now() }))
      } else {
        outData.ask = parsed.tick?.asks[0][0] ?? outData.ask;
        outData.bid = parsed.tick?.bids[0][0] ?? outData.bid
      }
    }
  } catch (error) {
    console.log(error);
  }
});

ws.on('open', () => {
  ws.send(JSON.stringify({ "sub": "market.dogeusdt.depth.step0", "symbol": "dogeusdt", "pick": ["bids.29", "asks.29"], "step": "step0" }))
  // ws.send(JSON.stringify({ "sub": "market.overviewv2" }))
});

async function unzip(buffer) {
  return new Promise((resolve, reject) => {
    zlib.unzip(buffer, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result.toString());
    });
  });
}

module.exports = {
  accessor,
}