// ==UserScript==
// @name         AposBot
// @namespace    https://github.com/Apostolique/Agar.io-bot
// @version      6.0.0
// @description  A bot that plays Agar.io.
// @author       https://github.com/Apostolique
// @match        https://agar.io/*
// @match        http://agar.io/*
// @match        https://*.agar.io/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Apostolique/Agar.io-bot/main/aposbot.user.js
// @downloadURL  https://raw.githubusercontent.com/Apostolique/Agar.io-bot/main/aposbot.user.js
// @supportURL   https://github.com/Apostolique/Agar.io-bot/issues
// @license      MIT
// ==/UserScript==

(function () {
'use strict';
var __modules = {};
var __cache = {};
function __require(id) {
    if (__cache[id]) return __cache[id].exports;
    var module = { exports: {} };
    __cache[id] = module;
    __modules[id](module, module.exports, __require);
    return module.exports;
}

__modules[0] = function (module, exports, require) {
'use strict';

/**
 * Userscript entry point.
 *
 * Puts a backend and a bot together, draws the overlay and the panel over the
 * game canvas, binds the keys, and hangs the console API off `window.AposBot`.
 */

const { BrowserBackend, OWN_CANVAS } = require(1);
const bots = require(2);
const { checkForUpdate, cdnUrl } = require(3);
const { initAnalytics, isOptedOut, setOptOut } = require(4);
const { version, repository } = require(5);

/** Where to report a frame the codec could not read. */
const ISSUES = 'https://github.com/' + repository + '/issues';

/**
 * Keys the bot listens for. Nothing here is swallowed, so the game keeps the
 * ones it binds itself, ESC for its options among them.
 */
const KEYS = {
    TOGGLE_BOT: 't',
    NEXT_BOT: 'b',
    TOGGLE_DRAW: 'r',
    TOGGLE_DARK: 'd',
    TOGGLE_RESTART: 'p',
};

/** Set once a life has been played, so the menu is only waited on once. */
const MENU_KEY = 'aposbot:seen-menu';

function firstVisit() {
    try {
        return window.localStorage.getItem(MENU_KEY) === null;
    } catch (err) {
        // Storage blocked, so treat every visit as a return one rather than
        // holding at the menu forever.
        return false;
    }
}

function remember(key) {
    try {
        window.localStorage.setItem(key, '1');
    } catch (err) {
        /* storage blocked; the menu comes up again next time */
    }
}

/**
 * What the dark theme was last set to. The game exposes no getter and stores
 * nothing, so it comes up light every time and this starts there with it.
 */
let darkTheme = false;

/**
 * Flips the game's own dark theme, which its renderer reads.
 *
 * The setting is still there behind `core.setDarkTheme`, though the menu no
 * longer offers it, so this key is the only way left to reach it. Returns
 * null when there is no core yet, so the caller can say so instead of the key
 * doing nothing at all.
 */
function toggleDark() {
    const core = window.core;
    if (!core || typeof core.setDarkTheme !== 'function') return null;
    darkTheme = !darkTheme;
    core.setDarkTheme(darkTheme);
    return darkTheme;
}

function createOverlay() {
    const canvas = document.createElement('canvas');
    canvas.id = 'aposbot-overlay';
    // So findCanvas does not mistake it for the game.
    canvas.setAttribute(OWN_CANVAS, 'overlay');
    canvas.style.cssText = [
        'position:fixed',
        'inset:0',
        'pointer-events:none',
        'z-index:2147483000',
    ].join(';');
    document.body.appendChild(canvas);
    return canvas;
}

function createPanel() {
    const panel = document.createElement('div');
    panel.id = 'aposbot-panel';
    panel.style.cssText = [
        'position:fixed',
        'top:8px',
        'left:8px',
        'z-index:2147483001',
        'font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
        'background:rgba(17,17,17,.82)',
        'color:#eee',
        'padding:8px 10px',
        'border-radius:6px',
        'white-space:pre',
        'pointer-events:none',
        'min-width:200px',
    ].join(';');
    document.body.appendChild(panel);
    return panel;
}

/**
 * Colour tables the AI's draw calls index into, one per background.
 *
 * Same eight hues in both, so a red ring means the same thing either way and
 * only the lightness moves. One table cannot do both ends: pure blue reads at
 * 8:1 on the near-white background and 2:1 on the dark theme's near-black
 * one, and white is the other way round. Every entry here clears 4.3:1 on the
 * background it is drawn against.
 */
const DEBUG_COLORS = {
    light: [
        '#d40000', '#00892b', '#0000ff', '#8a6d00',
        '#c000c0', '#00707a', '#111111', '#5a5a5a',
    ],
    dark: [
        '#ff5c5c', '#00ff00', '#4d9fff', '#ffff00',
        '#ff5cff', '#00ffff', '#ffffff', '#b0b0b0',
    ],
};

function colorFor(index) {
    const palette = darkTheme ? DEBUG_COLORS.dark : DEBUG_COLORS.light;
    return palette[index % palette.length] || palette[6];
}

function drawDebug(backend, canvas) {
    const context = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    // Assigning width or height reallocates the canvas and clears it, so only
    // do it when the window actually changed size.
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
    context.clearRect(0, 0, width, height);

    const world = backend.world;
    if (!world.isAlive) return;

    const project = (x, y) => backend.worldToScreen(x, y);

    // One path per colour rather than one per shape. A crowded game emits a
    // couple of thousand rings and segments a frame, and stroking each on its
    // own costs far more than the geometry does. Grouping keeps every stroke
    // that was going to be drawn and issues eight of them instead.
    context.lineWidth = 2;
    const strokesByColor = new Map();
    const pathFor = (color) => {
        let path = strokesByColor.get(color);
        if (!path) {
            path = [];
            strokesByColor.set(color, path);
        }
        return path;
    };

    for (const [x1, y1, x2, y2, color] of world.lines) {
        const a = project(x1, y1);
        const b = project(x2, y2);
        if (!a || !b) continue;
        pathFor(color).push(['line', a.x, a.y, b.x, b.y]);
    }

    for (const [x, y, radius, color] of world.circles) {
        const centre = project(x, y);
        if (!centre) continue;
        pathFor(color).push(['arc', centre.x, centre.y, radius * world.ratio]);
    }

    for (const [color, shapes] of strokesByColor) {
        context.strokeStyle = colorFor(color);
        context.beginPath();
        for (const shape of shapes) {
            if (shape[0] === 'line') {
                context.moveTo(shape[1], shape[2]);
                context.lineTo(shape[3], shape[4]);
            } else {
                // moveTo first, or the arc joins onto whatever came before it.
                context.moveTo(shape[1] + shape[3], shape[2]);
                context.arc(shape[1], shape[2], shape[3], 0, Math.PI * 2);
            }
        }
        context.stroke();
    }

    // The dots group the same way the rings do. Most of them are cluster
    // marks carrying no text at all.
    const dotsByColor = new Map();
    const labels = [];
    for (const [x, y, color, text] of world.points) {
        const point = project(x, y);
        if (!point) continue;
        let dots = dotsByColor.get(color);
        if (!dots) {
            dots = [];
            dotsByColor.set(color, dots);
        }
        dots.push(point);
        if (text) labels.push([point, text]);
    }

    for (const [color, dots] of dotsByColor) {
        context.fillStyle = colorFor(color);
        context.beginPath();
        for (const dot of dots) {
            context.moveTo(dot.x + 3, dot.y);
            context.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
        }
        context.fill();
    }

    if (labels.length) {
        // agar.io's background is near-white, so plain white text vanishes
        // into it. Outline first, then fill, and it reads on either.
        context.font = '12px ui-monospace, Consolas, monospace';
        context.lineWidth = 3;
        context.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        for (const [point, text] of labels) {
            context.strokeText(String(text), point.x + 5, point.y - 5);
        }
        context.fillStyle = '#fff';
        for (const [point, text] of labels) {
            context.fillText(String(text), point.x + 5, point.y - 5);
        }
        context.lineWidth = 2;
    }
}

/**
 * The bots the B key goes through: the ones in the registry, then the ones the
 * console pasted in. A pasted bot is in no registry, so the backend keeping
 * hold of it is the only thing between switching away and pasting it again.
 */
function roster(backend) {
    const ring = bots.names.map((name) => bots.resolve(name));
    for (const entry of backend.installed) {
        if (!ring.includes(entry.factory)) ring.push(entry.factory);
    }
    return ring;
}

/** What each of the AI's decision branches means, for the panel. */
const STATE_TEXT = {
    flee: 'flee      threats close, taking the cheapest way out',
    bait: 'bait      nearly merged, letting one come to us',
    stage: 'stage     walking round a virus to line a shot up',
    pop: 'pop       feeding a virus at somebody',
    hide: 'hide      sitting in a virus it is too small to pop',
    pour: 'pour      pouring the pieces into the biggest one',
    lure: 'lure      standing on a virus, offering itself',
    escape: 'escape    splitting out of something it cannot outrun',
    split: 'split     splitting onto prey',
    hunt: 'hunt      closing on prey',
    feed: 'feed      eating pellets',
    roam: 'roam      nothing to eat, heading for room',
};

function render(backend, panel) {
    const status = backend.status;
    const lines = [
        (status.bot || 'AposBot ' + version) +
            (status.running ? '  [ON]' : '  [off]'),
        '',
        'mass      ' + status.mass,
        'cells     ' + status.cells,
        'visible   ' + status.visible,
    ];

    // What the bot is doing, and whatever it says about why.
    if (status.running && status.alive) {
        lines.push('');
        lines.push(STATE_TEXT[status.state] || 'state     ' + status.state);
        for (const line of status.lines) lines.push(line);
    } else if (status.running && status.connected) {
        lines.push('');
        lines.push(
            status.autoplay
                ? 'dead      starting the next life'
                : 'dead      press Play, or P to restart on its own'
        );
    }
    if (status.desyncs > 0) {
        lines.push('');
        lines.push('PROTOCOL DESYNC x' + status.desyncs);
        lines.push('see console for details');
    }
    if (!status.connected) {
        lines.push('');
        lines.push('waiting for game socket...');
    }
    // One key per line. Side by side these are the widest thing on the panel,
    // and the panel is as wide as whatever it holds.
    lines.push('');
    lines.push('T   manual');
    if (roster(backend).length > 1) lines.push('B   bot');
    lines.push('R   draw');
    lines.push('D   dark');
    lines.push('P   restart ' + (status.autoplay ? '[on]' : '[off]'));
    panel.textContent = lines.join('\n');
}

function main() {
    const log = (...parts) => console.log('[AposBot]', ...parts);

    const backend = new BrowserBackend({ log });
    // Hook the socket immediately: the game connects as soon as it loads, and
    // a hook installed afterwards sees nothing.
    backend.install(window);

    const useBot = (name) => {
        const bot = backend.useBot(bots.resolve(name));
        log('Playing ' + bot.name);
        return bot;
    };

    useBot(bots.DEFAULT_BOT);

    /** Hands the game to the next bot along, wrapping at the end. */
    const nextBot = () => {
        const ring = roster(backend);
        if (ring.length < 2) {
            log(backend.bot.name + ' is the only bot installed');
            return;
        }
        const at = ring.indexOf(backend.factory);
        log('Playing ' + backend.useBot(ring[(at + 1) % ring.length]).name);
    };

    backend.on('desync', (err) => {
        console.warn(
            '[AposBot] Could not decode a frame from agar.io. The record ' +
            'layout has probably changed.\n' +
            'Save what the server is sending with AposBot.dump(), then open ' +
            'an issue at ' + ISSUES + '\n' +
            err.message + (err.dump ? '\n' + err.dump : '')
        );
    });
    backend.on('unknown', (opcode) => {
        console.warn(
            '[AposBot] agar.io sent opcode 0x' +
            opcode.toString(16).padStart(2, '0') +
            ', which the codec does not model. Frames are ' +
            'arriving but none of them reach the world.\n' +
            'Save what the server is sending with AposBot.dump(), then open ' +
            'an issue at ' + ISSUES
        );
    });
    backend.on('error', (err) => console.error('[AposBot] AI error:', err));

    let overlay = null;
    let panel = null;
    let drawDebugEnabled = true;

    const ready = () => {
        if (panel) return;
        overlay = createOverlay();
        panel = createPanel();

        initAnalytics({
            window,
            document,
            storage: window.localStorage,
            log,
        });

        // The overlay sits on top of a game that renders at 60fps, so it has
        // to be drawn on the same clock or it trails what it is annotating.
        // The panel is text and reads better without flicker.
        setInterval(() => render(backend, panel), 100);

        const paint = () => {
            // The camera belongs to the display, so it moves on the display's
            // clock whether the bot is running or not. The backend's tick does
            // this too; stepping by elapsed time means both is the same as one.
            backend.stepCamera();
            if (drawDebugEnabled) drawDebug(backend, overlay);
            requestAnimationFrame(paint);
        };
        requestAnimationFrame(paint);

        window.addEventListener('keydown', (event) => {
            if (event.target && /^(INPUT|TEXTAREA)$/.test(event.target.tagName)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === KEYS.TOGGLE_BOT) {
                log(backend.toggle() ? 'Bot on' : 'Manual controls');
            } else if (key === KEYS.NEXT_BOT) {
                nextBot();
            } else if (key === KEYS.TOGGLE_DARK) {
                const dark = toggleDark();
                if (dark === null) log('No game core yet, so no theme to set');
                else log(dark ? 'Dark mode on' : 'Dark mode off');
            } else if (key === KEYS.TOGGLE_DRAW) {
                drawDebugEnabled = !drawDebugEnabled;
                if (!drawDebugEnabled && overlay) {
                    overlay
                        .getContext('2d')
                        .clearRect(0, 0, overlay.width, overlay.height);
                }
            } else if (key === KEYS.TOGGLE_RESTART) {
                backend.autoplay = !backend.autoplay;
                log(
                    backend.autoplay
                        ? 'Restarting after each death'
                        : 'Stopping at the next death'
                );
            }
        });

        // Autoplay presses Play once it sees no cells, so starting here is
        // enough to get a life going without anyone touching the keyboard.
        // The exception is the first visit, which belongs to whoever is
        // setting their name up. Blocking only covers pointer movement, so
        // the menu stays usable with the bot already on.
        if (firstVisit()) {
            backend.autoplay = false;
            backend.once('tick', () => {
                backend.autoplay = true;
                remember(MENU_KEY);
            });
            log('Bot on. Set your name up, then press Play and it takes over.');
        } else {
            log('Bot on. Press T for manual controls.');
        }
        backend.start();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ready);
    } else {
        ready();
    }

    // The script header handles updates for most people; this is a courtesy
    // notice for anyone whose manager has auto-update switched off.
    checkForUpdate({ storage: window.localStorage })
        .then((update) => {
            if (update && update.isOutdated) {
                log(
                    'Version ' + update.latest + ' is available (you have ' +
                    version + '): ' + update.url
                );
            }
        })
        .catch(() => {});

    // A small console API, so the bot can be driven without the UI.
    window.AposBot = {
        version,
        backend,
        world: backend.world,
        start: () => backend.start(),
        stop: () => backend.stop(),
        status: () => backend.status,
        capture: () => backend.capture(),
        /** The bots that can be run, and switching to one of them by name. */
        bots: bots.names,
        get bot() {
            return backend.bot;
        },
        use: (name) => useBot(name).name,
        dump: () => backend.dump(),
        cdnUrl,
        /** Reporting, and turning it off from the next page load onwards. */
        analytics: {
            get enabled() {
                return !isOptedOut(window.localStorage);
            },
            set enabled(on) {
                setOptOut(window.localStorage, !on);
            },
        },
    };

    // Companion userscripts get no say in load order, so the array is the
    // meeting point and whoever runs first creates it. What is already in it
    // is installed now, and a push from here on installs on the spot.
    const queue = window.aposBots || [];
    const installQueued = (factory) => {
        if (typeof factory !== 'function') {
            console.error(
                '[AposBot] window.aposBots takes a factory: a function that ' +
                'takes the world API and returns the bot. Got ' +
                typeof factory + '.'
            );
            return;
        }
        try {
            log('Playing ' + backend.useBot(factory).name);
        } catch (err) {
            console.error('[AposBot] A bot in window.aposBots threw:', err);
        }
    };
    for (const factory of queue.slice()) installQueued(factory);
    queue.push = function (...factories) {
        for (const factory of factories) {
            Array.prototype.push.call(this, factory);
            installQueued(factory);
        }
        return this.length;
    };
    window.aposBots = queue;
}

main();

};

__modules[1] = function (module, exports, require) {
'use strict';

/**
 * Backend: agar.io, in the browser.
 *
 * Wrapping the WebSocket constructor gets the same bytes the game reads.
 * Decisions go back out as mouse and key events on the canvas, so nothing
 * writes into the game's memory.
 */

const { EventEmitter } = require(6);
const { World } = require(7);
const modern = require(8);

/** Frames kept for diagnostics when the protocol changes under us. */
const CAPTURE_LIMIT = 200;

/**
 * Marks canvases the bot puts on the page itself. The overlay covers the whole
 * window and the game's canvas does not, so without this the overlay is the
 * biggest canvas around and findCanvas picks it.
 */
const OWN_CANVAS = 'data-aposbot';

/**
 * Pointer events the game watches. It reapplies the real pointer on every
 * frame, so these have to stop reaching it while the bot is steering.
 */
const POINTER_EVENTS = ['mousemove', 'pointermove', 'pointerrawupdate'];

/**
 * Frames kept from the start of every socket, in both directions. The
 * handshake is there, and it is over before anyone can ask for a capture.
 */
const PROLOGUE_LIMIT = 40;

/**
 * How the live steering readout is scored. Same definitions the offline
 * measurement runs use, so a number off the panel means what a number off a
 * measured run means. A destination closer than MIN_HEADING has no reliable
 * direction and is left out rather than counted as a wild turn.
 */
const REVERSAL_DEGREES = 90;
const MIN_HEADING = 1;
/** How long the readout accumulates before it publishes and starts again. */
const STEERING_WINDOW_MS = 1000;

/**
 * Starting the next life. How long after the last cell dies before the page
 * is asked for another, since the results take a moment to come up; how long
 * between two presses, since the first is still being animated; and how long
 * without a button to press before the spawn goes through the core instead.
 */
const RESTART_DELAY = 1000;
const RESTART_PAUSE = 1500;
const RESTART_FALLBACK = 12000;
/** The page's own buttons, in the order a death shows them. */
const RESTART_BUTTONS = ['statsContinue', 'play'];
/**
 * What the bot puts in the nickname box, once, when the box first turns up.
 * Typing over it afterwards sticks, since nothing writes to the box again.
 */
const DEFAULT_NICK = 'NotReallyABot';
/** The page's nickname box. */
const NICK_FIELD = 'nick';
/**
 * How long a game socket may go without an update while we have cells
 * before it is closed. A live game streams 25 updates a second, so a socket
 * that is open and silent for this long has lost its connection without
 * finding out, and the game sits frozen until it is told.
 */
const SILENCE_MS = 10000;

function toHex(bytes) {
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
        out += bytes[i].toString(16).padStart(2, '0');
    }
    return out;
}

/**
 * Normalises whatever the socket hands us into bytes, or null for the text
 * frames agar.io also sends.
 *
 * A userscript can run in a different realm from the page, where `instanceof
 * ArrayBuffer` is false even for a real one, so check the internal class.
 */
function toBytes(data) {
    if (!data || typeof data === 'string') return null;
    const tag = Object.prototype.toString.call(data);
    if (tag === '[object ArrayBuffer]') return new Uint8Array(data);
    if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
    return null;
}

class BrowserBackend extends EventEmitter {
    constructor(options = {}) {
        super();
        this.log = options.log || function () {};
        this.world = new World({ log: this.log });
        this.bot = null;
        /** What built the live bot, so a ring of them knows where it is. */
        this.factory = null;
        /** Every bot installed so far, as { name, factory }, in that order. */
        this.installed = [];

        this.socket = null;
        this.connection = null;
        this.capturing = false;
        this.captured = [];
        this.prologue = [];
        this.sockets = 0;
        this.prologueCounts = new Map();
        this.desyncs = 0;
        this.lastDesync = null;
        this.frames = 0;
        /** Opcodes the codec does not model, counted by opcode. */
        this.unknownOpcodes = new Map();
        this.unknown = 0;

        /** Where the AI wants to go, in world coordinates. */
        this.target = null;
        /** Whether the bot's decisions reach the game. See run. */
        this.enabled = false;
        /** Whether the frame loop is going. */
        this.looping = false;

        /** Whether the nickname box has been written to. See nameSelf. */
        this.named = false;

        /** Whether a death is followed by the next life. See keepPlaying. */
        this.autoplay = true;
        this.deadSince = 0;
        this.lastRestart = 0;
        this.restarts = 0;

        this.canvas = null;
        /** The game canvas's box, measured once a frame. See readCanvasRect. */
        this.canvasRect = null;
        /** Whether the game's own input surface has turned up yet. */
        this.hasCore = false;
        this.pointerBlocker = null;
        this.mouseX = 0;
        this.mouseY = 0;

        /** Whether the game told us its zoom, rather than us inferring it. */
        this.zoomFromGame = false;
        this.zoomWatched = null;
        this.targetWatched = null;
        /** True only inside aimAt, so the game's own resync can be told apart. */
        this.aiming = false;

        /**
         * How steady the steering has been over the last window. The panel
         * shows it next to what the AI says it is doing, because a state
         * flipping many times a second and a heading swinging with it is what
         * a stutter looks like from in here.
         */
        this.steering = {
            turn: 0, reversals: 0, switches: 0, decisions: 0, rate: 0, ai: 0,
            pointer: 0,
        };
        this.window = {
            since: 0, degrees: 0, decisions: 0, reversals: 0, switches: 0,
            ticks: 0, ai: 0, pointer: 0,
        };
        this.lastHeading = null;
        this.lastState = null;
    }

    useBot(factory) {
        this.factory = factory;
        this.bot = factory(
            this.world.api({
                setPoint: (x, y) => this.setPoint(x, y),
                split: () => this.split(),
                eject: () => this.eject(),
                // In the browser the pointer is real, so report where it is.
                getMouseX: () => this.mouseX,
                getMouseY: () => this.mouseY,
            })
        );

        // A bot is known by its name, so a second one under a name already
        // here replaces it. Working on a bot means pasting an edit into the
        // console, and every paste is a new function.
        const at = this.installed.findIndex((e) => e.name === this.bot.name);
        if (at < 0) this.installed.push({ name: this.bot.name, factory });
        else this.installed[at] = { name: this.bot.name, factory };

        return this.bot;
    }

    /**
     * Wraps window.WebSocket so every frame the game receives also reaches us.
     * Has to run before the game connects, hence `@run-at document-start`.
     */
    install(win = window) {
        const backend = this;
        const NativeWebSocket = win.WebSocket;
        if (NativeWebSocket && NativeWebSocket.__aposBotWrapped) return;

        function WrappedWebSocket(url, protocols) {
            const socket = protocols
                ? new NativeWebSocket(url, protocols)
                : new NativeWebSocket(url);

            const connection = new modern.Connection();
            backend.record('open', socket, null);

            // What we send matters as much as what we receive: the handshake
            // says which revision the client claims to speak.
            const nativeSend = socket.send;
            socket.send = function (data) {
                const bytes = toBytes(data);
                backend.record('out', socket, bytes);
                // Half the cipher key is in what the client sends.
                if (bytes) connection.observeOutbound(bytes);
                return nativeSend.call(this, data);
            };

            // agar.io opens sockets for things other than the game; the game
            // socket is the one that carries binary frames.
            let adopted = false;
            socket.addEventListener('message', (event) => {
                const bytes = toBytes(event.data);
                if (!bytes) return;
                if (!adopted) {
                    adopted = true;
                    // A different server, so its map is a different size at a
                    // different origin. This runs on the greeting, before the
                    // map that follows it.
                    if (backend.connection) backend.world.beginConnection();
                }
                backend.socket = socket;
                backend.connection = connection;
                backend.record('in', socket, bytes);
                backend.onFrame(bytes, connection);
            });
            socket.addEventListener('close', () => {
                if (backend.socket === socket) {
                    backend.socket = null;
                    // Nothing in the world outlives its server. A cell of
                    // ours left behind keeps the world alive, and a world
                    // that is alive never asks the page for the next life.
                    backend.world.beginConnection();
                    backend.emit('disconnected');
                }
            });
            return socket;
        }

        WrappedWebSocket.prototype = NativeWebSocket.prototype;
        WrappedWebSocket.CONNECTING = NativeWebSocket.CONNECTING;
        WrappedWebSocket.OPEN = NativeWebSocket.OPEN;
        WrappedWebSocket.CLOSING = NativeWebSocket.CLOSING;
        WrappedWebSocket.CLOSED = NativeWebSocket.CLOSED;
        WrappedWebSocket.__aposBotWrapped = true;

        win.WebSocket = WrappedWebSocket;
        this.log('WebSocket hook installed');
    }

    /**
     * Files one frame under the socket's prologue, the rolling capture window,
     * or both.
     */
    record(direction, socket, bytes) {
        if (direction !== 'open' && !bytes) return;

        if (!socket.__aposBotId) socket.__aposBotId = ++this.sockets;
        const entry = { t: Date.now(), dir: direction, socket: socket.__aposBotId };
        if (direction === 'open') entry.url = String(socket.url);
        else entry.hex = toHex(bytes);

        const kept = this.prologueCounts.get(entry.socket) || 0;
        if (kept < PROLOGUE_LIMIT) {
            this.prologue.push(entry);
            this.prologueCounts.set(entry.socket, kept + 1);
        }
        if (this.capturing) {
            this.captured.push(entry);
            if (this.captured.length > CAPTURE_LIMIT) this.captured.shift();
        }
    }

    onFrame(bytes, connection) {
        this.frames++;

        let message;
        try {
            message = connection.decode(bytes);
        } catch (err) {
            // Report rather than feed the AI a world that is quietly wrong.
            this.desyncs++;
            if (this.desyncs === 1 || this.desyncs % 500 === 0) {
                this.lastDesync = err;
                this.emit('desync', err);
            }
            return;
        }
        if (!message) return;

        if (message.type === 'unknown') {
            this.unknown++;
            const seen = (this.unknownOpcodes.get(message.opcode) || 0) + 1;
            this.unknownOpcodes.set(message.opcode, seen);
            if (seen === 1) this.emit('unknown', message.opcode);
            return;
        }

        this.world.apply(message);
        this.emit('frame', message);
    }

    // ------------------------------------------------------------------ input

    findCanvas(doc = document) {
        if (this.canvas && doc.body.contains(this.canvas)) return this.canvas;
        // The game renders to the largest canvas on the page that the bot did
        // not add itself.
        //
        // Largest as laid out, not as allocated. agar.io keeps canvases that
        // are never displayed -- a stats graph, and one a good megapixel in
        // size -- and those have a backing store big enough to win on width
        // times height while occupying no space at all. A page with one of
        // those picked instead of the game puts the assumed centre anywhere.
        // Nothing the bot draws or aims at survives that, so go by the box the
        // canvas actually occupies, which is zero for all of them.
        const canvases = Array.from(doc.getElementsByTagName('canvas')).filter(
            (canvas) =>
                (!canvas.hasAttribute || !canvas.hasAttribute(OWN_CANVAS)) &&
                canvas.clientWidth > 0 &&
                canvas.clientHeight > 0
        );
        this.canvas = canvases.sort(
            (a, b) =>
                b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight
        )[0] || null;
        return this.canvas;
    }

    /**
     * Brings the camera up to now, having first matched the viewport to the
     * canvas the game is drawing on.
     *
     * That canvas is not the window. agar.io lays it out above a banner and
     * reflows it as the ads around it load, so it is both smaller than the
     * window and a different size at different moments -- 1920x863 and
     * 1920x807 in two runs of the same page. The zoom is computed from those
     * dimensions, so reading them anywhere but here leaves the camera scaled
     * for a viewport the game is not using.
     *
     * The overlay draws whether or not the bot is running, so this has to be
     * on the display's clock rather than inside tick().
     */
    stepCamera() {
        // Picks up the game's input surface as soon as it exists, which is
        // also where the zoom is followed from.
        this.controls();
        // Stale from here on: the frame is about to draw against a new camera.
        this.canvasRect = null;
        const canvas = this.findCanvas();
        if (canvas && canvas.clientWidth > 0 && canvas.clientHeight > 0) {
            this.world.viewWidth = canvas.clientWidth;
            this.world.viewHeight = canvas.clientHeight;
        }
        this.world.stepCamera();
    }

    /**
     * World coordinates to screen pixels.
     *
     * World.stepCamera keeps the camera current, and tick calls it once a
     * frame. Without that the camera only moves when the network says so, and
     * the overlay steps 25 times a second over a game that glides 60.
     */
    worldToScreen(x, y) {
        const rect = this.canvasRect || this.readCanvasRect();
        if (!rect) return null;
        const world = this.world;
        const ratio = world.ratio || 1;
        // Viewport coordinates, since the overlay is drawn over the whole
        // window and the game's canvas may not fill it.
        return {
            x: rect.left + (x - world.viewX) * ratio + rect.width / 2,
            y: rect.top + (y - world.viewY) * ratio + rect.height / 2,
        };
    }

    /**
     * Measures the game canvas, and remembers it for the rest of the frame.
     *
     * `getBoundingClientRect` makes the browser flush layout. The overlay
     * projects every line end, circle and point the AI emitted, which in a
     * crowded game is a few thousand, and asking per point turned one frame
     * into a few thousand forced layouts. Nothing moves between two projections
     * in the same frame, so one measurement does for all of them. `stepCamera`
     * drops it at the top of each frame.
     */
    readCanvasRect() {
        const canvas = this.findCanvas();
        if (!canvas) return null;
        this.canvasRect = canvas.getBoundingClientRect();
        return this.canvasRect;
    }

    /**
     * agar.io's own input surface. The game reads the pointer inside its
     * WebAssembly core, which ignores synthetic mouse and key events, so
     * anything we want it to do has to go through here. `setTarget` takes
     * canvas pixels, the same space the real pointer would be in.
     */
    controls() {
        if (typeof window === 'undefined') return null;
        const core = window.core;
        if (!core || typeof core.setTarget !== 'function') return null;
        this.hasCore = true;
        this.watchZoom(core);
        this.watchTarget(core);
        // The core turns up when the page is ready and not before, which can
        // be after the bot was switched on. The pointer has to be held off
        // from the moment it does: the game reapplies the real pointer every
        // frame, so a live mouse and a steering bot take turns and the cell
        // rocks between the two of them.
        if (this.enabled) this.blockPointer(true);
        return core;
    }

    /**
     * Follows the player's own zoom, which multiplies the camera's scale.
     *
     * The core keeps the zoom to itself, and the only thing that reaches it is
     * the wheel, through `core.playerZoom`. agar.io's own bundle calls it with
     * the notch and nothing else:
     *
     *     window['core']['playerZoom'](e.wheelDelta / -120 || e.detail || 0)
     *
     * So a notch in arrives as -1 and a notch out as +1, and `World.zoomBy`
     * puts it on the same ladder the core is climbing.
     *
     * Wrap the call rather than listening for `wheel`. The page's notches
     * counted separately from the core's are two ladders, and the drift ends
     * at the 0.07 floor with the overlay collapsed onto the centre of the
     * screen -- and with `aimAt` scaling by a ratio that small, the cell
     * crawls, which no death or reconnect clears.
     */
    watchZoom(core) {
        if (this.zoomWatched === core || !core) return;
        this.zoomWatched = core;
        if (typeof core.playerZoom !== 'function') return;

        const backend = this;
        const native = core.playerZoom;
        core.playerZoom = function (delta) {
            if (Number.isFinite(delta) && delta !== 0) {
                backend.zoomFromGame = true;
                backend.world.zoomBy(delta);
            }
            return native.apply(this, arguments);
        };
    }

    /**
     * Holds off agar.io's own pointer resync while the bot steers.
     *
     * `mc/agario.js` re-pushes its stored cursor through `core.setTarget`
     * every 25ms for as long as the page thinks you are in a game:
     *
     *     if (now - this.lastSyncTime > 25)
     *         this.updateMouseTarget(this.targetMouseX, this.targetMouseY)
     *
     * No mouse event is involved, so blocking events does nothing about it,
     * and the bot ends up sharing the wheel with a second driver aiming at
     * wherever the cursor was left. It runs only while the page is in a game,
     * which is why the bot steers cleanly when it spawned through
     * `core.sendNick` with the menu still up, and fights the moment
     * someone presses Play.
     */
    watchTarget(core) {
        if (this.targetWatched === core || !core) return;
        this.targetWatched = core;
        if (typeof core.setTarget !== 'function') return;

        const backend = this;
        const native = core.setTarget;
        core.setTarget = function (x, y) {
            if (backend.enabled && !backend.aiming) return;
            return native.apply(this, arguments);
        };
    }

    /**
     * Aims at a world position by pointing the game at it.
     *
     * This and `split` and `eject` are everything the bot does to the game, so
     * they are where manual play is held: the AI goes on thinking and drawing
     * while the three of them stop short of the game.
     */
    aimAt(x, y) {
        if (!this.enabled) return;
        const canvas = this.findCanvas();
        if (!canvas) return;

        const centreX = canvas.clientWidth / 2;
        const centreY = canvas.clientHeight / 2;

        // Past a short dead zone agar.io moves at full speed toward the
        // pointer, so beyond that only the direction matters. Capping the
        // offset instead of clamping each axis keeps the direction exact for
        // targets that fall outside the canvas.
        const ratio = this.world.ratio || 1;
        let offsetX = (x - this.world.viewX) * ratio;
        let offsetY = (y - this.world.viewY) * ratio;
        const reach = Math.min(centreX, centreY) * 0.9;
        const length = Math.hypot(offsetX, offsetY);
        if (length > reach) {
            offsetX = (offsetX / length) * reach;
            offsetY = (offsetY / length) * reach;
        }

        this.mouseX = centreX + offsetX;
        this.mouseY = centreY + offsetY;

        const core = this.controls();
        if (core) {
            // `setTarget` takes backing-store pixels, not CSS ones: the page
            // passes `clientX * canvasScale`, and the same scale is what sizes
            // the backing store. They part company on a HiDPI screen and at
            // any quality setting below High, which halves it.
            const scale =
                canvas.clientWidth > 0 && canvas.width > 0
                    ? canvas.width / canvas.clientWidth
                    : 1;
            this.aiming = true;
            try {
                core.setTarget(this.mouseX * scale, this.mouseY * scale);
            } finally {
                this.aiming = false;
            }
            return;
        }

        const rect = canvas.getBoundingClientRect();
        canvas.dispatchEvent(
            new MouseEvent('mousemove', {
                clientX: rect.left + this.mouseX,
                clientY: rect.top + this.mouseY,
                bubbles: true,
                cancelable: true,
                view: window,
            })
        );
    }

    split() {
        if (!this.enabled) return;
        const core = this.controls();
        if (core && typeof core.split === 'function') core.split();
        else this.pressKey(' ', 32);
    }

    eject() {
        if (!this.enabled) return;
        const core = this.controls();
        if (core && typeof core.eject === 'function') core.eject();
        else this.pressKey('w', 87);
    }

    pressKey(key, keyCode) {
        const target = this.findCanvas() || document.body;
        for (const type of ['keydown', 'keyup']) {
            target.dispatchEvent(
                new KeyboardEvent(type, {
                    key,
                    keyCode,
                    which: keyCode,
                    bubbles: true,
                    cancelable: true,
                })
            );
        }
    }

    // ------------------------------------------------------------------- loop

    /**
     * agar.io reapplies the real pointer on every frame, overwriting whatever
     * setTarget was last told, so the two fight and the cell judders. While
     * the bot is steering, the pointer has to stop reaching the game.
     *
     * Only when the game's own input is in use. The fallback path works by
     * dispatching events, and blocking would swallow those too.
     */
    blockPointer(on) {
        if (typeof window === 'undefined') return;
        if (on && !this.pointerBlocker) {
            // Counted as well as stopped. A pointer that keeps moving while
            // the bot steers is a hand on the mouse, and every measurement
            // taken with one there is measuring the hand.
            this.pointerBlocker = (event) => {
                this.window.pointer++;
                event.stopImmediatePropagation();
            };
            for (const type of POINTER_EVENTS) {
                window.addEventListener(type, this.pointerBlocker, true);
            }
        } else if (!on && this.pointerBlocker) {
            for (const type of POINTER_EVENTS) {
                window.removeEventListener(type, this.pointerBlocker, true);
            }
            this.pointerBlocker = null;
        }
    }

    /**
     * Starts the next life once this one has ended, through the page's own
     * buttons, so the menu goes away the way it does for a person.
     *
     * agar.io puts the match results up a moment after the last cell dies,
     * with Continue on them, and the main menu with Play behind that. Each is
     * pressed once it is on screen, with a pause between presses so one that
     * is still being animated is not pressed twice. When neither turns up the
     * spawn goes through `core.sendNick`, which starts a life with the menu
     * still drawn over it.
     */
    keepPlaying(now) {
        if (!this.autoplay || !this.enabled) {
            this.deadSince = 0;
            return;
        }
        if (!this.deadSince) {
            this.deadSince = now;
            return;
        }
        if (now - this.deadSince < RESTART_DELAY) return;
        if (now - this.lastRestart < RESTART_PAUSE) return;
        const button = this.restartButton();
        if (button) {
            button.click();
            this.lastRestart = now;
            this.restarts++;
            return;
        }
        if (now - this.deadSince < RESTART_FALLBACK) return;
        const core = this.controls();
        if (core && typeof core.sendNick === 'function') {
            core.sendNick(this.spawnNick());
            this.lastRestart = now;
            this.restarts++;
        }
    }

    /** The page's nickname box, if it has one. */
    nickField() {
        if (typeof document === 'undefined') return null;
        const field = document.getElementById(NICK_FIELD);
        return field && typeof field.value === 'string' ? field : null;
    }

    /** The name the next life spawns under, whoever put it in the box. */
    spawnNick() {
        const field = this.nickField();
        const typed = field ? field.value.trim() : '';
        return typed || DEFAULT_NICK;
    }

    /**
     * Puts the bot's name in the nickname box, once a box exists.
     *
     * Play spawns under whatever the box holds, so the box is the only way a
     * name reaches a life started that way. The write happens once per page
     * rather than once per life, which leaves a name typed over it alone.
     *
     * An input that keeps its value in a framework rather than on the element
     * ignores a plain assignment, so the write goes through the prototype's
     * setter and an input event, the way a keystroke would.
     */
    nameSelf() {
        if (this.named) return;
        const field = this.nickField();
        if (!field) return;
        this.named = true;
        const value = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(field),
            'value'
        );
        if (value && value.set) value.set.call(field, DEFAULT_NICK);
        else field.value = DEFAULT_NICK;
        if (typeof Event !== 'function') return;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
    }

    /**
     * Closes a game socket that has stopped talking while we have cells.
     *
     * A connection that drops underneath the browser can stay open as far as
     * the socket knows, and the game freezes on its last frame. Closing it is
     * what tells the page, which then shows the menu, and the next life goes
     * through keepPlaying like any other.
     */
    dropSilentSocket(now) {
        const socket = this.socket;
        if (!socket || socket.readyState !== 1) return;
        if (now - this.world.lastUpdate < SILENCE_MS) return;
        this.log('No update for ' + SILENCE_MS / 1000 + 's, closing the socket');
        socket.close();
    }

    /** The first of the page's restart buttons that is on screen. */
    restartButton() {
        if (typeof document === 'undefined') return null;
        for (const id of RESTART_BUTTONS) {
            const button = document.getElementById(id);
            if (!button || typeof button.getBoundingClientRect !== 'function') {
                continue;
            }
            const box = button.getBoundingClientRect();
            if (!(box.width > 0 && box.height > 0)) continue;
            const style =
                typeof getComputedStyle === 'function'
                    ? getComputedStyle(button)
                    : null;
            if (style && (style.display === 'none' || style.visibility === 'hidden')) {
                continue;
            }
            return button;
        }
        return null;
    }

    /**
     * Starts the frame loop, which keeps going whether or not the bot is
     * driving. The drawings are the AI's reasoning, so playing manually with
     * them still up means it has to keep thinking to have anything to draw.
     * What `enabled` gates is the output: aimAt, split and eject.
     */
    run() {
        if (this.looping) return;
        this.looping = true;
        const step = () => {
            if (!this.looping) return;
            this.tick();
            this.rafHandle = requestAnimationFrame(step);
        };
        this.rafHandle = requestAnimationFrame(step);
    }

    start() {
        this.run();
        if (this.enabled) return;
        this.enabled = true;
        this.controls();
        this.emit('started');
    }

    stop() {
        this.enabled = false;
        this.blockPointer(false);
        this.emit('stopped');
    }

    toggle() {
        if (this.enabled) this.stop();
        else this.start();
        return this.enabled;
    }

    /**
     * Records where the bot is steering.
     *
     * The AI reads this back through getPointX and getPointY as the
     * destination its cells were already going towards, and falls back on it
     * whenever it cannot pick a better one. A backend that skips this leaves
     * those at the origin, so the fallback aims at the top left of the map.
     */
    setPoint(x, y) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        this.target = [x, y];
        this.world.pointX = x;
        this.world.pointY = y;
    }

    /**
     * Scores one decision: how far it turned from the one before, and whether
     * the AI changed its mind about what it is doing.
     */
    measureDecision(x, y, now) {
        const centre = this.world.playerCentre();
        const dx = x - centre.x;
        const dy = y - centre.y;
        const length = Math.hypot(dx, dy);

        const state = this.bot ? this.bot.state : null;
        if (this.lastState !== null && state !== this.lastState) {
            this.window.switches++;
        }
        this.lastState = state;

        if (length >= MIN_HEADING) {
            const heading = [dx / length, dy / length];
            if (this.lastHeading) {
                const dot = Math.min(1, Math.max(-1,
                    heading[0] * this.lastHeading[0] +
                    heading[1] * this.lastHeading[1]));
                const degrees = (Math.acos(dot) * 180) / Math.PI;
                this.window.decisions++;
                this.window.degrees += degrees;
                if (degrees > REVERSAL_DEGREES) this.window.reversals++;
            }
            this.lastHeading = heading;
        }

    }

    /** Milliseconds, from the finer clock when the page has one. */
    clock() {
        return typeof performance !== 'undefined' && performance.now
            ? performance.now()
            : Date.now();
    }

    /**
     * Closes the steering window once a second and starts the next one.
     *
     * `rate` and `ai` are here rather than on their own because they answer
     * the same question from the other side: a mark that judders over a blob
     * is either the AI changing its mind or the frame not arriving, and the
     * two look identical on screen.
     */
    publishSteering(now) {
        if (!this.window.since) this.window.since = now;
        if (now - this.window.since < STEERING_WINDOW_MS) return;

        const w = this.window;
        const elapsed = (now - w.since) / 1000;
        this.steering = {
            turn: w.decisions ? w.degrees / w.decisions : 0,
            reversals: w.decisions ? (100 * w.reversals) / w.decisions : 0,
            switches: elapsed ? w.switches / elapsed : 0,
            decisions: w.decisions,
            rate: elapsed ? w.ticks / elapsed : 0,
            ai: w.ticks ? w.ai / w.ticks : 0,
            pointer: elapsed ? w.pointer / elapsed : 0,
        };
        this.window = {
            since: now, degrees: 0, decisions: 0, reversals: 0, switches: 0,
            ticks: 0, ai: 0, pointer: 0,
        };
    }

    tick() {
        // Once a frame, before anything reads the camera. Aiming and the
        // overlay both project through it, and it carries the viewport the AI
        // converts screen and world with.
        this.stepCamera();
        // The box is part of the menu, which mounts whenever the page gets
        // around to it, so this keeps looking until it is there.
        this.nameSelf();

        const now = Date.now();
        if (this.world.isAlive) {
            this.deadSince = 0;
            this.dropSilentSocket(now);
        } else {
            this.keepPlaying(now);
        }
        if (!this.bot || !this.world.isAlive) return;

        this.world.clearDebug();

        let destination;
        const started = this.clock();
        try {
            destination = this.bot.mainLoop();
        } catch (err) {
            this.emit('error', err);
            return;
        }
        this.window.ai += this.clock() - started;
        this.window.ticks++;
        // Straight through, once a frame. The AI reads it back next frame and
        // leans on it, so anything that filters it here also changes what the
        // AI thinks it decided.
        if (Array.isArray(destination) && destination.length >= 2) {
            const [x, y] = destination;
            if (Number.isFinite(x) && Number.isFinite(y)) {
                this.setPoint(x, y);
                this.aimAt(x, y);
                this.measureDecision(x, y, now);
            }
        }
        // Every frame, decision or not: a frame the AI spent without settling
        // on anywhere to go is exactly the frame worth counting.
        this.publishSteering(now);
        this.emit('tick', this.world);
    }

    // ------------------------------------------------------------ diagnostics

    /**
     * Records raw frames for diagnosing a layout change. Returns a function
     * that stops recording and hands back everything worth reading: the
     * opening frames of every socket, then the rolling window.
     */
    capture() {
        this.captured = [];
        this.capturing = true;
        this.log('Capturing frames. Call the returned function to stop.');
        return () => {
            this.capturing = false;
            return this.dump();
        };
    }

    /** The prologue frames then the rolling window, with nothing listed twice. */
    dump() {
        const inPrologue = new Set(this.prologue);
        return {
            capturedAt: new Date().toISOString(),
            frames: this.prologue.concat(
                this.captured.filter((entry) => !inPrologue.has(entry))
            ),
        };
    }

    get status() {
        return {
            running: this.enabled,
            connected: !!this.socket,
            alive: this.world.isAlive,
            autoplay: this.autoplay,
            restarts: this.restarts,
            bot: this.bot ? this.bot.name : null,
            state: this.bot ? this.bot.state : null,
            threats: this.bot ? this.bot.threatCount : 0,
            clusters: this.bot ? this.bot.clusterCount : 0,
            gaps: this.bot ? this.bot.gapCount : 0,
            // A bot can report its own numbers, which is the only way the
            // panel says anything about tactics the older one does not have.
            lines:
                this.bot && this.bot.displayText ? this.bot.displayText() : [],
            steering: this.steering,
            mass: this.world.mass,
            cells: this.world.playerCells.length,
            visible: Object.keys(this.world.cells).length,
            frames: this.frames,
            viewWidth: this.world.viewWidth,
            viewHeight: this.world.viewHeight,
            ratio: this.world.ratio,
            zoom: this.world.playerZoom,
            input: this.hasCore ? 'core' : 'events',
            blocking: !!this.pointerBlocker,
            desyncs: this.desyncs,
            unknown: this.unknown,
            unknownOpcodes: [...this.unknownOpcodes.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([opcode, count]) => ({ opcode, count })),
        };
    }
}

