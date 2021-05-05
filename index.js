const { accessor: realtimeData } = require('./data');
const { read, save } = require('./db');
const { baseUrl, qq, authKey } = require('./config/config.json');
const { Bot, Message, Middleware } = require('mirai-js');
const watchedMap = read();

(async () => {

  const bot = new Bot();

  await bot.open({
    baseUrl,
    qq,
    authKey,
  });

  bot.on(['FriendMessage', 'GroupMessage'], new Middleware().textProcessor()
    .use(async (data, next) => {
      const matched = data.text.match(/^\/doge$/);
      if (matched?.length >= 1) {
        data.matched = matched;
        await next();
      }
    })
    .use(async (data, next) => {
      if (data.matched.length == 1) {
        let message = new Message().addPlain(`doge:\n实时卖单: ${realtimeData.ask} $\n实时买单: ${realtimeData.bid} $`);

        for (const qq in watchedMap) {
          const up = ((realtimeData.ask / watchedMap[qq]?.price) * 100)?.toFixed(2);
          const earnings = ((realtimeData.ask - watchedMap[qq]?.price) * watchedMap[qq]?.count * 6.8)?.toFixed(2);
          message.addPlain('\n').addAt(qq).addPlain(` -> 涨跌: ${up}%, 盈亏: ${earnings}￥`)
        }

        data.type == 'FriendMessage' &&
          bot.sendMessage({
            friend: data.sender.id,
            message: message,
          });
        data.type == 'GroupMessage' &&
          bot.sendMessage({
            group: data.sender.group.id,
            message: message,
          });
      } else {
        await next();
      }
    })
    .done()
  );

  bot.on(['FriendMessage', 'GroupMessage'], new Middleware().textProcessor()
    .use(async (data, next) => {
      const matched = data.text.match(/^\/watch\s(.*)\s(.*)/);
      if (matched?.length == 3) {
        watchedMap[data.sender.id] = {
          count: matched[1] - 0,
          price: matched[2] - 0,
        }
        save(watchedMap);
        await next();
      }
    })
    .done()
  );

})();