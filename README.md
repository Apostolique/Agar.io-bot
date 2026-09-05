# Agar.io-bot

A bot that plays Agar.io. It looks at the cells around it, works out which directions are dangerous, and steers somewhere it can eat without being eaten.

## Installing

Install [`aposbot.user.js`](aposbot.user.js) with [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) and open `agar.io`.

## Playing

* Press `T` if you want to use the manual controls.
* Press `B` to switch to the next bot when more than one is installed.
* Press `R` if you want to toggle the line and dot drawing.
* Press `D` to toggle the dark mode.
* Press `P` to toggle restarting after a death.
* Press `ESC` for the option menu.

## The console

`window.AposBot` does the same things without the keys.

```js
AposBot.start()          // same as pressing T
AposBot.stop()
AposBot.status()         // mass, cells, state, how settled the steering is
AposBot.bots             // the names use() takes
AposBot.use('aposbot')   // switch to one of them
AposBot.bot              // the one that is running
AposBot.world            // the cells, the camera and the map
AposBot.backend          // the socket hook and the input path
AposBot.dump()           // the frames it has seen, as hex
```

`AposBot.dump()` is what to attach to an issue when the bot stops reading the game. agar.io moves its frame layout every so often, and the panel says `PROTOCOL DESYNC` with a hex window around the byte that stopped the parse in the console when it does.

## Writing your own bot

A bot is a factory that takes the world API and returns `mainLoop`, `keyAction` and `displayText`. `mainLoop` returns where you want to go in absolute game coordinates:

```js
AposBot.backend.useBot(function (api) {
    return {
        name: 'MyBot',
        keyAction: function (key) {},
        displayText: function () { return []; },
        mainLoop: function () {
            var me = api.getPlayer()[0];
            if (!me) return [];
            return [me.x + 100, me.y];
        },
    };
});
```

Paste that into the console and it takes over on the next frame. `B` goes to the next bot from there, so the built-in one is a keypress away and yours is another one back. You can read [`BOT-API.md`](BOT-API.md) for more information about what's available. Every accessor you can read the world through, what a cell carries, how the camera moves, and the debug drawing.

If you start working on a bot, make sure to start an issue and tell me about it so that I can add it to the bot list on
[Alternate Bots](https://github.com/Apostolique/Agar.io-bot/wiki/Alternate-Bots)

## Updates

Your userscript manager handles this. `aposbot.user.js` carries `@updateURL` and `@downloadURL`, so it updates itself on the manager's normal schedule. The bot also checks the GitHub releases API once an hour and mentions a new version in the console.

## Sponsoring

You can sponsor the project on [GitHub Sponsors](https://github.com/sponsors/Apostolique) if the bot is useful to you.

## License

MIT. See [LICENSE](LICENSE).