module.exports = {
    BrowserBackend,
    CAPTURE_LIMIT,
    PROLOGUE_LIMIT,
    OWN_CANVAS,
    POINTER_EVENTS,
};

};

__modules[2] = function (module, exports, require) {
'use strict';

/**
 * The bots you can run, by name.
 *
 * A backend takes a factory rather than a bot, so everything that picks one
 * picks it from here. Add your own bot to this table and they all know about
 * it.
 */

const createAposBot = require(9);

const BOTS = {
    aposbot: {
        create: createAposBot,
        description: 'splits, feeds viruses, plays every cell it owns',
    },
};

/** The one a runner takes when nobody says. */
const DEFAULT_BOT = 'aposbot';

const names = Object.keys(BOTS);

/** Looks a bot up, or throws with the list of names that would have worked. */
function resolve(name) {
    const entry = BOTS[name];
    if (!entry) {
        throw new Error(
            'Unknown bot "' + name + '". Try one of: ' + names.join(', ')
        );
    }
    return entry.create;
}

module.exports = { BOTS, DEFAULT_BOT, names, resolve };

};

__modules[3] = function (module, exports, require) {
'use strict';

/**
 * Update checking. Userscript managers handle the normal case through the
 * `@updateURL` header, so this is for reporting a new release in the console
 * and for the loader that pulls a specific commit.
 */

const { version, repository } = require(5);

const GITHUB_API = 'https://api.github.com';
const JSDELIVR = 'https://cdn.jsdelivr.net/gh';

/** How long to trust a cached answer, to stay off the API's rate limit. */
const CACHE_MS = 60 * 60 * 1000;

/**
 * Compares two dotted version strings.
 * @returns negative if a < b, 0 if equal, positive if a > b
 */
function compareVersions(a, b) {
    const left = String(a).split('.').map((n) => parseInt(n, 10) || 0);
    const right = String(b).split('.').map((n) => parseInt(n, 10) || 0);
    const length = Math.max(left.length, right.length);
    for (let i = 0; i < length; i++) {
        const diff = (left[i] || 0) - (right[i] || 0);
        if (diff !== 0) return diff;
    }
    return 0;
}

/** The newest release tag, or null when the repo has no releases yet. */
async function fetchLatestRelease(fetchImpl = globalThis.fetch) {
    const response = await fetchImpl(
        GITHUB_API + '/repos/' + repository + '/releases/latest',
        { cache: 'no-cache' }
    );
    if (response.status === 404) return null; // no releases published
    if (!response.ok) {
        throw new Error('GitHub API returned ' + response.status);
    }
    const data = await response.json();
    return {
        tag: data.tag_name,
        version: String(data.tag_name || '').replace(/^v/, ''),
        url: data.html_url,
        publishedAt: data.published_at,
    };
}

/** The SHA at the head of the default branch. */
async function fetchLatestCommit(branch = 'main', fetchImpl = globalThis.fetch) {
    const response = await fetchImpl(
        GITHUB_API + '/repos/' + repository + '/commits/' + branch,
        { cache: 'no-cache' }
    );
    if (!response.ok) {
        throw new Error('GitHub API returned ' + response.status);
    }
    const data = await response.json();
    return {
        sha: data.sha,
        shortSha: String(data.sha).slice(0, 7),
        message: data.commit && data.commit.message,
        date: data.commit && data.commit.committer && data.commit.committer.date,
    };
}

/** A jsDelivr URL for a file at a given ref. */
function cdnUrl(path, ref = 'main') {
    return JSDELIVR + '/' + repository + '@' + ref + '/' + path;
}

/**
 * Checks whether a newer version exists. Never throws, since a failed check
 * should not stop the bot playing.
 *
 * @returns {Promise<{current, latest, isOutdated, url}|null>}
 */
async function checkForUpdate(options = {}) {
    const storage = options.storage || null;
    const fetchImpl = options.fetch || globalThis.fetch;
    const now = Date.now();

    if (storage) {
        try {
            const cached = JSON.parse(storage.getItem('aposbot:update') || 'null');
            if (cached && now - cached.checkedAt < CACHE_MS) return cached.result;
        } catch (err) {
            /* corrupt cache entry; just re-check */
        }
    }

    let result = null;
    try {
        const release = await fetchLatestRelease(fetchImpl);
        if (release) {
            result = {
                current: version,
                latest: release.version,
                isOutdated: compareVersions(release.version, version) > 0,
                url: release.url,
            };
        }
    } catch (err) {
        return null;
    }

    if (storage) {
        try {
            storage.setItem(
                'aposbot:update',
                JSON.stringify({ checkedAt: now, result })
            );
        } catch (err) {
            /* storage full or blocked; not worth failing over */
        }
    }
    return result;
}

module.exports = {
    version,
    repository,
    compareVersions,
    fetchLatestRelease,
    fetchLatestCommit,
    checkForUpdate,
    cdnUrl,
    GITHUB_API,
    JSDELIVR,
};

};

__modules[4] = function (module, exports, require) {
'use strict';

/**
 * Google Analytics for the userscript.
 *
 * The bot runs on agar.io, which we do not own, so the tag stays off the
 * page's globals. gtag.js takes the name of its data layer in the `l` query
 * parameter, and pointing that at our own array keeps agar.io's events out of
 * this property and ours out of theirs.
 */

const { version } = require(5);

const MEASUREMENT_ID = 'G-ZSNW1C40B4';
const TAG_URL = 'https://www.googletagmanager.com/gtag/js';
const DATA_LAYER = 'aposbotDataLayer';
const OPT_OUT_KEY = 'aposbot:analytics';

function isOptedOut(storage) {
    if (!storage) return false;
    try {
        return storage.getItem(OPT_OUT_KEY) === 'off';
    } catch (err) {
        return false;
    }
}

/** Takes effect on the next page load, since the tag is already loaded. */
function setOptOut(storage, off) {
    if (!storage) return off;
    try {
        if (off) storage.setItem(OPT_OUT_KEY, 'off');
        else storage.removeItem(OPT_OUT_KEY);
    } catch (err) {
        /* storage blocked; the choice just will not stick */
    }
    return off;
}

/**
 * Loads gtag.js and sends the page view.
 *
 * @returns the `gtag` function, or null when nothing was loaded
 */
function initAnalytics(options = {}) {
    const win = options.window || globalThis;
    const doc = options.document || win.document;
    const storage = options.storage || null;
    const log = options.log || (() => {});

    // Called after DOMContentLoaded, so <head> is there in a real browser.
    const parent = doc && (doc.head || doc.documentElement);
    if (!parent || typeof doc.createElement !== 'function') return null;
    if (isOptedOut(storage)) return null;

    const layer = (win[DATA_LAYER] = win[DATA_LAYER] || []);
    // gtag pushes the arguments object rather than an array, and the tag reads
    // that shape, so this cannot be a rest parameter.
    const gtag = function gtag() {
        layer.push(arguments);
    };

    const script = doc.createElement('script');
    script.async = true;
    script.src = TAG_URL + '?id=' + MEASUREMENT_ID + '&l=' + DATA_LAYER;
    // A userscript cannot relax the page's CSP, so agar.io can refuse to load
    // this. Nothing else depends on it, so say so once and carry on.
    script.onerror = () => log('Analytics did not load.');
    parent.appendChild(script);

    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, { script_version: version });

    return gtag;
}

module.exports = {
    MEASUREMENT_ID,
    DATA_LAYER,
    OPT_OUT_KEY,
    isOptedOut,
    setOptOut,
    initAnalytics,
};

};

__modules[5] = function (module, exports, require) {
'use strict';

/**
 * Single source of truth for the bot version.
 *
 * The userscript header, the update check and the on-screen label all read
 * from here, so bumping this one number is enough to ship a release.
 */
module.exports = {
    version: '6.0.0',
    repository: 'Apostolique/Agar.io-bot',
};

};

__modules[6] = function (module, exports, require) {

        // Minimal EventEmitter: the backends only need on/emit/off.
        class EventEmitter {
            constructor() { this._listeners = {}; }
            on(name, fn) {
                (this._listeners[name] = this._listeners[name] || []).push(fn);
                return this;
            }
            off(name, fn) {
                const list = this._listeners[name];
                if (list) {
                    const i = list.indexOf(fn);
                    if (i !== -1) list.splice(i, 1);
                }
                return this;
            }
            once(name, fn) {
                const wrapper = (...args) => { this.off(name, wrapper); fn(...args); };
                return this.on(name, wrapper);
            }
            emit(name, ...args) {
                const list = this._listeners[name];
                if (!list || list.length === 0) return false;
                for (const fn of list.slice()) fn(...args);
                return true;
            }
        }
        module.exports = { EventEmitter };
    
};

