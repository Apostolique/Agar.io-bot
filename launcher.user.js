// ==UserScript==
// @name        AposLauncher
// @namespace   AposLauncher
// @include     http://agar.io/*
// @version     3.063
// @grant       none
// @author      http://www.twitch.tv/apostolique
// ==/UserScript==

var aposLauncherVersion = 3.063;

Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
};

Array.prototype.peek = function() {
    return this[this.length - 1];
}

var sha = "efde0488cc2cc176db48dd23b28a20b90314352b";
function getLatestCommit() {
    window.jQuery.ajax({
            url: "https://api.github.com/repos/apostolique/Agar.io-bot/git/refs/heads/master",
            cache: false,
            dataType: "jsonp"
        }).done(function(data) {
            console.dir(data["data"])
            console.log("hmm: " + data["data"]["object"]["sha"]);
            sha = data["data"]["object"]["sha"];

            function update(prefix, name, url) {
                window.jQuery(document.body).prepend("<div id='" + prefix + "Dialog' style='position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px; z-index: 100; display: none;'>");
                window.jQuery('#' + prefix + 'Dialog').append("<div id='" + prefix + "Message' style='width: 350px; background-color: #FFFFFF; margin: 100px auto; border-radius: 15px; padding: 5px 15px 5px 15px;'>");
                window.jQuery('#' + prefix + 'Message').append("<h2>UPDATE TIME!!!</h2>");
                window.jQuery('#' + prefix + 'Message').append("<p>Grab the update for: <a id='" + prefix + "Link' href='" + url + "' target=\"_blank\">" + name + "</a></p>");
                window.jQuery('#' + prefix + 'Link').on('click', function() {
                    window.jQuery("#" + prefix + "Dialog").hide();
                    window.jQuery("#" + prefix + "Dialog").remove();
                });
                window.jQuery("#" + prefix + "Dialog").show();
            }

            window.jQuery.get('https://raw.githubusercontent.com/Apostolique/Agar.io-bot/master/launcher.user.js?' + Math.floor((Math.random() * 1000000) + 1), function(data) {
                var latestVersion = data.replace(/(\r\n|\n|\r)/gm, "");
                latestVersion = latestVersion.substring(latestVersion.indexOf("// @version") + 11, latestVersion.indexOf("// @grant"));

                latestVersion = parseFloat(latestVersion + 0.0000);
                var myVersion = parseFloat(aposLauncherVersion + 0.0000);

                if (latestVersion > myVersion) {
                    update("aposLauncher", "launcher.user.js", "https://github.com/Apostolique/Agar.io-bot/blob/" + sha + "/launcher.user.js/");
                }
                console.log('Current launcher.user.js Version: ' + myVersion + " on Github: " + latestVersion);
            });

        }).fail(function() {});
}
getLatestCommit();

