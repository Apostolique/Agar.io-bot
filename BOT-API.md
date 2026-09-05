# Writing your own bot

AposBot provides an API that you can use to make your own bots.

## The shape of a bot

A bot is a factory. It takes the world API and hands back an object with three functions. This one eats the nearest pellet:

```js
AposBot.backend.useBot(function (api) {
    return {
        name: 'MyBot',

        // Called once per animation frame. Return [x, y] in game coordinates.
        mainLoop: function () {
            var mine = api.getPlayer();
            var me = mine[0];
            if (!me) return [];

            var owned = {};
            for (var i = 0; i < mine.length; i++) owned[mine[i].id] = true;

            // A pellet is under 25 mass, nameless and standing still.
            var closest = null;
            var best = Infinity;
            var cells = api.getCellsArray();
            for (var j = 0; j < cells.length; j++) {
                var cell = cells[j];
                if (owned[cell.id] || cell.isVirus()) continue;
                if (cell.name || !cell.isNotMoving()) continue;
                if (cell.size * cell.size / 100 > 25) continue;

                var distance = Math.hypot(cell.x - me.x, cell.y - me.y);
                if (distance < best) {
                    best = distance;
                    closest = cell;
                }
            }

            if (!closest) return [];
            return [closest.x, closest.y];
        },

        // Called on keypress, for your own toggles.
        keyAction: function (key) {},

        // Lines to show under the state in the panel.
        displayText: function () { return []; },
    };
});
```

Paste that into the console on a page with [`aposbot.user.js`](aposbot.user.js) installed and it takes over on the next frame. `AposBot.use('aposbot')` puts the built-in one back, and `B` goes round every bot installed, the one you pasted among them.

Returning an empty array leaves the bot aimed where it was, which is what the example does on a screen with no pellet on it. Throwing is survivable, since the backend catches it, reports it and carries on, though the bot won't steer that tick.

## Installing from your own userscript

Pasting into the console is for working on a bot. Shipping one is a userscript of your own, with the same `@match` lines and `@grant none`, which is what puts it in the page's `window` where AposBot lives:

```js
// ==UserScript==
// @name         QuickBot
// @match        https://agar.io/*
// @match        https://*.agar.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

window.aposBots = window.aposBots || [];
window.aposBots.push(function (api) {
    return {
        name: 'QuickBot',
        keyAction: function (key) {},
        displayText: function () { return []; },
        mainLoop: function () {
            return [api.screenToGameX(api.getMouseX()),
                    api.screenToGameY(api.getMouseY())];
        },
    };
});
```

Neither script gets a say in the load order, so the array is the meeting point and whoever runs first creates it. AposBot installs whatever is already in it, and a push after that installs on the spot. Waiting for `window.AposBot` yourself works too, though it takes a poll rather than a check: `@run-at document-idle` looks late enough and isn't for anyone running AposLoader, since that one fetches the bundle over the network and turns up a couple of round trips into the page.

A bot starts playing the moment it is installed, so with two of these the last one to load is the one steering while `B` reaches the other. Pushing under a name already installed replaces it rather than adding a second entry.

Under any `@grant` other than `none` the script is sandboxed, so the array to push onto is `unsafeWindow.aposBots`.

## Reading the world

| Accessor | Returns |
| --- | --- |
| `getCells()` | every visible cell, keyed by id |
| `getCellsArray()` | the same cells as an array |
| `getMemoryCells()` | visible cells plus ones that left view in the last 3 seconds |
| `getPlayer()` | your own cells, biggest first |
| `getX()`, `getY()` | centre of the view in game coordinates |
| `getMapStartX()`, `getMapStartY()` | top left corner of the map |
| `getMapEndX()`, `getMapEndY()` | bottom right corner of the map |
| `getRatio()` | pixels per game unit, zoom included |
| `getZoomlessRatio()` | pixels per game unit, ignoring zoom |
| `getWidth()`, `getHeight()` | viewport size in pixels |
| `getMouseX()`, `getMouseY()` | pointer position in screen pixels |
| `getPointX()`, `getPointY()` | where the bot last aimed, in game coordinates |
| `getLastUpdate()` | timestamp of the last server update |
| `getCurrentScore()` | best mass this life |
| `getMode()` | game mode, such as `':ffa'` |
| `getServer()` | server name, when the server sends one |

## Cells

A cell has `id`, `x`, `y`, `size`, `color` as a `'#rrggbb'` string, and `name`.

Mass is `size * size / 100`, not `size`. A 60 pixel cell is 36 mass.

Three of them are functions rather than properties. `isVirus()` is true for viruses. `isNotMoving()` is true when the cell held still between the last two updates, which is how you spot pellets and idle viruses. `getUptimeTime()` is the timestamp of its last update, which is what ages entries out of `getMemoryCells()`.

A cell that was eaten leaves memory at once rather than ageing out, and so does one you own. Everything else stays: the server's removal list also carries cells that merely left the view, which is what memory is for. Without the first, food you have already swallowed sits in the world for the full three seconds and a bot keeps steering at a cluster that is inside it. Your own cells are never merely out of sight though, since the server streams a box around your camera, so one that stops arriving has merged or died.

## The map

`getMapStartX()` and the three beside it are the rect the server sent for this connection. Before it sends one they are infinite, so nothing is off the map and no wall is near. Every agar.io server picks its own size, a little over 14000 a side, and its own origin, so a bot that assumes a fixed map will be wrong on the next connection.

## Coordinates

Everything is in absolute game coordinates unless it says screen. Two helpers convert: `screenToGameX(x)` and `screenToGameY(y)`, which take the real pointer where it sits on the real screen, so they use the zoom. `verticalDistance()` gives the diagonal of the visible area in game units, and it does not: the player's wheel is a cosmetic on top of the view the server picked, so nothing a bot decides with moves when someone scrolls. `getZoomlessRatio()` is the scale to size a view with while `getRatio()` is the one to draw with.

## The camera

`getX()` and `getY()` are not the middle of your cells. The game chases that point rather than sitting on it: on each rendered frame the camera moves halfway to the middle of your cells, and `getRatio()` a tenth of the way to the zoom your mass calls for. So the camera trails you whenever you move, and by more the faster you go.

The camera chases the positions off the wire, which is also the space every accessor here reports. The game chases the positions it has *glided* to, which lag the wire. That difference cancels: its camera trails its drawn cells by the same fraction this one trails the wire, so a point at a cell's `x` and `y`, projected through this camera, lands on the blob the player sees.

## Acting

`setPoint(x, y)` aims at a game coordinate. Returning `[x, y]` from `mainLoop` does the same thing and is the normal way to steer.

`split()` splits and `shoot()` ejects mass. Both go to the game the same tick you call them, and both go wherever the pointer is, so aim before you fire.

`T` hands the controls back to the player. Your `mainLoop` still runs and still draws, though nothing it decides reaches the game until `T` gives it back.

## Drawing

`drawLine(x1, y1, x2, y2, color)`, `drawPoint(x, y, color, text)`, `drawCircle(x, y, radius, color)` and `drawArc(x1, y1, x2, y2, x3, y3, color)` queue debug geometry in game coordinates. `color` is an index into an eight entry palette. The index picks a hue and the theme picks the shade, so index 2 is blue on both backgrounds without vanishing into either. `R` toggles whether any of it reaches the screen, so calling these is always safe.

Drawing what a bot is thinking is most of how you find out why it did something. What would you show?