__modules[7] = function (module, exports, require) {
'use strict';

/**
 * The cells the bot can see, and the accessors it reads them through.
 *
 * Independent of the network and the renderer, so one World serves every
 * backend. Coordinates are always absolute world coordinates.
 * See BOT-API.md.
 */

/** Viewport the bot reasons in. The AI hardcodes 1920x1080 in places. */
const VIEW_WIDTH = 1920;
const VIEW_HEIGHT = 1080;

function area(rect) {
    return (rect.maxX - rect.minX) * (rect.maxY - rect.minY);
}

/**
 * The map before a server has said where it is.
 *
 * Every agar.io server picks its own size, a little over 14000 a side, and its
 * own origin: one game runs from -3169 to 10918 across and the next from
 * -10471 to 3731. So there is no rect to fall back on, and an unbounded one is
 * the honest answer -- nothing is off the map and no wall is near.
 */
const UNKNOWN_BORDER = {
    minX: -Infinity,
    minY: -Infinity,
    maxX: Infinity,
    maxY: Infinity,
};

/** How long an off-screen cell stays remembered, in milliseconds. */
const MEMORY_MS = 3000;

/**
 * The camera, as the game moves it on each rendered frame: halfway to the
 * centre of your cells, and a tenth of the way to the zoom your mass calls for.
 *
 * Written as the share left over per frame at 60fps, then applied by elapsed
 * time, so the result does not depend on how often anyone calls stepCamera.
 */
const FRAME_MS = 1000 / 60;
const CAMERA_KEPT = 0.5;
const RATIO_KEPT = 0.9;

/**
 * What one notch of the wheel does to the player's own zoom, and how far it
 * can go. `_ac_zoom` in `agario.core.wasm` multiplies by `0.9^delta` for the
 * notch it is handed, and the frame that spends the zoom clamps it: under 1 it
 * writes 1 back, over `4/scale` it writes that. So the wheel zooms in and back
 * out to where it started, and no further.
 */
const ZOOM_STEP = 0.9;
const ZOOM_MIN = 1;
const ZOOM_MAX_SCALE = 4;

/**
 * How long the game takes to glide a cell to a position it was just told
 * about. `S()` in the reference client, which lerps position and size over
 * this and is called once per rendered frame.
 *
 * Everything reads the glided position, because that is what the game draws
 * and what its camera averages. A world left at the wire positions steps 25
 * times a second under an overlay painting 60, which is what makes a marker
 * judder over a blob that glides.
 */
const INTERP_MS = 120;

function clamp01(value) {
    return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** One blob in the world. See BOT-API.md for the accessor contract. */
class Cell {
    constructor(record, now = Date.now()) {
        this.id = record.id;
        // Where the wire says it is heading.
        this.toX = record.x;
        this.toY = record.y;
        this.toSize = record.size;
        // Where the current glide started. A cell seen for the first time is
        // simply there, so x, y and size below are already the whole glide.
        this.fromX = record.x;
        this.fromY = record.y;
        this.fromSize = record.size;
        // Where it is drawn, which is what everything downstream reads.
        this.x = record.x;
        this.y = record.y;
        this.size = record.size;
        this.color = record.color || '#ffffff';
        this.name = record.name || '';
        this.skin = record.skin || '';
        this.virus = !!record.isVirus;
        this.agitated = !!record.isAgitated;
        this.ejected = !!record.isEjected;
        this.food = !!record.isFood;

        // Previous position, so we can tell whether the cell is drifting.
        this.prevX = record.x;
        this.prevY = record.y;

        this.updateTime = now;
        this.birth = now;
        this.birthMass = (this.size * this.size) / 100;
    }

    update(record, now) {
        // Carry on from wherever the cell is being drawn rather than from the
        // last thing the wire said, the way the game does. Updates arrive
        // faster than a glide finishes, so starting from the wire position
        // would snap the cell backwards on every one of them.
        this.step(now);
        this.prevX = this.toX;
        this.prevY = this.toY;
        this.fromX = this.x;
        this.fromY = this.y;
        this.fromSize = this.size;
        this.toX = record.x;
        this.toY = record.y;
        this.toSize = record.size;
        if (record.color) this.color = record.color;
        if (record.name) this.name = record.name;
        if (record.skin) this.skin = record.skin;
        this.virus = !!record.isVirus;
        this.agitated = !!record.isAgitated;
        this.ejected = !!record.isEjected;
        if (record.isFood !== undefined) this.food = !!record.isFood;
        this.updateTime = now;
    }

    /**
     * Advances the drawn position and size to where the game would have them
     * now. Recomputed from the endpoints rather than accumulated, so calling
     * it twice in a frame is the same as calling it once.
     */
    step(now) {
        const t = clamp01((now - this.updateTime) / INTERP_MS);
        this.x = this.fromX + (this.toX - this.fromX) * t;
        this.y = this.fromY + (this.toY - this.fromY) * t;
        this.size = this.fromSize + (this.toSize - this.fromSize) * t;
    }

    isVirus() {
        return this.virus;
    }

    /**
     * True when the cell held still between the last two updates. Asked of the
     * wire positions, since the drawn one is still easing towards them and is
     * never exactly anywhere.
     */
    isNotMoving() {
        return this.toX === this.prevX && this.toY === this.prevY;
    }

    /** Timestamp of the last update. The AI's memory pass ages cells with it. */
    getUptimeTime() {
        return this.updateTime;
    }
}

class World {
    constructor(options = {}) {
        this.viewWidth = options.viewWidth || VIEW_WIDTH;
        this.viewHeight = options.viewHeight || VIEW_HEIGHT;
        this.log = options.log || function () {};

        /** Every cell currently known, keyed by id. */
        this.cells = {};
        /** Cells that recently left the view, kept warm for the AI's memory. */
        this.memoryCells = {};
        /** Ids the server told us we own. */
        this.ownedIds = [];

        this.border = Object.assign({}, UNKNOWN_BORDER);
        this.borderSeen = false;
        /**
         * The box agar.io keeps sending around the player. Smaller than the
         * map and about two screens wide, and not what the server streams:
         * cells stop arriving at the edge of the screen, well inside it.
         */
        this.serverView = null;
        this.gameMode = ':ffa';
        this.serverName = '';

        // The camera. stepCamera() eases it toward your cells the way the game
        // does, so both the AI and anything drawn use what the player sees.
        this.viewX = 0;
        this.viewY = 0;
        this.ratio = 1;
        this.zoomlessRatio = 1;
        this.cameraTime = 0;
        /**
         * The player's own zoom, which multiplies the camera's scale. The game
         * keeps it inside its core; a backend that can see it sets this.
         */
        this.playerZoom = 1;
        /** Whether the camera was following cells last step. */
        this.following = false;

        // Where the bot last asked to go.
        this.pointX = 0;
        this.pointY = 0;

        this.lastUpdate = Date.now();
        this.score = 0;

        // Debug geometry, refilled by the AI every tick. A renderer can draw
        // these; headless runs simply discard them.
        this.lines = [];
        this.points = [];
        this.circles = [];
        this.arcs = [];
    }

    /**
     * Starts over for a new connection.
     *
     * The map belongs to the server, and so do the cells: nothing the last
     * one said describes this one, and a cell of ours left over from it
     * keeps the world alive with a menu on the screen and nothing playing.
     * Backends call this when the socket carrying frames changes, before
     * the new server's map arrives, and when the socket closes.
     */
    beginConnection() {
        this.border = Object.assign({}, UNKNOWN_BORDER);
        this.borderSeen = false;
        this.serverView = null;
        this.cells = {};
        this.memoryCells = {};
        this.ownedIds = [];
    }

    /** All known cells as an array. */
    get cellsArray() {
        return Object.values(this.cells);
    }

    /** The cells we control, largest first. */
    get playerCells() {
        const mine = [];
        for (const id of this.ownedIds) {
            const cell = this.cells[id];
            if (cell) mine.push(cell);
        }
        return mine.sort((a, b) => b.size - a.size);
    }

    get isAlive() {
        return this.playerCells.length > 0;
    }

    /** Total mass across all our cells. */
    get mass() {
        let total = 0;
        for (const cell of this.playerCells) {
            total += (cell.size * cell.size) / 100;
        }
        return Math.round(total);
    }

    // ---------------------------------------------------------------- events

    /** Applies one decoded protocol frame. */
    apply(message) {
        if (!message) return;
        switch (message.type) {
            case 'update':
                this.applyUpdate(message);
                break;
            case 'position':
                // Sent while spectating, when we have no cells to average.
                if (!this.isAlive) {
                    this.viewX = message.x;
                    this.viewY = message.y;
                    this.ratio = message.scale;
                    this.zoomlessRatio = message.scale;
                }
                break;
            case 'clearAll':
                this.cells = {};
                this.memoryCells = {};
                this.ownedIds = [];
                break;
            case 'clearOwned':
                this.ownedIds = [];
                break;
            case 'addOwnedCell':
                if (this.ownedIds.indexOf(message.id) === -1) {
                    this.ownedIds.push(message.id);
                }
                break;
            case 'border': {
                const rect = {
                    minX: message.minX,
                    minY: message.minY,
                    maxX: message.maxX,
                    maxY: message.maxY,
                };
                // agar.io sends this in two senses. Once, right after the
                // greeting, it is the map. After that it arrives constantly as
                // a smaller box centred on the player, about two screens
                // wide. Only the map bounds movement, and it is the larger of
                // the two, so the largest one this connection has sent wins.
                this.serverView = rect;
                if (!this.borderSeen || area(rect) > area(this.border)) {
                    this.border = rect;
                    this.borderSeen = true;
                }
                if (message.serverName) this.serverName = message.serverName;
                break;
            }
            default:
                break;
        }
    }

    applyUpdate(message) {
        const now = Date.now();
        this.lastUpdate = now;

        // Cells that were eaten disappear, and we drop them from our own list
        // if they were ours.
        for (const eat of message.eaten) {
            this.consume(eat.preyId);
        }

        for (const record of message.cells) {
            const existing = this.cells[record.id];
            if (existing) {
                existing.update(record, now);
            } else {
                this.cells[record.id] = new Cell(record, now);
            }
            // Anything currently visible is also the freshest memory we have.
            this.memoryCells[record.id] = this.cells[record.id];
        }

        for (const id of message.removed) {
            this.forget(id);
        }

        // Everything the AI and the overlay read is the glided position, so
        // bring the whole world to now before anyone looks at it.
        this.stepCells(now);
        this.expireMemory(now);
        this.score = Math.max(this.score, this.mass);
        // The camera runs on the display clock, not the network's, so that it
        // moves the way the game's does. See stepCamera.
        this.stepCamera(now);
    }

    /**
     * Drops a cell the server has stopped sending.
     *
     * One of ours is never merely out of sight: the server streams a box
     * around our own camera, so when a cell we own stops arriving it has
     * merged or been eaten, and there is nothing left to remember. Live
     * agar.io reports a merge in the removal list and not in the eat list, so
     * leaving it in memory keeps the half that was swallowed on the AI's
     * books for the three seconds memory lasts -- a stranger our own colour,
     * sitting on top of us, small enough for the cell that just ate it to
     * split at.
     */
    forget(id) {
        delete this.cells[id];
        const owned = this.ownedIds.indexOf(id);
        if (owned === -1) return;
        this.ownedIds.splice(owned, 1);
        delete this.memoryCells[id];
    }

    /**
     * Drops a cell the server named as prey.
     *
     * Memory outlives the view on purpose, so a threat that scrolls off is
     * still there a moment later. A cell that was eaten is the other case
     * entirely: it is gone, and remembering it means the AI keeps steering at
     * food that is already inside it. That is a bot arriving at a cluster and
     * sitting on it for the three seconds the memory lasts.
     *
     * Only for `eaten`. The removal list also carries cells that merely left
     * the view, which is exactly what memory is for.
     */
    consume(id) {
        this.forget(id);
        delete this.memoryCells[id];
    }

    /** Advances every known cell to where the game would be drawing it. */
    stepCells(now) {
        for (const id in this.cells) this.cells[id].step(now);
        for (const id in this.memoryCells) this.memoryCells[id].step(now);
    }

    /**
     * Cells the AI saw recently but that have since left the view are kept
     * around briefly, so it does not forget a threat the moment it scrolls off.
     */
    expireMemory(now) {
        for (const id of Object.keys(this.memoryCells)) {
            if (this.cells[id]) continue;
            const remembered = this.memoryCells[id];
            const stale = now - remembered.getUptimeTime() > MEMORY_MS;
            const offMap =
                remembered.x < this.border.minX ||
                remembered.x > this.border.maxX ||
                remembered.y < this.border.minY ||
                remembered.y > this.border.maxY;
            if (stale || offMap) delete this.memoryCells[id];
        }
    }

    /**
     * Turns a wheel notch into the zoom it leaves behind. Backends that can
     * see the wheel call this with the delta the game itself receives.
     */
    zoomBy(delta) {
        if (!Number.isFinite(delta) || delta === 0) return this.playerZoom;
        this.playerZoom *= Math.pow(ZOOM_STEP, delta);
        return this.clampZoom();
    }

    /**
     * Holds the zoom inside the range the core holds it in.
     *
     * On every frame rather than on every notch, because the ceiling is
     * against the current scale: growing lowers the scale, which lets the
     * wheel go further in, and shrinking pulls a zoom that was allowed back
     * down. Notches past either end are dropped rather than banked, so one
     * notch the other way moves the camera straight away.
     */
    clampZoom() {
        const ceiling = ZOOM_MAX_SCALE / (this.ratio > 0 ? this.ratio : 1);
        let zoom = this.playerZoom;
        if (zoom < ZOOM_MIN) zoom = ZOOM_MIN;
        if (zoom > ceiling) zoom = ceiling;
        this.playerZoom = zoom;
        return zoom;
    }

    /** Mean position of our own cells, or the camera when we have none. */
    playerCentre() {
        const mine = this.playerCells;
        if (mine.length === 0) return { x: this.viewX, y: this.viewY };
        let x = 0;
        let y = 0;
        for (const cell of mine) {
            x += cell.x;
            y += cell.y;
        }
        return { x: x / mine.length, y: y / mine.length };
    }

    /**
     * Moves the camera on by however long it has been since the last call.
     *
     * The game does this on every rendered frame: the centre goes halfway to
     * the middle of your cells, and the zoom a tenth of the way to what your
     * mass calls for. Both are chases, so the camera trails you whenever you
     * move, by more the faster you go. Doing it on the network's clock instead
     * leaves an overlay that steps 25 times a second over a game that glides
     * 60, which is most of what makes one look detached from the other.
     *
     * The chase runs on the positions off the wire, not on the ones the game
     * has glided to. That looks like it should be a frame behind, and it is
     * the opposite: the game's camera trails its own drawn cells by exactly
     * the fraction this one trails the wire, so the two lags cancel and a mark
     * placed at a cell's wire position lands on the blob the player sees.
     * Which is also why aiming works without knowing how far behind the game
     * draws.
     *
     * Backends call this once a frame. Calling it more often is harmless: the
     * easing is by elapsed time, so the path is the same either way.
     */
    stepCamera(now = Date.now()) {
        this.stepCells(now);
        this.clampZoom();
        const mine = this.playerCells;
        if (mine.length === 0) {
            // Spectating or dead. The server drives the camera through
            // `position` messages, so leave it alone, and snap to wherever we
            // come back as.
            this.following = false;
            this.cameraTime = now;
            return;
        }

        let x = 0;
        let y = 0;
        let sumSize = 0;
        for (const cell of mine) {
            x += cell.x;
            y += cell.y;
            sumSize += cell.size;
        }
        x /= mine.length;
        y /= mine.length;

        const frames = Math.max(0, now - this.cameraTime) / FRAME_MS;
        this.cameraTime = now;

        const base = Math.max(this.viewHeight / 1080, this.viewWidth / 1920);
        const zoom =
            Math.pow(Math.min(64 / sumSize, 1), 0.4) * base * this.playerZoom;

        if (!this.following) {
            // First cell of a life: the game puts the camera on it outright.
            this.following = true;
            this.viewX = x;
            this.viewY = y;
            this.ratio = zoom;
        } else {
            const centreStep = 1 - Math.pow(CAMERA_KEPT, frames);
            const zoomStep = 1 - Math.pow(RATIO_KEPT, frames);
            this.viewX += (x - this.viewX) * centreStep;
            this.viewY += (y - this.viewY) * centreStep;
            this.ratio += (zoom - this.ratio) * zoomStep;
        }
        // What the camera would be at without the wheel. The AI sizes the
        // view it reasons about with this, because the player's zoom is a
        // cosmetic on top of a view the server picked, and a bot that decides
        // differently depending on how far someone scrolled is a bot with a
        // second personality.
        this.zoomlessRatio = this.ratio / (this.playerZoom || 1);
    }

    /** Clears the debug geometry the AI accumulates each tick. */
    clearDebug() {
        this.lines.length = 0;
        this.points.length = 0;
        this.circles.length = 0;
        this.arcs.length = 0;
    }

    // ------------------------------------------------------------------- api

    /**
     * Builds the accessor object the AI reads the world through.
     *
     * @param actions  { setPoint, split, eject } supplied by the backend
     */
    api(actions = {}) {
        const world = this;
        const noop = function () {};

        return {
            // -- state
            getCells: () => world.cells,
            getCellsArray: () => world.cellsArray,
            getMemoryCells: () => world.memoryCells,
            getPlayer: () => world.playerCells,
            getWidth: () => world.viewWidth,
            getHeight: () => world.viewHeight,
            getRatio: () => world.ratio,
            getZoomlessRatio: () => world.zoomlessRatio,
            getX: () => world.viewX,
            getY: () => world.viewY,
            getOffsetX: () => world.viewX,
            getOffsetY: () => world.viewY,
            getPointX: () => world.pointX,
            getPointY: () => world.pointY,
            getMapStartX: () => world.border.minX,
            getMapStartY: () => world.border.minY,
            getMapEndX: () => world.border.maxX,
            getMapEndY: () => world.border.maxY,
            getLastUpdate: () => world.lastUpdate,
            getCurrentScore: () => world.score,
            getMode: () => world.gameMode,
            getServer: () => world.serverName,

            // Headless runs have no pointer, so the "mouse" is wherever the
            // bot last aimed. In the browser the backend overrides these.
            getMouseX: actions.getMouseX || (() => world.viewWidth / 2),
            getMouseY: actions.getMouseY || (() => world.viewHeight / 2),

            // -- coordinate conversion
            screenToGameX: (x) =>
                (x - world.viewWidth / 2) / world.ratio + world.viewX,
            screenToGameY: (y) =>
                (y - world.viewHeight / 2) / world.ratio + world.viewY,
            // The view's diagonal in world units, which the AI uses as how far
            // ahead to put a destination. Zoomless, like the box it belongs
            // to: scrolling the wheel must not shorten the bot's stride.
            verticalDistance: () => {
                const scale = world.zoomlessRatio || 1;
                const width = world.viewWidth / scale;
                const height = world.viewHeight / scale;
                return Math.sqrt(width * width + height * height);
            },

            // -- actions
            setPoint: actions.setPoint || noop,
            split: actions.split || noop,
            shoot: actions.eject || noop,

            // -- debug drawing
            drawLine: (x1, y1, x2, y2, color) =>
                world.lines.push([x1, y1, x2, y2, color]),
            drawPoint: (x, y, color, text) =>
                world.points.push([x, y, color, text]),
            drawCircle: (x, y, radius, color) =>
                world.circles.push([x, y, radius, color]),
            drawArc: (x1, y1, x2, y2, x3, y3, color) =>
                world.arcs.push([x1, y1, x2, y2, x3, y3, color]),

            log: world.log,
        };
    }
}

module.exports = { World, Cell, VIEW_WIDTH, VIEW_HEIGHT, MEMORY_MS };

};

__modules[8] = function (module, exports, require) {
'use strict';

/**
 * Codec for live agar.io, protocol 23.
 *
 * The wire format is the classic protocol in legacy.js with two differences:
 * every frame is obfuscated, and a named cell carries the id of the player it
 * belongs to after its name.
 *
 * The obfuscation is a four-byte repeating XOR that restarts on every frame.
 * Its key is the uint32 the server sends in its 0xf1 greeting XORed with the
 * uint32 the client announced in its 0xff message, so a Connection has to
 * watch both sides of the handshake before it can read anything. Under the
 * XOR, 0xff is an LZ4 envelope and everything inside it is classic Agar.
 */

const legacy = require(10);
const { decompressBlock } = require(11);
const { DesyncError, hexDump, asBytes } = require(12);

/** What agar.io announces in its opening 0xfe message. */
const PROTOCOL_VERSION = 23;

/** Opcodes the client sends in the clear before the cipher is up. */
const CLIENT = {
    PROTOCOL_VERSION: 0xfe,
    KEY: 0xff,
};

const SERVER = {
    /** Greeting: the server's half of the cipher key, then a version string. */
    KEY: 0xf1,
    COMPRESSED: 0xff,
};

function viewOf(bytes) {
    return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

/**
 * One game socket. Frames have to be fed in the order they cross the wire,
 * both directions, because the key is split across the handshake.
 */
class Connection {
    constructor() {
        this.protocolVersion = PROTOCOL_VERSION;
        this.clientKey = null;
        this.serverKey = null;
        this.key = null;
        this.serverVersion = null;
    }

    /** True once both halves of the key have been seen. */
    get ready() {
        return this.key !== null;
    }

    /** Watches what the client sends; 0xff carries its half of the key. */
    observeOutbound(buffer) {
        const bytes = asBytes(buffer);
        if (bytes.length < 5) return;
        const view = viewOf(bytes);
        if (bytes[0] === CLIENT.PROTOCOL_VERSION) {
            this.protocolVersion = view.getUint32(1, true);
        } else if (bytes[0] === CLIENT.KEY && this.clientKey === null) {
            this.clientKey = view.getUint32(1, true);
            this.deriveKey();
        }
    }

    deriveKey() {
        if (this.clientKey === null || this.serverKey === null) return;
        const key = (this.serverKey ^ this.clientKey) >>> 0;
        this.key = new Uint8Array([
            key & 0xff,
            (key >>> 8) & 0xff,
            (key >>> 16) & 0xff,
            (key >>> 24) & 0xff,
        ]);
    }

    /** Undoes the obfuscation. The key restarts at every frame. */
    decrypt(bytes) {
        const out = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            out[i] = bytes[i] ^ this.key[i % 4];
        }
        return out;
    }

    /**
     * Decodes one frame from the server.
     *
     * @param {Uint8Array} buffer  raw frame, exactly as it came off the socket
     * @returns {object|null}      a message, `{type:'unknown'}` for an opcode
     *                             we do not model, or null while the handshake
     *                             is still in progress
     * @throws  {DesyncError}      when the bytes do not match the layout
     */
    decode(buffer) {
        let bytes = asBytes(buffer);
        if (bytes.length < 1) return null;

        // The greeting arrives before the cipher is up, in the clear.
        if (!this.ready) {
            if (bytes[0] !== SERVER.KEY || bytes.length < 5) return null;
            this.serverKey = viewOf(bytes).getUint32(1, true);
            this.deriveKey();
            this.serverVersion = readCString(bytes, 5);
            return { type: 'serverVersion', version: this.serverVersion };
        }

        bytes = this.decrypt(bytes);

        if (bytes[0] === SERVER.COMPRESSED) {
            if (bytes.length < 5) {
                throw new DesyncError('truncated envelope', bytes, 0);
            }
            const length = viewOf(bytes).getUint32(1, true);
            bytes = decompressBlock(bytes.subarray(5), length);
        }

        const message = legacy.decode(bytes, this.protocolVersion);
        if (message) return message;
        return { type: 'unknown', opcode: bytes[0] };
    }
}

function readCString(bytes, offset) {
    let end = offset;
    while (end < bytes.length && bytes[end] !== 0) end++;
    return new TextDecoder('utf-8').decode(bytes.subarray(offset, end));
}

module.exports = {
    PROTOCOL_VERSION,
    CLIENT,
    SERVER,
    Connection,
    DesyncError,
    hexDump,
};

};

__modules[9] = function (module, exports, require) {
'use strict';

/**
 * AposBot.
 *
 * Scores every direction it could take instead of picking a gap between
 * threats, so pellets, prey, viruses and the map edge all land in one number
 * and there is always a best way to go. On top of that it splits onto prey,
 * feeds viruses at players too big to fight, and plays every cell it owns
 * rather than only the biggest one.
 *
 * Reads the world through BOT-API.md and nothing else, so the same code
 * runs headless and on the page.
 *
 * @param api  an object implementing the world API
 * @returns    a bot with { name, mainLoop(), keyAction(), displayText() }
 */

const { version } = require(5);

// ----------------------------------------------------------------- the rules

/** Mass one cell needs over another to swallow it. */
const EAT_RATIO = 1.25;
/**
 * Margin on top of that, so a near tie is not prey. On the other side the
 * margin is thin, since a cell only just too small to eat us is one pellet
 * patch away from being able to, and it is already touching us.
 */
const PREY_RATIO = 1.4;
const THREAT_RATIO = 1.05;
/** What an enemy needs before splitting onto one of our cells pays them. */
const SPLIT_THREAT_RATIO = 2.6;
/** And what a half of ours needs over what it lands on, since the target moves. */
const SPLIT_KILL_RATIO = 1.6;

/** How far a split cell travels, in world units. */
const SPLIT_REACH = 710;
/** Mass a cell needs before the server will split it, and the cell cap. */
const SPLIT_MIN_MASS = 35;
const MAX_CELLS = 16;

/** Virus mass, what one W press costs, how far its pellet flies. */
const VIRUS_MASS = 100;
const EJECT_COST = 18;
const EJECT_REACH = 660;
/** Pellets it takes to grow a virus past its cap and fire it. */
const VIRUS_FEED = 8;

/** Mass under which a nameless cell standing still is a pellet rather than prey. */
const PELLET_MASS = 25;
/** How close a piece of ours has to be to count towards what would eat it. */
const CASCADE_RANGE = 900;
/**
 * How near another player has to be to an enemy's mouth to count towards
 * what that enemy is about to weigh, how near ejected mass in somebody else's
 * colour has to be to say the enemy is being fed, how much of it says so, and
 * how much of the feeder counts once it does. Then how far off the feeder can
 * stand.
 *
 * A threat is not a fixed size. One with a smaller player under its mouth, or
 * a teammate pouring mass into it, is bigger a second from now than it is on
 * this tick, and a second is what a split takes. A transfer loses about a
 * quarter of what is thrown, and the rest of the feeder is what is coming.
 */
const FORESEE_RANGE = 200;
const FEED_RANGE = 300;
const FEED_MIN = 26;
const FEED_SHARE = 0.7;
const FEEDER_RANGE = 700;

// ------------------------------------------------------------- the weighting

/**
 * What each kind of thing is worth in the one number every direction gets.
 *
 * Food is mass over distance, which is small, so it carries a scale to bring
 * it into the same range as the pushes. The rest are tuned against each other:
 * a threat one step inside its reach outscores any pile of pellets, and a wall
 * two cell-widths ahead outscores a threat that is still far off.
 */
const FOOD_GAIN = 1000;
const FOOD_SOFT = 400;
const PREY_GAIN = 2.2;
const VIRUS_FOOD_GAIN = 0.5;
const SHELTER_GAIN = 0.8;
const THREAT_WEIGHT = 500;
const VIRUS_WEIGHT = 220;
const WALL_WEIGHT = 260;

/**
 * Room kept around a threat, past what it can reach, and how far outside that
 * the push starts.
 *
 * Squared rather than cubed over a shorter run, so the field is quiet until
 * somebody is genuinely close and then wins outright. Cubed over a long run
 * reads as reasonable and plays as a bot that grazes while a killer walks up
 * to it, since a pile of pellets outscores a push that gentle.
 */
const THREAT_MARGIN = 120;
const THREAT_BUFFER = 250;
/**
 * How far ahead a threat is placed, in milliseconds along the way it is
 * going.
 *
 * Where something is standing is the wrong thing to steer around, since by
 * the time a heading is taken it has moved. A piece in flight from a split
 * covers most of its 710 in under a second, and a whale walking at us closes
 * the gap while we graze. So every threat that has been seen to move is read
 * where it will be, and how close it is comes from the nearer of the two.
 */
const THREAT_LOOKAHEAD = 400;
/**
 * How much nearer a threat that is closing on us is read along a heading,
 * in milliseconds of its closing speed.
 *
 * The sweep discounts a threat by how far down the heading it sits, so a
 * cell of a thousand a screen away costs about nothing, and a bot with
 * pellets on that side walks towards it to eat them. One closing at a
 * hundred and fifty a second is three hundred nearer by the time the
 * pellets are eaten, and a piece in flight from a split is on top of us.
 */
const CLOSING_LEAD = 2000;
/**
 * What being inside somebody's split range is worth next to being inside their
 * mouth. Splitting costs them half their mass and a merge timer, so most of
 * them will not do it for a crumb, while the ones who do end the game.
 */
const SPLIT_FEAR = 0.45;
/**
 * How much of that fear a cell that dwarfs us gets.
 *
 * Splitting costs half the mass and a merge timer, so it is spent on a meal
 * worth having: an eighth of them or more is one, a thirtieth is not, and
 * between the two the fear falls off in a straight line. A whale would rather
 * keep walking, which makes the space beside one safer than the space beside
 * something three times our size. Never nothing, since some of them split on
 * anything.
 */
const SPLIT_BITE_FULL = 0.12;
const SPLIT_BITE_NONE = 0.03;
const SPLIT_FEAR_FLOOR = 0.2;
/**
 * And what a mouthful sitting inside one is worth next to one in the open.
 *
 * The same discount the field applies, applied to the menu, so that a screen
 * with four big players on it still has something on it worth arriving at.
 */
const SPLIT_SHUN = 0.4;
/** How much a heading straight away from something beats one sideways past it. */
const ESCAPE_LEAN = 0.15;
/**
 * Above what speed, in units per millisecond, something closing on us is a
 * piece in flight rather than a cell walking. The smallest cell walks at under
 * 500 a second and a half thrown from a split starts well above it. Then what
 * crossing its line costs next to running along it.
 */
const FLIGHT_SPEED = 0.5;
const FLIGHT_CROSS = 0.5;
/**
 * How far past its own edge a piece that eats a threat still covers one
 * standing behind it, and what the threat is worth once it does.
 *
 * A cell smaller than us is faster than us, so being in pieces is not the same
 * as being exposed in pieces. The crumbs can sit behind the big one, and
 * anything that wants a crumb has to come into the big one's mouth to reach
 * it, which is a trade we are happy with. Reading every piece on its own is
 * what has eight cells run from something one of them eats for lunch, and it
 * gives up the screen to do it.
 *
 * Half rather than nothing, because cover is read where everybody is standing
 * this tick and the piece it protects is the fast one that leaves first. A
 * fifth reads as the better bargain and plays worse, since the crumb it stopped
 * worrying about walks out from behind the cover on its own.
 */
const COVER_MARGIN = 60;
const COVER_DISCOUNT = 0.5;
/**
 * Room kept around a virus we are big enough to pop on, and the band it pushes
 * over. Wider than a threat's, since a virus never moves and never chases, so
 * steering around one early costs nothing.
 */
const VIRUS_MARGIN = 60;
const VIRUS_BUFFER = 450;
/**
 * A virus somebody is feeding, next to one that is sitting still: what being
 * in its line costs, as a multiple of the virus itself, and how far down the
 * line it reaches once it flies. It comes to us whether or not we go to it.
 */
const SHOT_WEIGHT = 2;
const SHOT_REACH = 900;
/**
 * How far ahead a wall starts costing, how close it has to be before it shoves
 * back the way a threat does, and how much a chase widens both.
 *
 * The two do different jobs. Room left along a heading is what keeps an escape
 * from ending in a corner, while the shove is what keeps the bot off the rim: a
 * heading straight along the edge has the whole map ahead of it, so on room
 * alone it costs nothing.
 */
const WALL_LOOKAHEAD = 500;
/** How far inside the map a destination is kept. */
const MAP_MARGIN = 20;
/**
 * How near a wall our edge has to be before a destination past it slides
 * along it rather than stopping at it, and how much of a heading has to run
 * along the wall before that says which way to slide.
 */
const WALL_TOUCH = 40;
const SLIDE_LEAN = 0.15;
const WALL_NEAR = 250;
const WALL_SHOVE = 90;
const WALL_PRESSURE = 2;

/**
 * What open map is worth when there is nothing on the screen to eat, and how
 * much of it counts as open.
 *
 * Food is the whole of what pulls the bot anywhere, so an empty screen leaves
 * it holding whatever bearing it had until the map runs out, and then sliding
 * along the edge. A busy game empties the screen often, a dozen players strip
 * a patch in seconds, and the edge is where somebody bigger only has to walk
 * at you. So with nothing worth having on the screen, room is what is worth
 * having, and the heading with the most map ahead of it points back inside.
 *
 * It is only ever the tie-breaker: one pellet anywhere on the screen puts this
 * back to nothing, so it cannot cost a mouthful.
 */
const ROAM_GAIN = 60;
const ROAM_RANGE = 4000;

/**
 * How close something that could eat one of our cells has to be before the
 * room a heading leaves us in is worth anything, what that room is worth when
 * it is right on top of us, and how far ahead a heading is judged to land.
 *
 * Being cornered is not something that happens at the corner. It is decided
 * while there is still room, by taking food that walks you into a smaller and
 * smaller pocket, and by the time the wall is close enough to push back the
 * only ways out run past the thing that has been herding you. So room stops
 * being free the moment something that can eat you is near, and stays free
 * every other time, which is most of the game.
 */
const MENACE_RANGE = 1600;
const ESCAPE_GAIN = 90;
const ESCAPE_REACH = 3000;
/**
 * How much map has to be left on the nearest side before the whole thing goes
 * quiet. Wide, because a corner is lost long before it is reached, and the
 * point is to be somewhere else while that still costs nothing.
 */
const ESCAPE_BOX = 6000;

/** Above this the bot is being chased rather than merely watched. */
const FLEE_PRESSURE = 0.35;
/** And above this, split pieces travel together rather than spread out. */
const GATHER_PRESSURE = 0.1;

/**
 * How far ahead the destination sits while the pieces are being brought back
 * together, as a share of how far out they are spread.
 *
 * Inside the group, since that is the whole trick: a pointer between two cells
 * is each of them told to go at the other, and they close the gap in the time
 * it would otherwise take them to drift into one.
 */
const MERGE_PULL = 0.35;
/**
 * How far outside our own edge the destination has to sit before the cell
 * counts as having somewhere to go.
 *
 * Only wide enough to survive a step, since the point of measuring it per
 * direction is to be able to aim at the thing rather than past it.
 */
const CLEAR_MARGIN = 50;

/** How much better a heading has to be before the bot turns onto it. */
const TURN_MARGIN = 6;
const TURN_MARGIN_SHARE = 0.08;
/**
 * And how much more it has to be worth to turn round than to turn a little.
 *
 * Two patches either side of the cell trade places every time the near one
 * is eaten down a little, and every swap throws away the walk that was just
 * made, so a cell between two patches walks back and forth and eats neither.
 * Two threats either side do the same thing to the way out: whichever of the
 * two is pressing harder this tick owns the straight-away heading, and a cell
 * that answers each in turn runs north, then south, then north, which is a
 * cell standing still while both of them walk up to it. Turning back costs
 * the whole of the walk either way, so the margin grows with the angle turned
 * through, as a share of what the best heading is worth. A threat that turns
 * up ahead still gets answered, since a heading that now runs into a mouth
 * loses far more than any share of the best one.
 */
const TURN_REVERSAL = 0.15;
/**
 * How far off the heading the bot will look for something to aim at, how far
 * off it will follow what it already chose, and how much better a new one has
 * to be to take over.
 *
 * Holding the heading is not enough on its own. Two pellets either side of one
 * heading trade places on the smallest change, the aim swings between them by
 * the width of the cone, and a cell told to go left and right in turn stays
 * where it is.
 */
const COMMIT_CONE = 0.82;
const COMMIT_KEEP = 0.3;
const COMMIT_SWITCH = 1.35;
/**
 * What a mouthful off the line is worth next to one on it, as a power of the
 * cosine of the angle between them.
 *
 * The nearest thing in the cone is the wrong pick. Taken nearest first, a
 * patch is eaten by swinging from one edge of the cone to the other on every
 * pellet while the heading under the cone never moves, which is a cell that
 * looks unable to make its mind up. Cubed, a pellet at the edge of the cone
 * is worth about half of one dead ahead, so it is taken when it is a good
 * deal nearer and passed when it is not, and a patch is eaten by walking
 * through it.
 */
const COMMIT_LEAN = 3;

// ------------------------------------------------------------------ tactics

/**
 * Cells we are willing to have out before a hunting split is a bad idea.
 *
 * Two, so that a hunt never leaves us in more than four. Eight pieces of
 * seventy each beside a player of a thousand are one split away from being
 * a meal, and whichever of them the half lands among, the rest are lunch for
 * it afterwards.
 */
const SPLIT_MAX_CELLS = 2;
/** Time between splits, and how straight we have to be aimed to take one. */
const SPLIT_COOLDOWN = 900;
const SPLIT_ALIGN = 0.97;
/**
 * How much of a split's reach to bank on, and how fast a target has to be
 * going before throwing at it beats walking at it.
 *
 * The reach is short of the full 710 because the throw goes where the target
 * was going to be rather than where it is, and a metre short is the whole cost
 * with none of the meal. The speed is because a split buys nothing against
 * something that is not leaving: half the mass on two lines and a merge timer,
 * to arrive somewhere the cell was going to walk to anyway.
 */
const SPLIT_TRUST = 0.9;
const SPLIT_CHASE = 0.5;
/**
 * How long a walk onto something standing still is worth taking before a
 * split is the better way there, in milliseconds.
 *
 * Standing still is not the same as staying still. Whoever it is looks up
 * eventually, and everything smaller than us is quicker than us, so a walk
 * that takes three seconds is three seconds for that to happen. A split lands
 * in one.
 */
const SPLIT_WALK = 1500;
/**
 * What prey that is leaving faster than we can follow is worth, as a share
 * of its mass.
 *
 * A cell smaller than us is quicker than us, so walking after one that is
 * running never ends. It is a walk across the screen that finishes with the
 * crumb still ahead and the pellets that were beside the cell behind it. A
 * few percent leaves it on the map as somewhere worth leaning towards and
 * takes it off the menu.
 */
const PREY_FLEEING = 0.03;
/**
 * How far ahead of a moving smaller player its pellets stop being ours, in
 * milliseconds of its travel, and what those are worth to us.
 */
const GRAZE_LEAD = 1000;
const GRAZE_DISCOUNT = 0.3;
/**
 * How far off prey is worth the whole of itself, past which it fades with
 * the distance, and how far past a split's reach it is still the thing to
 * aim at rather than the pellets on the way to it.
 *
 * Mass over distance is the wrong shape at long range: a crumb two screens
 * away outscores every pellet beside the cell, and the cell walks a straight
 * line past all of them to get there. So far prey leans the heading and the
 * pellets along that heading are what the cell actually goes to, until the
 * prey is close enough that the next thing that happens to it is a split.
 */
const PREY_REACH = 1200;
const STRIKE_MARGIN = 200;
/**
 * How far behind prey its ways out are looked at, over how many headings
 * either side of straight away from us, and how many of those have to be
 * shut before it counts as trapped.
 *
 * Somebody who cannot run is somebody who can be walked onto, and the map
 * edge is not the only thing that stops a run: a cell big enough to pop on a
 * virus cannot pass one either, so a field of them behind a player is a wall
 * with gaps.
 */
const TRAP_RANGE = 350;
const TRAP_SPAN = 4;
const TRAP_STEP = Math.PI / 12;
const TRAP_BLOCKED = 6;
/**
 * The least a split has to stand to gain, as a share of the cell that throws
 * it. A crumb is not worth a merge timer, while a player broken into eight
 * crumbs lying together is, since a half landing among them takes the lot.
 */
const SPLIT_WORTH = 0.06;
/**
 * Room kept between where a half comes down and anybody who could eat it,
 * past their reach. The halves are apart for the whole merge timer, which is
 * over a minute at a couple of thousand mass, and a walk of a few seconds is
 * nothing next to that.
 */
const SPLIT_CAUTION = 300;
/** Threat pressure above which a hunting split is not worth what it risks. */
const AGGRO_PRESSURE = 0.35;

/**
 * How close to being eaten it has to be before splitting out is better than
 * running, and how far past a threat the line a half travels has to clear.
 *
 * A split is the only way to cover ground faster than the cell moves, so it is
 * the last thing left once the room has already gone. It is also half the mass
 * on each of two lines, so it is worth it only when standing still is worse:
 * pinned, in contact, and with a way out that does not go past the mouth.
 *
 * Pinned means different things depending on what is doing the pinning.
 * Something that can split onto us has the room gone the moment it is in
 * contact and we are against the map. Something that cannot is slower than we
 * are, so it only ever eats us by cutting a run off, and whether it can is
 * about where it stands, not about how much of us it is already covering.
 */
const ESCAPE_CONTACT = 0.75;
const ESCAPE_CLEAR = 60;
/**
 * How far inside our own edge a mouth has to have closed before running has
 * stopped working, as a share of our radius.
 *
 * Room to run is not the only thing that runs out. Somebody who split onto us
 * arrives already overlapping, and from there the ground a run would cover is
 * ground there is no time to cover: the choice is half the mass thrown clear
 * or all of it swallowed. Measured off their edge against our centre, since
 * that is the gap the server closes to decide it.
 */
const ESCAPE_SWALLOW = 0.5;
/**
 * And how much faster than us it has to be coming before running is losing.
 *
 * Over one, since matching our speed is not gaining on us and half the reading
 * is a socket that talks 25 times a second being read by a loop that thinks 60
 * times a second. Us is the faster of what we measure and what the cell walks
 * at flat out: a cell turning round measures nearly still for a tick, and
 * nothing walking has caught it just because of that.
 */
const ESCAPE_LOSING = 1.2;
/** How much of a heading has to point away from it to count as running. */
const ESCAPE_AWAY = 0.3;
/** And how much of one may point at it before the throw is into the mouth. */
const ESCAPE_INTO = 0.5;
/**
 * The stride a chase is walked forward in, in units, when asking whether
 * something walking can cut a run off. The run is judged out to the same
 * reach an escape is.
 */
const CHASE_STRIDE = 25;

/** Mass we keep back, so feeding a virus never spends the game. */
const POP_MIN_MASS = 280;
/**
 * A player worth spending it on, and how far the virus may fly at them. A
 * fired virus is given a boost of 780 and stops there, so a shot lined up on
 * somebody further off than that is 144 mass thrown at nothing.
 */
const POP_MIN_ENEMY = 150;
const POP_RANGE = 900;
/**
 * Going and making the line rather than waiting for one.
 *
 * Three moving things happening to fall on one line is not something to wait
 * for, and the far side of the virus from them is a place, so it can be walked
 * to. It is worth the walk against somebody we cannot fight any other way,
 * which is also the only time we are the smaller and quicker of the two and
 * can get round them to do it.
 *
 * The walk goes round the virus and not at it: the straight line to the far
 * side runs through the thing we are lining up, and we are big enough to come
 * apart on it. So the aim steps along the ring by an arc at a time.
 */
const POP_WALK = 1600;
const POP_STANDOFF = 90;
const POP_ARC = 0.6;
const POP_STAGE_TIMEOUT = 8000;
/**
 * How long somebody is left alone after a walk round a virus at them came to
 * nothing, since the same virus and the same player are still the best shot
 * on the screen and the walk would otherwise start again on the next scan.
 */
const POP_STAGE_REST = 8000;
/**
 * Sitting in a virus, for when we are too small to pop on one and everything
 * after us is not. How far we will go to reach one.
 *
 * Being chased is the whole of when this is worth doing, and being chased is
 * something coming at us rather than something big being near: how close it
 * has to be, how much of our own speed it has to be closing at, and how long
 * that is still true for after it stops closing, since a chaser that pulls up
 * outside and waits is still a chaser.
 */
const HIDE_RANGE = 1600;
/**
 * Standing on a virus that fits under us, so that whoever takes the bait takes
 * the virus with it.
 *
 * How far we will walk to one, how far off the mark may be and still be worth
 * waiting for, how close it gets before we step round to the far side, and how
 * far past the virus that step goes. Then how long we will stand there for
 * somebody who never comes, and how long we leave it alone afterwards, since
 * the same virus is still the nearest one and nothing else would stop this
 * starting again on the very next tick.
 */
const LURE_WALK = 900;
const LURE_RANGE = 1400;
const LURE_BAIL = 90;
const LURE_CLEAR = 40;
const LURE_TIMEOUT = 5000;
const LURE_REST = 15000;
/**
 * How fast somebody has to be coming before standing still for them is a
 * plan, in units per millisecond. On a crowded screen there is always
 * somebody bigger within range, and standing on a virus for everyone who
 * merely exists is a cell that spends a third of its early game as bait for
 * players who never look its way.
 */
const LURE_CLOSING = 0.05;

const HUNT_RANGE = 700;
const HUNT_CLOSING = 0.45;
const HUNT_SUSTAIN = 600;
const HIDE_HOLD = 1500;
/** How straight the line from us through the virus to them has to be. */
const POP_ALIGN = 0.978;
/**
 * Contact danger that keeps a feed from starting, since the split ring never
 * does, and the higher one that stops a feed already under way. A threat
 * hovering at the one line otherwise turns a one second feed into a coin
 * flip every tick, and every flip is pellets thrown at a count that the
 * virus keeps and we do not.
 */
const POP_CONTACT = 0.2;
const POP_CONTACT_HOLD = 0.4;
/**
 * How long what was fed into a virus is remembered for.
 *
 * The virus keeps the count and the bot does not, so a feed that stops when
 * the line bends and starts again when it straightens has to carry on from
 * where it left off rather than from nothing. And a virus that has taken the
 * full eight and is still standing there is one the server would not let
 * fire, since it caps how many there are, so it is left alone for the same
 * while: feeding it again is mass thrown into a hole.
 */
const FEED_MEMORY = 30000;
const EJECT_INTERVAL = 120;
const POP_TIMEOUT = 6000;
/** How often to go looking for one of those lines. */
const POP_SCAN = 400;

/** How close to merging counts as close enough to stand and bait. */
const BAIT_WINDOW = 4000;
const BAIT_RANGE = 1400;
/** Mass we need over them before letting them come is a plan. */
const BAIT_MARGIN = 1.35;
/** What a baited threat's push is multiplied by, since we want it to come. */
const BAIT_DISCOUNT = 0.15;

/**
 * Pouring the pieces into one.
 *
 * Every press ejects from every cell we own at the pointer, so a pointer on
 * our biggest cell is every other piece feeding it, thirteen of every
 * eighteen thrown. It is dearer than waiting for the merge and it is now,
 * which is what makes it a play: a big cell one pour short of a split on
 * somebody, or of outweighing somebody at its mouth, gets there in a
 * second. How far off the merge has to be for it to be worth it, how far a
 * piece can be from the big one and still land its pellets in it, the least
 * a piece keeps back, what pressure calls it off, how long a pour runs, how
 * long before the next, and the least the pour has to add.
 */
const POUR_MERGE_FAR = 10000;
const POUR_REACH = 600;
const POUR_KEEP = SPLIT_MIN_MASS + EJECT_COST;
const POUR_PRESSURE = 0.2;
const POUR_TIMEOUT = 4000;
const POUR_REST = 6000;
const POUR_WORTH = 0.1;

// ---------------------------------------------------------------- directions

/** Headings the bot chooses between. 64 is 5.6 degrees a step. */
const DIRECTIONS = 64;
const DIR_STEP = (Math.PI * 2) / DIRECTIONS;
const DIR_X = new Float64Array(DIRECTIONS);
const DIR_Y = new Float64Array(DIRECTIONS);
for (let i = 0; i < DIRECTIONS; i++) {
    DIR_X[i] = Math.cos(i * DIR_STEP);
    DIR_Y[i] = Math.sin(i * DIR_STEP);
}

/**
 * Food is spread over the headings around it rather than added to one, which
 * is what makes a patch of pellets pull harder than a lone one without anybody
 * having to cluster them first. Cubed cosine, out to about 60 degrees.
 */
const FOOD_CONE = 11;
const FOOD_KERNEL = new Float64Array(FOOD_CONE + 1);
for (let j = 0; j <= FOOD_CONE; j++) {
    const c = Math.cos(j * DIR_STEP);
    FOOD_KERNEL[j] = c * c * c;
}

// ------------------------------------------------------------------- helpers

function massOf(cell) {
    return (cell.size * cell.size) / 100;
}

function sizeOf(mass) {
    return Math.sqrt(mass * 100);
}

/**
 * How fast a cell of that radius walks flat out, in units per millisecond.
 * The server moves it 2.2 × radius^-0.45 × 40 a tick, 25 ticks a second.
 */
function walkSpeed(size) {
    return 2.2 * Math.pow(size, -0.45);
}

function clamp01(value) {
    return value < 0 ? 0 : value > 1 ? 1 : value;
}

/**
 * What share of the split fear a threat of that weight earns for a meal of
 * that size, from the floor for one that would hardly notice it to the whole
 * of it for one it would feed on properly.
 *
 * The meal is everything of ours the split would land among, not the one
 * piece being asked about: eight crumbs in a huddle are one bite.
 */
function splitAppetite(meal, mass) {
    const bite = clamp01(
        (meal / mass - SPLIT_BITE_NONE) / (SPLIT_BITE_FULL - SPLIT_BITE_NONE)
    );
    return SPLIT_FEAR_FLOOR + (1 - SPLIT_FEAR_FLOOR) * bite;
}

function span(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * How long before split pieces may merge again: 30 seconds plus a share of the
 * mass, taking whichever of agar.io and the Ogar servers charges more. Nothing
 * on the wire carries the timer, so this is an estimate off the last time our
 * piece count went up.
 */
function mergeDelay(mass) {
    const agario = 30000 + 23.3 * mass;
    const ogar = Math.max(30000, sizeOf(mass) * 200);
    return Math.max(agario, ogar);
}

/** agar.io's team colours, the way legacy/launcher.user.js read them. */
function teamOf(color) {
    if (!color) return -1;
    if (color.substring(1, 3) === 'ff') return 0;
    if (color.substring(3, 5) === 'ff') return 1;
    return 2;
}

/** Distance from a point to the segment ab, for checking a split's flight. */
function distanceToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const length = dx * dx + dy * dy;
    let t = length > 0 ? ((px - ax) * dx + (py - ay) * dy) / length : 0;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    return span(px, py, ax + dx * t, ay + dy * t);
}

module.exports = function createAposBot(api) {
    const {
        getPlayer,
        getCells,
        getMemoryCells,
        getPointX,
        getPointY,
        getMapStartX,
        getMapStartY,
        getMapEndX,
        getMapEndY,
        getLastUpdate,
        getMode,
        verticalDistance,
        split,
        shoot,
        drawLine,
        drawPoint,
        drawCircle,
    } = api;

    class AposBot {
        constructor() {
            this.name = 'AposBot ' + version;

            /**
             * What the last tick decided. The panel shows it and nothing here
             * reads it.
             *
             *   flee   threats close, taking the cheapest way out
             *   bait   split and nearly merged, letting one come to us
             *   stage  walking round a virus to line a shot up
             *   pop    feeding a virus at somebody
             *   hide   sitting in a virus we are too small to pop
             *   pour   pouring the pieces into the biggest one
             *   escape splitting out of something we cannot outrun
             *   split  splitting onto prey this tick
             *   hunt   closing on prey
             *   feed   eating pellets
             *   roam   nothing scores, holding the heading
             */
            this.state = 'roam';
            this.threatCount = 0;
            this.clusterCount = 0;
            this.gapCount = 0;
            this.preyCount = 0;

            /** Splitting and virus feeding, both off with the one switch. */
            this.aggressive = true;
            this.drawing = true;

            this.heading = null;
            /** The way round something, followed until it stops working. */
            this.detour = null;
            /** Which way along a wall it last slid, per axis. */
            this.slideX = 1;
            this.slideY = 1;
            /** When something last closed on us, which is what cover is for. */
            this.huntedAt = 0;
            this.beingChased = false;
            /** When each threat started closing on us, for telling a chase apart. */
            this.pursuit = new Map();
            this.targetId = null;
            /** What the aim settled on this tick, and when it settled on it. */
            this.target = null;
            this.targetSince = 0;
            this.splitAt = 0;
            this.feeding = null;
            /** The virus being walked round, before there is a line to feed. */
            this.staging = null;
            /** Who not to walk round a virus at again yet, and until when. */
            this.stageRest = new Map();
            /** How many pellets each virus has had from us lately, and when. */
            this.fedViruses = new Map();
            /** The pour under way, and when the next may start. */
            this.pouring = null;
            this.pourRest = 0;
            /** The virus being stood on as bait, and when to stop offering it. */
            this.luring = null;
            this.lureRest = 0;
            this.popScan = 0;
            this.cellCount = 0;
            /** When our piece count last went up, which starts the merge clock. */
            this.brokeAt = 0;
            this.baitId = null;
            this.mergeLeft = 0;
            this.contact = 0;

            /** Where cells were last tick, so a target can be led. */
            this.motion = new Map();

            this.risk = new Float64Array(DIRECTIONS);
            this.gain = new Float64Array(DIRECTIONS);
            this.preyGain = new Float64Array(DIRECTIONS);
            this.value = new Float64Array(DIRECTIONS);
            /** Whether the screen is empty enough that room is the only gain. */
            this.repositioning = false;
            /** How hard something that could eat us is leaning on us, 0 to 1. */
            this.menace = 0;
        }

        keyAction(key) {
            if (key && key.keyCode === 69) this.aggressive = !this.aggressive;
        }

        displayText() {
            const lines = [
                'sees      ' + this.threatCount + ' threats  ' +
                    this.preyCount + ' prey  ' + this.clusterCount + ' food',
            ];
            if (this.target) {
                const target = this.target;
                lines.push(
                    'target    ' +
                        (target.kind === 'bearing'
                            ? 'bearing, nothing to aim at'
                            : target.kind + ' ' + Math.round(target.distance) +
                              ' away  held ' +
                              ((getLastUpdate() - this.targetSince) / 1000)
                                  .toFixed(1) + 's')
                );
            }
            if (this.cellCount > 1) {
                lines.push(
                    'merge     ' +
                        (this.mergeLeft > 0
                            ? 'in ' + (this.mergeLeft / 1000).toFixed(1) + 's'
                            : 'ready')
                );
            }
            if (this.feeding) {
                lines.push(
                    'feeding   ' + this.feeding.fed + '/' + VIRUS_FEED +
                        ' into a virus'
                );
            } else if (this.staging) {
                lines.push('lining up a virus');
            }
            if (!this.aggressive) lines.push('aggression off');
            return lines;
        }

        // ---------------------------------------------------------- the world

        /**
         * Sorts what we can see into what eats us, what we eat, and what does
         * neither, all measured against our own biggest and smallest cells.
         */
        survey(mine) {
            let total = 0;
            let cx = 0;
            let cy = 0;
            let big = mine[0];
            let small = mine[0];
            for (const cell of mine) {
                total += massOf(cell);
                cx += cell.x;
                cy += cell.y;
                if (cell.size > big.size) big = cell;
                if (cell.size < small.size) small = cell;
            }
            cx /= mine.length;
            cy /= mine.length;
            let spread = 0;
            for (const cell of mine) {
                spread = Math.max(spread, span(cell.x, cell.y, cx, cy) + cell.size);
            }

            const bigMass = massOf(big);
            const smallMass = massOf(small);
            const teams = getMode() === ':teams';
            const myTeam = teams ? teamOf(big.color) : -1;
            const owned = new Set();
            for (const cell of mine) owned.add(cell.id);

            const food = [];
            const viruses = [];
            // Everything with a mouth, whether or not it is pointed at us. A
            // cell that is no threat to us can still eat half of us, which is
            // what a split leaves lying about.
            const enemies = [];

            // Memory is for what can eat us. A remembered pellet is off the
            // screen behind a hundred nearer ones, and a remembered player is
            // a stale position: a piece that merged into its neighbour, or
            // was swallowed at the edge of the screen, leaves three seconds
            // of aiming at a spot with nothing on it. So food and prey come
            // from the screen, and only threats come from memory.
            const visible = getCells();
            const cells = getMemoryCells();
            for (const id in cells) {
                const cell = cells[id];
                if (owned.has(cell.id)) continue;
                if (cell.isVirus()) {
                    viruses.push(cell);
                    continue;
                }
                if (teams && teamOf(cell.color) === myTeam) continue;

                const remembered = !visible[id];
                const mass = massOf(cell);
                const eatable = mass * PREY_RATIO < bigMass;
                if (cell.ejected) {
                    if (eatable && !remembered) food.push(cell);
                    continue;
                }
                if (eatable && this.isPellet(cell, mass)) {
                    if (!remembered) food.push(cell);
                    continue;
                }
                enemies.push({
                    x: cell.x, y: cell.y, size: cell.size, mass, id: cell.id, cell,
                    remembered,
                });
            }

            this.foresee(enemies, food);

            // Our own pieces smallest first, which is the order anything
            // eating its way through them would take them in.
            const ladder = mine
                .map((cell) => ({
                    id: cell.id, mass: massOf(cell),
                    x: cell.x, y: cell.y, size: cell.size,
                }))
                .sort((a, b) => a.mass - b.mass);
            for (const entry of enemies) this.cascade(entry, ladder);

            const prey = [];
            const threats = [];
            for (const entry of enemies) {
                // Neither list excludes the other. Split into pieces of
                // different sizes, one cell is lunch for the big piece and
                // death for a small one at the same time, and it is the small
                // one that gets there first.
                if (!entry.remembered && entry.grown * PREY_RATIO < bigMass) {
                    prey.push(entry);
                }
                if (entry.grown > smallMass * THREAT_RATIO) threats.push(entry);
            }

            this.mergeThreats(threats, enemies, smallMass, ladder);

            // What each threat covers, so nothing has to work it out per
            // pellet. Squared, since the only question asked of it is inside
            // or outside.
            //
            // The two rings answer different questions and so are kept apart.
            // A mouth is where food is not food, and a split ring is where
            // food is worth less: somebody has to spend half their mass and a
            // merge timer to collect on it, and most of them will not. Ruling
            // both out is what leaves a screen with four players on it holding
            // nothing worth arriving at.
            const zones = [];
            for (const threat of threats) {
                // Less the piece being asked about, like every other reading
                // of it. Counting the whole cascade here has a lone cell treat
                // anything that could eat it as able to split onto it too,
                // which fences off most of the food on the screen.
                const grown = this.grownFor(threat, small);
                const splits = grown > smallMass * SPLIT_THREAT_RATIO;
                const mouth = threat.size + big.size + THREAT_MARGIN;
                const jump = mouth + SPLIT_REACH;
                zones.push({
                    x: threat.x,
                    y: threat.y,
                    r2: mouth * mouth,
                    jump2: splits ? jump * jump : 0,
                    appetite: splits
                        ? splitAppetite(Math.max(smallMass, threat.eats), threat.mass)
                        : 0,
                });
            }

            return {
                mine,
                centre: { x: cx, y: cy },
                spread,
                big,
                small,
                bigMass,
                smallMass,
                total,
                food,
                prey,
                threats,
                viruses,
                enemies,
                zones,
            };
        }

        /**
         * Whether a cell is a pellet: small, nameless and standing still.
         *
         * Mass alone does not say. A fresh spawn on agar.io is 40 to 60
         * across, under the pellet mass, and quicker than anything that could
         * eat it. Filed as a pellet it outbids every real one on the screen by
         * its mass, and the bot crosses the screen after something it will
         * never catch. Filed as prey it is worth what can be caught.
         */
        isPellet(cell, mass) {
            return mass <= PELLET_MASS && !cell.name && cell.isNotMoving();
        }

        /**
         * What an enemy would weigh once it had eaten its way through the
         * pieces of ours it can reach, smallest first.
         *
         * A cell the size of one of our middle pieces is not worth its own
         * mass when we are in eight of them. It takes the smallest, which pays
         * for the next one up, and it keeps going: by the time it stops it can
         * be worth more than everything we have left. So it is sized by where
         * that ends rather than by where it starts, which is what stops the
         * big pieces treating it as lunch while the small ones feed it.
         */
        cascade(entry, ladder) {
            let grown = entry.mass + (entry.potential || 0);
            let absorbed = null;
            let eats = 0;
            for (const piece of ladder) {
                if (grown < piece.mass * EAT_RATIO) break;
                const gap =
                    span(entry.x, entry.y, piece.x, piece.y) -
                    entry.size - piece.size;
                if (gap > CASCADE_RANGE) continue;
                grown += piece.mass;
                eats += piece.mass;
                if (!absorbed) absorbed = [];
                absorbed.push(piece.id);
            }
            entry.grown = grown;
            entry.absorbed = absorbed;
            entry.eats = eats;
        }

        /**
         * What each enemy is about to weigh, before it does.
         *
         * Any player it can swallow that is already at its mouth, or inside a
         * split of it when a split would pay, and any ejected mass at its edge
         * in somebody else's colour, which is a teammate feeding it. The
         * feeder counts too, less what a transfer wastes, since what is being
         * poured in is the rest of them.
         */
        foresee(enemies, food) {
            const ejected = [];
            for (const cell of food) if (cell.ejected) ejected.push(cell);

            for (const entry of enemies) {
                let extra = 0;
                for (const other of enemies) {
                    if (other === entry) continue;
                    // Its own pieces are not a meal. They merge, a minute
                    // from now, and until then a player broken into ten is
                    // ten mouthfuls rather than one cell that has already
                    // swallowed nine of them.
                    if (other.cell.color === entry.cell.color) continue;
                    if (entry.mass < other.mass * EAT_RATIO) continue;
                    const gap =
                        span(entry.x, entry.y, other.x, other.y) -
                        entry.size - other.size;
                    const reach =
                        entry.mass >= other.mass * SPLIT_THREAT_RATIO
                            ? FORESEE_RANGE + SPLIT_REACH
                            : FORESEE_RANGE;
                    if (gap <= reach) extra += other.mass;
                }

                let fed = 0;
                for (const cell of ejected) {
                    if (cell.color === entry.cell.color) continue;
                    const gap =
                        span(entry.x, entry.y, cell.x, cell.y) - entry.size;
                    if (gap <= FEED_RANGE) fed += massOf(cell);
                }
                if (fed >= FEED_MIN) {
                    extra += fed;
                    let feeder = null;
                    let closest = FEEDER_RANGE;
                    for (const other of enemies) {
                        if (other === entry) continue;
                        if (other.cell.color === entry.cell.color) continue;
                        const gap =
                            span(entry.x, entry.y, other.x, other.y) -
                            entry.size - other.size;
                        if (gap < closest) {
                            closest = gap;
                            feeder = other;
                        }
                    }
                    if (feeder) extra += feeder.mass * FEED_SHARE;
                }
                entry.potential = extra;
            }
        }

        /**
         * The same number for one cell of ours, which is not fed by itself.
         * Counting a piece towards what would eat it has an enemy splitting
         * onto us with mass it only gets by eating us first.
         */
        grownFor(entry, cell) {
            if (!entry.absorbed) return entry.grown;
            return entry.absorbed.indexOf(cell.id) === -1
                ? entry.grown
                : entry.grown - massOf(cell);
        }

        /**
         * Two enemy cells lying on top of each other are one cell as soon as
         * they finish merging, and either half on its own can be small enough
         * to look harmless. Same colour and overlapping is close enough to
         * call it one player.
         */
        mergeThreats(threats, enemies, smallMass, ladder) {
            const groups = new Map();
            for (const entry of enemies) {
                if (!entry.cell) continue;
                const key = entry.cell.color || '';
                let group = groups.get(key);
                if (!group) groups.set(key, (group = []));
                group.push(entry.cell);
            }

            for (const group of groups.values()) {
                if (group.length < 2) continue;
                for (let i = 0; i < group.length; i++) {
                    for (let j = i + 1; j < group.length; j++) {
                        const a = group[i];
                        const b = group[j];
                        const reach = a.size + b.size;
                        if (Math.abs(a.x - b.x) > reach ||
                            Math.abs(a.y - b.y) > reach) {
                            continue;
                        }
                        if (span(a.x, a.y, b.x, b.y) > reach * 0.9) continue;
                        const mass = massOf(a) + massOf(b);
                        const entry = {
                            x: (a.x + b.x) / 2,
                            y: (a.y + b.y) / 2,
                            size: sizeOf(mass),
                            mass,
                            id: null,
                            cell: null,
                        };
                        this.cascade(entry, ladder);
                        if (entry.grown <= smallMass * THREAT_RATIO) continue;
                        threats.push(entry);
                    }
                }
            }
        }

        /**
         * How fast everything worth aiming at is going, in units per
         * millisecond.
         *
         * Measured between updates rather than between ticks. In the browser
         * the bot thinks 60 times a second over a socket that talks about 25,
         * so a frame-to-frame reading is a fraction of the movement over a
         * whole update interval and everything looks nearly still.
         */
        trackMotion(view, now) {
            const seen = new Set();
            const remember = (entry) => {
                if (!entry.cell) return;
                seen.add(entry.cell.id);
                const last = this.motion.get(entry.cell.id);
                if (!last) {
                    this.motion.set(entry.cell.id, {
                        x: entry.x, y: entry.y, at: now, vx: 0, vy: 0,
                        moved: false,
                    });
                    return;
                }
                if (now > last.at) {
                    const elapsed = now - last.at;
                    const vx = (entry.x - last.x) / elapsed;
                    const vy = (entry.y - last.y) / elapsed;
                    // Half of what it was and half of what it just did. One
                    // update's worth of glide is a noisy reading, and a lead
                    // or a projection taken off it swings about. The first
                    // reading is taken whole, since before it there is
                    // nothing to average with.
                    last.vx = last.moved ? (last.vx + vx) / 2 : vx;
                    last.vy = last.moved ? (last.vy + vy) / 2 : vy;
                    last.moved = true;
                    last.x = entry.x;
                    last.y = entry.y;
                    last.at = now;
                }
                entry.vx = last.vx;
                entry.vy = last.vy;
            };
            for (const entry of view.prey) remember(entry);
            for (const entry of view.threats) remember(entry);
            // Our own too, since how fast we are is the other half of every
            // question about whether running works.
            for (const cell of view.mine) remember({ cell, x: cell.x, y: cell.y });
            for (const id of this.motion.keys()) {
                if (!seen.has(id)) this.motion.delete(id);
            }
        }

        /** How fast something is going, or nothing if it has not been seen move. */
        speedOf(id) {
            const last = this.motion.get(id);
            if (!last) return 0;
            return Math.sqrt(last.vx * last.vx + last.vy * last.vy);
        }

        // -------------------------------------------------------- the scoring

        /**
         * Fills the three fields every heading is judged on and returns how
         * hard the nearest threat is pressing, which is what the rest of the
         * tick keys off.
         */
        score(view) {
            const risk = this.risk;
            const gain = this.gain;
            const preyGain = this.preyGain;
            risk.fill(0);
            gain.fill(0);
            preyGain.fill(0);

            const pressure = this.scoreThreats(view, risk);
            this.scoreFood(view, gain);
            this.scorePrey(view, preyGain);
            this.scoreViruses(view, risk, gain, pressure);
            this.scoreWalls(view, risk, pressure);
            this.scoreOpen(view, gain);
            this.scoreEscape(view, gain);
            return pressure;
        }

        /**
         * A threat pushes on the headings that point at it, hardest when it is
         * already inside its reach. Each one is anchored on whichever of our
         * cells it is closest to eating, so a threat that has cornered one
         * piece steers the whole player.
         */
        scoreThreats(view, risk) {
            let pressure = 0;
            // Being inside a mouth and being inside a split range are not the
            // same emergency, and one tactic keys off each. Feeding a virus at
            // somebody is always inside their split range, since the virus has
            // to be between us, so gating that on anything else calls it off
            // every time.
            this.contact = 0;
            const horizon = this.horizon();
            for (const threat of view.threats) {
                const baited = threat.id !== null && threat.id === this.baitId;
                const discount = baited ? BAIT_DISCOUNT : 1;
                let touches = false;
                const ahead = this.ahead(threat);

                // Once per cell it endangers rather than once per threat, so
                // one enemy sitting on three of our pieces pushes three times
                // as hard as one sitting on a single piece.
                for (const cell of view.mine) {
                    const mass = massOf(cell);
                    // What it would weigh by the time it got to this piece,
                    // less whatever this piece is worth: an enemy does not
                    // split onto us with mass it only has after eating us.
                    const grown = this.grownFor(threat, cell);
                    if (grown < mass * THREAT_RATIO) continue;
                    // And whether it would have to reach through a piece that
                    // eats it to get this one.
                    const weight = this.covered(view, cell, threat)
                        ? discount * COVER_DISCOUNT
                        : discount;
                    const reach = threat.size + cell.size + THREAT_MARGIN;
                    const splits =
                        grown > mass * SPLIT_THREAT_RATIO &&
                        grown >= SPLIT_MIN_MASS;
                    const fear = splits
                        ? SPLIT_FEAR *
                            splitAppetite(Math.max(mass, threat.eats), threat.mass)
                        : 0;

                    // How worried this cell is right now, which is what the
                    // states and the tactics read. The gap between the two
                    // edges, measured against the buffer rather than against
                    // the distance: normalising by the distance divides by the
                    // threat's own radius, so a cell ten times our size reads
                    // as half worried while it is swallowing us.
                    const gap =
                        Math.min(
                            span(threat.x, threat.y, cell.x, cell.y),
                            span(ahead.x, ahead.y, cell.x, cell.y)
                        ) - reach;
                    const near = clamp01(1 - gap / THREAT_BUFFER);
                    const jump = splits
                        ? clamp01(1 - (gap - SPLIT_REACH) / THREAT_BUFFER)
                        : 0;
                    if (near > 0 || jump > 0) {
                        touches = true;
                        pressure = Math.max(
                            pressure,
                            weight * Math.max(near, jump * fear)
                        );
                        this.contact = Math.max(this.contact, weight * near);
                    }

                    // Weighted by what the piece is worth, since mass is
                    // the score and one pointer cannot save both sides of
                    // something standing in the middle of us. Counting pieces
                    // instead has eight cells run to save four crumbs while
                    // the three that carry the game swim past its mouth.
                    const stake = mass / view.bigMass;
                    const nearer =
                        Math.max(0, this.closingOn(threat, cell)) * CLOSING_LEAD;
                    this.sweep(
                        risk, cell, ahead, reach, THREAT_BUFFER,
                        weight * stake * THREAT_WEIGHT, horizon, nearer
                    );
                    if (splits) {
                        this.sweep(
                            risk, cell, ahead, reach + SPLIT_REACH, THREAT_BUFFER,
                            weight * stake * THREAT_WEIGHT * fear,
                            horizon, nearer
                        );
                    }
                }

                if (touches && this.drawing && !baited) {
                    drawCircle(threat.x, threat.y, threat.size + THREAT_MARGIN, 0);
                }
            }
            return pressure;
        }

        /**
         * Where a threat will be a moment from now, or where it is when it
         * has not been seen to move.
         */
        ahead(threat) {
            if (!threat.vx && !threat.vy) return threat;
            return {
                x: threat.x + threat.vx * THREAT_LOOKAHEAD,
                y: threat.y + threat.vy * THREAT_LOOKAHEAD,
                size: threat.size,
                vx: threat.vx,
                vy: threat.vy,
            };
        }

        /**
         * What one cell going one way would cost, on every heading at once.
         *
         * Measured on how close the ray from that cell passes to the thing,
         * not on how close the thing is now. Those differ exactly where it
         * matters: a heading that runs past an enemy at arm's length reads as
         * perfectly safe to anything that only asks where everybody is
         * standing, and it is how a player with four cells feeds the fast
         * small ones to something the slow big one would never have reached.
         */
        sweep(risk, cell, thing, radius, buffer, weight, horizon, nearer = 0) {
            const rx = thing.x - cell.x;
            const ry = thing.y - cell.y;
            const distance = Math.sqrt(rx * rx + ry * ry);
            if (distance > horizon + radius + buffer) return;

            if (this.inFlight(thing, rx, ry)) {
                this.sweepFlight(risk, thing, rx, ry, radius, buffer, weight);
                return;
            }

            const band = radius + buffer;
            for (let i = 0; i < DIRECTIONS; i++) {
                // Anything that takes us no closer than we already are costs
                // nothing, which is most of why this is a sweep and not a
                // push: the whole half of the compass that leaves is free, and
                // the food and the walls pick between those.
                const along = rx * DIR_X[i] + ry * DIR_Y[i];
                if (along <= 0) {
                    // Every heading that leaves is free, which leaves them all
                    // tied and the bot running sideways past something that is
                    // on top of it. Straight away wins the tie, and only while
                    // there is something to be away from.
                    const clear = distance - radius;
                    if (clear >= buffer) continue;
                    const close = clear > 0 ? 1 - clear / buffer : 1;
                    const leaving = -along / distance;
                    risk[i] -= weight * close * close * leaving * ESCAPE_LEAN;
                    continue;
                }
                // Read nearer along the heading by what it closes in the
                // time the heading takes, so a thing that is coming counts
                // as where it is going to be and not where it is.
                const due = along > nearer ? along - nearer : 0;
                if (due >= horizon) continue;
                const cross = rx * DIR_Y[i] - ry * DIR_X[i];
                const clearance = cross < 0 ? -cross : cross;
                const gap = clearance - radius;
                if (gap >= buffer) continue;
                const near = gap > 0 ? 1 - gap / buffer : 1;
                const closing = clamp01((distance - clearance) / band);
                const soon = 1 - due / horizon;
                risk[i] += weight * near * near * closing * soon;
            }
        }

        /**
         * Whether a thing is a piece in flight coming at a cell: moving faster
         * than anything walks, and closing.
         */
        inFlight(thing, rx, ry) {
            const vx = thing.vx || 0;
            const vy = thing.vy || 0;
            if (vx * vx + vy * vy < FLIGHT_SPEED * FLIGHT_SPEED) return false;
            return rx * vx + ry * vy < 0;
        }

        /**
         * What every heading costs while a piece is in flight at a cell.
         *
         * A half thrown from a split goes where it was thrown, about 710 along
         * one line and faster than we go, and then it stops. Down that line is
         * being caught and up it is meeting it halfway, so both ends cost the
         * full weight, while off the line is the way out. Off it on the side
         * we are already standing on: crossing the line is passing through
         * the piece, so that way costs half. Straight away is what the
         * ordinary sweep leans towards, and against a piece in flight it is
         * the one heading that cannot work.
         */
        sweepFlight(risk, thing, rx, ry, radius, buffer, weight) {
            const speed = Math.sqrt(thing.vx * thing.vx + thing.vy * thing.vy);
            const vx = thing.vx / speed;
            const vy = thing.vy / speed;
            // How far we stand off its line, less what it reaches from it.
            const clear = Math.abs(rx * vy - ry * vx) - radius;
            if (clear >= buffer) return;
            const close = clear > 0 ? 1 - clear / buffer : 1;
            // Which side of the line we are on, so that crossing it can be
            // told from leaving it.
            const toward = ry * vx - rx * vy > 0 ? 1 : -1;
            for (let i = 0; i < DIRECTIONS; i++) {
                const along = DIR_X[i] * vx + DIR_Y[i] * vy;
                const across = (DIR_Y[i] * vx - DIR_X[i] * vy) * toward;
                let cost = along * along;
                if (across > 0) cost += FLIGHT_CROSS * across * across;
                risk[i] += weight * close * cost;
            }
        }

        /**
         * Whether a bigger piece of ours would eat this threat at the one spot
         * it has to stand in to eat this piece.
         *
         * Not whether it is roughly in the way. A threat takes a cell by
         * getting its centre to within the two radii of it, and the near side
         * of that circle is where it comes from, so that point is the whole
         * question: if a piece of ours that outweighs it has its mouth over
         * that point, coming for the crumb costs the threat the game.
         *
         * Measured against the whole cascade rather than against what it
         * weighs now, since it arrives having eaten whatever it passed.
         */
        covered(view, cell, threat) {
            if (view.mine.length < 2) return false;
            if (view.bigMass < threat.grown * PREY_RATIO) return false;
            const dx = threat.x - cell.x;
            const dy = threat.y - cell.y;
            const away = Math.sqrt(dx * dx + dy * dy) || 1;
            const bite = threat.size + cell.size;
            const mx = cell.x + (dx / away) * bite;
            const my = cell.y + (dy / away) * bite;
            for (const own of view.mine) {
                if (own.id === cell.id) continue;
                if (massOf(own) < threat.grown * PREY_RATIO) continue;
                if (span(own.x, own.y, mx, my) <= own.size + COVER_MARGIN) {
                    return true;
                }
            }
            return false;
        }

        /** How far ahead the sweep looks, which is about half a screen. */
        horizon() {
            return Math.max(600, verticalDistance() * 0.5);
        }

        scoreFood(view, gain) {
            const grazers = this.grazers(view);
            for (const cell of view.food) {
                const near = this.nearestCell(view.mine, cell.x, cell.y);
                if (near.distance < 1) continue;
                let value =
                    (FOOD_GAIN * massOf(cell)) / (near.distance + FOOD_SOFT);
                if (grazers.length > 0 && this.grazed(grazers, cell)) {
                    value *= GRAZE_DISCOUNT;
                }
                this.spread(gain, near.ux, near.uy, value);
            }
        }

        /**
         * Smaller players on the move, with how far ahead of themselves they
         * are about to eat. A cell smaller than us is quicker than us, so the
         * pellets in front of one are its and not ours, and steering at them
         * is following it round the map from behind.
         */
        grazers(view) {
            const out = [];
            for (const entry of view.prey) {
                const speed = Math.hypot(entry.vx || 0, entry.vy || 0);
                if (speed <= 0) continue;
                out.push({
                    x: entry.x,
                    y: entry.y,
                    ux: entry.vx / speed,
                    uy: entry.vy / speed,
                    reach: entry.size + speed * GRAZE_LEAD,
                });
            }
            return out;
        }

        /** Whether a pellet is in front of something that will get there first. */
        grazed(grazers, cell) {
            for (const grazer of grazers) {
                const dx = cell.x - grazer.x;
                const dy = cell.y - grazer.y;
                if (dx * grazer.ux + dy * grazer.uy <= 0) continue;
                if (dx * dx + dy * dy < grazer.reach * grazer.reach) return true;
            }
            return false;
        }

        /**
         * Prey is worth more than the pellets it is made of, worth more again
         * once it is inside split range, and worth more still with its back to
         * a wall, since that is the one that cannot simply outrun us.
         */
        scorePrey(view, preyGain) {
            const ours = this.ourSpeed(view);
            for (const entry of view.prey) {
                const near =
                    this.nearestCell(view.mine, entry.x, entry.y, entry.mass);
                if (!near.cell || near.distance < 1) continue;
                entry.trapped =
                    this.cornered(entry) ||
                    (near.distance < PREY_REACH && this.trapped(view, entry, near));
                entry.catch = this.catchable(view, entry, near, ours);
                let value =
                    (FOOD_GAIN * entry.mass * entry.catch) /
                    (near.distance + FOOD_SOFT);
                // Inside split range is worth double when a half of ours
                // could take it, and nothing in particular when it could not.
                if (near.distance < near.cell.size + SPLIT_REACH &&
                    massOf(near.cell) / 2 >= entry.grown * SPLIT_KILL_RATIO) {
                    value *= 2;
                }
                if (entry.trapped) value *= 1.5;
                if (near.distance > PREY_REACH) value *= PREY_REACH / near.distance;
                this.spread(preyGain, near.ux, near.uy, value);
            }
        }

        /**
         * Whether a prey's ways out are shut, by the map or by viruses it is
         * too big to pass. Read over the headings that lead away from us,
         * since those are the ones a run takes.
         */
        trapped(view, entry, near) {
            const pops = entry.mass > VIRUS_MASS * EAT_RATIO;
            const heading = Math.atan2(near.uy, near.ux);
            let blocked = 0;
            for (let k = -TRAP_SPAN; k <= TRAP_SPAN; k++) {
                const angle = heading + k * TRAP_STEP;
                const dx = Math.cos(angle);
                const dy = Math.sin(angle);
                if (this.roomAlong(entry, dx, dy) < TRAP_RANGE) {
                    blocked++;
                    continue;
                }
                if (!pops) continue;
                const endX = entry.x + dx * TRAP_RANGE;
                const endY = entry.y + dy * TRAP_RANGE;
                for (const virus of view.viruses) {
                    const gap = distanceToSegment(
                        virus.x, virus.y, entry.x, entry.y, endX, endY
                    );
                    if (gap < virus.size) {
                        blocked++;
                        break;
                    }
                }
            }
            return blocked >= TRAP_BLOCKED;
        }

        /** How far a cell can go that way before the map runs out. */
        roomAlong(cell, dx, dy) {
            const minX = getMapStartX();
            const maxX = getMapEndX();
            const minY = getMapStartY();
            const maxY = getMapEndY();
            let exit = Infinity;
            if (dx > 0 && isFinite(maxX)) exit = (maxX - cell.size - cell.x) / dx;
            else if (dx < 0 && isFinite(minX)) exit = (minX + cell.size - cell.x) / dx;
            if (dy > 0 && isFinite(maxY)) {
                exit = Math.min(exit, (maxY - cell.size - cell.y) / dy);
            } else if (dy < 0 && isFinite(minY)) {
                exit = Math.min(exit, (minY + cell.size - cell.y) / dy);
            }
            return exit < 0 ? 0 : exit;
        }

        /**
         * How much of a prey's mass is worth counting, given that it is
         * quicker than us.
         *
         * What can be caught is what is coming this way, what is standing
         * still, what has run out of map, and what a split can reach. The
         * rest is leaving, and a walk after it ends with it still ahead.
         */
        catchable(view, entry, near, ours) {
            const away = (entry.vx || 0) * near.ux + (entry.vy || 0) * near.uy;
            if (away <= 0) return 1;
            if (entry.trapped) return 1;
            if (view.bigMass / 2 >= entry.grown * SPLIT_KILL_RATIO) {
                const half = sizeOf(view.bigMass / 2);
                const reach = half + SPLIT_REACH * SPLIT_TRUST;
                if (span(entry.x, entry.y, view.big.x, view.big.y) < reach) {
                    return 1;
                }
            }
            const chaser = this.speedOf(near.cell.id) || ours;
            if (chaser <= 0) return 1;
            return Math.max(PREY_FLEEING, 1 - away / chaser);
        }

        /**
         * A virus splits us on the way in, so it costs more the more pieces we
         * have room to be broken into, and nothing at all once we are at the
         * cap: at 16 cells it is 100 mass sitting still. One we are too small
         * to pop is cover instead, since whoever is chasing us is not.
         */
        scoreViruses(view, risk, gain, pressure) {
            const room = Math.max(0, MAX_CELLS - view.mine.length);
            const shelter = this.beingChased && this.shelters(view);
            const horizon = this.horizon();
            // Whether a virus breaks anything we own, which is a question
            // about our biggest cell and not about whichever one happens to
            // be closest to it. A piece too small to pop sitting in front of
            // a cell that would is no reason to walk that cell in, and it is
            // not cover either while we are carrying something a virus opens.
            const breaks = view.bigMass > VIRUS_MASS * EAT_RATIO;
            for (const virus of view.viruses) {
                const near = this.nearestCell(view.mine, virus.x, virus.y);
                if (near.distance < 1) continue;

                if (breaks) {
                    if (room === 0) {
                        const value =
                            (VIRUS_FOOD_GAIN * FOOD_GAIN * VIRUS_MASS) /
                            (near.distance + FOOD_SOFT);
                        this.spread(gain, near.ux, near.uy, value);
                        if (this.drawing) {
                            drawCircle(virus.x, virus.y, virus.size, 1);
                        }
                        continue;
                    }
                    // Every cell big enough to pop on it, since the one that
                    // arrives first is the fast small one only when it is too
                    // small to care.
                    const weight = VIRUS_WEIGHT * (room / MAX_CELLS);
                    const shot = this.loaded(view, virus);
                    for (const cell of view.mine) {
                        const mass = massOf(cell);
                        if (mass <= VIRUS_MASS * EAT_RATIO) continue;
                        const radius = virus.size + cell.size + VIRUS_MARGIN;
                        const share = (weight * mass) / view.bigMass;
                        this.sweep(
                            risk, cell, virus, radius, VIRUS_BUFFER, share, horizon
                        );
                        if (!shot) continue;
                        // Somebody is loading it, and it flies down that line
                        // through whoever stands there. Downrange of it the
                        // line is a corridor to leave, the way a piece in
                        // flight is: backing down it is still in it.
                        const rx = virus.x - cell.x;
                        const ry = virus.y - cell.y;
                        if (rx * shot.x + ry * shot.y >= 0) continue;
                        if (rx * rx + ry * ry > SHOT_REACH * SHOT_REACH) continue;
                        this.sweepFlight(
                            risk, { x: virus.x, y: virus.y, vx: shot.x, vy: shot.y },
                            rx, ry, radius, VIRUS_BUFFER, share * SHOT_WEIGHT
                        );
                    }
                    if (this.drawing) {
                        drawCircle(virus.x, virus.y, virus.size + VIRUS_MARGIN, 6);
                        if (shot) {
                            drawLine(
                                virus.x, virus.y,
                                virus.x + shot.x * SHOT_REACH,
                                virus.y + shot.y * SHOT_REACH, 0
                            );
                        }
                    }
                } else if (shelter) {
                    const value =
                        (SHELTER_GAIN * pressure * FOOD_GAIN * VIRUS_MASS) /
                        (near.distance + FOOD_SOFT);
                    this.spread(gain, near.ux, near.uy, value);
                    if (this.drawing) drawCircle(virus.x, virus.y, virus.size, 4);
                }
            }
        }

        /**
         * Which way a virus somebody is feeding will fly, or nothing when
         * nobody is feeding it.
         *
         * Ejected mass at a virus in a colour that is not ours is somebody
         * loading it, and at eight it fires along the line the pellets came
         * in on: from the feeder, through the virus, and on. Which pellet
         * puts it over is theirs to choose, so a virus with pellets at it is
         * a gun that is already pointed. The line is read from the feeder
         * when they are still standing within an eject of it, and from the
         * pellets themselves when they are not.
         */
        loaded(view, virus) {
            let fx = 0;
            let fy = 0;
            let feeder = null;
            for (const cell of view.food) {
                if (!cell.ejected || cell.color === view.big.color) continue;
                const gap = span(cell.x, cell.y, virus.x, virus.y) - virus.size;
                if (gap > FEED_RANGE) continue;
                fx += virus.x - cell.x;
                fy += virus.y - cell.y;
                for (const entry of view.enemies) {
                    if (entry.cell.color !== cell.color) continue;
                    if (span(entry.x, entry.y, virus.x, virus.y) > EJECT_REACH) {
                        continue;
                    }
                    feeder = entry;
                }
            }
            if (!fx && !fy) return null;
            if (feeder) {
                fx = virus.x - feeder.x;
                fy = virus.y - feeder.y;
            }
            const length = Math.sqrt(fx * fx + fy * fy) || 1;
            return { x: fx / length, y: fy / length };
        }

        /** Whether anything chasing us is big enough to pop on a virus. */
        shelters(view) {
            for (const threat of view.threats) {
                if (threat.mass > VIRUS_MASS * EAT_RATIO) return true;
            }
            return false;
        }

        /**
         * How much room each heading leaves before the map runs out. This is
         * what keeps an escape from ending in a corner, and it counts from
         * further out the harder we are being pressed.
         */
        scoreWalls(view, risk, pressure) {
            const minX = getMapStartX();
            const minY = getMapStartY();
            const maxX = getMapEndX();
            const maxY = getMapEndY();
            if (
                !isFinite(minX) || !isFinite(minY) ||
                !isFinite(maxX) || !isFinite(maxY)
            ) {
                return;
            }
            const widen = 1 + pressure * WALL_PRESSURE;
            const lookahead = WALL_LOOKAHEAD * widen;

            for (const cell of view.mine) {
                const inset = cell.size;
                const left = minX + inset - cell.x;
                const right = maxX - inset - cell.x;
                const top = minY + inset - cell.y;
                const bottom = maxY - inset - cell.y;
                for (let i = 0; i < DIRECTIONS; i++) {
                    const dx = DIR_X[i];
                    const dy = DIR_Y[i];
                    let exit = Infinity;
                    if (dx > 0) exit = right / dx;
                    else if (dx < 0) exit = left / dx;
                    if (dy > 0) exit = Math.min(exit, bottom / dy);
                    else if (dy < 0) exit = Math.min(exit, top / dy);
                    if (exit >= lookahead) continue;
                    if (exit < 0) exit = 0;
                    const crowding = 1 - exit / lookahead;
                    risk[i] += WALL_WEIGHT * crowding * crowding;
                }

                const near = (WALL_NEAR + cell.size / 2) * widen;
                this.pushWall(risk, cell.x - minX, -1, 0, near);
                this.pushWall(risk, maxX - cell.x, 1, 0, near);
                this.pushWall(risk, cell.y - minY, 0, -1, near);
                this.pushWall(risk, maxY - cell.y, 0, 1, near);
            }
        }

        /**
         * How boxed in a heading would leave us, while something that could
         * eat us is close enough for that to matter.
         *
         * The threat terms already say which way not to go. They do not say
         * anything about where the going ends, so a bot dodging correctly all
         * the way into a corner scores well every single tick and dies anyway.
         */
        scoreEscape(view, gain) {
            this.menace = 0;
            const minX = getMapStartX();
            const minY = getMapStartY();
            const maxX = getMapEndX();
            const maxY = getMapEndY();
            if (
                !isFinite(minX) || !isFinite(minY) ||
                !isFinite(maxX) || !isFinite(maxY)
            ) {
                return;
            }

            // How hard we are being leaned on, read off the gap between edges
            // rather than the gap between centres, and over a long enough run
            // that it is still answerable when it happens.
            let menace = 0;
            for (const threat of view.threats) {
                for (const cell of view.mine) {
                    const mass = massOf(cell);
                    if (this.grownFor(threat, cell) < mass * THREAT_RATIO) continue;
                    if (this.covered(view, cell, threat)) continue;
                    const gap =
                        span(threat.x, threat.y, cell.x, cell.y) -
                        threat.size - cell.size;
                    const near = clamp01(1 - gap / MENACE_RANGE);
                    if (near > menace) menace = near;
                }
            }
            this.menace = menace;
            if (menace <= 0) return;

            // And how much of a pocket we are already in. Out in the middle
            // there is nothing to be saved from, so this says nothing at all
            // there, which is where most of the eating happens. It only starts
            // speaking once the map is running out on some side of us, which
            // is the position worth not being in.
            const at = view.centre;
            let here = at.x - minX;
            if (maxX - at.x < here) here = maxX - at.x;
            if (at.y - minY < here) here = at.y - minY;
            if (maxY - at.y < here) here = maxY - at.y;
            const boxed = clamp01(1 - here / ESCAPE_BOX);
            if (boxed <= 0) return;
            const weight = ESCAPE_GAIN * menace * boxed;
            for (let i = 0; i < DIRECTIONS; i++) {
                const x = at.x + DIR_X[i] * ESCAPE_REACH;
                const y = at.y + DIR_Y[i] * ESCAPE_REACH;
                let room = x - minX;
                if (maxX - x < room) room = maxX - x;
                if (y - minY < room) room = y - minY;
                if (maxY - y < room) room = maxY - y;
                if (room < 0) room = 0;
                else if (room > ESCAPE_REACH) room = ESCAPE_REACH;
                gain[i] += (weight * room) / ESCAPE_REACH;
            }
        }

        /**
         * Room to go to, for when there is nothing to go to.
         *
         * Runs only on a screen with nothing on it worth eating, so it never
         * competes with food. What it does is stop an empty screen meaning an
         * empty score, which is what left the bot holding one bearing into the
         * edge and then running along it.
         */
        scoreOpen(view, gain) {
            this.repositioning = false;
            if (view.food.length > 0 || view.prey.length > 0) return;
            const minX = getMapStartX();
            const minY = getMapStartY();
            const maxX = getMapEndX();
            const maxY = getMapEndY();
            if (
                !isFinite(minX) || !isFinite(minY) ||
                !isFinite(maxX) || !isFinite(maxY)
            ) {
                return;
            }
            this.repositioning = true;
            const cell = view.big;
            // Scored on where the heading leaves us rather than on how far it
            // could run. Room ahead ties every heading that has more than the
            // cap, which along an edge is most of them, and a tie is the bot
            // holding the bearing it already had. Where it lands does not tie:
            // the edge is still the edge once you have run along it.
            for (let i = 0; i < DIRECTIONS; i++) {
                const x = cell.x + DIR_X[i] * ROAM_RANGE;
                const y = cell.y + DIR_Y[i] * ROAM_RANGE;
                let room = x - minX;
                if (maxX - x < room) room = maxX - x;
                if (y - minY < room) room = y - minY;
                if (maxY - y < room) room = maxY - y;
                if (room < 0) room = 0;
                else if (room > ROAM_RANGE) room = ROAM_RANGE;
                gain[i] += (ROAM_GAIN * room) / ROAM_RANGE;
            }
        }

        /**
         * One wall shoving on the headings that point into it. Weak next to
         * the room term on purpose: this one only has to beat an empty screen,
         * since food along the edge is still worth going to get.
         */
        pushWall(risk, gap, ux, uy, near) {
            if (gap >= near) return;
            const crowding = gap > 0 ? 1 - gap / near : 1;
            const weight = WALL_SHOVE * crowding * crowding;
            for (let i = 0; i < DIRECTIONS; i++) {
                const dot = DIR_X[i] * ux + DIR_Y[i] * uy;
                if (dot > 0) risk[i] += weight * dot * dot;
            }
        }

        /** Whether a cell has run out of room to keep running. */
        cornered(entry) {
            const minX = getMapStartX();
            const maxX = getMapEndX();
            if (!isFinite(minX) || !isFinite(maxX)) return false;
            const margin = entry.size + 300;
            return (
                entry.x - minX < margin ||
                maxX - entry.x < margin ||
                entry.y - getMapStartY() < margin ||
                getMapEndY() - entry.y < margin
            );
        }

        /** The cell of ours closest to a point, and which way it lies. */
        nearestCell(mine, x, y, preyMass) {
            let cell = null;
            let best = Infinity;
            for (const own of mine) {
                if (preyMass !== undefined && massOf(own) < preyMass * PREY_RATIO) {
                    continue;
                }
                const dx = x - own.x;
                const dy = y - own.y;
                const distance = dx * dx + dy * dy;
                if (distance < best) {
                    best = distance;
                    cell = own;
                }
            }
            if (!cell) return { cell: null, distance: Infinity, ux: 0, uy: 0 };
            const distance = Math.sqrt(best) || 1;
            return {
                cell,
                distance,
                ux: (x - cell.x) / distance,
                uy: (y - cell.y) / distance,
            };
        }

        /** Adds a value to the headings around one, falling off with the angle. */
        spread(field, ux, uy, value) {
            const bin = Math.round(Math.atan2(uy, ux) / DIR_STEP);
            for (let j = -FOOD_CONE; j <= FOOD_CONE; j++) {
                const index = (bin + j + DIRECTIONS) % DIRECTIONS;
                field[index] += value * FOOD_KERNEL[j < 0 ? -j : j];
            }
        }

        // ------------------------------------------------------- the steering

        mainLoop() {
            const mine = getPlayer();
            if (mine.length === 0) {
                this.state = 'roam';
                this.cellCount = 0;
                this.feeding = null;
                this.staging = null;
                this.luring = null;
                this.pouring = null;
                this.targetId = null;
                this.target = null;
                this.detour = null;
                this.huntedAt = 0;
                this.pursuit.clear();
                return [];
            }

            const now = getLastUpdate();
            // Only the steering has one, so a tick a tactic answers has none.
            this.target = null;
            if (mine.length > this.cellCount) this.brokeAt = now;
            this.cellCount = mine.length;

            const view = this.survey(mine);
            this.trackMotion(view, now);
            this.threatCount = view.threats.length;
            this.preyCount = view.prey.length;
            this.clusterCount = view.food.length;
            this.mergeLeft = this.mergeIn(view, now);

            this.baitId = this.baitTarget(view, now);
            // Once a tick, since it moves the clock on and both the field and
            // the cover read it.
            this.beingChased = this.chased(view, now);
            const pressure = this.score(view);
            this.rank(view);

            const pop = this.planPop(view, now);
            if (pop) return pop;

            const out = this.planEscape(view, now);
            if (out) return out;

            const bait = this.planLure(view, now);
            if (bait) return bait;

            const cover = this.planHide(view);
            if (cover) return cover;

            const pour = this.planPour(view, now, pressure);
            if (pour) return pour;

            const kill = this.planSplit(view, now, pressure);
            if (kill) return kill;

            return this.steer(view, pressure);
        }

        /**
         * Splitting to get out, when there is nothing left to get out with.
         *
         * Cornered by something bigger, every heading either runs at it or
         * runs out of map, and the cell is slower than the room it has left. A
         * split is the one thing that covers ground the cell cannot: it throws
         * both halves 710 in a second. It costs half the mass on each of two
         * lines, so it wants a line that clears the mouth by more than the
         * mouth can reach, and it is only ever taken when the alternative is
         * standing there being eaten.
         */
        planEscape(view, now) {
            if (this.contact < ESCAPE_CONTACT) return null;
            if (now - this.splitAt < SPLIT_COOLDOWN) return null;
            if (view.mine.length >= MAX_CELLS) return null;
            if (view.bigMass < SPLIT_MIN_MASS * 2) return null;

            const cell = view.big;
            const mass = massOf(cell);
            const minX = getMapStartX();
            const minY = getMapStartY();
            const maxX = getMapEndX();
            const maxY = getMapEndY();
            const known =
                isFinite(minX) && isFinite(minY) &&
                isFinite(maxX) && isFinite(maxY);

            // Which of them is actually on us, since that is the one we have
            // to get away from rather than merely around.
            let pressing = null;
            let closest = Infinity;
            for (const threat of view.threats) {
                if (this.grownFor(threat, cell) < mass * THREAT_RATIO) continue;
                const gap =
                    span(threat.x, threat.y, cell.x, cell.y) - threat.size;
                if (gap < closest) {
                    closest = gap;
                    pressing = threat;
                }
            }
            if (!pressing) return null;

            const awayX = cell.x - pressing.x;
            const awayY = cell.y - pressing.y;
            const away = Math.hypot(awayX, awayY) || 1;
            const ux = awayX / away;
            const uy = awayY / away;

            // Size and speed run opposite ways in this game, so nothing big
            // enough to eat us ever catches us by walking, and a mouth closing
            // on us faster than we can go is a piece still in flight from a
            // split. That we cannot outrun, and the gap that is left is
            // measured in frames.
            const ours = Math.max(this.ourSpeed(view), walkSpeed(cell.size));
            const flying =
                this.closingOn(pressing, cell) > ours * ESCAPE_LOSING;
            const grown = this.grownFor(pressing, cell);
            const splits =
                grown > mass * SPLIT_THREAT_RATIO && grown >= SPLIT_MIN_MASS;

            if (!splits && !flying) {
                // Something walking that cannot split onto us. It is slower
                // than we are, so covering us is not eating us: it eats us
                // only by cutting off every run we have, and whether it can
                // is where it stands, not how far in it is.
                if (this.runOpen(view, cell)) return null;
            } else {
                // Running beats splitting whenever running works, and against
                // this it works whenever some heading that takes us off it
                // still has map in front of it. Being cornered is exactly the
                // case where none does, and being swallowed by a piece in
                // flight is the other way the room runs out.
                const swallowed =
                    flying && closest < cell.size * ESCAPE_SWALLOW;
                let boxed = true;
                for (let i = 0; i < DIRECTIONS; i++) {
                    if (DIR_X[i] * ux + DIR_Y[i] * uy <= ESCAPE_AWAY) continue;
                    if (this.roomAlong(cell, DIR_X[i], DIR_Y[i]) > SPLIT_REACH) {
                        boxed = false;
                        break;
                    }
                }
                if (!boxed && !swallowed) return null;
            }

            // Cornered. What matters now is where the halves come down, not
            // how close they start: something already touching us is close to
            // every line we could take, so asking the whole flight to clear it
            // rules out the throw exactly when it is the only thing left. So
            // the landing has to be out of reach, and the throw must not be
            // aimed into the mouth on the way.
            const half = sizeOf(view.bigMass / 2);
            let best = null;
            let bestRoom = 0;
            for (let i = 0; i < DIRECTIONS; i++) {
                if (DIR_X[i] * -ux + DIR_Y[i] * -uy > ESCAPE_INTO) continue;
                const x = cell.x + DIR_X[i] * SPLIT_REACH;
                const y = cell.y + DIR_Y[i] * SPLIT_REACH;
                if (known) {
                    if (
                        x < minX + half || x > maxX - half ||
                        y < minY + half || y > maxY - half
                    ) {
                        continue;
                    }
                }
                let worst = Infinity;
                for (const threat of view.threats) {
                    const gap =
                        span(threat.x, threat.y, x, y) -
                        threat.size - half - ESCAPE_CLEAR;
                    if (gap < worst) worst = gap;
                }
                if (worst <= 0) continue;
                if (worst > bestRoom) {
                    bestRoom = worst;
                    best = i;
                }
            }

            if (best === null) return null;

            // The throw goes wherever the pointer is, and the pointer is
            // where the last tick left it. So this tick turns onto the
            // landing and the next one throws. Fired at once it goes down
            // whatever heading the running had, which is rarely this one.
            const at = this.point(view, DIR_X[best], DIR_Y[best], SPLIT_REACH);
            const dx = at[0] - view.centre.x;
            const dy = at[1] - view.centre.y;
            const length = Math.sqrt(dx * dx + dy * dy) || 1;
            const aimX = getPointX() - view.centre.x;
            const aimY = getPointY() - view.centre.y;
            const aimLength = Math.sqrt(aimX * aimX + aimY * aimY) || 1;
            const aligned =
                (dx * aimX + dy * aimY) / (length * aimLength) > SPLIT_ALIGN;
            if (aligned) {
                split();
                this.splitAt = now;
                this.state = 'escape';
            } else {
                this.state = 'flee';
            }
            return this.aim(view, DIR_X[best], DIR_Y[best], SPLIT_REACH);
        }

        /**
         * How fast our own cells are actually going, which is the yardstick
         * for whether anything is gaining on us.
         *
         * The fastest of them rather than the one being chased, since a piece
         * that only appeared this update has no reading yet and the smallest
         * cell we have is the quickest thing we could be. Reading it high
         * makes a throw less likely, which is the right way round for a move
         * that costs half the mass.
         */
        ourSpeed(view) {
            let fastest = 0;
            for (const cell of view.mine) {
                const speed = this.speedOf(cell.id);
                if (speed > fastest) fastest = speed;
            }
            return fastest;
        }

        /** How fast something is eating into the gap between it and a cell. */
        closingOn(threat, cell) {
            const last = threat.id !== null ? this.motion.get(threat.id) : null;
            if (!last) return 0;
            const dx = cell.x - threat.x;
            const dy = cell.y - threat.y;
            const away = Math.sqrt(dx * dx + dy * dy) || 1;
            return (last.vx * dx + last.vy * dy) / away;
        }

        /**
         * How far a cell can go along a heading before its edge meets the
         * map, or forever while the map is not known.
         */
        roomAlong(cell, dx, dy) {
            const minX = getMapStartX();
            const minY = getMapStartY();
            const maxX = getMapEndX();
            const maxY = getMapEndY();
            if (
                !isFinite(minX) || !isFinite(minY) ||
                !isFinite(maxX) || !isFinite(maxY)
            ) {
                return Infinity;
            }
            let exit = Infinity;
            if (dx > 0) exit = (maxX - cell.size - cell.x) / dx;
            else if (dx < 0) exit = (minX + cell.size - cell.x) / dx;
            if (dy > 0) exit = Math.min(exit, (maxY - cell.size - cell.y) / dy);
            else if (dy < 0) exit = Math.min(exit, (minY + cell.size - cell.y) / dy);
            return exit < 0 ? 0 : exit;
        }

        /**
         * Whether a cell has a run left: some heading with a split's worth of
         * map on it that nothing able to eat it can cut off by walking.
         */
        runOpen(view, cell) {
            const mass = massOf(cell);
            for (let i = 0; i < DIRECTIONS; i++) {
                const room = this.roomAlong(cell, DIR_X[i], DIR_Y[i]);
                if (room <= SPLIT_REACH) continue;
                let cut = false;
                for (const threat of view.threats) {
                    if (this.grownFor(threat, cell) < mass * THREAT_RATIO) continue;
                    if (this.cutsOff(threat, cell, DIR_X[i], DIR_Y[i], room)) {
                        cut = true;
                        break;
                    }
                }
                if (!cut) return true;
            }
            return false;
        }

        /**
         * Whether a threat walking flat out can get its mouth over a cell
         * that runs along a heading for that much room.
         *
         * Walked forward a stride at a time: the cell goes down the heading
         * and the threat goes its share of that straight at the cell, which
         * is what a chaser with the pointer on us does. The server eats a
         * cell whose centre is inside the other's radius less a third of its
         * own, so that is the mouth. Caught if the mouth closes before the
         * room or the reach of the run does, and clear as soon as it is
         * behind us and falling back, since a slower chaser never makes that
         * up on a straight run.
         */
        cutsOff(threat, cell, hx, hy, room) {
            const mouth = Math.max(0, threat.size - cell.size / 3);
            const pace = walkSpeed(threat.size) / walkSpeed(cell.size);
            const run = Math.min(room, ESCAPE_REACH);
            let x = cell.x;
            let y = cell.y;
            let tx = threat.x;
            let ty = threat.y;
            for (let s = 0; s <= run; s += CHASE_STRIDE) {
                const dx = x - tx;
                const dy = y - ty;
                const gap = Math.sqrt(dx * dx + dy * dy);
                if (gap <= mouth) return true;
                if (pace < 1 && (dx * hx + dy * hy) / gap > pace) return false;
                x += hx * CHASE_STRIDE;
                y += hy * CHASE_STRIDE;
                tx += (dx / gap) * pace * CHASE_STRIDE;
                ty += (dy / gap) * pace * CHASE_STRIDE;
            }
            return false;
        }

        /** Milliseconds until our pieces can merge again, 0 once they can. */
        mergeIn(view, now) {
            if (view.mine.length < 2) return 0;
            return Math.max(0, this.brokeAt + mergeDelay(view.bigMass) - now);
        }

        /**
         * Somebody worth standing still for.
         *
         * Pieces that are about to merge are bait: a player big enough to take
         * one piece, and small enough that all of them together take him,
         * walks in while we are two cells and finds one. So that threat stops
         * pushing, the pieces gather, and we wait.
         */
        baitTarget(view, now) {
            if (view.mine.length < 2 || !this.aggressive) return null;
            if (this.mergeIn(view, now) > BAIT_WINDOW) return null;

            let best = null;
            let bestDistance = Infinity;
            for (const threat of view.threats) {
                if (threat.id === null) continue;
                if (threat.grown * BAIT_MARGIN > view.total) continue;
                if (threat.grown < view.smallMass * THREAT_RATIO) continue;
                const distance =
                    span(threat.x, threat.y, view.centre.x, view.centre.y);
                if (distance > BAIT_RANGE || distance >= bestDistance) continue;
                best = threat;
                bestDistance = distance;
            }
            if (best && this.drawing) drawCircle(best.x, best.y, best.size + 80, 2);
            return best ? best.id : null;
        }

        /**
         * The best heading, and the picture of why.
         *
         * Run before the tactics rather than inside the steering, because the
         * ring is the bot's account of the tick and a tick a tactic answered
         * is exactly the one worth reading. Drawing it only on the ticks
         * nothing happened leaves the overlay blinking out whenever it does.
         */
        rank(view) {
            const value = this.value;
            let best = 0;
            let bestValue = -Infinity;
            let low = Infinity;
            for (let i = 0; i < DIRECTIONS; i++) {
                value[i] =
                    this.gain[i] + PREY_GAIN * this.preyGain[i] - this.risk[i];
                if (value[i] > bestValue) {
                    bestValue = value[i];
                    best = i;
                }
                if (value[i] < low) low = value[i];
            }

            // Holding a heading through a near tie, so the cell travels
            // instead of shivering between two headings worth the same, and
            // through more than a near tie the further round the turn goes.
            //
            // The margin is a share of how much the compass differs, from
            // the worst heading to the best. On a quiet screen that is the
            // food, and while fleeing it is the mouth behind us, which is
            // what keeps two ways round something at nearly the same price
            // from being taken in turn. The best heading's own value is the
            // wrong yardstick there: the free half of the compass scores
            // about nothing, and a share of nothing holds nothing.
            if (this.heading !== null) {
                let steps = Math.abs(best - this.heading);
                if (steps > DIRECTIONS / 2) steps = DIRECTIONS - steps;
                const turning = (1 - Math.cos(steps * DIR_STEP)) / 2;
                const margin =
                    TURN_MARGIN +
                    (TURN_MARGIN_SHARE + TURN_REVERSAL * turning) *
                        (bestValue - low);
                if (value[this.heading] >= bestValue - margin) best = this.heading;
            }
            this.heading = best;
            if (this.drawing) this.drawValue(view, best);
            return best;
        }

        /** Turns the heading it settled on into somewhere to be. */
        steer(view, pressure) {
            const best = this.heading;
            const chasing = PREY_GAIN * this.preyGain[best] > this.gain[best];
            if (this.baitId !== null) this.state = 'bait';
            else if (pressure > FLEE_PRESSURE) this.state = 'flee';
            else if (chasing) this.state = 'hunt';
            else if (this.repositioning) this.state = 'roam';
            else if (this.gain[best] > 0) this.state = 'feed';
            else this.state = 'roam';

            const stride = this.stride(view, pressure);
            const target = this.commit(view, DIR_X[best], DIR_Y[best]);
            if (!target) {
                this.target = { kind: 'bearing' };
                const clear = this.clearHeading(view, best, stride);
                return this.aim(
                    view, DIR_X[clear.index], DIR_Y[clear.index], clear.reach
                );
            }
            this.target = target;
            if (this.drawing) {
                drawCircle(target.x, target.y, target.size + 12, 2);
            }

            // At the thing, not a fixed distance down the bearing to it. Every
            // cell we own chases the same point, so where that point sits
            // relative to each of them is the whole of the arrangement they
            // end up in: a point pushed out past a pellet has four cells run
            // through it abreast and spread out doing it, and the same point
            // put on the pellet gathers them onto it. The only distance the
            // aim owes anybody is enough to clear our own cells, and that is a
            // question about the direction rather than a number.
            let reach = Math.min(target.distance, stride);
            if (!this.merging(view)) {
                reach = Math.max(reach, this.floor(view, target.ux, target.uy));
            }
            return this.aim(view, target.ux, target.uy, reach);
        }

        /**
         * The one thing along that heading worth arriving at.
         *
         * The scan says which way is worth going, though a bearing is the
         * wrong thing to aim at: two patches either side of one heading
         * average into a direction with nothing on it, and the bot sails
         * between them and eats neither. So the heading picks the cone and the
         * best mouthful inside it picks the point, where best leans hard
         * towards the line: a mouthful off to the side has to be a good deal
         * nearer to be worth the turn, or a patch gets eaten by swinging from
         * one edge of the cone to the other on every pellet.
         *
         * A mouthful is what arriving there swallows, not the one pellet. The
         * heading adds a patch up on its own, since twenty pellets land on
         * the same few headings, and an aim that scored them one at a time
         * had a lone pellet dead ahead beating a patch a little off the line,
         * with the cell walking past the patch to get it.
         *
         * Food inside somebody's reach is not a mouthful. A field alone will
         * steer around a threat and still let the bot graze towards one, which
         * is how it ends up overlapping a cell ten times its size wondering
         * why the escape came too late.
         */
        commit(view, ux, uy) {
            let best = null;
            let bestValue = 0;
            let held = null;
            let heldValue = 0;

            const consider = (id, x, y, size, worth, kind) => {
                const dx = x - view.centre.x;
                const dy = y - view.centre.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 1) return;
                const along = (dx * ux + dy * uy) / distance;
                const keeping = id === this.targetId;
                if (along < (keeping ? COMMIT_KEEP : COMMIT_CONE)) return;
                // The discounts only ever lower it, so the cheap comparison
                // still rules out everything it used to before the rings and
                // the lines are asked about.
                const raw = worth() / (distance + FOOD_SOFT);
                if (!keeping && raw <= bestValue) return;
                const shun = this.shunned(view, x, y);
                if (shun <= 0) return;
                const value = raw * shun * Math.pow(along, COMMIT_LEAN);
                if (!keeping && value <= bestValue) return;
                if (this.crosses(view, x, y)) return;
                const pick = {
                    id, x, y, size, kind, distance,
                    ux: dx / distance, uy: dy / distance,
                };
                if (keeping) {
                    held = pick;
                    heldValue = value;
                }
                if (value > bestValue) {
                    bestValue = value;
                    best = pick;
                }
            };

            const mouthful = this.mouthfuls(view);
            for (const cell of view.food) {
                consider(
                    cell.id, cell.x, cell.y, cell.size, () => mouthful(cell),
                    cell.ejected ? 'ejected mass' : 'pellet'
                );
            }
            // Prey is the thing to aim at only once it is nearly in reach of
            // a split and can actually be caught. Before that the heading
            // leans towards it and the pellets on the way are the point.
            const strike = view.big.size + SPLIT_REACH + STRIKE_MARGIN;
            for (const entry of view.prey) {
                const caught = entry.catch === undefined ? 1 : entry.catch;
                if (caught < 0.5) continue;
                if (span(entry.x, entry.y, view.big.x, view.big.y) > strike) continue;
                consider(
                    entry.id, entry.x, entry.y, entry.size,
                    () => entry.mass * PREY_GAIN * caught, 'prey'
                );
            }

            const pick =
                held && heldValue * COMMIT_SWITCH >= bestValue ? held : best;
            const id = pick ? pick.id : null;
            if (id !== this.targetId) this.targetSince = getLastUpdate();
            this.targetId = id;
            return pick;
        }

        /**
         * What arriving on a pellet swallows: every pellet within the big
         * cell's radius of it, itself included. Bucketed on that radius, so
         * each pellet asks nine buckets rather than every other pellet on the
         * screen.
         */
        mouthfuls(view) {
            const radius = Math.max(view.big.size, 1);
            const buckets = new Map();
            const keyOf = (bx, by) => bx * 65536 + by;
            for (const cell of view.food) {
                const key = keyOf(
                    Math.floor(cell.x / radius), Math.floor(cell.y / radius)
                );
                let bucket = buckets.get(key);
                if (!bucket) buckets.set(key, (bucket = []));
                bucket.push(cell);
            }
            const reach = radius * radius;
            return (cell) => {
                const bx = Math.floor(cell.x / radius);
                const by = Math.floor(cell.y / radius);
                let mass = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const bucket = buckets.get(keyOf(bx + i, by + j));
                        if (!bucket) continue;
                        for (const other of bucket) {
                            const dx = other.x - cell.x;
                            const dy = other.y - cell.y;
                            if (dx * dx + dy * dy <= reach) mass += massOf(other);
                        }
                    }
                }
                return mass;
            };
        }

        /**
         * What a point is worth for standing where it stands, from nothing at
         * all inside somebody's mouth to a discount inside their split range.
         *
         * Reading the split ring as a mouth is what empties the menu. It is
         * 710 wide and every player big enough to matter carries one, so four
         * of them on a screen leaves no pellet anywhere that is not inside
         * one, and a bot with nothing worth arriving at goes back to steering
         * on a bearing and shivering between two of those. Costing it instead
         * says the same thing the field says: worth less, not worthless.
         */
        shunned(view, x, y) {
            let shun = 1;
            for (const zone of view.zones) {
                const dx = x - zone.x;
                const dy = y - zone.y;
                const reach = dx * dx + dy * dy;
                if (reach < zone.r2) return 0;
                if (zone.jump2 && reach < zone.jump2) {
                    shun = Math.min(shun, 1 - (1 - SPLIT_SHUN) * zone.appetite);
                }
            }
            return shun;
        }

        /**
         * Whether any cell of ours would have to go through something to get
         * there.
         *
         * Every cell chases the same point down its own line, and the small
         * ones get there first, since speed falls off with size. So a
         * destination is only as safe as the worst of those lines: aiming past
         * an enemy is how a player with four cells feeds three of them to it
         * while the big one is still on its way.
         */
        crosses(view, x, y) {
            const room = view.mine.length < MAX_CELLS;
            for (const cell of view.mine) {
                const mass = massOf(cell);
                for (const threat of view.threats) {
                    if (this.grownFor(threat, cell) < mass * THREAT_RATIO) continue;
                    const reach = threat.size + cell.size + THREAT_MARGIN;
                    if (this.through(cell, threat, reach, x, y)) return true;
                }
                if (!room || mass <= VIRUS_MASS * EAT_RATIO) continue;
                for (const virus of view.viruses) {
                    const reach = virus.size + cell.size;
                    if (this.through(cell, virus, reach, x, y)) return true;
                }
            }
            return false;
        }

        /**
         * Whether going from a cell to a point takes it inside something it is
         * not inside already.
         *
         * The second half of that is the whole of it. A segment starts where
         * the cell is, so once anything has closed to within its own reach the
         * line to every point on the map passes through it, and a test that
         * only asks how near the line comes answers yes to all of them: no
         * pellet is reachable, no heading is clear, and the one direction that
         * would save us reads exactly like the one that kills us. What is left
         * to ask then is whether the line comes closer to it than we are
         * standing. The whole half of the compass that leaves is clear, and
         * nothing that dips towards it is. Asking only whether the far end is
         * further out lets a line pass through the middle of the thing on
         * its way to a point beyond it, which is chasing prey through the
         * player that eats us.
         */
        through(cell, thing, reach, x, y) {
            const gap = distanceToSegment(
                thing.x, thing.y, cell.x, cell.y, x, y
            );
            if (gap >= reach) return false;
            const now = span(thing.x, thing.y, cell.x, cell.y);
            if (now >= reach) return true;
            return gap < now - 1;
        }

        /**
         * How far ahead to put the destination.
         *
         * Every cell chases the same point, so a near one gathers them and a
         * far one runs them in parallel. Gathering wins whenever something can
         * eat a piece on its own, and the floor keeps the point outside our own
         * cell, since a pointer inside it is a cell standing still.
         */
        stride(view, pressure) {
            const floor = view.big.size + CLEAR_MARGIN;
            // Inside the group rather than ahead of it, and deliberately not
            // held off by the floor. Every cell chases the same spot, so a
            // spot between them is each of them told to go at the other, and
            // two pieces told that meet in the middle instead of running side
            // by side until the timer runs out. Standing still is the job here.
            if (this.merging(view)) return view.spread * MERGE_PULL;
            const gather = pressure > GATHER_PRESSURE || this.state === 'bait';
            if (view.mine.length > 1 && gather) {
                return Math.max(view.spread + view.big.size, floor);
            }
            return Math.max(verticalDistance() * 0.5, floor);
        }

        /**
         * Whether the pieces should be brought together rather than driven.
         *
         * Only once they may actually merge. Before that a destination between
         * them is two cells pressed against each other going nowhere, which is
         * every bit as stopped as it sounds and lasts the whole timer.
         */
        merging(view) {
            return view.mine.length > 1 && this.mergeLeft <= 0;
        }

        /**
         * Closest the destination may sit along a direction, which is past the
         * last of our own cells that way.
         *
         * A pointer inside a cell is a cell that has stopped, and a pointer
         * behind one is a cell told to turn round, so the point has to clear
         * all of them in the direction of travel. How far that is depends on
         * the direction and on how spread out we are, which is why it is
         * measured rather than picked. A fixed number has to cover the worst
         * case, and the worst case is being in eight pieces across half a
         * screen: every destination goes out that far whether or not anything
         * is there, and one cell on its own can never be aimed at anything.
         */
        floor(view, ux, uy) {
            let floor = 0;
            for (const cell of view.mine) {
                const along =
                    (cell.x - view.centre.x) * ux + (cell.y - view.centre.y) * uy;
                const edge = along + cell.size + CLEAR_MARGIN;
                if (edge > floor) floor = edge;
            }
            return floor;
        }

        /**
         * The best heading whose line no piece of ours has to fight through.
         *
         * Falling back to a bearing when nothing is worth arriving at is fine
         * right up until the bearing is the one `commit` just refused. A
         * pointer down it moves every cell we own, and the small fast ones
         * reach whatever is in the way first, which is how a player with four
         * cells feeds three of them to something the big one was only ever
         * going to eat. Headings are tried by value, so this gives up as
         * little as it has to, and it keeps the first one when they all cross,
         * since standing still is not safer than moving.
         */
        clearHeading(view, best, stride) {
            const reach = this.clearReach(view, best, stride);
            if (reach > 0) {
                this.detour = null;
                return { index: best, reach };
            }

            // The way round it is already taking, while that still works.
            //
            // Which headings are clear changes from frame to frame once we are
            // surrounded, so choosing afresh every tick swings the aim across
            // the compass while the cell stands in the middle of it going
            // nowhere. A way round is something to follow until it stops
            // working, and it stops working when it is blocked or when the
            // heading it was going round comes clear again.
            if (this.detour !== null) {
                const held = this.clearReach(view, this.detour, stride);
                if (held > 0) return { index: this.detour, reach: held };
            }

            // A new one gives up as little of the direction as it has to.
            // Sorting the whole compass by value instead hands back a heading
            // pointing anywhere at all, and going round something is an angle
            // rather than a score.
            //
            // Which way round is settled by the scan, or by the way it was
            // already going if it was going one way. Losing a detour on the
            // left and picking one up on the right is the same swing this is
            // here to stop, taken one blocked frame at a time.
            const value = this.value;
            const side = this.sideOf(best);
            for (let step = 1; step <= DIRECTIONS / 2; step++) {
                const up = (best + step) % DIRECTIONS;
                const down = (best - step + DIRECTIONS) % DIRECTIONS;
                let first = value[down] > value[up] ? down : up;
                if (side < 0) first = down;
                else if (side > 0) first = up;
                const second = first === up ? down : up;
                for (const i of [first, second]) {
                    const got = this.clearReach(view, i, stride);
                    if (got <= 0) continue;
                    this.detour = i;
                    return { index: i, reach: got };
                }
            }
            return { index: best, reach: stride };
        }

        /**
         * How far down a heading we can go before a piece of ours would have
         * to swim through something, either the whole stride or a step.
         *
         * A bearing whose far end sits in a mouth is not a bearing to turn
         * around from. Most of it is open, and the destination is what says
         * how much of it we take: turning instead is how a bot with food ahead
         * of it and a big player beyond the food spends the game facing the
         * other way, and how it swaps ends every time the far point crosses
         * and clears again.
         */
        /** Which way round the detour it is holding goes, 0 for none. */
        sideOf(best) {
            if (this.detour === null) return 0;
            let step = this.detour - best;
            if (step > DIRECTIONS / 2) step -= DIRECTIONS;
            else if (step < -DIRECTIONS / 2) step += DIRECTIONS;
            return step > 0 ? 1 : step < 0 ? -1 : 0;
        }

        clearReach(view, index, stride) {
            const far = this.point(view, DIR_X[index], DIR_Y[index], stride);
            if (!this.crosses(view, far[0], far[1])) return stride;
            const floor = this.floor(view, DIR_X[index], DIR_Y[index]);
            if (floor >= stride) return 0;
            const near = this.point(view, DIR_X[index], DIR_Y[index], floor);
            if (!this.crosses(view, near[0], near[1])) return floor;
            return 0;
        }

        /** Where a heading puts the destination, and draws the line. */
        aim(view, ux, uy, distance) {
            const at = this.point(view, ux, uy, distance);
            if (this.drawing) drawLine(view.centre.x, view.centre.y, at[0], at[1], 2);
            return at;
        }

        /**
         * The same point, without the drawing, for anything weighing one.
         *
         * Kept inside the map two different ways, depending on where the wall
         * is. With the wall still ahead the point stops at it and the cell
         * walks up to it, since a pellet lying against the edge is still a
         * pellet. With the wall already at our edge a point on it is a point
         * beside the cell, or behind it in a corner, and a pointer inside your
         * own cell is a cell that has stopped. So there the heading keeps
         * whatever part of it runs along the wall, at full stride, and a
         * heading straight into the wall keeps going the way it last slid
         * rather than reading a direction off the noise in a component that
         * is nearly nothing.
         */
        point(view, ux, uy, distance) {
            const minX = getMapStartX();
            const maxX = getMapEndX();
            const minY = getMapStartY();
            const maxY = getMapEndY();
            let x = view.centre.x + ux * distance;
            let y = view.centre.y + uy * distance;

            const known =
                isFinite(minX) && isFinite(maxX) &&
                isFinite(minY) && isFinite(maxY);
            if (known) {
                const low = MAP_MARGIN;
                const cell = view.big;
                const touch = cell.size + WALL_TOUCH;
                const blockX =
                    (x < minX + low && cell.x - minX < touch) ||
                    (x > maxX - low && maxX - cell.x < touch);
                const blockY =
                    (y < minY + low && cell.y - minY < touch) ||
                    (y > maxY - low && maxY - cell.y < touch);
                if (blockX && !blockY) {
                    if (Math.abs(uy) >= SLIDE_LEAN) this.slideY = uy < 0 ? -1 : 1;
                    x = view.centre.x;
                    y = view.centre.y + this.slideY * distance;
                } else if (blockY && !blockX) {
                    if (Math.abs(ux) >= SLIDE_LEAN) this.slideX = ux < 0 ? -1 : 1;
                    x = view.centre.x + this.slideX * distance;
                    y = view.centre.y;
                }
                x = Math.min(Math.max(x, minX + low), maxX - low);
                y = Math.min(Math.max(y, minY + low), maxY - low);
            }

            return [x, y];
        }

        drawValue(view, best) {
            let low = Infinity;
            let high = -Infinity;
            for (let i = 0; i < DIRECTIONS; i++) {
                if (this.value[i] < low) low = this.value[i];
                if (this.value[i] > high) high = this.value[i];
            }
            const range = high - low || 1;
            const base = view.big.size + 40;
            for (let i = 0; i < DIRECTIONS; i++) {
                const length = base + 300 * ((this.value[i] - low) / range);
                drawPoint(
                    view.centre.x + DIR_X[i] * length,
                    view.centre.y + DIR_Y[i] * length,
                    i === best ? 1 : 7,
                    ''
                );
            }
        }

        // --------------------------------------------------------- the splits

        /**
         * Splitting onto prey doubles our reach for a second and halves what
         * either piece can survive, so it wants a target we beat twice over,
         * room to land, and nobody nearby who eats halves.
         */
        planSplit(view, now, pressure) {
            if (!this.aggressive) return null;
            if (pressure > AGGRO_PRESSURE) return null;
            if (now - this.splitAt < SPLIT_COOLDOWN) return null;
            if (view.mine.length > SPLIT_MAX_CELLS) return null;

            const cell = view.big;
            const mass = view.bigMass;
            if (mass < SPLIT_MIN_MASS * 2) return null;

            // How far a half can actually eat something. The throw carries its
            // centre 710 from ours and its mouth reaches its own radius past
            // that, so the reach grows with the half rather than with the cell
            // that threw it. Measuring it off our own size instead reads a big
            // cell as able to throw a hundred units further than it can, which
            // is a split that lands just short of a meal and pays for it in
            // half the mass and a merge timer.
            const half = sizeOf(mass / 2);
            const range = half + SPLIT_REACH * SPLIT_TRUST;
            const ours = this.ourSpeed(view);
            let best = null;
            let bestScore = 0;
            for (const entry of view.prey) {
                if (mass / 2 < entry.grown * SPLIT_KILL_RATIO) continue;
                const target = this.lead(entry, cell);
                const distance = span(target.x, target.y, cell.x, cell.y);
                if (distance > range) continue;
                // Something standing still a step away can be walked onto,
                // which keeps the mass in one piece and the merge timer at
                // zero. Further off than a step, a split is there first.
                if (ours > 0 &&
                    this.speedOf(entry.id) < ours * SPLIT_CHASE &&
                    distance - cell.size < ours * SPLIT_WALK) {
                    continue;
                }
                // Aiming at it moves every cell we own at it, and the small
                // ones get there first. Something the big cell eats for lunch
                // can still be waiting for those.
                if (this.crosses(view, target.x, target.y)) continue;
                if (!this.splitIsSafe(view, cell, target)) continue;
                const haul = this.haul(view, entry, target, half, mass);
                if (haul < mass * SPLIT_WORTH) continue;
                const score = haul / (distance + 200);
                if (score > bestScore) {
                    bestScore = score;
                    best = target;
                }
            }
            if (!best) return null;

            const dx = best.x - cell.x;
            const dy = best.y - cell.y;
            const length = Math.sqrt(dx * dx + dy * dy) || 1;
            const aimX = getPointX() - cell.x;
            const aimY = getPointY() - cell.y;
            const aimLength = Math.sqrt(aimX * aimX + aimY * aimY) || 1;
            const aligned =
                (dx * aimX + dy * aimY) / (length * aimLength) > SPLIT_ALIGN;

            if (this.drawing) {
                drawCircle(best.x, best.y, 60, 2);
                drawLine(cell.x, cell.y, best.x, best.y, 2);
            }

            if (aligned) {
                split();
                this.splitAt = now;
                this.state = 'split';
            } else {
                this.state = 'hunt';
            }
            // Past the target, so the pieces carry through it rather than
            // pulling up on top of it.
            return [cell.x + (dx / length) * range, cell.y + (dy / length) * range];
        }

        /**
         * What a half landing on this one would eat: it, and every other
         * piece a half beats whose centre is inside the half where it lands.
         * A player broken into eight is eight crumbs that are not worth a
         * split each and one meal that is.
         */
        haul(view, entry, target, half, mass) {
            let total = entry.mass;
            for (const other of view.prey) {
                if (other === entry) continue;
                if (mass / 2 < other.grown * SPLIT_KILL_RATIO) continue;
                if (span(other.x, other.y, target.x, target.y) < half) {
                    total += other.mass;
                }
            }
            return total;
        }

        /** Where a target will be by the time a split gets there. */
        lead(entry, cell) {
            if (!entry.vx && !entry.vy) {
                return { x: entry.x, y: entry.y, mass: entry.mass };
            }
            const distance = span(entry.x, entry.y, cell.x, cell.y);
            // A split covers its 710 in about a second, so lead by the share of
            // that second the target is away.
            const ahead = Math.min(1000, (distance / SPLIT_REACH) * 1000);
            return {
                x: entry.x + (entry.vx || 0) * ahead,
                y: entry.y + (entry.vy || 0) * ahead,
                mass: entry.mass,
            };
        }

        /**
         * Whether both halves survive it: nothing that eats a half within reach
         * of where one lands or where the other stays, and no virus in the
         * flight path to break the flying one up.
         */
        splitIsSafe(view, cell, target) {
            const half = massOf(cell) / 2;
            for (const enemy of view.enemies) {
                if (enemy.grown < half * THREAT_RATIO) continue;
                const splits = enemy.grown > half * SPLIT_THREAT_RATIO;
                const reach = enemy.size + cell.size + THREAT_MARGIN +
                    SPLIT_CAUTION + (splits ? SPLIT_REACH : 0);
                const landing = span(enemy.x, enemy.y, target.x, target.y);
                const behind = span(enemy.x, enemy.y, cell.x, cell.y);
                if (landing < reach || behind < reach) return false;
            }
            if (half > VIRUS_MASS * EAT_RATIO) {
                const dx = target.x - cell.x;
                const dy = target.y - cell.y;
                const length = Math.sqrt(dx * dx + dy * dy) || 1;
                const reach = cell.size + SPLIT_REACH;
                const endX = cell.x + (dx / length) * reach;
                const endY = cell.y + (dy / length) * reach;
                for (const virus of view.viruses) {
                    const gap = distanceToSegment(
                        virus.x, virus.y, cell.x, cell.y, endX, endY
                    );
                    if (gap < virus.size + sizeOf(half) * 0.5) return false;
                }
            }
            return true;
        }

        // ----------------------------------------------------- the virus shot

        /**
         * Feeding a virus.
         *
         * Eight pellets into a virus fires it along the line they came in on,
         * and a player it lands on comes apart. It is the one thing that
         * touches somebody too big to fight, and it costs the mass of the
         * pellets whether or not it connects, so the setup has to be straight
         * and the target has to be worth it.
         */
        planPop(view, now) {
            // One cell only. Every press ejects from every cell we own, so in
            // three cells a shot costs three times what it costs in one, and
            // the pellets the other two throw go wherever they were standing
            // when they threw them, which on a bad day is into the same virus
            // and fires it back through us.
            if (!this.aggressive || view.mine.length > 1) {
                this.feeding = null;
                this.staging = null;
                return null;
            }
            if (this.feeding) {
                const held = this.holdPop(view, now);
                if (held) return held;
                this.feeding = null;
            }
            // A walk already under way holds through the same contact a feed
            // does, and whoever it was for is rested when it drops, since a
            // walk that stops at the line and starts again at the next scan
            // is a cell going back and forth beside a virus.
            const limit = this.staging ? POP_CONTACT_HOLD : POP_CONTACT;
            if (
                this.contact > limit ||
                view.total < POP_MIN_MASS + VIRUS_FEED * EJECT_COST ||
                view.bigMass < SPLIT_MIN_MASS * 2
            ) {
                this.restStage(now);
                return null;
            }

            // Already on the way round one.
            if (this.staging) {
                const walk = this.holdStation(view, now);
                if (walk) return walk;
                this.restStage(now);
            }

            // Every virus against every player, which is not worth doing on
            // every frame of a 60fps loop for a setup that turns up once a
            // minute.
            if (now - this.popScan < POP_SCAN) return null;
            this.popScan = now;

            const setup = this.findPop(view, now);
            if (setup) {
                this.feeding = {
                    virus: setup.virus.id,
                    enemy: setup.enemy.id,
                    fed: this.fedInto(setup.virus.id, now),
                    last: 0,
                    since: now,
                };
                return this.holdPop(view, now);
            }

            const station = this.findStation(view, now);
            if (!station) return null;
            this.staging = {
                virus: station.virus.id,
                enemy: station.enemy.id,
                since: now,
            };
            const walk = this.holdStation(view, now);
            if (walk) return walk;
            this.restStage(now);
            return null;
        }

        /**
         * Gives up the walk round a virus, and leaves whoever it was for alone
         * for a while. A walk that made its line is already a feed by the time
         * this is asked, and that one is dropped on its own terms.
         */
        restStage(now) {
            if (this.staging) {
                this.stageRest.set(this.staging.enemy, now + POP_STAGE_REST);
            }
            this.staging = null;
            this.feeding = null;
        }

        /**
         * Somebody worth a virus: big enough for one to break, and not
         * something a split of ours would simply eat.
         */
        popWorthy(view, enemy, now) {
            if (enemy.id === null || enemy.mass < POP_MIN_ENEMY) return false;
            if (view.bigMass / 2 >= enemy.grown * SPLIT_KILL_RATIO) return false;
            const rest = this.stageRest.get(enemy.id);
            if (rest === undefined) return true;
            if (now < rest) return false;
            this.stageRest.delete(enemy.id);
            return true;
        }

        /**
         * Walking round a virus until it stands between us and somebody too
         * big to fight.
         *
         * The aim steps along the ring around the virus towards the far side
         * rather than going straight at it. The straight line to the far side
         * runs through the virus, and every cell we own takes that line, so
         * aiming across it is asking to be broken into eight pieces in front
         * of the player we were setting the shot up for.
         */
        holdStation(view, now) {
            const staging = this.staging;
            if (now - staging.since > POP_STAGE_TIMEOUT) return null;

            const virus = view.viruses.find((cell) => cell.id === staging.virus);
            const enemy = view.enemies.find((entry) => entry.id === staging.enemy);
            if (!virus || !enemy) return null;

            const cell = view.big;
            if (this.popLine(cell, virus, enemy)) {
                // Made. From here it is an ordinary feed.
                this.feeding = {
                    virus: virus.id, enemy: enemy.id,
                    fed: this.fedInto(virus.id, now), last: 0, since: now,
                };
                this.staging = null;
                return this.holdPop(view, now);
            }

            if (span(virus.x, virus.y, enemy.x, enemy.y) > POP_RANGE) return null;
            const stand = cell.size + virus.size + POP_STANDOFF;
            if (stand > EJECT_REACH) return null;

            const here = Math.atan2(cell.y - virus.y, cell.x - virus.x);
            const want = Math.atan2(virus.y - enemy.y, virus.x - enemy.x);
            let turn = want - here;
            while (turn > Math.PI) turn -= Math.PI * 2;
            while (turn < -Math.PI) turn += Math.PI * 2;
            if (turn > POP_ARC) turn = POP_ARC;
            else if (turn < -POP_ARC) turn = -POP_ARC;

            // A shorter step when the long one would take a piece of ours
            // through something, since giving up the whole setup over one
            // crowded frame is how a plan that takes seconds never finishes.
            for (const share of [1, 0.5, 0.25]) {
                const angle = here + turn * share;
                const x = virus.x + Math.cos(angle) * stand;
                const y = virus.y + Math.sin(angle) * stand;
                if (this.shunned(view, x, y) <= 0) continue;
                if (this.crosses(view, x, y)) continue;
                this.state = 'stage';
                if (this.drawing) {
                    drawCircle(virus.x, virus.y, virus.size + 30, 4);
                    drawLine(virus.x, virus.y, enemy.x, enemy.y, 4);
                    drawPoint(x, y, 4, '');
                }
                return [x, y];
            }
            return null;
        }

        /**
         * A virus with somebody worth firing it at behind it, near enough to
         * be worth walking round.
         *
         * Anybody a virus would break and a split of ours would not simply
         * eat. Against somebody bigger the shot is what we have instead of a
         * fight, and against somebody our own size it is sixteen pieces where
         * there was one player, most of them lunch.
         */
        findStation(view, now) {
            const cell = view.big;
            let best = null;
            let bestScore = 0;
            for (const virus of view.viruses) {
                const walk = span(virus.x, virus.y, cell.x, cell.y);
                if (walk > POP_WALK) continue;
                if (cell.size + virus.size + POP_STANDOFF > EJECT_REACH) continue;
                if (this.dud(virus, now)) continue;
                for (const enemy of view.enemies) {
                    if (!this.popWorthy(view, enemy, now)) continue;
                    const toEnemy = span(virus.x, virus.y, enemy.x, enemy.y);
                    if (toEnemy > POP_RANGE || toEnemy < enemy.size) continue;
                    const score = enemy.mass / (walk + toEnemy + 400);
                    if (score > bestScore) {
                        bestScore = score;
                        best = { virus, enemy };
                    }
                }
            }
            return best;
        }

        /**
         * Sitting in a virus.
         *
         * One we are too small to pop is cover, and the middle of it is the
         * best part: whoever is chasing us is bigger than it, so following us
         * in costs them the game. The field already leans this way, and
         * leaning is not arriving. A cell parked beside a virus is a cell
         * that is merely near one.
         */
        /**
         * Standing on a virus that fits underneath us.
         *
         * Between covering a virus and coming apart on it there is a band
         * about 25 mass wide: wide enough to hide it and still too small for
         * it to break us. A cell sitting in that band looks like a free meal
         * with nothing under it, and anything big enough to want the meal is
         * big enough to come apart on what is under it.
         *
         * Being eaten along with it is not the plan. We stand while they close
         * and step round to the far side once they are committed, which puts
         * the virus between us and leaves us standing next to whatever it
         * makes of them.
         */
        planLure(view, now) {
            if (!this.aggressive || view.mine.length !== 1 ||
                now < this.lureRest) {
                this.luring = null;
                return null;
            }

            const cell = view.big;
            const fits = (virus) =>
                cell.size >= virus.size &&
                view.bigMass <= massOf(virus) * EAT_RATIO;

            let virus = null;
            if (this.luring) {
                if (now - this.luring.since > LURE_TIMEOUT) {
                    // Nobody took it. Resting rather than simply dropping it,
                    // since the same virus is still the nearest one and this
                    // would otherwise start again on the next tick and stand
                    // there for the rest of the game.
                    this.lureRest = now + LURE_REST;
                    this.luring = null;
                } else {
                    virus = view.viruses.find((v) => v.id === this.luring.virus);
                    if (!virus) this.luring = null;
                }
            }
            if (!virus) virus = this.nearestVirus(view, LURE_WALK, fits);
            if (!virus || !fits(virus)) {
                this.luring = null;
                return null;
            }

            // Somebody worth standing still for: big enough to want us, and
            // big enough to come apart on what we are standing on.
            const bite = massOf(virus) * EAT_RATIO;
            let mark = null;
            let closest = LURE_RANGE;
            for (const threat of view.threats) {
                if (threat.mass <= bite) continue;
                if (this.closingOn(threat, cell) < LURE_CLOSING) continue;
                const gap =
                    span(threat.x, threat.y, cell.x, cell.y) -
                    threat.size - cell.size;
                if (gap >= closest) continue;
                mark = threat;
                closest = gap;
            }
            if (!mark) {
                this.luring = null;
                return null;
            }

            if (!this.luring) this.luring = { virus: virus.id, since: now };
            this.state = 'lure';
            if (this.drawing) {
                drawCircle(virus.x, virus.y, virus.size, 2);
                drawLine(mark.x, mark.y, virus.x, virus.y, 2);
            }

            if (closest < LURE_BAIL) {
                const dx = virus.x - mark.x;
                const dy = virus.y - mark.y;
                const away = Math.sqrt(dx * dx + dy * dy) || 1;
                const step = virus.size + cell.size + LURE_CLEAR;
                return [
                    virus.x + (dx / away) * step,
                    virus.y + (dy / away) * step,
                ];
            }
            return [virus.x, virus.y];
        }

        planHide(view) {
            if (view.bigMass > VIRUS_MASS * EAT_RATIO) return null;
            if (!this.beingChased) return null;
            // Every one of them, not merely one of them. A virus stops what is
            // too big for it and nothing else, so parking in one while
            // something small enough to follow us in is after us is standing
            // still in front of the one thing the cover does not cover.
            for (const threat of view.threats) {
                for (const cell of view.mine) {
                    if (this.grownFor(threat, cell) < massOf(cell) * THREAT_RATIO) {
                        continue;
                    }
                    if (threat.mass <= VIRUS_MASS * EAT_RATIO) return null;
                }
            }

            const best = this.nearestVirus(view, HIDE_RANGE);
            if (!best) return null;

            this.state = 'hide';
            if (this.drawing) drawCircle(best.x, best.y, best.size, 4);
            return [best.x, best.y];
        }

        /**
         * Pouring the pieces into the biggest one.
         *
         * The pointer goes on the big cell and every press throws from every
         * piece at it. The pieces walk in on the same pointer, so a pour
         * gathers as it goes. It is for one thing: a big cell that is one
         * pour short of a split on somebody, or of outweighing somebody it
         * could not eat, and it only runs while nothing is pressing, since
         * the whole player stands on one spot to do it.
         */
        planPour(view, now, pressure) {
            if (!this.aggressive || view.mine.length < 3 ||
                this.mergeLeft < POUR_MERGE_FAR || now < this.pourRest ||
                pressure > POUR_PRESSURE || this.contact > 0) {
                this.pouring = null;
                return null;
            }
            const big = view.big;
            let pour = 0;
            for (const cell of view.mine) {
                if (cell.id === big.id) continue;
                const mass = massOf(cell);
                if (mass <= POUR_KEEP) continue;
                const gap = span(cell.x, cell.y, big.x, big.y) - cell.size - big.size;
                if (gap > POUR_REACH) continue;
                pour += (mass - POUR_KEEP) * FEED_SHARE;
            }
            if (pour < view.bigMass * POUR_WORTH) {
                this.pouring = null;
                return null;
            }

            const purpose = this.pourFor(view, view.bigMass + pour);
            if (!purpose) {
                this.pouring = null;
                return null;
            }

            if (!this.pouring) this.pouring = { since: now, last: 0 };
            if (now - this.pouring.since > POUR_TIMEOUT) {
                this.pouring = null;
                this.pourRest = now + POUR_REST;
                return null;
            }
            // The pellets go wherever the pointer is, so nothing is thrown
            // until it is already on the big cell.
            const onBig =
                span(getPointX(), getPointY(), big.x, big.y) < big.size;
            if (onBig && now - this.pouring.last >= EJECT_INTERVAL) {
                shoot();
                this.pouring.last = now;
            }
            this.state = 'pour';
            if (this.drawing) {
                drawCircle(big.x, big.y, big.size + 20, 2);
                drawLine(big.x, big.y, purpose.x, purpose.y, 2);
            }
            return [big.x, big.y];
        }

        /**
         * Somebody the big cell could take once it had the pour, and could
         * not take now: prey a half would then beat, or a player it would
         * then outweigh. Nobody, and the pour is mass thrown away for nothing.
         */
        pourFor(view, poured) {
            let best = null;
            let closest = PREY_REACH;
            for (const entry of view.enemies) {
                const distance = span(entry.x, entry.y, view.big.x, view.big.y);
                if (distance >= closest) continue;
                const splitNow = view.bigMass / 2 >= entry.grown * SPLIT_KILL_RATIO;
                const splitThen = poured / 2 >= entry.grown * SPLIT_KILL_RATIO;
                const eatNow = view.bigMass >= entry.grown * PREY_RATIO;
                const eatThen = poured >= entry.grown * PREY_RATIO;
                if ((splitThen && !splitNow) || (eatThen && !eatNow)) {
                    best = entry;
                    closest = distance;
                }
            }
            return best;
        }

        /** The nearest virus no cell of ours has to swim through anything for. */
        nearestVirus(view, range, ok) {
            const cell = view.big;
            let best = null;
            let bestDistance = range;
            for (const virus of view.viruses) {
                const distance = span(virus.x, virus.y, cell.x, cell.y);
                if (distance >= bestDistance) continue;
                if (ok && !ok(virus)) continue;
                if (this.crosses(view, virus.x, virus.y)) continue;
                best = virus;
                bestDistance = distance;
            }
            return best;
        }

        /**
         * Whether something that could eat us is coming for us, rather than
         * merely being big and standing about.
         *
         * Being inside somebody's split range says nothing about what they
         * mean by it, and on a small cell almost everybody's split range
         * covers us almost all of the time. Read that as being hunted and the
         * bot spends the game in a virus, which is safe and is also how a
         * 60 mass cell is still a 60 mass cell a minute later. What tells a
         * chase from a crowd is that the gap is closing.
         *
         * Held briefly once it is true, since a chaser that pulls up outside
         * and waits stops closing, and leaving cover because the thing outside
         * it stopped walking is how the cover gets you killed.
         */
        chased(view, now) {
            const ours = this.ourSpeed(view);
            const pursuit = this.pursuit;
            const seen = new Set();
            let chased = false;

            for (const threat of view.threats) {
                if (threat.id === null) continue;
                let closing = false;
                for (const cell of view.mine) {
                    const mass = massOf(cell);
                    if (this.grownFor(threat, cell) < mass * THREAT_RATIO) continue;
                    if (this.covered(view, cell, threat)) continue;
                    const gap =
                        span(threat.x, threat.y, cell.x, cell.y) -
                        threat.size - cell.size;
                    if (gap > HUNT_RANGE) continue;
                    if (ours > 0 &&
                        this.closingOn(threat, cell) > ours * HUNT_CLOSING) {
                        closing = true;
                        break;
                    }
                }
                if (!closing) continue;
                seen.add(threat.id);
                // How long it has been coming, not whether it is coming this
                // frame. Everything on a busy screen is moving, and a third of
                // everything is moving roughly at us at any moment, so one
                // frame of it is a reading of the crowd rather than of anybody
                // in particular.
                let since = pursuit.get(threat.id);
                if (since === undefined) pursuit.set(threat.id, (since = now));
                if (now - since >= HUNT_SUSTAIN) chased = true;
            }
            for (const id of pursuit.keys()) {
                if (!seen.has(id)) pursuit.delete(id);
            }

            if (chased) this.huntedAt = now;
            // A chaser that pulls up outside cover and waits stops closing,
            // and leaving cover because the thing outside it stopped walking
            // is how the cover gets you killed.
            return chased ||
                (this.huntedAt > 0 && now - this.huntedAt < HIDE_HOLD &&
                    this.nearThreat(view, HUNT_RANGE));
        }

        /** Whether anything that could eat us is still within a range of us. */
        nearThreat(view, range) {
            for (const threat of view.threats) {
                for (const cell of view.mine) {
                    const mass = massOf(cell);
                    if (this.grownFor(threat, cell) < mass * THREAT_RATIO) continue;
                    const gap =
                        span(threat.x, threat.y, cell.x, cell.y) -
                        threat.size - cell.size;
                    if (gap <= range) return true;
                }
            }
            return false;
        }

        /** Keeps feeding while the line holds, and gives up when it does not. */
        holdPop(view, now) {
            const feeding = this.feeding;
            if (now - feeding.since > POP_TIMEOUT) return null;
            if (feeding.fed >= VIRUS_FEED) return null;
            if (this.contact > POP_CONTACT_HOLD) return null;
            if (view.total < POP_MIN_MASS) return null;

            const virus = view.viruses.find((cell) => cell.id === feeding.virus);
            const enemy = view.enemies.find((entry) => entry.id === feeding.enemy);
            if (!virus || !enemy) return null;

            const cell = view.big;
            const line = this.popLine(cell, virus, enemy);
            if (!line) return null;

            // A pellet goes wherever the pointer is, and on the tick a feed
            // starts the pointer is wherever the walk left it, which after
            // backing off the virus is straight away from it. So no press
            // until the aim is on the line.
            const aimX = getPointX() - cell.x;
            const aimY = getPointY() - cell.y;
            const aimLength = Math.sqrt(aimX * aimX + aimY * aimY) || 1;
            const aimed =
                (aimX * line.ux + aimY * line.uy) / aimLength >= POP_ALIGN;
            if (aimed && now - feeding.last >= EJECT_INTERVAL) {
                shoot();
                feeding.fed++;
                feeding.last = now;
                this.fedViruses.set(virus.id, { fed: feeding.fed, at: now });
            }
            this.state = 'pop';

            if (this.drawing) {
                drawLine(cell.x, cell.y, virus.x, virus.y, 4);
                drawLine(virus.x, virus.y, enemy.x, enemy.y, 4);
                drawCircle(virus.x, virus.y, virus.size + 30, 4);
            }

            // Just outside our own cell, so the pellets go the right way while
            // the cell itself stays where it is.
            const hold = cell.size * 0.9;
            return [cell.x + line.ux * hold, cell.y + line.uy * hold];
        }

        /**
         * What a virus has had from us lately, which is where a feed on it
         * carries on from. Nothing once the memory has lapsed.
         */
        fedInto(virusId, now) {
            const entry = this.fedViruses.get(virusId);
            if (!entry) return 0;
            if (now - entry.at > FEED_MEMORY) {
                this.fedViruses.delete(virusId);
                return 0;
            }
            return entry.fed;
        }

        /** A virus that has had the full feed and is still there will not fire. */
        dud(virus, now) {
            return this.fedInto(virus.id, now) >= VIRUS_FEED;
        }

        /** The straightest us-virus-enemy line on the screen, if there is one. */
        findPop(view, now) {
            const cell = view.big;
            let best = null;
            let bestAlign = POP_ALIGN;
            for (const virus of view.viruses) {
                if (this.dud(virus, now)) continue;
                for (const enemy of view.enemies) {
                    if (!this.popWorthy(view, enemy, now)) continue;
                    const line = this.popLine(cell, virus, enemy);
                    if (!line || line.align <= bestAlign) continue;
                    bestAlign = line.align;
                    best = { virus, enemy };
                }
            }
            return best;
        }

        /** Whether we can put a pellet in that virus and it in that player. */
        popLine(cell, virus, enemy) {
            const dvx = virus.x - cell.x;
            const dvy = virus.y - cell.y;
            const toVirus = Math.sqrt(dvx * dvx + dvy * dvy) || 1;
            if (toVirus > EJECT_REACH) return null;
            if (toVirus < cell.size + virus.size + 40) return null;

            const dex = enemy.x - virus.x;
            const dey = enemy.y - virus.y;
            const toEnemy = Math.sqrt(dex * dex + dey * dey) || 1;
            if (toEnemy > POP_RANGE) return null;

            // Far enough off that they cannot simply walk into us while we
            // stand there feeding. Their split range reaches most of this, so
            // it is the pressure gate above that calls that off, not this.
            const gap = span(enemy.x, enemy.y, cell.x, cell.y);
            if (gap < enemy.size + cell.size + 300) return null;

            const ux = dvx / toVirus;
            const uy = dvy / toVirus;
            const align = ux * (dex / toEnemy) + uy * (dey / toEnemy);
            if (align < POP_ALIGN) return null;
            return { ux, uy, align };
        }
    }

    return new AposBot();
};

};