console.log("Running Bot Launcher!");
(function(d, e) {

    //UPDATE
    function keyAction(e) {
        if (84 == e.keyCode) {
            console.log("Toggle");
            toggle = !toggle;
        }
        if (82 == e.keyCode) {
            console.log("ToggleDraw");
            toggleDraw = !toggleDraw;
        }
        if (83 == e.keyCode) {
            selectedCell = (selectedCell + 1).mod(getPlayer().length + 1);
            console.log("Next Cell " + selectedCell);
        }
        if (68 == e.keyCode) {
            window.setDarkTheme(!getDarkBool());
        }
        if (70 == e.keyCode) {
            window.setShowMass(!getMassBool());
        }
        if (69 == e.keyCode) {
            if (message.length > 0) {
                window.setMessage([]);
                window.onmouseup = function() {};
                window.ignoreStream = true;
            } else {
                window.ignoreStream = false;
                window.refreshTwitch();
            }
        }
        if (81 == e.keyCode) {
            console.log("ToggleFollowMouse");
            toggleFollow = !toggleFollow;
        }
    }

    function humanPlayer() {
        //Don't need to do anything.
        var player = getPlayer();

        var destination = [];

        for (var i = 0; i < player.length; i++) {
            destination.push([getPointX(), getPointY()])
        }

        return destination;
    }

    function pb() {

        //UPDATE
        if (window.botList == null) {
            window.botList = [];
            window.jQuery('#locationUnknown').append(window.jQuery('<select id="bList" class="form-control" onchange="setBotIndex($(this).val());" />'));
            window.jQuery('#locationUnknown').addClass('form-group');
        }

        window.jQuery('#nick').val(originalName);

        if (window.botList.length == 0) {
            window.botList.push(["Human", humanPlayer]);

            var bList = window.jQuery('#bList');
            window.jQuery('<option />', {
                value: (window.botList.length - 1),
                text: "Human"
            }).appendTo(bList);
        }

        ya = !0;
        Pa();
        setInterval(Pa, 18E4);

        var father = window.jQuery("#canvas").parent();
        window.jQuery("#canvas").remove();
        father.prepend("<canvas id='canvas'>");

        G = za = document.getElementById("canvas");
        f = G.getContext("2d");
        G.onmousedown = function(a) {
            if (Qa) {
                var b = a.clientX - (5 + m / 5 / 2),
                    c = a.clientY - (5 + m / 5 / 2);
                if (Math.sqrt(b * b + c * c) <= m / 5 / 2) {
                    V();
                    H(17);
                    return
                }
            }
            fa = a.clientX;
            ga = a.clientY;
            Aa();
            V();
        };
        G.onmousemove = function(a) {
            fa = a.clientX;
            ga = a.clientY;
            Aa();
        };
        G.onmouseup = function() {};
        /firefox/i.test(navigator.userAgent) ? document.addEventListener("DOMMouseScroll", Ra, !1) : document.body.onmousewheel = Ra;
        var a = !1,
            b = !1,
            c = !1;
        d.onkeydown = function(l) {
            //UPDATE
            if (!window.jQuery('#nick').is(":focus")) {
                32 != l.keyCode || a || (V(), H(17), a = !0);
                81 != l.keyCode || b || (H(18), b = !0);
                87 != l.keyCode || c || (V(), H(21), c = !0);
                27 == l.keyCode && Sa(!0);

                //UPDATE
                keyAction(l);
            }
        };
        d.onkeyup = function(l) {
            32 == l.keyCode && (a = !1);
            87 == l.keyCode && (c = !1);
            81 == l.keyCode && b && (H(19), b = !1);
        };
        d.onblur = function() {
            H(19);
            c = b = a = !1
        };
        d.onresize = Ta;
        d.requestAnimationFrame(Ua);
        setInterval(V, 40);
        y && e("#region").val(y);
        Va();
        ha(e("#region").val());
        0 == Ba && y && I();
        W = !0;
        e("#overlays").show();
        Ta();
        d.location.hash && 6 <= d.location.hash.length && Wa(d.location.hash)
    }

    function Ra(a) {
        J *= Math.pow(.9, a.wheelDelta / -120 || a.detail || 0);
        //UPDATE
        0.07 > J && (J = 0.07);
        J > 4 / h && (J = 4 / h)
    }

    function qb() {
        if (.4 > h) X = null;
        else {
            for (var a = Number.POSITIVE_INFINITY, b = Number.POSITIVE_INFINITY, c = Number.NEGATIVE_INFINITY, l = Number.NEGATIVE_INFINITY, d = 0, p = 0; p < v.length; p++) {
                var g = v[p];
                !g.N() || g.R || 20 >= g.size * h || (d = Math.max(g.size, d), a = Math.min(g.x, a), b = Math.min(g.y, b), c = Math.max(g.x, c), l = Math.max(g.y, l))
            }
            X = rb.ka({
                ca: a - d + 100,
                da: b - d + 100,
                oa: c + d + 100,
                pa: l + d + 100,
                ma: 2,
                na: 4
            });
            for (p = 0; p < v.length; p++)
                if (g = v[p],
                    g.N() && !(20 >= g.size * h))
                    for (a = 0; a < g.a.length; ++a) b = g.a[a].x, c = g.a[a].y, b < s - m / 2 / h || c < t - r / 2 / h || b > s + m / 2 / h || c > t + r / 2 / h || X.m(g.a[a])
        }
    }

    function Aa() {
        //UPDATE
        if (selectedCell > 0 && selectedCell <= getPlayer().length) {
            setPoint(((fa - m / 2) / h + s), ((ga - r / 2) / h + t), selectedCell - 1);
            drawCircle(getPlayer()[selectedCell - 1].x, getPlayer()[selectedCell - 1].y, getPlayer()[selectedCell - 1].size, 8);
            drawCircle(getPlayer()[selectedCell - 1].x, getPlayer()[selectedCell - 1].y, getPlayer()[selectedCell - 1].size / 2, 8);
        } else if (selectedCell > getPlayer().length) {
            selectedCell = 0;
        }
        if (toggle || window.botList[botIndex][0] == "Human") {
            var startIndex = (selectedCell == 0 ? 0 : selectedCell - 1);
            for (var i = 0; i < getPlayer().length - (selectedCell == 0 ? 0 : 1); i++) {
                setPoint(((fa - m / 2) / h + s) + i, ((ga - r / 2) / h + t) + i, (i + startIndex).mod(getPlayer().length));
                }
        }
    }

    function Pa() {
        null == ka && (ka = {}, e("#region").children().each(function() {
            var a = e(this),
                b = a.val();
            b && (ka[b] = a.text())
        }));
        e.get("https://m.agar.io/info", function(a) {
                var b = {},
                    c;
                for (c in a.regions) {
                    var l = c.split(":")[0];
                    b[l] = b[l] || 0;
                    b[l] += a.regions[c].numPlayers
                }
                for (c in b) e('#region option[value="' + c + '"]').text(ka[c] + " (" + b[c] + " players)")
            },
            "json")
    }

    function Xa() {
        e("#adsBottom").hide();
        e("#overlays").hide();
        W = !1;
        Va();
        d.googletag && d.googletag.pubads && d.googletag.pubads().clear(d.aa)
    }

    function ha(a) {
        a && a != y && (e("#region").val() != a && e("#region").val(a), y = d.localStorage.location = a, e(".region-message").hide(), e(".region-message." + a).show(), e(".btn-needs-server").prop("disabled", !1), ya && I())
    }

    function Sa(a) {
        W || (K = null, sb(), a && (x = 1), W = !0, e("#overlays").fadeIn(a ? 200 : 3E3))
    }

    function Y(a) {
        e("#helloContainer").attr("data-gamemode", a);
        P = a;
        e("#gamemode").val(a)
    }

    function Va() {
        e("#region").val() ? d.localStorage.location = e("#region").val() : d.localStorage.location && e("#region").val(d.localStorage.location);
        e("#region").val() ? e("#locationKnown").append(e("#region")) : e("#locationUnknown").append(e("#region"))
    }

    function sb() {
        la && (la = !1, setTimeout(function() {
            la = !0
        //UPDATE
        }, 6E4 * Ya))
    }

    function Z(a) {
        return d.i18n[a] || d.i18n_dict.en[a] || a
    }

    function Za() {
        var a = ++Ba;
        console.log("Find " + y + P);
        e.ajax("https://m.agar.io/", {
            error: function() {
                setTimeout(Za, 1E3)
            },
            success: function(b) {
                a == Ba && (b = b.split("\n"), b[2] && alert(b[2]), Ca("ws://" + b[0], b[1]))
            },
            dataType: "text",
            method: "POST",
            cache: !1,
            crossDomain: !0,
            data: (y + P || "?") + "\n154669603"
        })
    }

    function I() {
        ya && y && (e("#connecting").show(), Za())
    }

    function Ca(a, b) {
        if (q) {
            q.onopen = null;
            q.onmessage = null;
            q.onclose = null;
            try {
                q.close()
            } catch (c) {}
            q = null
        }
        Da.la && (a = "ws://" + Da.la);
        if (null != L) {
            var l = L;
            L = function() {
                l(b)
            }
        }
        if (tb) {
            var d = a.split(":");
            a = d[0] + "s://ip-" + d[1].replace(/\./g, "-").replace(/\//g,
                "") + ".tech.agar.io:" + (+d[2] + 2E3)
        }
        M = [];
        k = [];
        E = {};
        v = [];
        Q = [];
        F = [];
        z = A = null;
        R = 0;
        $ = !1;
        console.log("Connecting to " + a);
        //UPDATE
        serverIP = a;
        q = new WebSocket(a);
        q.binaryType = "arraybuffer";
        q.onopen = function() {
            var a;
            console.log("socket open");
            a = N(5);
            a.setUint8(0, 254);
            a.setUint32(1, 4, !0);
            O(a);
            a = N(5);
            a.setUint8(0, 255);
            a.setUint32(1, 154669603, !0);
            O(a);
            a = N(1 + b.length);
            a.setUint8(0, 80);
            for (var c = 0; c < b.length; ++c) a.setUint8(c + 1, b.charCodeAt(c));
            O(a);
            $a()
        };
        q.onmessage = ub;
        q.onclose = vb;
        q.onerror = function() {
            console.log("socket error")
        }
    }

    function N(a) {
        return new DataView(new ArrayBuffer(a))
    }

    function O(a) {
        q.send(a.buffer)
    }

    function vb() {
        $ && (ma = 500);
        console.log("socket close");
        setTimeout(I, ma);
        ma *= 2
    }

    function ub(a) {
        wb(new DataView(a.data))
    }

    function wb(a) {
        function b() {
            for (var b = "";;) {
                var d = a.getUint16(c, !0);
                c += 2;
                if (0 == d) break;
                b += String.fromCharCode(d)
            }
            return b
        }
        var c = 0;
        240 == a.getUint8(c) && (c += 5);
        switch (a.getUint8(c++)) {
            case 16:
                xb(a, c);
                break;
            case 17:
                aa = a.getFloat32(c, !0);
                c += 4;
                ba = a.getFloat32(c, !0);
                c += 4;
                ca = a.getFloat32(c, !0);
                c += 4;
                break;
            case 20:
                k = [];
                M = [];
                break;
            case 21:
                Ea = a.getInt16(c, !0);
                c += 2;
                Fa = a.getInt16(c, !0);
                c += 2;
                Ga || (Ga = !0, na = Ea, oa = Fa);
                break;
            case 32:
                M.push(a.getUint32(c, !0));
                c += 4;
                break;
            case 49:
                if (null != A) break;
                var l = a.getUint32(c, !0),
                    c = c + 4;
                F = [];
                for (var d = 0; d < l; ++d) {
                    var p = a.getUint32(c, !0),
                        c = c + 4;
                    F.push({
                        id: p,
                        name: b()
                    })
                }
                ab();
                break;
            case 50:
                A = [];
                l = a.getUint32(c, !0);
                c += 4;
                for (d = 0; d < l; ++d) A.push(a.getFloat32(c, !0)), c += 4;
                ab();
                break;
            case 64:
                pa = a.getFloat64(c, !0);
                c += 8;
                qa = a.getFloat64(c, !0);
                c += 8;
                ra = a.getFloat64(c, !0);
                c += 8;
                sa = a.getFloat64(c, !0);
                c += 8;
                aa = (ra + pa) / 2;
                ba = (sa + qa) / 2;
                ca = 1;
                0 == k.length && (s = aa, t = ba, h = ca);
                break;
            case 81:
                var g = a.getUint32(c, !0),
                    c = c + 4,
                    e = a.getUint32(c, !0),
                    c = c + 4,
                    f = a.getUint32(c, !0),
                    c = c + 4;
                setTimeout(function() {
                    S({
                        e: g,
                        f: e,
                        d: f
                    })
                }, 1200)
        }
    }

    function xb(a, b) {
        bb = C = Date.now();
        $ || ($ = !0, e("#connecting").hide(), cb(), L && (L(), L = null));
        var c = Math.random();
        Ha = !1;
        var d = a.getUint16(b, !0);
        b += 2;
        for (var u = 0; u < d; ++u) {
            var p = E[a.getUint32(b, !0)],
                g = E[a.getUint32(b + 4, !0)];
            b += 8;
            p && g && (g.X(), g.s = g.x, g.t = g.y, g.r = g.size, g.J = p.x, g.K = p.y, g.q = g.size, g.Q =
                C)
        }
        for (u = 0;;) {
            d = a.getUint32(b, !0);
            b += 4;
            if (0 == d) break;
            ++u;
            var f, p = a.getInt16(b, !0);
            b += 4;
            g = a.getInt16(b, !0);
            b += 4;
            f = a.getInt16(b, !0);
            b += 2;
            for (var h = a.getUint8(b++), w = a.getUint8(b++), m = a.getUint8(b++), h = (h << 16 | w << 8 | m).toString(16); 6 > h.length;) h = "0" + h;
            var h = "#" + h,
                w = a.getUint8(b++),
                m = !!(w & 1),
                r = !!(w & 16);
            w & 2 && (b += 4);
            w & 4 && (b += 8);
            w & 8 && (b += 16);
            for (var q, n = "";;) {
                q = a.getUint16(b, !0);
                b += 2;
                if (0 == q) break;
                n += String.fromCharCode(q)
            }
            q = n;
            n = null;
            E.hasOwnProperty(d) ? (n = E[d], n.P(), n.s = n.x, n.t = n.y, n.r = n.size, n.color = h) :
                (n = new da(d, p, g, f, h, q), v.push(n), E[d] = n, n.ua = p, n.va = g);
            n.h = m;
            n.n = r;
            n.J = p;
            n.K = g;
            n.q = f;
            n.sa = c;
            n.Q = C;
            n.ba = w;
            q && n.B(q); - 1 != M.indexOf(d) && -1 == k.indexOf(n) && (document.getElementById("overlays").style.display = "none", k.push(n), 1 == k.length && (s = n.x, t = n.y, db()))

            //UPDATE
            interNodes[d] = window.getCells()[d];
        }

        //UPDATE
        Object.keys(interNodes).forEach(function(element, index) {
            //console.log("start: " + interNodes[element].updateTime + " current: " + D + " life: " + (D - interNodes[element].updateTime));
            var isRemoved = !window.getCells().hasOwnProperty(element);

            if (isRemoved && (window.getLastUpdate() - interNodes[element].getUptimeTime()) > 3000) {
                delete interNodes[element];
            } else {
                for (var i = 0; i < getPlayer().length; i++) {
                    if (isRemoved && computeDistance(getPlayer()[i].x, getPlayer()[i].y, interNodes[element].x, interNodes[element].y) < getPlayer()[i].size + 710) {

                        delete interNodes[element];
                        break;
                    }
                }
            }
        });

        c = a.getUint32(b, !0);
        b += 4;
        for (u = 0; u < c; u++) d = a.getUint32(b, !0), b += 4, n = E[d], null != n && n.X();
        //UPDATE
        //Ha && 0 == k.length && Sa(!1)
    }

    //UPDATE
    function computeDistance(x1, y1, x2, y2) {
        var xdis = x1 - x2; // <--- FAKE AmS OF COURSE!
        var ydis = y1 - y2;
        var distance = Math.sqrt(xdis * xdis + ydis * ydis);

        return distance;
    }

    function screenDistance() {
        return Math.min(computeDistance(getOffsetX(), getOffsetY(), screenToGameX(getWidth()), getOffsetY()), computeDistance(getOffsetX(), getOffsetY(), getOffsetX(), screenToGameY(getHeight())));
    }

    window.verticalDistance = function() {
        return computeDistance(screenToGameX(0), screenToGameY(0), screenToGameX(getWidth()), screenToGameY(getHeight()));
    }

    function screenToGameX(x) {
        return (x - getWidth() / 2) / getRatio() + getX();
    }

    function screenToGameY(y) {
        return (y - getHeight() / 2) / getRatio() + getY();
    }

    window.drawPoint = function(x_1, y_1, drawColor, text) {
        if (!toggleDraw) {
            dPoints.push([x_1, y_1, drawColor]);
            dText.push(text);
        }
    }

    window.drawArc = function(x_1, y_1, x_2, y_2, x_3, y_3, drawColor) {
        if (!toggleDraw) {
            var radius = computeDistance(x_1, y_1, x_3, y_3);
            dArc.push([x_1, y_1, x_2, y_2, x_3, y_3, radius, drawColor]);
        }
    }

    window.drawLine = function(x_1, y_1, x_2, y_2, drawColor) {
        if (!toggleDraw) {
            lines.push([x_1, y_1, x_2, y_2, drawColor]);
        }
    }

    window.drawCircle = function(x_1, y_1, radius, drawColor) {
        if (!toggleDraw) {
            circles.push([x_1, y_1, radius, drawColor]);
        }
    }

    function V() {

        //UPDATE
        if (getPlayer().length == 0 && !reviving && ~~(getCurrentScore() / 100) > 0) {
            console.log("Dead: " + ~~(getCurrentScore() / 100));
            apos('send', 'pageview');
        }

        if (getPlayer().length == 0) {
            console.log("Revive");
            setNick(originalName);
            reviving = true;
        } else if (getPlayer().length > 0 && reviving) {
            reviving = false;
        }
        
        
        var a;
        if (T()) {
            a = fa - m / 2;
            var b = ga - r / 2;
            for (var i = 0; i < getPlayer().length; i++) {
                var tempID = getPlayer()[i].id;
                64 > a * a + b * b || .01 > Math.abs(eb - ia[i]) && .01 > Math.abs(fb - ja[i]) || (eb = ia[i], fb = ja[i], a = N(21), a.setUint8(0, 16), a.setFloat64(1, ia[i], !0), a.setFloat64(9, ja[i], !0), a.setUint32(17, tempID, !0), O(a))
            }
        }
    }

    function cb() {
        if (T() && $ && null != K) {
            var a = N(1 + 2 * K.length);
            a.setUint8(0, 0);
            for (var b = 0; b < K.length; ++b) a.setUint16(1 + 2 * b, K.charCodeAt(b), !0);
            O(a)
        }
    }

    function T() {
        return null != q && q.readyState == q.OPEN
    }

    window.opCode = function(a) {
        console.log("Sending op code.");
        H(parseInt(a));
    }

    function H(a) {
        if (T()) {
            var b = N(1);
            b.setUint8(0, a);
            O(b)
        }
    }

    function $a() {
        if (T() && null != B) {
            var a = N(1 + B.length);
            a.setUint8(0, 81);
            for (var b = 0; b < B.length; ++b) a.setUint8(b + 1, B.charCodeAt(b));
            O(a)
        }
    }

    function Ta() {
        m = d.innerWidth;
        r = d.innerHeight;
        za.width = G.width = m;
        za.height = G.height = r;
        var a = e("#helloContainer");
        a.css("transform", "none");
        var b = a.height(),
            c = d.innerHeight;
        b > c / 1.1 ? a.css("transform", "translate(-50%, -50%) scale(" + c / b / 1.1 + ")") : a.css("transform", "translate(-50%, -50%)");
        gb()
    }

    function hb() {
        var a;
        a = Math.max(r / 1080, m / 1920);
        return a *= J
    }

    function yb() {
        if (0 != k.length) {
            for (var a = 0, b = 0; b < k.length; b++) a += k[b].size;
            a = Math.pow(Math.min(64 / a, 1), .4) * hb();
            h = (9 * h + a) / 10
        }
    }

    function gb() {
        //UPDATE
        dPoints = [];
        circles = [];
        dArc = [];
        dText = [];
        lines = [];


        var a, b = Date.now();
        ++zb;
        C = b;
        if (0 < k.length) {
            yb();
            for (var c = a = 0, d = 0; d < k.length; d++) k[d].P(), a += k[d].x / k.length, c += k[d].y / k.length;
            aa = a;
            ba = c;
            ca = h;
            s = (s + a) / 2;
            t = (t + c) / 2;
        } else s = (29 * s + aa) / 30, t = (29 * t + ba) / 30, h = (9 * h + ca * hb()) / 10;
        qb();
        Aa();
        Ia || f.clearRect(0, 0, m, r);
        Ia ? (f.fillStyle = ta ? "#111111" : "#F2FBFF", f.globalAlpha = .05, f.fillRect(0, 0, m, r), f.globalAlpha = 1) : Ab();
        v.sort(function(a, b) {
            return a.size == b.size ? a.id - b.id : a.size - b.size
        });
        f.save();
        f.translate(m / 2, r / 2);
        f.scale(h, h);
        f.translate(-s, -t);
        //UPDATE
        f.save();
        f.beginPath();
        f.lineWidth = 5;
        f.strokeStyle = "#FFFFFF";
        f.moveTo(getMapStartX(), getMapStartY());
        f.lineTo(getMapStartX(), getMapEndY());
        f.stroke();
        f.moveTo(getMapStartX(), getMapStartY());
        f.lineTo(getMapEndX(), getMapStartY());
        f.stroke();
        f.moveTo(getMapEndX(), getMapStartY());
        f.lineTo(getMapEndX(), getMapEndY());
        f.stroke();
        f.moveTo(getMapStartX(), getMapEndY());
        f.lineTo(getMapEndX(), getMapEndY());
        f.stroke();
        f.restore();
        
        for (d = 0; d < v.length; d++) v[d].w(f);
        for (d = 0; d < Q.length; d++) Q[d].w(f);
        //UPDATE
        if (getPlayer().length > 0) {
            var moveLoc = window.botList[botIndex][1](toggleFollow);
            if (selectedCell > 0) {
                Aa();
            }
            if (!toggle) {
                var startIndex = (selectedCell == 0 ? 0 : selectedCell);
                for (var i = 0; i < getPlayer().length - (selectedCell == 0 ? 0 : 1); i++) {
                    setPoint(moveLoc[(i + startIndex).mod(getPlayer().length)][0], moveLoc[(i + startIndex).mod(getPlayer().length)][1], (i + startIndex).mod(getPlayer().length));
                }
            }
        }
        customRender(f);
        if (Ga) {
            na = (3 * na + Ea) / 4;
            oa = (3 * oa + Fa) / 4;
            f.save();
            f.strokeStyle = "#FFAAAA";
            f.lineWidth = 10;
            f.lineCap = "round";
            f.lineJoin = "round";
            f.globalAlpha = .5;
            f.beginPath();
            for (d = 0; d < k.length; d++) f.moveTo(k[d].x, k[d].y), f.lineTo(na, oa);
            f.stroke();
            f.restore();
        }
        f.restore();
        z && z.width && f.drawImage(z, m - z.width - 10, 10);
        R = Math.max(R, Bb());

        //UPDATE

        var currentDate = new Date();

        var nbSeconds = 0;
        if (getPlayer().length > 0) {
            //nbSeconds = currentDate.getSeconds() + currentDate.getMinutes() * 60 + currentDate.getHours() * 3600 - lifeTimer.getSeconds() - lifeTimer.getMinutes() * 60 - lifeTimer.getHours() * 3600;
            nbSeconds = (currentDate.getTime() - lifeTimer.getTime())/1000;
        }

        bestTime = Math.max(nbSeconds, bestTime);

        var displayText = 'Score: ' + ~~(R / 100) + " Current Time: " + nbSeconds + " seconds.";

        0 != R && (null == ua && (ua = new va(24, "#FFFFFF")), ua.C(displayText), c = ua.L(), a = c.width, f.globalAlpha = .2, f.fillStyle = "#000000", f.fillRect(10, r - 10 - 24 - 10, a + 10, 34), f.globalAlpha = 1, f.drawImage(c, 15, r -
            10 - 24 - 5));
        Cb();
        b = Date.now() - b;
        b > 1E3 / 60 ? D -= .01 : b < 1E3 / 65 && (D += .01);.4 > D && (D = .4);
        1 < D && (D = 1);
        b = C - ib;
        !T() || W ? (x += b / 2E3, 1 < x && (x = 1)) : (x -= b / 300, 0 > x && (x = 0));
        0 < x && (f.fillStyle = "#000000", f.globalAlpha = .5 * x, f.fillRect(0, 0, m, r), f.globalAlpha = 1);
        ib = C

        drawStats(f);
    }

    //UPDATE
    function customRender(d) {
        d.save();
        for (var i = 0; i < lines.length; i++) {
            d.beginPath();

            d.lineWidth = 5;

            if (lines[i][4] == 0) {
                d.strokeStyle = "#FF0000";
            } else if (lines[i][4] == 1) {
                d.strokeStyle = "#00FF00";
            } else if (lines[i][4] == 2) {
                d.strokeStyle = "#0000FF";
            } else if (lines[i][4] == 3) {
                d.strokeStyle = "#FF8000";
            } else if (lines[i][4] == 4) {
                d.strokeStyle = "#8A2BE2";
            } else if (lines[i][4] == 5) {
                d.strokeStyle = "#FF69B4";
            } else if (lines[i][4] == 6) {
                d.strokeStyle = "#008080";
            } else if (lines[i][4] == 7) {
                d.strokeStyle = "#FFFFFF";
            } else {
                d.strokeStyle = "#000000";
            }

            d.moveTo(lines[i][0], lines[i][1]);
            d.lineTo(lines[i][2], lines[i][3]);

            d.stroke();
        }
        d.restore();
        d.save();
        for (var i = 0; i < circles.length; i++) {
            if (circles[i][3] == 0) {
                d.strokeStyle = "#FF0000";
            } else if (circles[i][3] == 1) {
                d.strokeStyle = "#00FF00";
            } else if (circles[i][3] == 2) {
                d.strokeStyle = "#0000FF";
            } else if (circles[i][3] == 3) {
                d.strokeStyle = "#FF8000";
            } else if (circles[i][3] == 4) {
                d.strokeStyle = "#8A2BE2";
            } else if (circles[i][3] == 5) {
                d.strokeStyle = "#FF69B4";
            } else if (circles[i][3] == 6) {
                d.strokeStyle = "#008080";
            } else if (circles[i][3] == 7) {
                d.strokeStyle = "#FFFFFF";
            } else {
                d.strokeStyle = "#000000";
            }
            d.beginPath();

            d.lineWidth = 10;
            //d.setLineDash([5]);
            d.globalAlpha = 0.3;

            d.arc(circles[i][0], circles[i][1], circles[i][2], 0, 2 * Math.PI, false);

            d.stroke();
        }
        d.restore();
        d.save();
        for (var i = 0; i < dArc.length; i++) {
            if (dArc[i][7] == 0) {
                d.strokeStyle = "#FF0000";
            } else if (dArc[i][7] == 1) {
                d.strokeStyle = "#00FF00";
            } else if (dArc[i][7] == 2) {
                d.strokeStyle = "#0000FF";
            } else if (dArc[i][7] == 3) {
                d.strokeStyle = "#FF8000";
            } else if (dArc[i][7] == 4) {
                d.strokeStyle = "#8A2BE2";
            } else if (dArc[i][7] == 5) {
                d.strokeStyle = "#FF69B4";
            } else if (dArc[i][7] == 6) {
                d.strokeStyle = "#008080";
            } else if (dArc[i][7] == 7) {
                d.strokeStyle = "#FFFFFF";
            } else {
                d.strokeStyle = "#000000";
            }

            d.beginPath();

            d.lineWidth = 5;

            var ang1 = Math.atan2(dArc[i][1] - dArc[i][5], dArc[i][0] - dArc[i][4]);
            var ang2 = Math.atan2(dArc[i][3] - dArc[i][5], dArc[i][2] - dArc[i][4]);

            d.arc(dArc[i][4], dArc[i][5], dArc[i][6], ang1, ang2, false);

            d.stroke();
        }
        d.restore();
        d.save();
        for (var i = 0; i < dPoints.length; i++) {
            if (dText[i] == "") {
                var radius = 10;

                d.beginPath();
                d.arc(dPoints[i][0], dPoints[i][1], radius, 0, 2 * Math.PI, false);

                if (dPoints[i][2] == 0) {
                    d.fillStyle = "black";
                } else if (dPoints[i][2] == 1) {
                    d.fillStyle = "yellow";
                } else if (dPoints[i][2] == 2) {
                    d.fillStyle = "blue";
                } else if (dPoints[i][2] == 3) {
                    d.fillStyle = "red";
                } else if (dPoints[i][2] == 4) {
                    d.fillStyle = "#008080";
                } else if (dPoints[i][2] == 5) {
                    d.fillStyle = "#FF69B4";
                } else {
                    d.fillStyle = "#000000";
                }

                d.fill();
                d.lineWidth = 2;
                d.strokeStyle = '#003300';
                d.stroke();
            } else {
                var text = new va(18, (getDarkBool() ? '#F2FBFF' : '#111111'), true, '#000000');

                text.C(dText[i]);
                var textRender = text.L();
                d.drawImage(textRender, dPoints[i][0], dPoints[i][1]);
            }

        }
        d.restore();
    }

    function drawStats(d) {
        d.save()

        sessionScore = Math.max(getCurrentScore(), sessionScore);

        var debugStrings = [];
        debugStrings.push("Current Bot: " + window.botList[botIndex][0]);
        debugStrings.push("T - Bot: " + (!toggle ? "On" : "Off"));
        debugStrings.push("R - Lines: " + (!toggleDraw ? "On" : "Off"));
        debugStrings.push("Q - Follow Mouse: " + (toggleFollow ? "On" : "Off"));
        debugStrings.push("S - Manual Cell: " + (selectedCell == 0 ? "None" : selectedCell) + " of " + getPlayer().length);
        debugStrings.push("");
        debugStrings.push("Best Score: " + ~~(sessionScore / 100));
        debugStrings.push("Best Time: " + bestTime + " seconds");
        debugStrings.push("");
        debugStrings.push(serverIP);

        if (getPlayer().length > 0) {
            var offsetX = -getMapStartX();
            var offsetY = -getMapStartY();
            debugStrings.push("Location: " + Math.floor(getPlayer()[0].x + offsetX) + ", " + Math.floor(getPlayer()[0].y + offsetY));
        }

        var offsetValue = 20;
        var text = new va(18, (getDarkBool() ? '#F2FBFF' : '#111111'));

        for (var i = 0; i < debugStrings.length; i++) {
            text.C(debugStrings[i]);
            var textRender = text.L();
            d.drawImage(textRender, 20, offsetValue);
            offsetValue += textRender.height;
        }

        if (message.length > 0) {
            var mRender = [];
            var mWidth = 0;
            var mHeight = 0;

            for (var i = 0; i < message.length; i++) {
                var mText = new va(28, '#FF0000', true, '#000000');
                mText.C(message[i]);
                mRender.push(mText.L());

                if (mRender[i].width > mWidth) {
                    mWidth = mRender[i].width;
                }
                mHeight += mRender[i].height;
            }

            var mX = getWidth() / 2 - mWidth / 2;
            var mY = 20;

            d.globalAlpha = 0.4;
            d.fillStyle = '#000000';
            d.fillRect(mX - 10, mY - 10, mWidth + 20, mHeight + 20);
            d.globalAlpha = 1;

            var mOffset = mY;
            for (var i = 0; i < mRender.length; i++) {
                d.drawImage(mRender[i], getWidth() / 2 - mRender[i].width / 2, mOffset);
                mOffset += mRender[i].height;
            }
        }

        d.restore();
    }

    function Ab() {
        f.fillStyle = ta ? "#111111" : "#F2FBFF";
        f.fillRect(0, 0, m, r);
        f.save();
        f.strokeStyle = ta ? "#AAAAAA" : "#000000";
        f.globalAlpha = .2 * h;
        for (var a = m / h, b = r / h, c = (a / 2 - s) % 50; c < a; c += 50) f.beginPath(), f.moveTo(c * h - .5, 0), f.lineTo(c * h - .5, b * h), f.stroke();
        for (c = (b / 2 - t) % 50; c < b; c += 50) f.beginPath(), f.moveTo(0, c * h - .5), f.lineTo(a * h, c * h - .5), f.stroke();
        f.restore()
    }

    function Cb() {
        if (Qa && Ja.width) {
            var a = m / 5;
            f.drawImage(Ja, 5, 5, a, a)
        }
    }

    function Bb() {
        for (var a = 0, b = 0; b < k.length; b++) a += k[b].q * k[b].q;
        return a
    }

    function ab() {
        z = null;
        if (null != A || 0 != F.length)
            if (null != A || wa) {
                z = document.createElement("canvas");
                var a = z.getContext("2d"),
                    b = 60,
                    b = null == A ? b + 24 * F.length : b + 180,
                    c = Math.min(200, .3 * m) / 200;
                z.width = 200 * c;
                z.height = b * c;
                a.scale(c, c);
                a.globalAlpha = .4;
                a.fillStyle = "#000000";
                a.fillRect(0, 0, 200, b);
                a.globalAlpha =
                    1;
                a.fillStyle = "#FFFFFF";
                c = null;
                c = Z("leaderboard");
                a.font = "30px Ubuntu";
                a.fillText(c, 100 - a.measureText(c).width / 2, 40);
                if (null == A)
                    for (a.font = "20px Ubuntu", b = 0; b < F.length; ++b) c = F[b].name || Z("unnamed_cell"), wa || (c = Z("unnamed_cell")), -1 != M.indexOf(F[b].id) ? (k[0].name && (c = k[0].name), a.fillStyle = "#FFAAAA") : a.fillStyle = "#FFFFFF", c = b + 1 + ". " + c, a.fillText(c, 100 - a.measureText(c).width / 2, 70 + 24 * b);
                else
                    for (b = c = 0; b < A.length; ++b) {
                        var d = c + A[b] * Math.PI * 2;
                        a.fillStyle = Db[b + 1];
                        a.beginPath();
                        a.moveTo(100, 140);
                        a.arc(100,
                            140, 80, c, d, !1);
                        a.fill();
                        c = d
                    }
            }
    }

    function Ka(a, b, c, d, e) {
        this.V = a;
        this.x = b;
        this.y = c;
        this.i = d;
        this.b = e
    }

    function da(a, b, c, d, e, p) {
        this.id = a;
        this.s = this.x = b;
        this.t = this.y = c;
        this.r = this.size = d;
        this.color = e;
        this.a = [];
        this.W();
        this.B(p)
    }

    function va(a, b, c, d) {
        a && (this.u = a);
        b && (this.S = b);
        this.U = !!c;
        d && (this.v = d)
    }

    function S(a, b) {
        var c = "1" == e("#helloContainer").attr("data-has-account-data");
        e("#helloContainer").attr("data-has-account-data", "1");
        if (null == b && d.localStorage.loginCache) {
            var l = JSON.parse(d.localStorage.loginCache);
            l.f = a.f;
            l.d = a.d;
            l.e = a.e;
            d.localStorage.loginCache = JSON.stringify(l)
        }
        if (c) {
            var u = +e(".agario-exp-bar .progress-bar-text").first().text().split("/")[0],
                c = +e(".agario-exp-bar .progress-bar-text").first().text().split("/")[1].split(" ")[0],
                l = e(".agario-profile-panel .progress-bar-star").first().text();
            if (l != a.e) S({
                f: c,
                d: c,
                e: l
            }, function() {
                e(".agario-profile-panel .progress-bar-star").text(a.e);
                e(".agario-exp-bar .progress-bar").css("width", "100%");
                e(".progress-bar-star").addClass("animated tada").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
                    function() {
                        e(".progress-bar-star").removeClass("animated tada")
                    });
                setTimeout(function() {
                    e(".agario-exp-bar .progress-bar-text").text(a.d + "/" + a.d + " XP");
                    S({
                        f: 0,
                        d: a.d,
                        e: a.e
                    }, function() {
                        S(a, b)
                    })
                }, 1E3)
            });
            else {
                var p = Date.now(),
                    g = function() {
                        var c;
                        c = (Date.now() - p) / 1E3;
                        c = 0 > c ? 0 : 1 < c ? 1 : c;
                        c = c * c * (3 - 2 * c);
                        e(".agario-exp-bar .progress-bar-text").text(~~(u + (a.f - u) * c) + "/" + a.d + " XP");
                        e(".agario-exp-bar .progress-bar").css("width", (88 * (u + (a.f - u) * c) / a.d).toFixed(2) + "%");
                        1 > c ? d.requestAnimationFrame(g) : b && b()
                    };
                d.requestAnimationFrame(g)
            }
        } else e(".agario-profile-panel .progress-bar-star").text(a.e),
            e(".agario-exp-bar .progress-bar-text").text(a.f + "/" + a.d + " XP"), e(".agario-exp-bar .progress-bar").css("width", (88 * a.f / a.d).toFixed(2) + "%"), b && b()
    }

    function jb(a) {
        "string" == typeof a && (a = JSON.parse(a));
        Date.now() + 18E5 > a.ja ? e("#helloContainer").attr("data-logged-in", "0") : (d.localStorage.loginCache = JSON.stringify(a), B = a.fa, e(".agario-profile-name").text(a.name), $a(), S({
            f: a.f,
            d: a.d,
            e: a.e
        }), e("#helloContainer").attr("data-logged-in", "1"))
    }

    function Eb(a) {
        a = a.split("\n");
        jb({
            name: a[0],
            ta: a[1],
            fa: a[2],
            ja: 1E3 *
                +a[3],
            e: +a[4],
            f: +a[5],
            d: +a[6]
        })
    }

    function La(a) {
        if ("connected" == a.status) {
            var b = a.authResponse.accessToken;
            d.FB.api("/me/picture?width=180&height=180", function(a) {
                d.localStorage.fbPictureCache = a.data.url;
                e(".agario-profile-picture").attr("src", a.data.url)
            });
            e("#helloContainer").attr("data-logged-in", "1");
            null != B ? e.ajax("https://m.agar.io/checkToken", {
                error: function() {
                    B = null;
                    La(a)
                },
                success: function(a) {
                    a = a.split("\n");
                    S({
                        e: +a[0],
                        f: +a[1],
                        d: +a[2]
                    })
                },
                dataType: "text",
                method: "POST",
                cache: !1,
                crossDomain: !0,
                data: B
            }) : e.ajax("https://m.agar.io/facebookLogin", {
                error: function() {
                    B = null;
                    e("#helloContainer").attr("data-logged-in", "0")
                },
                success: Eb,
                dataType: "text",
                method: "POST",
                cache: !1,
                crossDomain: !0,
                data: b
            })
        }
    }

    function Wa(a) {
        Y(":party");
        e("#helloContainer").attr("data-party-state", "4");
        a = decodeURIComponent(a).replace(/.*#/gim, "");
        Ma("#" + d.encodeURIComponent(a));
        e.ajax(Na + "//m.agar.io/getToken", {
            error: function() {
                e("#helloContainer").attr("data-party-state", "6")
            },
            success: function(b) {
                b = b.split("\n");
                e(".partyToken").val("agar.io/#" +
                    d.encodeURIComponent(a));
                e("#helloContainer").attr("data-party-state", "5");
                Y(":party");
                Ca("ws://" + b[0], a)
            },
            dataType: "text",
            method: "POST",
            cache: !1,
            crossDomain: !0,
            data: a
        })
    }

    function Ma(a) {
        d.history && d.history.replaceState && d.history.replaceState({}, d.document.title, a)
    }
    if (!d.agarioNoInit) {
        var Na = d.location.protocol,
            tb = "https:" == Na,
            xa = d.navigator.userAgent;
        if (-1 != xa.indexOf("Android")) d.ga && d.ga("send", "event", "MobileRedirect", "PlayStore"), setTimeout(function() {
                d.location.href = "market://details?id=com.miniclip.agar.io"
            },
            1E3);
        else if (-1 != xa.indexOf("iPhone") || -1 != xa.indexOf("iPad") || -1 != xa.indexOf("iPod")) d.ga && d.ga("send", "event", "MobileRedirect", "AppStore"), setTimeout(function() {
            d.location.href = "https://itunes.apple.com/app/agar.io/id995999703"
        }, 1E3);
        else {
            var za, f, G, m, r, X = null,

                //UPDATE
                toggle = false,
                toggleDraw = false,
                toggleFollow = false,
                tempPoint = [0, 0, 1],
                dPoints = [],
                circles = [],
                dArc = [],
                dText = [],
                lines = [],
                names = ["NotReallyABot"],
                originalName = names[Math.floor(Math.random() * names.length)],
                sessionScore = 0,
                serverIP = "",
                interNodes = [],
                lifeTimer = new Date(),
                bestTime = 0,
                botIndex = 0,
                reviving = false,
                message = [],
                selectedCell = 0,

                q = null,
                s = 0,
                t = 0,
                M = [],
                k = [],
                E = {},
                v = [],
                Q = [],
                F = [],
                fa = 0,
                ga = 0,

                //UPDATE
                ia = [-1],
                ja = [-1],

                zb = 0,
                C = 0,
                ib = 0,
                K = null,
                pa = 0,
                qa = 0,
                ra = 1E4,
                sa = 1E4,
                h = 1,
                y = null,
                kb = !0,
                wa = !0,
                Oa = !1,
                Ha = !1,
                R = 0,
                ta = !1,
                lb = !1,
                aa = s = ~~((pa + ra) / 2),
                ba = t = ~~((qa + sa) / 2),
                ca = 1,
                P = "",
                A = null,
                ya = !1,
                Ga = !1,
                Ea = 0,
                Fa =
                0,
                na = 0,
                oa = 0,
                mb = 0,
                Db = ["#333333", "#FF3333", "#33FF33", "#3333FF"],
                Ia = !1,
                $ = !1,
                bb = 0,
                B = null,
                J = 1,
                x = 1,
                W = !0,
                Ba = 0,
                Da = {};
            (function() {
                var a = d.location.search;
                "?" == a.charAt(0) && (a = a.slice(1));
                for (var a = a.split("&"), b = 0; b < a.length; b++) {
                    var c = a[b].split("=");
                    Da[c[0]] = c[1]
                }
            })();
            var Qa = "ontouchstart" in d && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(d.navigator.userAgent),
                Ja = new Image;
            Ja.src = "img/split.png";
            var nb = document.createElement("canvas");
            if ("undefined" == typeof console || "undefined" ==
                typeof DataView || "undefined" == typeof WebSocket || null == nb || null == nb.getContext || null == d.localStorage) alert("You browser does not support this game, we recommend you to use Firefox to play this");
            else {
                var ka = null;
                d.setNick = function(a) {
                    //UPDATE
                    originalName = a;
                    if (getPlayer().length == 0) {
                        lifeTimer = new Date();
                    }

                    Xa();
                    K = a;
                    cb();
                    R = 0
                };
                d.setRegion = ha;
                d.setSkins = function(a) {
                    kb = a
                };
                d.setNames = function(a) {
                    wa = a
                };
                d.setDarkTheme = function(a) {
                    ta = a
                };
                d.setColors = function(a) {
                    Oa = a
                };
                d.setShowMass = function(a) {
                    lb = a
                };
                d.spectate = function() {
                    K = null;
                    H(1);
                    Xa()
                };
                d.setGameMode = function(a) {
                    a != P && (":party" ==
                        P && e("#helloContainer").attr("data-party-state", "0"), Y(a), ":party" != a && I())
                };
                d.setAcid = function(a) {
                    Ia = a
                };
                null != d.localStorage && (null == d.localStorage.AB9 && (d.localStorage.AB9 = 0 + ~~(100 * Math.random())), mb = +d.localStorage.AB9, d.ABGroup = mb);
                e.get(Na + "//gc.agar.io", function(a) {
                    var b = a.split(" ");
                    a = b[0];
                    b = b[1] || ""; - 1 == ["UA"].indexOf(a) && ob.push("ussr");
                    ea.hasOwnProperty(a) && ("string" == typeof ea[a] ? y || ha(ea[a]) : ea[a].hasOwnProperty(b) && (y || ha(ea[a][b])))
                }, "text");
                d.ga && d.ga("send", "event", "User-Agent", d.navigator.userAgent, {
                    nonInteraction: 1
                });
                var la = !1,
                    Ya = 0;
                setTimeout(function() {
                    la = !0
                }, Math.max(6E4 * Ya, 1E4));
                var ea = {
                        AF: "JP-Tokyo",
                        AX: "EU-London",
                        AL: "EU-London",
                        DZ: "EU-London",
                        AS: "SG-Singapore",
                        AD: "EU-London",
                        AO: "EU-London",
                        AI: "US-Atlanta",
                        AG: "US-Atlanta",
                        AR: "BR-Brazil",
                        AM: "JP-Tokyo",
                        AW: "US-Atlanta",
                        AU: "SG-Singapore",
                        AT: "EU-London",
                        AZ: "JP-Tokyo",
                        BS: "US-Atlanta",
                        BH: "JP-Tokyo",
                        BD: "JP-Tokyo",
                        BB: "US-Atlanta",
                        BY: "EU-London",
                        BE: "EU-London",
                        BZ: "US-Atlanta",
                        BJ: "EU-London",
                        BM: "US-Atlanta",
                        BT: "JP-Tokyo",
                        BO: "BR-Brazil",
                        BQ: "US-Atlanta",
                        BA: "EU-London",
                        BW: "EU-London",
                        BR: "BR-Brazil",
                        IO: "JP-Tokyo",
                        VG: "US-Atlanta",
                        BN: "JP-Tokyo",
                        BG: "EU-London",
                        BF: "EU-London",
                        BI: "EU-London",
                        KH: "JP-Tokyo",
                        CM: "EU-London",
                        CA: "US-Atlanta",
                        CV: "EU-London",
                        KY: "US-Atlanta",
                        CF: "EU-London",
                        TD: "EU-London",
                        CL: "BR-Brazil",
                        CN: "CN-China",
                        CX: "JP-Tokyo",
                        CC: "JP-Tokyo",
                        CO: "BR-Brazil",
                        KM: "EU-London",
                        CD: "EU-London",
                        CG: "EU-London",
                        CK: "SG-Singapore",
                        CR: "US-Atlanta",
                        CI: "EU-London",
                        HR: "EU-London",
                        CU: "US-Atlanta",
                        CW: "US-Atlanta",
                        CY: "JP-Tokyo",
                        CZ: "EU-London",
                        DK: "EU-London",
                        DJ: "EU-London",
                        DM: "US-Atlanta",
                        DO: "US-Atlanta",
                        EC: "BR-Brazil",
                        EG: "EU-London",
                        SV: "US-Atlanta",
                        GQ: "EU-London",
                        ER: "EU-London",
                        EE: "EU-London",
                        ET: "EU-London",
                        FO: "EU-London",
                        FK: "BR-Brazil",
                        FJ: "SG-Singapore",
                        FI: "EU-London",
                        FR: "EU-London",
                        GF: "BR-Brazil",
                        PF: "SG-Singapore",
                        GA: "EU-London",
                        GM: "EU-London",
                        GE: "JP-Tokyo",
                        DE: "EU-London",
                        GH: "EU-London",
                        GI: "EU-London",
                        GR: "EU-London",
                        GL: "US-Atlanta",
                        GD: "US-Atlanta",
                        GP: "US-Atlanta",
                        GU: "SG-Singapore",
                        GT: "US-Atlanta",
                        GG: "EU-London",
                        GN: "EU-London",
                        GW: "EU-London",
                        GY: "BR-Brazil",
                        HT: "US-Atlanta",
                        VA: "EU-London",
                        HN: "US-Atlanta",
                        HK: "JP-Tokyo",
                        HU: "EU-London",
                        IS: "EU-London",
                        IN: "JP-Tokyo",
                        ID: "JP-Tokyo",
                        IR: "JP-Tokyo",
                        IQ: "JP-Tokyo",
                        IE: "EU-London",
                        IM: "EU-London",
                        IL: "JP-Tokyo",
                        IT: "EU-London",
                        JM: "US-Atlanta",
                        JP: "JP-Tokyo",
                        JE: "EU-London",
                        JO: "JP-Tokyo",
                        KZ: "JP-Tokyo",
                        KE: "EU-London",
                        KI: "SG-Singapore",
                        KP: "JP-Tokyo",
                        KR: "JP-Tokyo",
                        KW: "JP-Tokyo",
                        KG: "JP-Tokyo",
                        LA: "JP-Tokyo",
                        LV: "EU-London",
                        LB: "JP-Tokyo",
                        LS: "EU-London",
                        LR: "EU-London",
                        LY: "EU-London",
                        LI: "EU-London",
                        LT: "EU-London",
                        LU: "EU-London",
                        MO: "JP-Tokyo",
                        MK: "EU-London",
                        MG: "EU-London",
                        MW: "EU-London",
                        MY: "JP-Tokyo",
                        MV: "JP-Tokyo",
                        ML: "EU-London",
                        MT: "EU-London",
                        MH: "SG-Singapore",
                        MQ: "US-Atlanta",
                        MR: "EU-London",
                        MU: "EU-London",
                        YT: "EU-London",
                        MX: "US-Atlanta",
                        FM: "SG-Singapore",
                        MD: "EU-London",
                        MC: "EU-London",
                        MN: "JP-Tokyo",
                        ME: "EU-London",
                        MS: "US-Atlanta",
                        MA: "EU-London",
                        MZ: "EU-London",
                        MM: "JP-Tokyo",
                        NA: "EU-London",
                        NR: "SG-Singapore",
                        NP: "JP-Tokyo",
                        NL: "EU-London",
                        NC: "SG-Singapore",
                        NZ: "SG-Singapore",
                        NI: "US-Atlanta",
                        NE: "EU-London",
                        NG: "EU-London",
                        NU: "SG-Singapore",
                        NF: "SG-Singapore",
                        MP: "SG-Singapore",
                        NO: "EU-London",
                        OM: "JP-Tokyo",
                        PK: "JP-Tokyo",
                        PW: "SG-Singapore",
                        PS: "JP-Tokyo",
                        PA: "US-Atlanta",
                        PG: "SG-Singapore",
                        PY: "BR-Brazil",
                        PE: "BR-Brazil",
                        PH: "JP-Tokyo",
                        PN: "SG-Singapore",
                        PL: "EU-London",
                        PT: "EU-London",
                        PR: "US-Atlanta",
                        QA: "JP-Tokyo",
                        RE: "EU-London",
                        RO: "EU-London",
                        RU: "RU-Russia",
                        RW: "EU-London",
                        BL: "US-Atlanta",
                        SH: "EU-London",
                        KN: "US-Atlanta",
                        LC: "US-Atlanta",
                        MF: "US-Atlanta",
                        PM: "US-Atlanta",
                        VC: "US-Atlanta",
                        WS: "SG-Singapore",
                        SM: "EU-London",
                        ST: "EU-London",
                        SA: "EU-London",
                        SN: "EU-London",
                        RS: "EU-London",
                        SC: "EU-London",
                        SL: "EU-London",
                        SG: "JP-Tokyo",
                        SX: "US-Atlanta",
                        SK: "EU-London",
                        SI: "EU-London",
                        SB: "SG-Singapore",
                        SO: "EU-London",
                        ZA: "EU-London",
                        SS: "EU-London",
                        ES: "EU-London",
                        LK: "JP-Tokyo",
                        SD: "EU-London",
                        SR: "BR-Brazil",
                        SJ: "EU-London",
                        SZ: "EU-London",
                        SE: "EU-London",
                        CH: "EU-London",
                        SY: "EU-London",
                        TW: "JP-Tokyo",
                        TJ: "JP-Tokyo",
                        TZ: "EU-London",
                        TH: "JP-Tokyo",
                        TL: "JP-Tokyo",
                        TG: "EU-London",
                        TK: "SG-Singapore",
                        TO: "SG-Singapore",
                        TT: "US-Atlanta",
                        TN: "EU-London",
                        TR: "TK-Turkey",
                        TM: "JP-Tokyo",
                        TC: "US-Atlanta",
                        TV: "SG-Singapore",
                        UG: "EU-London",
                        UA: "EU-London",
                        AE: "EU-London",
                        GB: "EU-London",
                        US: "US-Atlanta",
                        UM: "SG-Singapore",
                        VI: "US-Atlanta",
                        UY: "BR-Brazil",
                        UZ: "JP-Tokyo",
                        VU: "SG-Singapore",
                        VE: "BR-Brazil",
                        VN: "JP-Tokyo",
                        WF: "SG-Singapore",
                        EH: "EU-London",
                        YE: "JP-Tokyo",
                        ZM: "EU-London",
                        ZW: "EU-London"
                    },
                    L = null;
                d.connect = Ca;

                //UPDATE
                window.getDarkBool = function() {
                    return ta;
                }
                window.getMassBool = function() {
                    return lb;
                }

                window.getMemoryCells = function() {
                    return interNodes;
                }

                window.getCellsArray = function() {
                    return v;
                }

                window.getCells = function() {
                    return E;
                }

                window.getPlayer = function() {
                    return k;
                }

                window.getWidth = function() {
                    return m;
                }

                window.getHeight = function() {
                    return r;
                }

                window.getRatio = function() {
                    return h;
                }

                window.getOffsetX = function() {
                    return aa;
                }

                window.getOffsetY = function() {
                    return ba;
                }

                window.getX = function() {
                    return s;
                }

                window.getY = function() {
                    return t;
                }

                window.getPointX = function() {
                    return ia[0];
                }

                window.getPointY = function() {
                    return ja[0];
                }

                window.getMouseX = function() {
                    return fa;
                }

                window.getMouseY = function() {
                    return ga;
                }

                window.getMapStartX = function() {
                    return pa;
                }

                window.getMapStartY = function() {
                    return qa;
                }

                window.getMapEndX = function() {
                    return ra;
                }

                window.getMapEndY = function() {
                    return sa;
                }

                window.getScreenDistance = function() {
                    var temp = screenDistance();
                    return temp;
                }
                window.getLastUpdate = function() {
                    return C;
                }

                window.getCurrentScore = function() {
                    return R;
                }

                window.getMode = function() {
                    return P;
                }

                window.setPoint = function(x, y, index) {
                    while (ia.length > getPlayer().length) {
                        ia.pop();
                        ja.pop();
                    }
                    if (index < ia.length) {
                        ia[index] = x;
                        ja[index] = y;
                    } else {
                        while (index < ia.length - 1) {
                            ia.push(-1);
                            ja.push(-1);
                        }
                        ia.push(x);
                        ja.push(y);
                    }
                }

                window.setScore = function(a) {
                    sessionScore = a * 100;
                }

                window.setBestTime = function(a) {
                    bestTime = a;
                }

                window.best = function(a, b) {
                    setScore(a);
                    setBestTime(b);
                }

                window.setBotIndex = function(a) {
                    console.log("Changing bot");
                    botIndex = a;
                }

                window.setMessage = function(a) {
                    message = a;
                }

                var ma = 500,
                    eb = -1,
                    fb = -1,
                    z = null,
                    D = 1,
                    ua = null,
                    Ua = function() {
                        var a = Date.now(),
                            b = 1E3 / 60;
                        return function() {
                            d.requestAnimationFrame(Ua);
                            var c = Date.now(),
                                l = c - a;
                            l > b && (a = c - l % b, !T() || 240 > Date.now() - bb ? gb() : console.warn("Skipping draw"), Fb())
                        }
                    }(),
                    U = {},
                    ob = "notreallyabot;poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;chaplin;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin;belgium;luxembourg;stussy;prussia;8ch;argentina;scotland;sir;romania;belarus;wojak;doge;nasa;byzantium;imperial japan;french kingdom;somalia;turkey;mars;pokerface;8;irs;receita federal;facebook".split(";"),
                    Gb = ["8", "nasa"],
                    Hb = ["m'blob"];
                Ka.prototype = {
                    V: null,
                    x: 0,
                    y: 0,
                    i: 0,
                    b: 0
                };
                da.prototype = {
                    id: 0,
                    a: null,
                    name: null,
                    o: null,    
                    O: null,
                    x: 0,
                    y: 0,
                    size: 0,
                    s: 0,
                    t: 0,
                    r: 0,
                    J: 0,
                    K: 0,
                    q: 0,
                    ba: 0,
                    Q: 0,
                    sa: 0,
                    ia: 0,
                    G: !1,
                    h: !1,
                    n: !1,
                    R: !0,
                    Y: 0,
                    //UPDATE
                    updateCode: 0,
                    danger: false,
                    dangerTimeOut: 0,
                    isVirus: function() {
                        return this.h;
                    },
                    getUptimeTime: function() {
                        return this.Q;
                    }, 
                    X: function() {
                        var a;
                        for (a = 0; a < v.length; a++)
                            if (v[a] == this) {
                                v.splice(a, 1);
                                break
                            }
                        delete E[this.id];
                        a = k.indexOf(this); - 1 != a && (Ha = !0, k.splice(a, 1));
                        a = M.indexOf(this.id); - 1 != a && M.splice(a, 1);
                        this.G = !0;
                        0 < this.Y && Q.push(this)
                    },
                    l: function() {
                        return Math.max(~~(.3 * this.size), 24)
                    },
                    B: function(a) {
                        if (this.name = a) null ==
                            this.o ? this.o = new va(this.l(), "#FFFFFF", !0, "#000000") : this.o.M(this.l()), this.o.C(this.name)
                    },
                    W: function() {
                        for (var a = this.I(); this.a.length > a;) {
                            var b = ~~(Math.random() * this.a.length);
                            this.a.splice(b, 1)
                        }
                        for (0 == this.a.length && 0 < a && this.a.push(new Ka(this, this.x, this.y, this.size, Math.random() - .5)); this.a.length < a;) b = ~~(Math.random() * this.a.length), b = this.a[b], this.a.push(new Ka(this, b.x, b.y, b.i, b.b))
                    },
                    I: function() {
                        var a = 10;
                        20 > this.size && (a = 0);
                        this.h && (a = 30);
                        var b = this.size;
                        this.h || (b *= h);
                        b *= D;
                        this.ba &
                            32 && (b *= .25);
                        return ~~Math.max(b, a)
                    },
                    qa: function() {
                        this.W();
                        for (var a = this.a, b = a.length, c = 0; c < b; ++c) {
                            var d = a[(c - 1 + b) % b].b,
                                e = a[(c + 1) % b].b;
                            a[c].b += (Math.random() - .5) * (this.n ? 3 : 1);
                            a[c].b *= .7;
                            10 < a[c].b && (a[c].b = 10); - 10 > a[c].b && (a[c].b = -10);
                            a[c].b = (d + e + 8 * a[c].b) / 10
                        }
                        for (var p = this, g = this.h ? 0 : (this.id / 1E3 + C / 1E4) % (2 * Math.PI), c = 0; c < b; ++c) {
                            var f = a[c].i,
                                d = a[(c - 1 + b) % b].i,
                                e = a[(c + 1) % b].i;
                            if (15 < this.size && null != X && 20 < this.size * h && 0 < this.id) {
                                var k = !1,
                                    w = a[c].x,
                                    m = a[c].y;
                                X.ra(w - 5, m - 5, 10, 10, function(a) {
                                    a.V != p && 25 > (w -
                                        a.x) * (w - a.x) + (m - a.y) * (m - a.y) && (k = !0)
                                });
                                !k && (a[c].x < pa || a[c].y < qa || a[c].x > ra || a[c].y > sa) && (k = !0);
                                k && (0 < a[c].b && (a[c].b = 0), a[c].b -= 1)
                            }
                            f += a[c].b;
                            0 > f && (f = 0);
                            f = this.n ? (19 * f + this.size) / 20 : (12 * f + this.size) / 13;
                            a[c].i = (d + e + 8 * f) / 10;
                            d = 2 * Math.PI / b;
                            e = this.a[c].i;
                            this.h && 0 == c % 2 && (e += 5);
                            a[c].x = this.x + Math.cos(d * c + g) * e;
                            a[c].y = this.y + Math.sin(d * c + g) * e
                        }
                    },
                    P: function() {
                        if (0 >= this.id) return 1;
                        var a;
                        a = (C - this.Q) / 120;
                        a = 0 > a ? 0 : 1 < a ? 1 : a;
                        var b = 0 > a ? 0 : 1 < a ? 1 : a;
                        this.l();
                        if (this.G && 1 <= b) {
                            var c = Q.indexOf(this); - 1 != c && Q.splice(c, 1)
                        }
                        this.x =
                            a * (this.J - this.s) + this.s;
                        this.y = a * (this.K - this.t) + this.t;
                        this.size = b * (this.q - this.r) + this.r;
                        return b
                    },
                    N: function() {
                        return 0 >= this.id ? !0 : this.x + this.size + 40 < s - m / 2 / h || this.y + this.size + 40 < t - r / 2 / h || this.x - this.size - 40 > s + m / 2 / h || this.y - this.size - 40 > t + r / 2 / h ? !1 : !0
                    },
                    w: function(a) {
                        if (this.N()) {
                            ++this.Y;
                            var b = 0 < this.id && !this.h && !this.n && .4 > h;
                            5 > this.I() && (b = !0);
                            if (this.R && !b)
                                for (var c = 0; c < this.a.length; c++) this.a[c].i = this.size;
                            this.R = b;
                            a.save();
                            this.ia = C;
                            c = this.P();
                            this.G && (a.globalAlpha *= 1 - c);
                            a.lineWidth =
                                10;
                            a.lineCap = "round";
                            a.lineJoin = this.h ? "miter" : "round";
                            Oa ? (a.fillStyle = "#FFFFFF", a.strokeStyle = "#AAAAAA") : (a.fillStyle = this.color, a.strokeStyle = this.color);
                            if (b) a.beginPath(), a.arc(this.x, this.y, this.size + 5, 0, 2 * Math.PI, !1);
                            else {
                                this.qa();
                                a.beginPath();
                                var d = this.I();
                                a.moveTo(this.a[0].x, this.a[0].y);
                                for (c = 1; c <= d; ++c) {
                                    var e = c % d;
                                    a.lineTo(this.a[e].x, this.a[e].y)
                                }
                            }
                            a.closePath();
                            d = this.name.toLowerCase();
                            !this.n && kb && ":teams" != P ? -1 != ob.indexOf(d) ? (U.hasOwnProperty(d) || (U[d] = new Image, (d == "notreallyabot" ? U[d].src = "http://i.imgur.com/q5FdCkx.png" : U[d].src = "skins/" +
                                d + ".png")), c = 0 != U[d].width && U[d].complete ? U[d] : null) : c = null : c = null;
                            c = (e = c) ? -1 != Hb.indexOf(d) : !1;
                            b || a.stroke();
                            a.fill();
                            null == e || c || (a.save(), a.clip(), a.drawImage(e, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size), a.restore());
                            (Oa || 15 < this.size) && !b && (a.strokeStyle = "#000000", a.globalAlpha *= .1, a.stroke());
                            a.globalAlpha = 1;
                            null != e && c && a.drawImage(e, this.x - 2 * this.size, this.y - 2 * this.size, 4 * this.size, 4 * this.size);
                            c = -1 != k.indexOf(this);
                            b = ~~this.y;
                            if (0 != this.id && (wa || c) && this.name && this.o && (null ==
                                    e || -1 == Gb.indexOf(d))) {
                                e = this.o;
                                e.C(this.name);
                                e.M(this.l());
                                d = 0 >= this.id ? 1 : Math.ceil(10 * h) / 10;
                                e.ea(d);
                                var e = e.L(),
                                    p = ~~(e.width / d),
                                    g = ~~(e.height / d);
                                a.drawImage(e, ~~this.x - ~~(p / 2), b - ~~(g / 2), p, g);
                                b += e.height / 2 / d + 4
                            }
                            0 < this.id && lb && (c || 0 == k.length && (!this.h || this.n) && 20 < this.size) && (null == this.O && (this.O = new va(this.l() / 2, "#FFFFFF", !0, "#000000")), c = this.O, c.M(this.l() / 2), c.C(~~(this.size * this.size / 100)), d = Math.ceil(10 * h) / 10, c.ea(d), e = c.L(), p = ~~(e.width / d), g = ~~(e.height / d), a.drawImage(e, ~~this.x - ~~(p / 2),
                                b - ~~(g / 2), p, g));
                            a.restore()
                        }
                    }
                };
                va.prototype = {
                    F: "",
                    S: "#000000",
                    U: !1,
                    v: "#000000",
                    u: 16,
                    p: null,
                    T: null,
                    k: !1,
                    D: 1,
                    M: function(a) {
                        this.u != a && (this.u = a, this.k = !0)
                    },
                    ea: function(a) {
                        this.D != a && (this.D = a, this.k = !0)
                    },
                    setStrokeColor: function(a) {
                        this.v != a && (this.v = a, this.k = !0)
                    },
                    C: function(a) {
                        a != this.F && (this.F = a, this.k = !0)
                    },
                    L: function() {
                        null == this.p && (this.p = document.createElement("canvas"), this.T = this.p.getContext("2d"));
                        if (this.k) {
                            this.k = !1;
                            var a = this.p,
                                b = this.T,
                                c = this.F,
                                d = this.D,
                                e = this.u,
                                p = e + "px Ubuntu";
                            b.font =
                                p;
                            var g = ~~(.2 * e);
                            a.width = (b.measureText(c).width + 6) * d;
                            a.height = (e + g) * d;
                            b.font = p;
                            b.scale(d, d);
                            b.globalAlpha = 1;
                            b.lineWidth = 3;
                            b.strokeStyle = this.v;
                            b.fillStyle = this.S;
                            this.U && b.strokeText(c, 3, e - g / 2);
                            b.fillText(c, 3, e - g / 2)
                        }
                        return this.p
                    }
                };
                Date.now || (Date.now = function() {
                    return (new Date).getTime()
                });
                (function() {
                    for (var a = ["ms", "moz", "webkit", "o"], b = 0; b < a.length && !d.requestAnimationFrame; ++b) d.requestAnimationFrame = d[a[b] + "RequestAnimationFrame"], d.cancelAnimationFrame = d[a[b] + "CancelAnimationFrame"] || d[a[b] +
                        "CancelRequestAnimationFrame"];
                    d.requestAnimationFrame || (d.requestAnimationFrame = function(a) {
                        return setTimeout(a, 1E3 / 60)
                    }, d.cancelAnimationFrame = function(a) {
                        clearTimeout(a)
                    })
                })();
                var rb = {
                        ka: function(a) {
                            function b(a, b, c, d, e) {
                                this.x = a;
                                this.y = b;
                                this.j = c;
                                this.g = d;
                                this.depth = e;
                                this.items = [];
                                this.c = []
                            }
                            var c = a.ma || 2,
                                d = a.na || 4;
                            b.prototype = {
                                x: 0,
                                y: 0,
                                j: 0,
                                g: 0,
                                depth: 0,
                                items: null,
                                c: null,
                                H: function(a) {
                                    for (var b = 0; b < this.items.length; ++b) {
                                        var c = this.items[b];
                                        if (c.x >= a.x && c.y >= a.y && c.x < a.x + a.j && c.y < a.y + a.g) return !0
                                    }
                                    if (0 !=
                                        this.c.length) {
                                        var d = this;
                                        return this.$(a, function(b) {
                                            return d.c[b].H(a)
                                        })
                                    }
                                    return !1
                                },
                                A: function(a, b) {
                                    for (var c = 0; c < this.items.length; ++c) b(this.items[c]);
                                    if (0 != this.c.length) {
                                        var d = this;
                                        this.$(a, function(c) {
                                            d.c[c].A(a, b)
                                        })
                                    }
                                },
                                m: function(a) {
                                    0 != this.c.length ? this.c[this.Z(a)].m(a) : this.items.length >= c && this.depth < d ? (this.ha(), this.c[this.Z(a)].m(a)) : this.items.push(a)
                                },
                                Z: function(a) {
                                    return a.x < this.x + this.j / 2 ? a.y < this.y + this.g / 2 ? 0 : 2 : a.y < this.y + this.g / 2 ? 1 : 3
                                },
                                $: function(a, b) {
                                    return a.x < this.x + this.j / 2 &&
                                        (a.y < this.y + this.g / 2 && b(0) || a.y >= this.y + this.g / 2 && b(2)) || a.x >= this.x + this.j / 2 && (a.y < this.y + this.g / 2 && b(1) || a.y >= this.y + this.g / 2 && b(3)) ? !0 : !1
                                },
                                ha: function() {
                                    var a = this.depth + 1,
                                        c = this.j / 2,
                                        d = this.g / 2;
                                    this.c.push(new b(this.x, this.y, c, d, a));
                                    this.c.push(new b(this.x + c, this.y, c, d, a));
                                    this.c.push(new b(this.x, this.y + d, c, d, a));
                                    this.c.push(new b(this.x + c, this.y + d, c, d, a));
                                    a = this.items;
                                    this.items = [];
                                    for (c = 0; c < a.length; c++) this.m(a[c])
                                },
                                clear: function() {
                                    for (var a = 0; a < this.c.length; a++) this.c[a].clear();
                                    this.items.length =
                                        0;
                                    this.c.length = 0
                                }
                            };
                            var e = {
                                x: 0,
                                y: 0,
                                j: 0,
                                g: 0
                            };
                            return {
                                root: new b(a.ca, a.da, a.oa - a.ca, a.pa - a.da, 0),
                                m: function(a) {
                                    this.root.m(a)
                                },
                                A: function(a, b) {
                                    this.root.A(a, b)
                                },
                                ra: function(a, b, c, d, f) {
                                    e.x = a;
                                    e.y = b;
                                    e.j = c;
                                    e.g = d;
                                    this.root.A(e, f)
                                },
                                H: function(a) {
                                    return this.root.H(a)
                                },
                                clear: function() {
                                    this.root.clear()
                                }
                            }
                        }
                    },
                    db = function() {
                        var a = new da(0, 0, 0, 32, "#ED1C24", ""),
                            b = document.createElement("canvas");
                        b.width = 32;
                        b.height = 32;
                        var c = b.getContext("2d");
                        return function() {
                            0 < k.length && (a.color = k[0].color, a.B(k[0].name));
                            c.clearRect(0,
                                0, 32, 32);
                            c.save();
                            c.translate(16, 16);
                            c.scale(.4, .4);
                            a.w(c);
                            c.restore();
                            var d = document.getElementById("favicon"),
                                e = d.cloneNode(!0);
                            //UPDATE -- NO IDEA WHAT I JUST DID THERE!
                            //e.setAttribute("href", b.toDataURL("image/png"));
                            d.parentNode.replaceChild(e, d)
                        }
                    }();
                e(function() {
                    db()
                });
                e(function() {
                    +d.localStorage.wannaLogin && (d.localStorage.loginCache && jb(d.localStorage.loginCache), d.localStorage.fbPictureCache && e(".agario-profile-picture").attr("src", d.localStorage.fbPictureCache))
                });
                d.facebookLogin = function() {
                    d.localStorage.wannaLogin = 1
                };
                d.fbAsyncInit =
                    function() {
                        function a() {
                            d.localStorage.wannaLogin = 1;
                            null == d.FB ? alert("You seem to have something blocking Facebook on your browser, please check for any extensions") : d.FB.login(function(a) {
                                La(a)
                            }, {
                                scope: "public_profile, email"
                            })
                        }
                        d.FB.init({
                            appId: "677505792353827",
                            cookie: !0,
                            xfbml: !0,
                            status: !0,
                            version: "v2.2"
                        });
                        d.FB.Event.subscribe("auth.statusChange", function(b) {
                            +d.localStorage.wannaLogin && ("connected" == b.status ? La(b) : a())
                        });
                        d.facebookLogin = a
                    };
                d.logout = function() {
                    B = null;
                    e("#helloContainer").attr("data-logged-in",
                        "0");
                    e("#helloContainer").attr("data-has-account-data", "0");
                    delete d.localStorage.wannaLogin;
                    delete d.localStorage.loginCache;
                    delete d.localStorage.fbPictureCache;
                    I()
                };
                var Fb = function() {
                    function a(a, b, c, d, e) {
                        var f = b.getContext("2d"),
                            h = b.width;
                        b = b.height;
                        a.color = e;
                        a.B(c);
                        a.size = d;
                        f.save();
                        f.translate(h / 2, b / 2);
                        a.w(f);
                        f.restore()
                    }
                    var b = new da(0, 0, 0, 32, "#5bc0de", "");
                    b.id = -1;
                    var c = new da(0, 0, 0, 32, "#5bc0de", "");
                    c.id = -1;
                    var d = document.createElement("canvas");
                    d.getContext("2d");
                    d.width = d.height = 70;
                    a(c, d,
                        "", 26, "#ebc0de");
                    return function() {
                        e(".cell-spinner").filter(":visible").each(function() {
                            var c = e(this),
                                f = Date.now(),
                                g = this.width,
                                h = this.height,
                                k = this.getContext("2d");
                            k.clearRect(0, 0, g, h);
                            k.save();
                            k.translate(g / 2, h / 2);
                            for (var m = 0; 10 > m; ++m) k.drawImage(d, (.1 * f + 80 * m) % (g + 140) - g / 2 - 70 - 35, h / 2 * Math.sin((.001 * f + m) % Math.PI * 2) - 35, 70, 70);
                            k.restore();
                            (c = c.attr("data-itr")) && (c = Z(c));
                            a(b, this, c || "", +e(this).attr("data-size"), "#5bc0de")
                        })
                    }
                }();
                d.createParty = function() {
                    Y(":party");
                    L = function(a) {
                        Ma("/#" + d.encodeURIComponent(a));
                        e(".partyToken").val("agar.io/#" + d.encodeURIComponent(a));
                        e("#helloContainer").attr("data-party-state", "1")
                    };
                    I()
                };
                d.joinParty = Wa;
                d.cancelParty = function() {
                    Ma("/");
                    e("#helloContainer").attr("data-party-state", "0");
                    Y("");
                    I()
                };
                e(function() {
                    e(pb)
                })
            }
        }
    }
})(window, window.jQuery);

(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'apos');

apos('create', 'UA-64394184-1', 'auto');
apos('send', 'pageview');

window.ignoreStream = false;
window.refreshTwitch = function() {
    $.ajax({
        url: "https://api.twitch.tv/kraken/streams/apostolique",
        cache: false,
        dataType: "jsonp"
    }).done(function(data) {
        if (data["stream"] == null) {
            //console.log("Apostolique is not online!");
            window.setMessage([]);
            window.onmouseup = function() {};
            window.ignoreStream = false;
        } else {
            //console.log("Apostolique is online!");
            if (!window.ignoreStream) {
                window.setMessage(["twitch.tv/apostolique is online right now!", "Click the screen to open the stream!", "Press E to ignore."]);
                window.onmouseup = function() {
                    window.open("http://www.twitch.tv/apostolique");
                };
            }
        }
    }).fail(function() {});
}
setInterval(window.refreshTwitch, 60000);
window.refreshTwitch();