__modules[10] = function (module, exports, require) {
'use strict';

/**
 * Codec for the classic Agar.io protocol (versions 4-18), spoken by
 * Ogar-family servers. All multi-byte values are little endian.
 */

const { DesyncError } = require(12);

const CLIENT = {
    SPAWN: 0,
    SPECTATE: 1,
    MOUSE: 16,
    SPLIT: 17,
    EJECT: 21,
    PROTOCOL_VERSION: 254,
    CLIENT_KEY: 255,
};

const SERVER = {
    UPDATE_NODES: 16,
    UPDATE_POSITION: 17,
    CLEAR_ALL: 18,
    CLEAR_OWNED: 20,
    ADD_OWNED_CELL: 32,
    LEADERBOARD_FFA: 49,
    LEADERBOARD_TEAMS: 50,
    SET_BORDER: 64,
};

/** Cell flag bits in an UPDATE_NODES record. */
/**
 * From this version on, the extra byte that follows a cell's flags is a second
 * set of flags. Observed on agar.io at protocol 23; Ogar-family servers stop
 * at 18, where that byte means something else and is skipped.
 */
const EXTENDED_FLAGS_FROM = 19;

/** Bits in that second byte. */
const EXTENDED_FLAG = {
    /**
     * The record ends with the uint32 id of the player the cell belongs to,
     * after the skin and the name. It is how a split player's cells are
     * grouped, and it appears on cells with no name of their own.
     */
    PLAYER_ID: 0x04,
};

const FLAG = {
    VIRUS: 0x01,
    COLOR_PRESENT: 0x02,
    SKIN_PRESENT: 0x04,
    NAME_PRESENT: 0x08,
    AGITATED: 0x10,
    EJECTED: 0x20,
    FOOD: 0x80,
};

/**
 * Sequential little-endian reader over a DataView.
 * Works in Node and in the browser without modification.
 *
 * Running off the end means the record layout is not what this file expects,
 * so it raises a DesyncError carrying a hex window around the byte that
 * failed, rather than the RangeError a DataView would raise on its own.
 */
class Reader {
    constructor(buffer) {
        this.view = new DataView(
            buffer.buffer || buffer,
            buffer.byteOffset || 0,
            buffer.byteLength
        );
        this.offset = 0;
    }
    get remaining() {
        return this.view.byteLength - this.offset;
    }
    /** Refuses to read past the end, and says where it stopped. */
    need(count) {
        if (this.offset + count > this.view.byteLength) {
            throw new DesyncError(
                'the frame ends ' +
                    (this.offset + count - this.view.byteLength) +
                    ' bytes short of the next field',
                this.view,
                this.offset
            );
        }
    }
    uint8() {
        this.need(1);
        return this.view.getUint8(this.offset++);
    }
    int16() {
        this.need(2);
        const v = this.view.getInt16(this.offset, true);
        this.offset += 2;
        return v;
    }
    uint16() {
        this.need(2);
        const v = this.view.getUint16(this.offset, true);
        this.offset += 2;
        return v;
    }
    int32() {
        this.need(4);
        const v = this.view.getInt32(this.offset, true);
        this.offset += 4;
        return v;
    }
    uint32() {
        this.need(4);
        const v = this.view.getUint32(this.offset, true);
        this.offset += 4;
        return v;
    }
    float32() {
        this.need(4);
        const v = this.view.getFloat32(this.offset, true);
        this.offset += 4;
        return v;
    }
    float64() {
        this.need(8);
        const v = this.view.getFloat64(this.offset, true);
        this.offset += 8;
        return v;
    }
    /** Zero-terminated UTF-8 string (protocol >= 6). */
    stringUtf8() {
        const bytes = [];
        for (;;) {
            const c = this.uint8();
            if (c === 0) break;
            bytes.push(c);
        }
        return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
    }
    /** Zero-terminated UTF-16 string (protocol < 6). */
    stringUnicode() {
        let s = '';
        for (;;) {
            const c = this.uint16();
            if (c === 0) break;
            s += String.fromCharCode(c);
        }
        return s;
    }
}

/** Builds a packet of a fixed byte length. */
function packet(length) {
    return new DataView(new ArrayBuffer(length));
}

const encode = {
    /** Announce which protocol revision we speak. Must be sent first. */
    protocolVersion(version) {
        const p = packet(5);
        p.setUint8(0, CLIENT.PROTOCOL_VERSION);
        p.setUint32(1, version, true);
        return p.buffer;
    },
    /** Ogar-family servers require this to be 0 above protocol 6. */
    clientKey(key) {
        const p = packet(5);
        p.setUint8(0, CLIENT.CLIENT_KEY);
        p.setUint32(1, key >>> 0, true);
        return p.buffer;
    },
    /** Spawn with a nickname. */
    spawn(name, protocolVersion) {
        if (protocolVersion >= 6) {
            const bytes = new TextEncoder().encode(name);
            const p = packet(2 + bytes.length);
            p.setUint8(0, CLIENT.SPAWN);
            for (let i = 0; i < bytes.length; i++) p.setUint8(1 + i, bytes[i]);
            p.setUint8(1 + bytes.length, 0);
            return p.buffer;
        }
        const p = packet(1 + name.length * 2 + 2);
        p.setUint8(0, CLIENT.SPAWN);
        for (let i = 0; i < name.length; i++) {
            p.setUint16(1 + i * 2, name.charCodeAt(i), true);
        }
        p.setUint16(1 + name.length * 2, 0, true);
        return p.buffer;
    },
    spectate() {
        const p = packet(1);
        p.setUint8(0, CLIENT.SPECTATE);
        return p.buffer;
    },
    /** Where the bot wants to move, in absolute world coordinates. */
    mouse(x, y) {
        const p = packet(13);
        p.setUint8(0, CLIENT.MOUSE);
        p.setInt32(1, x | 0, true);
        p.setInt32(5, y | 0, true);
        p.setUint32(9, 0, true);
        return p.buffer;
    },
    split() {
        const p = packet(1);
        p.setUint8(0, CLIENT.SPLIT);
        return p.buffer;
    },
    eject() {
        const p = packet(1);
        p.setUint8(0, CLIENT.EJECT);
        return p.buffer;
    },
};

/**
 * Decodes one server frame into a plain object describing what changed.
 * Returns null for frames we do not care about, so callers can ignore them.
 */
function decode(buffer, protocolVersion) {
    const r = new Reader(buffer);
    if (r.remaining < 1) return null;
    const opcode = r.uint8();

    switch (opcode) {
        case SERVER.UPDATE_NODES:
            return decodeUpdateNodes(r, protocolVersion);

        case SERVER.UPDATE_POSITION:
            return {
                type: 'position',
                x: r.float32(),
                y: r.float32(),
                scale: r.float32(),
            };

        case SERVER.CLEAR_ALL:
            return { type: 'clearAll' };

        case SERVER.CLEAR_OWNED:
            return { type: 'clearOwned' };

        case SERVER.ADD_OWNED_CELL:
            return { type: 'addOwnedCell', id: r.uint32() };

        case SERVER.SET_BORDER: {
            const border = {
                type: 'border',
                minX: r.float64(),
                minY: r.float64(),
                maxX: r.float64(),
                maxY: r.float64(),
            };
            if (r.remaining >= 4) {
                border.gameMode = r.uint32();
                if (r.remaining > 0) {
                    border.serverName =
                        protocolVersion >= 6 ? r.stringUtf8() : r.stringUnicode();
                }
            }
            return border;
        }

        case SERVER.LEADERBOARD_FFA: {
            const count = r.uint32();
            const entries = [];
            for (let i = 0; i < count && r.remaining > 0; i++) {
                const id = r.uint32();
                entries.push({
                    id,
                    name: protocolVersion >= 6 ? r.stringUtf8() : r.stringUnicode(),
                });
            }
            return { type: 'leaderboard', mode: 'ffa', entries };
        }

        case SERVER.LEADERBOARD_TEAMS: {
            const count = r.uint32();
            const shares = [];
            for (let i = 0; i < count && r.remaining >= 4; i++) shares.push(r.float32());
            return { type: 'leaderboard', mode: 'teams', shares };
        }

        default:
            return null;
    }
}

function decodeUpdateNodes(r, protocolVersion) {
    // 1. Cells that ate other cells.
    const eaten = [];
    const eatCount = r.uint16();
    for (let i = 0; i < eatCount && r.remaining >= 8; i++) {
        eaten.push({ hunterId: r.uint32(), preyId: r.uint32() });
    }

    // 2. Cell add/update records, terminated by a zero id.
    const cells = [];
    for (;;) {
        if (r.remaining < 4) break;
        const id = r.uint32();
        if (id === 0) break;

        let x, y;
        if (protocolVersion < 5) {
            x = r.int16();
            y = r.int16();
        } else {
            x = r.int32();
            y = r.int32();
        }
        const size = r.uint16();

        const cell = { id, x, y, size };

        if (protocolVersion < 5) {
            // Below 5 the colour is unconditional and precedes the flags.
            cell.color = rgbToHex(r.uint8(), r.uint8(), r.uint8());
            const flags = r.uint8();
            cell.isVirus = !!(flags & FLAG.VIRUS);
            cell.isAgitated = !!(flags & FLAG.AGITATED);
            cell.isEjected = !!(flags & FLAG.EJECTED);
            cell.name = r.stringUnicode();
        } else {
            const flags = r.uint8();
            cell.isVirus = !!(flags & FLAG.VIRUS);
            cell.isAgitated = !!(flags & FLAG.AGITATED);
            cell.isEjected = !!(flags & FLAG.EJECTED);
            cell.isFood = !!(flags & FLAG.FOOD);

            // 11 and up write an extra byte after the food flag.
            let extended = 0;
            if (protocolVersion >= 11 && flags & FLAG.FOOD) extended = r.uint8();

            if (flags & FLAG.COLOR_PRESENT) {
                cell.color = rgbToHex(r.uint8(), r.uint8(), r.uint8());
            }
            if (flags & FLAG.SKIN_PRESENT) {
                cell.skin = protocolVersion >= 6 ? r.stringUtf8() : r.stringUnicode();
            }
            if (flags & FLAG.NAME_PRESENT) {
                cell.name = protocolVersion >= 6 ? r.stringUtf8() : r.stringUnicode();
            }
            if (
                protocolVersion >= EXTENDED_FLAGS_FROM &&
                extended & EXTENDED_FLAG.PLAYER_ID
            ) {
                cell.playerId = r.uint32();
            }
        }
        cells.push(cell);
    }

    // 3. Cells that left the view or died.
    const removed = [];
    if (r.remaining > 0) {
        const removeCount = protocolVersion < 6 ? r.uint32() : r.uint16();
        for (let i = 0; i < removeCount && r.remaining >= 4; i++) {
            removed.push(r.uint32());
        }
    }

    return { type: 'update', eaten, cells, removed };
}

function rgbToHex(red, green, blue) {
    return (
        '#' +
        ('00' + red.toString(16)).slice(-2) +
        ('00' + green.toString(16)).slice(-2) +
        ('00' + blue.toString(16)).slice(-2)
    );
}

module.exports = {
    CLIENT,
    SERVER,
    FLAG,
    EXTENDED_FLAG,
    EXTENDED_FLAGS_FROM,
    Reader,
    encode,
    decode,
    rgbToHex,
};

};

__modules[11] = function (module, exports, require) {
'use strict';

/**
 * Minimal LZ4 block decompressor, for unwrapping agar.io's compressed frames.
 * Block format only, so no frame header and no checksums.
 *
 * Each sequence starts with a token byte. The high nibble is how many literal
 * bytes to copy out, the low nibble is the length of a match to copy from
 * earlier in the output. A nibble of 15 means "keep reading length bytes until
 * one is not 255".
 */

/**
 * @param {Uint8Array} input          compressed block
 * @param {number}     expectedLength decompressed size, from the envelope
 * @returns {Uint8Array}
 */
function decompressBlock(input, expectedLength) {
    const output = new Uint8Array(expectedLength);
    let inPos = 0;
    let outPos = 0;

    while (inPos < input.length) {
        const token = input[inPos++];

        // --- literals
        let literalLength = token >>> 4;
        if (literalLength === 15) {
            let more;
            do {
                if (inPos >= input.length) {
                    throw new Error('LZ4: truncated literal length');
                }
                more = input[inPos++];
                literalLength += more;
            } while (more === 255);
        }

        if (inPos + literalLength > input.length) {
            throw new Error('LZ4: literal run overruns input');
        }
        if (outPos + literalLength > output.length) {
            throw new Error('LZ4: literal run overruns output');
        }
        for (let i = 0; i < literalLength; i++) {
            output[outPos++] = input[inPos++];
        }

        // The last sequence ends after its literals, with no match.
        if (inPos >= input.length) break;

        // --- match
        if (inPos + 1 >= input.length) {
            throw new Error('LZ4: truncated match offset');
        }
        const offset = input[inPos++] | (input[inPos++] << 8);
        if (offset === 0 || offset > outPos) {
            throw new Error('LZ4: match offset out of range');
        }

        let matchLength = token & 0x0f;
        if (matchLength === 15) {
            let more;
            do {
                if (inPos >= input.length) {
                    throw new Error('LZ4: truncated match length');
                }
                more = input[inPos++];
                matchLength += more;
            } while (more === 255);
        }
        matchLength += 4; // minimum match is 4 bytes

        if (outPos + matchLength > output.length) {
            throw new Error('LZ4: match overruns output');
        }
        // Deliberately byte-by-byte: overlapping matches are legal and are how
        // LZ4 encodes runs.
        let matchPos = outPos - offset;
        for (let i = 0; i < matchLength; i++) {
            output[outPos++] = output[matchPos++];
        }
    }

    if (outPos !== expectedLength) {
        throw new Error(
            'LZ4: decompressed ' + outPos + ' bytes, expected ' + expectedLength
        );
    }
    return output;
}

module.exports = { decompressBlock };

};

__modules[12] = function (module, exports, require) {
'use strict';

/**
 * What a codec throws when the bytes do not match the layout it expects.
 *
 * The point of it is the dump: a window of hex around the byte that failed,
 * which is where you start when a server changes its record format. A bare
 * RangeError from a DataView says only that something ran off the end.
 */

class DesyncError extends Error {
    constructor(message, buffer, offset) {
        super(message);
        this.name = 'DesyncError';
        this.offset = offset;
        this.dump = hexDump(buffer, offset);
    }
}

/** A short hex window around the failure, for diagnosing a layout change. */
function hexDump(buffer, offset, radius = 32) {
    const bytes = asBytes(buffer);
    const start = Math.max(0, offset - radius);
    const end = Math.min(bytes.length, offset + radius);
    const parts = [];
    for (let i = start; i < end; i++) {
        const hex = bytes[i].toString(16).padStart(2, '0');
        parts.push(i === offset ? '[' + hex + ']' : hex);
    }
    // A frame that stops short fails at a byte that is not there, so there is
    // nothing in the window to mark.
    if (offset >= bytes.length) parts.push('[end]');
    return (
        'bytes ' + start + '-' + end + ' of ' + bytes.length + ': ' + parts.join(' ')
    );
}

/** Anything holding bytes -- ArrayBuffer, DataView or typed array -- as bytes. */
function asBytes(buffer) {
    return new Uint8Array(
        buffer.buffer || buffer,
        buffer.byteOffset || 0,
        buffer.byteLength
    );
}

module.exports = { DesyncError, hexDump, asBytes };

};

__require(0);
})();