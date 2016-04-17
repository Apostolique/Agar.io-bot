/*The MIT License (MIT)
Copyright (c) 2015 Apostolique
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/
// ==UserScript==
// @name        AposLauncher
// @namespace   AposLauncher
// @include     http://agar.io/*
<<<<<<< HEAD
// @version     5.030
// @grant       none
// @author      http://www.twitch.tv/apostolique
// ==/UserScript==
var aposLauncherVersion = 5.030;
=======
// @version     5.010
// @grant       none
// @author      http://www.twitch.tv/apostolique
// ==/UserScript==
var aposLauncherVersion = 5.010;
>>>>>>> master

var showAd = true;

Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
};

Array.prototype.peek = function() {
    return this[this.length - 1];
};
var sha = "efde0488cc2cc176db48dd23b28a20b90314352b";

function getLatestCommit() {
    window.jQuery.ajax({
        url: "https://api.github.com/repos/apostolique/Agar.io-bot/git/refs/heads/master",
        cache: false,
        dataType: "jsonp"
    }).done(function(data) {
        console.dir(data.data);
        console.log("hmm: " + data.data.object.sha);
        sha = data.data.object.sha;

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

function addAd() {
    window.google_ad_client = "ca-pub-5878021809689194";
    window.google_ad_slot = "1479874665";
    window.google_ad_width = 300;
    window.google_ad_height = 250;

    window.jQuery(".side-container:last").append("<div class='agario-panel'><center id='aposAd'></center></div>");
    var aposAd = document.getElementById('aposAd');
    var w = document.write;
    document.write = function(content) {
        aposAd.innerHTML = content;
        document.write = w;
    };

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://pagead2.googlesyndication.com/pagead/show_ads.js';
    document.body.appendChild(script);
}

if (showAd) {
    addAd();
}
(function(c, e) {
    function vc() {
        for (var a = document.cookie.split(";"), b = 0; b < a.length; b++) {
            for (var d = a[b];
                " " == d.charAt(0);) d = d.substring(1, d.length);
            if (0 == d.indexOf("agario_redirect=")) return d.substring(16, d.length)
        }
        return null
    }

    function qa(a, b) {
        if (b) {
            var d = new Date;
            d.setTime(d.getTime() + 864E5 * b);
            d = "; expires=" + d.toGMTString()
        } else d = "";
        document.cookie = "agario_redirect=" + a + d + "; path=/"
    }
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
        window.botList[botIndex].keyAction(e);
    }
    //UPDATE
    function humanPlayer() {
        //Don't need to do anything.
        return [getPointX(), getPointY()];
    }


    function Lb() {
        //UPDATE

        window.botList = window.botList || [];

        window.jQuery('#nick').val(originalName);

        function HumanPlayerObject() {
            this.name = "Human";
            this.keyAction = function(key) {};
            this.displayText = function() {
                return [];
            };
            this.mainLoop = humanPlayer;
        }

        var hpo = new HumanPlayerObject();

        window.botList.push(hpo);

        window.updateBotList();

        ab = !0;
        Ob();
        setInterval(Ob, 18E4);

        var father = window.jQuery("#canvas").parent();
        window.jQuery("#canvas").remove();
        father.prepend("<canvas id='canvas1'>");
        $b();

        O = Ab = document.getElementById("canvas1");
        f = O.getContext("2d");
        //UPDATE 
        O.onmousedown = function(a) {
            if (gc) {
                var b = a.clientX - (5 + q / 5 / 2),
                    c = a.clientY - (5 + q / 5 / 2);
                if (Math.sqrt(b * b + c * c) <= q / 5 / 2) {
                    Ka();
                    H(17);
                    return
                }
            }
            Y = 1 * a.clientX;
            Z = 1 * a.clientY;
            $a();
            Ka();
        };
        //UPDATE
        O.onmousemove = function(a) {
            Xa = !1;
            Y = 1 * a.clientX;
            Z = 1 * a.clientY;
            $a()
        };
        O.onmouseup = function() {};
        /firefox/i.test(navigator.userAgent) ? document.addEventListener("DOMMouseScroll", Nb, !1) : document.body.onmousewheel = Nb
        c.onkeydown = function(a) {
            //UPDATE
            if (!window.jQuery('#nick').is(":focus")) {
                32 != a.keyCode || ra || ("nick" != a.target.id && a.preventDefault(), Za(), ra = !0);
                81 == a.keyCode && (X(18), sa = !0);
                87 != a.keyCode || ta || (Mb(), ta = !0);
                27 == a.keyCode && (a.preventDefault(), ua(300), e("#oferwallContainer").is(":visible") && c.closeOfferwall(), e("#videoContainer").is(":visible") && c.closeVideoContainer())
                    //UPDATE
                keyAction(a);
            }
        };
        c.onkeyup = function(a) {
            32 == a.keyCode && (ra = !1);
            87 == a.keyCode && (ta = !1);
            81 == a.keyCode && sa && (X(19), sa = !1)
        }
    }

    function Nb(a) {
        a.preventDefault();
        P *= Math.pow(.9, a.wheelDelta / -120 || a.detail || 0);
        console.log("P: " + P)
<<<<<<< HEAD
        //UPDATE
        0.07 > P && (P = 0.07);
=======
            //UPDATE
        1 > P && (P = 0.07);
>>>>>>> master
        P > 4 / r && (P = 4 / r)
    }

    function wc() {
        if (.4 > r) ia = null;
        else {
            for (var a = Number.POSITIVE_INFINITY, b = Number.POSITIVE_INFINITY, d = Number.NEGATIVE_INFINITY, c = Number.NEGATIVE_INFINITY, g = 0; g < z.length; g++) {
                var e = z[g];
                !e.P() || e.V || 20 >= e.size * r || (a = Math.min(e.x - e.size, a), b = Math.min(e.y - e.size, b), d = Math.max(e.x + e.size, d), c = Math.max(e.y + e.size, c))
            }
            ia = xc.init({
                Ba: a - 10,
                Ca: b - 10,
                za: d + 10,
                Aa: c + 10,
                Ja: 2,
                Ka: 4
            });
            for (g = 0; g < z.length; g++)
                if (e = z[g], e.P() && !(20 >= e.size * r))
                    for (a = 0; a < e.a.length; ++a) b = e.a[a].x, d = e.a[a].y, b < A - q / 2 / r || d < B - u / 2 / r || b > A + q / 2 / r || d > B + u / 2 / r || ia.va(e.a[a])
        }
    }

    function $a() {
<<<<<<< HEAD
        //UPDATE
        if (toggle || window.botList[botIndex].name == "Human") {
            setPoint((Y - q / 2) / r + A, (Z - u / 2) / r + B);
        }
=======
        va = (Y - q / 2) / r + A;
        wa = (Z - u / 2) / r + B
>>>>>>> master
    }

    function Ob() {
        null == xa && (xa = {}, e("#region").children().each(function() {
            var a = e(this),
                b = a.val();
            b && (xa[b] = a.text())
        }));
        e.get(ya + "info", function(a) {
            var b = {},
                d;
            for (d in a.regions) {
                var c = d.split(":")[0];
                b[c] = b[c] || 0;
                b[c] += a.regions[d].numPlayers
            }
            for (d in b) e('#region option[value="' + d + '"]').text(xa[d] + " (" + b[d] + " players)")
        }, "json")
    }

    function Pb() {
        e("#adsBottom").hide();
        e("#overlays").hide();
        e("#stats").hide();
        e("#mainPanel").hide();
        aa = ja = !1;
        Qb();
        c.destroyAd(c.adSlots.aa);
        c.destroyAd(c.adSlots.ac)
    }

    function za(a) {
        a && (a == K ? e(".btn-needs-server").prop("disabled", !1) : (e("#region").val() != a && e("#region").val(a), K = c.localStorage.location = a, e(".region-message").hide(), e(".region-message." + a).show(), e(".btn-needs-server").prop("disabled", !1), ab && Q()))
    }

    function ua(a) {
        ja || aa || (Aa ? e(".btn-spectate").prop("disabled", !0) : e(".btn-spectate").prop("disabled", !1), Ba = !1, N = null, bb || (e("#adsBottom").show(), e("#g300x250").hide(), e("#a300x250").show(), e("#g728x90").hide(), e("#a728x90").show()), c.refreshAd(bb ? c.adSlots.ac : c.adSlots.aa), bb = !1, 1E3 > a && (C = 1), ja = !0, e("#mainPanel").show(), 0 < a ? e("#overlays").fadeIn(a) : e("#overlays").show())
    }

    function ka(a) {
        e("#helloContainer").attr("data-gamemode", a);
        Ca = a;
        e("#gamemode").val(a)
    }

    function Qb() {
        e("#region").val() ? c.localStorage.location = e("#region").val() : c.localStorage.location && e("#region").val(c.localStorage.location);
        e("#region").val() ? e("#locationKnown").append(e("#region")) : e("#locationUnknown").append(e("#region"))
    }

    function cb(a) {
        "env_local" in EnvConfig ? "true" == EnvConfig.load_local_configuration ? c.MC.updateConfigurationID("base") : c.MC.updateConfigurationID(EnvConfig.configID) : c.MC.updateConfigurationID(a)
<<<<<<< HEAD
    }

    function yc() {
        "configID" in E ? cb(E.configID) : e.get(ya + "getLatestID", function(a) {
            cb(a);
            c.localStorage.last_config_id = a
        }).fail(function() {
            var a;
            if (a = "last_config_id" in c.localStorage) a = c.localStorage.last_config_id, a = !(null == a || void 0 == a || "" === a);
            a && (a = c.localStorage.last_config_id, console.log("Fallback to stored configID: " + a), cb(a))
        })
    }

    function zc() {
        e.get(db + "//gc.agar.io", function(a) {
            var b = a.split(" ");
            a = b[0];
            b = b[1] || ""; - 1 == ["UA"].indexOf(a) && Rb.push("ussr");
            la.hasOwnProperty(a) && ("string" == typeof la[a] ? K || za(la[a]) : la[a].hasOwnProperty(b) && (K || za(la[a][b])))
        }, "text")
    }

=======
    }

    function yc() {
        "configID" in E ? cb(E.configID) : e.get(ya + "getLatestID", function(a) {
            cb(a);
            c.localStorage.last_config_id = a
        }).fail(function() {
            var a;
            if (a = "last_config_id" in c.localStorage) a = c.localStorage.last_config_id, a = !(null == a || void 0 == a || "" === a);
            a && (a = c.localStorage.last_config_id, console.log("Fallback to stored configID: " + a), cb(a))
        })
    }

    function zc() {
        e.get(db + "//gc.agar.io", function(a) {
            var b = a.split(" ");
            a = b[0];
            b = b[1] || ""; - 1 == ["UA"].indexOf(a) && Rb.push("ussr");
            la.hasOwnProperty(a) && ("string" == typeof la[a] ? K || za(la[a]) : la[a].hasOwnProperty(b) && (K || za(la[a][b])))
        }, "text")
    }

>>>>>>> master
    function R(a) {
        return c.i18n[a] || c.i18n_dict.en[a] || a
    }

    function Sb() {
        var a = ++eb;
        Tb();
        e.ajax(ya + "findServer", {
            error: function() {
                console.log("Failed to get server. Will retry in 30 seconds");
                setTimeout(Sb, 3E4)
            },
            success: function(b) {
                if (a == eb) {
                    b.alert && alert(b.alert);
                    var d = b.ip;
                    "game_server_port" in EnvConfig && (d = c.location.hostname + ":" + EnvConfig.game_server_port);
                    fb("ws" + (gb ? "s" : "") + "://" + d, b.token)
                }
            },
            dataType: "json",
            method: "POST",
            cache: !1,
            crossDomain: !0,
            data: (K + Ca || "?") + "\n154669603"
        })
    }

    function Q() {
        ab && K && (e("#connecting").show(), Sb())
    }

    function Tb() {
        if (x) {
            x.onopen = null;
            x.onmessage = null;
            x.onclose = null;
            try {
                x.close()
            } catch (a) {}
            x = null
        }
    }

    function fb(a, b) {
        Tb();
        E.ip && (a = "ws" + (gb ? "s" : "") + "://" + E.ip);
        if (null != S) {
            var d = S;
            S = function() {
                d(b)
            }
        }
        if (gb && !EnvConfig.env_development && !EnvConfig.env_local) {
            var c = a.split(":");
            a = "wss://ip-" + c[1].replace(/\./g, "-").replace(/\//g, "") + ".tech.agar.io:" + +c[2]
        }
        G = [];
        t = [];
        L = {};
        z = [];
        ba = [];
        D = [];
        H = I = null;
        T = 0;
        ma = !1;
        m.cache.sentGameServerLogin = !1;
        //UPDATE
        console.log("Connecting to " + a);
        serverIP = a;
        x = new WebSocket(a);
        x.binaryType = "arraybuffer";
        x.onopen = function() {
            var a;
            Da = y = Date.now();
            na = 120;
            Ea = 0;
            console.log("socket open");
            a = U(5);
            a.setUint8(0, 254);
            a.setUint32(1, 5, !0);
            V(a);
            a = U(5);
            a.setUint8(0, 255);
            a.setUint32(1, 154669603, !0);
            V(a);
            a = U(1 + b.length);
            a.setUint8(0, 80);
            for (var d = 0; d < b.length; ++d) a.setUint8(d + 1, b.charCodeAt(d));
            V(a);
            m.core.proxy.onSocketOpen()
        };
        x.onmessage = Ac;
        x.onclose = Bc;
        x.onerror = function() {
            console.log(hb.la() + " socket error", arguments)
        }
    }

    function U(a) {
        return new DataView(new ArrayBuffer(a))
    }

    function V(a) {
        x.send(a.buffer)
    }

    function Bc() {
        ma && (Fa = 500);
        m.core.proxy.onSocketClosed();
        console.log(hb.la() + " socket close");
        setTimeout(Q, Fa);
        Fa *= 2
    }

    function Ac(a) {
        Cc(new DataView(a.data))
    }

    function Cc(a) {
        function b() {
            for (var b = "";;) {
                var c = a.getUint16(d, !0);
                d += 2;
                if (0 == c) break;
                b += String.fromCharCode(c)
            }
            return b
        }
        var d = 0;
        if (240 == a.getUint8(d)) Ga();
        else switch (a.getUint8(d++)) {
            case 16:
                Dc(a, d);
                break;
            case 17:
                ib = a.getFloat32(d, !0);
                d += 4;
                jb = a.getFloat32(d, !0);
                d += 4;
                kb = a.getFloat32(d, !0);
                d += 4;
                break;
            case 18:
                G = [];
                t = [];
                L = {};
                z = [];
                break;
            case 20:
                t = [];
                G = [];
                break;
            case 21:
                lb = a.getInt16(d, !0);
                d += 2;
                mb = a.getInt16(d, !0);
                d += 2;
                nb || (nb = !0, Ha = lb, Ia = mb);
                break;
            case 32:
                G.push(a.getUint32(d, !0));
                d += 4;
                break;
            case 49:
                if (null != I) break;
                var v = a.getUint32(d, !0),
                    d = d + 4;
                D = [];
                for (var g = 0; g < v; ++g) {
                    var e = a.getUint32(d, !0),
                        d = d + 4;
                    D.push({
                        id: e,
                        name: b()
                    })
                }
                Ub();
                break;
            case 50:
                I = [];
                v = a.getUint32(d, !0);
                d += 4;
                for (g = 0; g < v; ++g) I.push(a.getFloat32(d, !0)), d += 4;
                Ub();
                break;
            case 64:
                ob = a.getFloat64(d, !0);
                d += 8;
                pb = a.getFloat64(d, !0);
                d += 8;
                qb = a.getFloat64(d, !0);
                d += 8;
                rb = a.getFloat64(d, !0);
                d += 8;
                a.byteLength > d && (v = a.getUint32(d, !0), d += 4, sb = !!(v & 1), tb = b(), c.MC.updateServerVersion(tb), console.log("Server version " + tb));
                break;
            case 102:
                v = a.buffer.slice(d);
                m.core.proxy.forwardProtoMessage(v);
                break;
            case 104:
                c.logout()
        }
    }

    function Dc(a, b) {
        function d() {
            for (var d = "";;) {
                var c = a.getUint16(b, !0);
                b += 2;
                if (0 == c) break;
                d += String.fromCharCode(c)
            }
            return d
        }

        function v() {
            for (var d = "";;) {
                var c = a.getUint8(b++);
                if (0 == c) break;
                d += String.fromCharCode(c)
            }
            return d
        }
        y = Date.now();
        var g = y - Da;
        Da = y;
        na = Ec * na + Fc * g;
        Ea = Gc * Ea + Hc * Math.abs(g - na);
        m.core.debug && (m.debug.updateChart("networkUpdate", y, g), m.debug.updateChart("rttMean", y, na), m.debug.updateChart("rttSDev", y, Ea));
        ma || (ma = !0, e("#connecting").hide(), Vb(), S && (S(), S = null));
        ub = !1;
        g = a.getUint16(b, !0);
        b += 2;
        for (var p = 0; p < g; ++p) {
            var M = L[a.getUint32(b, !0)],
                l = L[a.getUint32(b + 4, !0)];
            b += 8;
            M && l && (l.ca(), l.s = l.x, l.u = l.y, l.o = l.size, l.pa(M.x, M.y), l.g = l.size, l.T = y, Ic(M, l))
        }
        for (p = 0;;) {
            g = a.getUint32(b, !0);
            b += 4;
            if (0 == g) break;
            ++p;
            var vb, M = a.getInt32(b, !0);
            b += 4;
            l = a.getInt32(b, !0);
            b += 4;
            vb = a.getInt16(b, !0);
            b += 2;
            var n = a.getUint8(b++),
                f = a.getUint8(b++),
                h = a.getUint8(b++),
                f = Jc(n << 16 | f << 8 | h),
                h = a.getUint8(b++),
                k = !!(h & 1),
                r = !!(h & 16),
                q = null;
            h & 2 && (b += 4 + a.getUint32(b, !0));
            h & 4 && (q = v());
            var u = d(),
                n = null;
            L.hasOwnProperty(g) ? (n = L[g], n.S(), n.s = n.x, n.u = n.y, n.o = n.size, n.color = f) : (n = new ca(g, M, l, vb, f, u), z.push(n), L[g] = n);
            n.c = k;
            n.h = r;
            n.pa(M, l);
            n.g = vb;
            n.T = y;
            n.ea = h;
            q && (n.C = q);
            //UPDATE
            u && n.A(u); - 1 != G.indexOf(g) && -1 == t.indexOf(n) && (t.push(n), n.birth = getLastUpdate(), n.birthMass = (n.size * n.size / 100), n.I = !0, 1 == t.length && (n.wa = !0, A = n.x, B = n.y, Wb(), document.getElementById("overlays").style.display = "none", F = [], wb = 0, xb = t[0].color, Aa = !0, Ja = Date.now(), W = yb = zb = 0))
                //UPDATE
            interNodes[g] = window.getCells()[g];
        }
        //UPDATE
        Object.keys(interNodes).forEach(function(element, index) {
            //console.log("start: " + interNodes[element].updateTime + " current: " + h.detail + " life: " + (h.detail - interNodes[element].updateTime));
            var isRemoved = !window.getCells().hasOwnProperty(element);

            //console.log("Time not updated: " + (window.getLastUpdate() - interNodes[element].getUptimeTime()));
            if (isRemoved && (window.getLastUpdate() - interNodes[element].getUptimeTime()) > 3000) {
                delete interNodes[element];
            } else {
                if (isRemoved &&
                    interNodes[element].x > (getX() - (1920 / 2) / getZoomlessRatio()) &&
                    interNodes[element].x < (getX() + (1920 / 2) / getZoomlessRatio()) &&
                    interNodes[element].y > getY() - (1080 / 2) / getZoomlessRatio() &&
                    interNodes[element].y < getY() + (1080 / 2) / getZoomlessRatio()) {

                    delete interNodes[element];
                }
            }
        });
        M = a.getUint32(b, !0);
        b += 4;
        for (p = 0; p < M; p++) g = a.getUint32(b, !0), b += 4, n = L[g], null != n && n.ca();
        ub && 0 == t.length && (0 == c.MC.isUserLoggedIn() ? Ga() : Xb = setTimeout(Ga, 2E3))
    }

    //UPDATE
    function computeDistance(x1, y1, x2, y2) {
        var xdis = x1 - x2; // <--- FAKE AmS OF COURSE!
        var ydis = y1 - y2;
        var distance = Math.sqrt(xdis * xdis + ydis * ydis);

        return distance;
    }
    //UPDATE    
    /**
     * Some horse shit of some sort.
     * @return Horse Shit
     */
    function screenDistance() {
        return Math.min(computeDistance(getOffsetX(), getOffsetY(), screenToGameX(getWidth()), getOffsetY()), computeDistance(getOffsetX(), getOffsetY(), getOffsetX(), screenToGameY(getHeight())));
    }

    window.verticalDistance = function() {
        return computeDistance(screenToGameX(0), screenToGameY(0), screenToGameX(getWidth()), screenToGameY(getHeight()));
    }

    /**
     * A conversion from the screen's horizontal coordinate system
     * to the game's horizontal coordinate system.
     * @param x in the screen's coordinate system
     * @return x in the game's coordinate system
     */
    window.screenToGameX = function(x) {
        return (x - getWidth() / 2) / getRatio() + getX();
    }

    /**
     * A conversion from the screen's vertical coordinate system
     * to the game's vertical coordinate system.
     * @param y in the screen's coordinate system
     * @return y in the game's coordinate system
     */
    window.screenToGameY = function(y) {
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

    function Ka() {
        //UPDATE
        if (firstStart) {
            Uc(false);
        }

        if (getPlayer().length == 0 && !reviving && ~~(getCurrentScore() / 100) > 0) {
            console.log("Dead: " + ~~(getCurrentScore() / 100));
            apos('send', 'pageview');
        }

        if (getPlayer().length == 0 && !firstStart) {
            console.log("Revive");
            setNick(originalName);
            reviving = true;
        } else if (getPlayer().length > 0 && reviving) {
            reviving = false;
            console.log("Done Reviving!");
        }

        if (da()) {
            var a = Y - q / 2,
                b = Z - u / 2;
            64 > a * a + b * b || .01 > Math.abs(Yb - va) && .01 > Math.abs(Zb - wa) || (Yb = va, Zb = wa, a = U(13), a.setUint8(0, 16), a.setInt32(1, va, !0), a.setInt32(5, wa, !0), a.setUint32(9, 0, !0), V(a))
        }
    }

    function Vb() {
        if (da() && ma && null != N) {
            var a = U(1 + 2 * N.length);
            a.setUint8(0, 0);
            for (var b = 0; b < N.length; ++b) a.setUint16(1 + 2 * b, N.charCodeAt(b), !0);
            V(a);
            N = null;
            Ba = !0
        }
    }

    function Za() {
        Ka();
        X(17)
    }

    function Mb() {
        Ka();
        X(21)
    }

    function da() {
        return null != x && x.readyState == x.OPEN
    }

    function X(a) {
        if (da()) {
            var b = U(1);
            b.setUint8(0, a);
            V(b)
        }
    }

    function Kc(a) {
        "auto" == a.toLowerCase() ? h.auto = !0 : (m.renderSettings.selected = m.renderSettings[a.toLowerCase()], h.auto = !1)
    }

    function $b() {
        q = 1 * c.innerWidth;
        u = 1 * c.innerHeight;
        Ab.width = O.width = q;
        Ab.height = O.height = u;
        var a = e("#helloContainer");
        a.css("transform", "none");
        var b = a.height(),
            d = c.innerHeight;
        0 != b / 2 % 2 && (b++, a.height(b));
        b > d / 1.1 ? a.css("transform", "translate(-50%, -50%) scale(" + d / b / 1.1 + ")") : a.css("transform", "translate(-50%, -50%)");
        ac()
    }

    function bc() {
        var a;
        a = 1 * Math.max(u / 1080, q / 1920);
        return a *= P
    }

    //UPDATE
    function bc2() {
        var a;
        a = 1 * Math.max(u / 1080, q / 1920);
        return a;
    }

    function Lc() {
        if (0 != t.length) {
            for (var a = 0, b = 0; b < t.length; b++) a += t[b].size;
            r = (9 * r + Math.pow(Math.min(64 / a, 1), .4) * bc()) /
                10;
            //UPDATE
            var r2 = (9 * r + Math.pow(Math.min(64 / a, 1), .4) * bc2()) / 10;
        }
    }

    function ac() {
        //UPDATE
        console.log("Update rendering");
        dPoints = [];
        circles = [];
        dArc = [];
        dText = [];
        lines = [];
        var a, b = Date.now();
        ++Mc;
        cc && (++La, 180 < La && (La = 0));
        y = b;
        if (0 < t.length) {
            Lc();
            for (var d = a = 0, c = 0; c < t.length; c++) t[c].S(), a += t[c].x / t.length, d += t[c].y / t.length;
            ib = a;
            jb = d;
            kb = r;
            A = (A + a) / 2;
            B = (B + d) / 2
                //UPDATE
        } else A = (5 * A + ib) / 6, B = (5 * B + jb) / 6, r = (9 * r + kb * bc()) / 10, r2 = (9 * r + kb * bc2()) / 10;
        wc();
        $a();
        Bb || f.clearRect(0, 0, q, u);
        Bb ? (f.fillStyle = ea ? "#111111" : "#F2FBFF", f.globalAlpha = .05, f.fillRect(0, 0, q, u), f.globalAlpha = 1) : Nc();
        z.sort(function(a, b) {
            return a.size == b.size ? a.id - b.id : a.size - b.size
        });
        f.save();
        f.translate(q / 2, u / 2);
        f.scale(r, r);
        f.translate(-A, -B);
        for (c = 0; c < ba.length; c++) ba[c].w(f);
        for (c = 0; c < z.length; c++) z[c].w(f);
        //UPDATE
        if (getPlayer().length > 0) {
            var moveLoc = window.botList[botIndex].mainLoop();
            if (!toggle) {
                setPoint(moveLoc[0], moveLoc[1]);
            }
        }
        customRender(f);
        if (nb) {
            Ha = (3 * Ha + lb) / 4;
            Ia = (3 * Ia + mb) / 4;
            f.save();
            f.strokeStyle = "#FFAAAA";
            f.lineWidth = 10;
            f.lineCap = "round";
            f.lineJoin = "round";
            f.globalAlpha = .5;
            f.beginPath();
            for (c = 0; c < t.length; c++) f.moveTo(t[c].x, t[c].y), f.lineTo(Ha, Ia);
            f.stroke();
            f.restore()
        }
        f.restore();
        H && H.width && f.drawImage(H, q - H.width - 10, 10);
        T = Math.max(T, dc());
        //UPDATE

        var currentDate = new Date();

        var nbSeconds = 0;
        if (getPlayer().length > 0) {
            //nbSeconds = currentDate.getSeconds() + currentDate.getMinutes() * 60 + currentDate.getHours() * 3600 - lifeTimer.getSeconds() - lifeTimer.getMinutes() * 60 - lifeTimer.getHours() * 3600;
            nbSeconds = (currentDate.getTime() - lifeTimer.getTime()) / 1000;
        }

        bestTime = Math.max(nbSeconds, bestTime);

        var displayText = 'Score: ' + ~~(Z / 100) + " Current Time: " + nbSeconds + " seconds.";

<<<<<<< HEAD
        0 != T && (null == Ma && (Ma = new Na(24, "#FFFFFF")), Ma.B(displayText), d = Ma.N(), a = d.width, f.globalAlpha =
=======
        0 != T && (null == Ma && (Ma = new Na(24, "#FFFFFF")), Ma.B(R("score") + ": " + ~~(T / 100)), d = Ma.N(), a = d.width, f.globalAlpha =
>>>>>>> master
            .2, f.fillStyle = "#000000", f.fillRect(10, u - 10 - 24 - 10, a + 10, 34), f.globalAlpha = 1, f.drawImage(d, 15, u - 10 - 24 - 5));
        Oc();
        b = Date.now() - b;
        b > 1E3 / 60 ? h.detail -= .01 : b < 1E3 / 65 && (h.detail += .001);
        h.detail < h.selected.minDetail && (h.auto && h.downgrade(), h.detail = h.selected.minDetail);
        h.detail > h.selected.maxDetail && (h.auto && h.upgrade(), h.detail = h.selected.maxDetail);
        b = y - ec;
        !da() || ja || aa ? (C += b / 2E3, 1 < C && (C = 1)) : (C -= b / 300, 0 > C && (C = 0));
        0 < C ? (f.fillStyle = "#000000", fc ? (f.globalAlpha = C, f.fillRect(0, 0, q, u), J.complete && J.width && (J.width /
            J.height < q / u ? (b = q, a = J.height * q / J.width) : (b = J.width * u / J.height, a = u), f.drawImage(J, (q - b) / 2, (u - a) / 2, b, a), f.globalAlpha = .5 * C, f.fillRect(0, 0, q, u))) : (f.globalAlpha = .5 * C, f.fillRect(0, 0, q, u)), f.globalAlpha = 1) : fc = !1;
        h.selected.ma && Ba && (Oa++, Oa > 10 * h.selected.warnFps ? (h.selected.ma = !1, Oa = -1, Pa = 0) : Pc());
        ec = y
            //UPDATE
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
                d.strokeStyle = (getDarkBool() ? '#F2FBFF' : '#111111');
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
                d.strokeStyle = (getDarkBool() ? '#F2FBFF' : '#111111');
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
                d.strokeStyle = (getDarkBool() ? '#F2FBFF' : '#111111');
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
                var text = new Na(18, (getDarkBool() ? '#F2FBFF' : '#111111'), true, (getDarkBool() ? '#111111' : '#F2FBFF'));

                text.B(dText[i]);
                var textRender = text.N();
                d.drawImage(textRender, dPoints[i][0] - (textRender.width / 2), dPoints[i][1] - (textRender.height / 2));
            }

        }
        d.restore();
    }
    //UPDATE
    function drawStats(d) {
        d.save()

        sessionScore = Math.max(getCurrentScore(), sessionScore);

        var botString = window.botList[botIndex].displayText();

        var debugStrings = [];
        debugStrings.push("Bot: " + window.botList[botIndex].name);
        debugStrings.push("Launcher: AposLauncher " + aposLauncherVersion);
        debugStrings.push("T - Bot: " + (!toggle ? "On" : "Off"));
        debugStrings.push("R - Lines: " + (!toggleDraw ? "On" : "Off"));

        for (var i = 0; i < botString.length; i++) {
            debugStrings.push(botString[i]);
        }

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
        var text = new Na(18, (getDarkBool() ? '#F2FBFF' : '#111111'));

        for (var i = 0; i < debugStrings.length; i++) {
            text.B(debugStrings[i]);
            var textRender = text.N();
            d.drawImage(textRender, 20, offsetValue);
            offsetValue += textRender.height;
        }

        if (message.length > 0) {
            var mRender = [];
            var mWidth = 0;
            var mHeight = 0;

            for (var i = 0; i < message.length; i++) {
                var mText = new Na(28, '#FF0000', true, '#000000');
                mText.B(message[i]);
                mRender.push(mText.N());

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

    function Pc() {
        var a = document.createElement("canvas"),
            b = a.getContext("2d"),
            d = Math.min(800, .6 * q) / 800;
        a.width = 800 * d;
        a.height = 60 * d;
        b.globalAlpha = .3;
        b.fillStyle = "#000000";
        b.fillRect(0, 0, 800, 60);
        b.globalAlpha =
            1;
        b.fillStyle = "#FFFFFF";
        b.scale(d, d);
        d = null;
        d = "Your computer is running slow,";
        b.font = "18px Ubuntu";
        b.fillText(d, 400 - b.measureText(d).width / 2, 25);
        d = "please close other applications or tabs in your browser for better game performance.";
        b.fillText(d, 400 - b.measureText(d).width / 2, 45);
        f.drawImage(a, (q - a.width) / 2, u - a.height - 10)
    }

    function Nc() {
        f.fillStyle = ea ? "#111111" : "#F2FBFF";
        f.fillRect(0, 0, q, u);
        f.save();
        f.strokeStyle = ea ? "#AAAAAA" : "#000000";
        f.globalAlpha = .2 * r;
        for (var a = q / r, b = u / r, d = (-A + a / 2) % 50; d < a; d += 50) f.beginPath(),
            f.moveTo(d * r - .5, 0), f.lineTo(d * r - .5, b * r), f.stroke();
        for (d = (-B + b / 2) % 50; d < b; d += 50) f.beginPath(), f.moveTo(0, d * r - .5), f.lineTo(a * r, d * r - .5), f.stroke();
        f.restore()
    }

    function Oc() {
        if (gc && Cb.width) {
            var a = q / 5;
            f.drawImage(Cb, 5, 5, a, a)
        }
    }

    function dc() {
        for (var a = 0, b = 0; b < t.length; b++) a += t[b].g * t[b].g;
        return a
    }

    function Ub() {
        H = null;
        if (null != I || 0 != D.length)
            if (null != I || fa) {
                H = document.createElement("canvas");
                var a = H.getContext("2d"),
                    b = 60,
                    b = null == I ? b + 24 * D.length : b + 180,
                    d = Math.min(200, .3 * q) / 200;
                H.width = 200 * d;
                H.height = b * d;
                a.scale(d, d);
                a.globalAlpha = .4;
                a.fillStyle = "#000000";
                a.fillRect(0, 0, 200, b);
                a.globalAlpha = 1;
                a.fillStyle = "#FFFFFF";
                d = null;
                d = R("leaderboard");
                a.font = "30px Ubuntu";
                a.fillText(d, 100 - a.measureText(d).width / 2, 40);
                var c, e;
                if (null == I)
                    for (a.font = "20px Ubuntu", b = 0; b < D.length; ++b) d = D[b].name || R("unnamed_cell"), fa || (d = R("unnamed_cell")), 1 == D[b].id || -1 != G.indexOf(D[b].id) ? (t[0].name && (d = t[0].name), a.fillStyle = "#FFAAAA") : a.fillStyle = "#FFFFFF", d = b + 1 + ". " + d, e = a.measureText(d).width, c = 70 + 24 * b, 200 < e ? a.fillText(d, 10, c) : a.fillText(d, (200 - e) / 2, c);
                else
                    for (b = d = 0; b < I.length; ++b) c = d + I[b] * Math.PI * 2, a.fillStyle = Qc[b + 1], a.beginPath(), a.moveTo(100, 140), a.arc(100, 140, 80, d, c, !1), a.fill(), d = c
            }
    }

    function Rc(a) {
        if (null == a || 0 == a.length) return null;
        if ("%" == a[0]) {
            if (!c.MC || !c.MC.getSkinInfo) return null;
            a = c.MC.getSkinInfo("skin_" + a.slice(1));
            if (null == a) return null;
            for (a = (+a.color).toString(16); 6 > a.length;) a = "0" + a;
            return "#" + a
        }
        return null
    }

    function hc(a) {
        if (null == a || 0 == a.length) return null;
        if (!oa.hasOwnProperty(a)) {
            var b = new Image;
            if (":" == a[0]) b.src = a.slice(1);
            else if ("%" == a[0]) {
                if (!c.MC || !c.MC.getSkinInfo) return null;
                var d = c.MC.getSkinInfo("skin_" + a.slice(1));
                if (null == d) return null;
                b.src = c.ASSETS_ROOT + d.url
            }
            oa[a] = b
        }
        return 0 != oa[a].width && oa[a].complete ? oa[a] : null
    }

    function Db(a, b, d, c, e) {
        this.$ = a;
        this.x = b;
        this.y = d;
        this.f = c;
        this.b = e
    }

    function ca(a, b, d, c, e, p) {
        this.id = a;
        this.s = this.x = this.L = this.J = b;
        this.u = this.y = this.M = this.K = d;
        this.o = this.size = c;
        this.color = e;
        this.a = [];
        this.ba();
        this.A(p)
    }

    function Jc(a) {
        for (a = a.toString(16); 6 > a.length;) a = "0" + a;
        return "#" + a
    }

    function Na(a, b, d, c) {
        a && (this.v = a);
        b && (this.W = b);
        this.Y = !!d;
        c && (this.Z = c)
<<<<<<< HEAD
    }

    function Sc(a) {
        for (var b = a.length, d, c; 0 < b;) c = Math.floor(Math.random() * b), b--, d = a[b], a[b] = a[c], a[c] = d
    }

    function Tc() {
        k = Qa
    }

    function ic(a) {
        k.context = "google" == a ? "google" : "facebook";
        Ra()
    }

    function Ra() {
        c.localStorage.storeObjectInfo = JSON.stringify(k);
        k = JSON.parse(c.localStorage.storeObjectInfo);
        c.storageInfo = k;
        "google" == k.context ? (e("#gPlusShare").show(), e("#fbShare").hide()) : (e("#gPlusShare").hide(), e("#fbShare").show())
    }

=======
    }

    function Sc(a) {
        for (var b = a.length, d, c; 0 < b;) c = Math.floor(Math.random() * b), b--, d = a[b], a[b] = a[c], a[c] = d
    }

    function Tc() {
        k = Qa
    }

    function ic(a) {
        k.context = "google" == a ? "google" : "facebook";
        Ra()
    }

    function Ra() {
        c.localStorage.storeObjectInfo = JSON.stringify(k);
        k = JSON.parse(c.localStorage.storeObjectInfo);
        c.storageInfo = k;
        "google" == k.context ? (e("#gPlusShare").show(), e("#fbShare").hide()) : (e("#gPlusShare").hide(), e("#fbShare").show())
    }

>>>>>>> master
    function jc(a) {
        e("#helloContainer").attr("data-has-account-data");
        "" != a.displayName && (a.name = a.displayName);
        if (null == a.name || void 0 == a.name) a.name = "";
        var b = a.name.lastIndexOf("_"); - 1 != b && (a.name = a.name.substring(0, b));
        e("#helloContainer").attr("data-has-account-data", "1");
        e("#helloContainer").attr("data-logged-in", "1");
        e(".agario-profile-panel .progress-bar-star").text(a.level);
        e(".agario-exp-bar .progress-bar-text").text(a.xp + "/" + a.xpNeeded + " XP");
        e(".agario-exp-bar .progress-bar").css("width", (88 * a.xp / a.xpNeeded).toFixed(2) + "%");
        e(".agario-profile-name").text(a.name);
        "" != a.picture && e(".agario-profile-picture").attr("src", a.picture);
        Eb();
        k.userInfo.level = a.level;
        k.userInfo.xp = a.xp;
        k.userInfo.xpNeeded = a.xpNeeded;
        k.userInfo.displayName = a.name;
        k.userInfo.loggedIn = "1";
        c.updateStorage()
    }

    function ga(a, b) {
        var d = a;
        if (k.userInfo.loggedIn) {
            var v = e("#helloContainer").is(":visible") && "1" == e("#helloContainer").attr("data-has-account-data");
            if (null == d || void 0 == d) d = k.userInfo;
            if (v) {
                var g = +e(".agario-exp-bar .progress-bar-text").first().text().split("/")[0],
                    v = +e(".agario-exp-bar .progress-bar-text").first().text().split("/")[1].split(" ")[0],
                    p = e(".agario-profile-panel .progress-bar-star").first().text();
                if (p != d.level) ga({
                    xp: v,
                    xpNeeded: v,
                    level: p
                }, function() {
                    e(".agario-profile-panel .progress-bar-star").text(d.level);
                    e(".agario-exp-bar .progress-bar").css("width", "100%");
                    e(".progress-bar-star").addClass("animated tada").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
                        e(".progress-bar-star").removeClass("animated tada")
                    });
                    setTimeout(function() {
                        e(".agario-exp-bar .progress-bar-text").text(d.xpNeeded + "/" + d.xpNeeded + " XP");
                        ga({
                            xp: 0,
                            xpNeeded: d.xpNeeded,
                            level: d.level
                        }, function() {
                            ga(d)
                        })
                    }, 1E3)
                });
                else {
                    var f = Date.now(),
                        l = function() {
                            var a;
                            a = (Date.now() - f) / 1E3;
                            a = 0 > a ? 0 : 1 < a ? 1 : a;
                            a = a * a * (3 - 2 * a);
                            e(".agario-exp-bar .progress-bar-text").text(~~(g + (d.xp - g) * a) + "/" + d.xpNeeded + " XP");
                            e(".agario-exp-bar .progress-bar").css("width", (88 * (g + (d.xp - g) * a) / d.xpNeeded).toFixed(2) + "%");
                            b && b();
                            1 > a && c.requestAnimationFrame(l)
                        };
                    c.requestAnimationFrame(l)
                }
            }
        }
<<<<<<< HEAD
    }

    function Eb() {
        var a;
        ("undefined" !== typeof a && a || "none" == e("#settings").css("display") && "none" == e("#socialLoginContainer").css("display")) && e("#instructions").show()
    }

=======
    }

    function Eb() {
        var a;
        ("undefined" !== typeof a && a || "none" == e("#settings").css("display") && "none" == e("#socialLoginContainer").css("display")) && e("#instructions").show()
    }

>>>>>>> master
    function kc(a) {
        if ("connected" == a.status) {
            var b = a.authResponse.accessToken;
            null == b || "undefined" == b || "" == b ? (3 > lc && (lc++, c.facebookRelogin()), c.logout()) : (c.MC.doLoginWithFB(b), m.cache.login_info = [b, "facebook"], c.FB.api("/me/picture?width=180&height=180", function(b) {
                k.userInfo.picture = b.data.url;
                c.updateStorage();
                e(".agario-profile-picture").attr("src", b.data.url);
                k.userInfo.socialId = a.authResponse.userID;
                Sa()
            }), e("#helloContainer").attr("data-logged-in", "1"), k.context = "facebook", k.loginIntent = "1", c.updateStorage())
        }
    }

    function mc(a) {
        ka(":party");
        e("#helloContainer").attr("data-party-state", "4");
        a = decodeURIComponent(a).replace(/.*#/gim, "");
        Fb("#" + c.encodeURIComponent(a));
        e.ajax(ya + "getToken", {
            error: function() {
                e("#helloContainer").attr("data-party-state", "6")
            },
            success: function(b) {
                b = b.split("\n");
                e(".partyToken").val("agar.io/#" + c.encodeURIComponent(a));
                e("#helloContainer").attr("data-party-state", "5");
                ka(":party");
                fb("ws://" + b[0], a)
            },
            dataType: "text",
            method: "POST",
            cache: !1,
            crossDomain: !0,
            data: a
        })
    }

    function Fb(a) {
        c.history && c.history.replaceState && c.history.replaceState({}, c.document.title, a)
    }

    function Ga() {
        Ba = !1;
        clearTimeout(Xb);
        null == c.storageInfo && c.createDefaultStorage();
        Gb = Date.now();
        0 >= Ja && (Ja = Gb);
        Aa = !1;
        Uc()
    }

    function Ic(a, b) {
        var d = -1 != G.indexOf(a.id),
            c = -1 != G.indexOf(b.id),
            e = 30 > b.size;
        d && e && ++wb;
        e || !d || c || b.ea & 32 || ++yb
    }

    function nc(a) {
        a = ~~a;
        var b = (a % 60).toString();
        a = (~~(a / 60)).toString();
        2 > b.length && (b = "0" + b);
        return a + ":" + b
    }

    function Vc() {
        if (null == D) return 0;
        for (var a = 0; a < D.length; ++a)
            if (D[a].id & 1) return a + 1;
        return 0
    }

    function Wc() {
        e(".stats-food-eaten").text(wb);
        e(".stats-time-alive").text(nc((Gb - Ja) / 1E3));
        e(".stats-leaderboard-time").text(nc(zb));
        e(".stats-highest-mass").text(~~(T / 100));
        e(".stats-cells-eaten").text(yb);
        e(".stats-top-position").text(0 == W ? ":(" : W);
        var a = document.getElementById("statsGraph");
        if (a) {
            var b = a.getContext("2d"),
                d = a.width,
                a = a.height;
            b.clearRect(0, 0, d, a);
            if (2 < F.length) {
                for (var c = 200, g = 0; g < F.length; g++) c = Math.max(F[g], c);
                b.lineWidth = 3;
                b.lineCap = "round";
                b.lineJoin = "round";
                b.strokeStyle = xb;
                b.fillStyle = xb;
                b.beginPath();
                b.moveTo(0, a - F[0] / c * (a - 10) + 10);
                for (g = 1; g < F.length; g += Math.max(~~(F.length / d), 1)) {
                    for (var p = g / (F.length - 1) * d, f = [], l = -20; 20 >= l; ++l) 0 > g + l || g + l >= F.length || f.push(F[g + l]);
                    f = f.reduce(function(a, b) {
                        return a + b
                    }) / f.length / c;
                    b.lineTo(p, a - f * (a - 10) + 10)
                }
                b.stroke();
                b.globalAlpha = .5;
                b.lineTo(d, a);
                b.lineTo(0, a);
                b.fill();
                b.globalAlpha = 1
            }
        }
    }

    function Uc() {
        ja || aa || (Ta ? (c.refreshAd(c.adSlots.ab), Wc(), aa = !0, setTimeout(function() {
            e("#overlays").fadeIn(500, function() {
                ga()
            });
            e("#stats").show();
            var a = oc("g_plus_share_stats");
            c.fillSocialValues(a, "gPlusShare")
        }, 1500)) : ua(500))
    }

    function oc(a) {
        var b = e(".stats-time-alive").text();
        return c.parseString(a, "%@", [b.split(":")[0], b.split(":")[1], e(".stats-highest-mass").text()])
    }

    function Xc() {
        c.open("https://plus.google.com/share?url=www.agar.io&hl=en-US", "Agar.io", "width=484,height=580,menubar=no,toolbar=no,resizable=yes,scrollbars=no,left=" +
            (c.screenX + c.innerWidth / 2 - 242) + ",top=" + (c.innerHeight - 580) / 2)
    }
    var pc = document.createElement("canvas");
    if ("undefined" == typeof console || "undefined" == typeof DataView || "undefined" == typeof WebSocket || null == pc || null == pc.getContext || null == c.localStorage) alert("You browser does not support this game, we recommend you to use Firefox to play this");
    else {
        var E = {};
        (function() {
            var a = c.location.search;
            "?" == a.charAt(0) && (a = a.slice(1));
            for (var a = a.split("&"), b = 0; b < a.length; b++) {
                var d = a[b].split("=");
                E[d[0]] = d[1]
            }
        })();
        c.queryString = E;
        var qc = "fb" in E,
            Yc = "miniclip" in E,
            w = {
                skinsEnabled: "0",
                namesEnabled: "0",
                noColors: "0",
                blackTheme: "0",
                showMass: "0",
                statsEnabled: "0"
            },
            Zc = function() {
                qa("", -1)
            },
            rc = "http:" != c.location.protocol,
            $c = "1" == vc(),
            sc = !1;
        qc || Yc || (rc && !$c ? (qa("1", 1), c.location.href = "http:" + c.location.href.substring(c.location.protocol.length), sc = !0) : qa("", -1));
        rc || qa("", -1);
        sc || setTimeout(Zc, 3E3);
        if (!c.agarioNoInit) {
            var db = c.location.protocol,
                gb = "https:" == db;
            E.master && (EnvConfig.master_url = E.master);
            var ya = db + "//" +
                EnvConfig.master_url + "/",
                Ua = c.navigator.userAgent;
            if (-1 != Ua.indexOf("Android")) c.ga && c.ga("send", "event", "MobileRedirect", "PlayStore"), setTimeout(function() {
                c.location.href = "https://play.google.com/store/apps/details?id=com.miniclip.agar.io"
            }, 1E3);
            else if (-1 != Ua.indexOf("iPhone") || -1 != Ua.indexOf("iPad") || -1 != Ua.indexOf("iPod")) c.ga && c.ga("send", "event", "MobileRedirect", "AppStore"), setTimeout(function() {
                c.location.href = "https://itunes.apple.com/app/agar.io/id995999703?mt=8&at=1l3vajp"
            }, 1E3);
            else {
                var m = {};
                c.agarApp = m;
                var Ab, f, O, q, u, ia = null,
                    //UPDATE
                    toggle = false,
                    toggleDraw = false,
                    shootTime = 0,
                    splitTime = 0,
                    shootCooldown = 100,
                    splitCooldown = 100,
                    tempPoint = [0, 0, 1],
                    dPoints = [],
                    circles = [],
                    dArc = [],
                    dText = [],
                    lines = [],
                    names = ["NotReallyABot"],
                    firstStart = true;
                originalName = names[Math.floor(Math.random() * names.length)],
                    sessionScore = 0,
                    serverIP = "",
                    interNodes = [],
                    lifeTimer = new Date(),
                    bestTime = 0,
                    botIndex = 0,
                    reviving = false,
                    message = [],

                    x = null,
                    A = 0,
                    B = 0,
                    G = [],
                    t = [],
                    L = {},
                    z = [],
                    ba = [],
                    D = [],
                    Y = 0,
                    Z = 0,
                    //UPDATE - NOT SURE
                    //va = (Y - q / 2) / r + A;
                    //wa = (Z - u / 2) / r + B;
                    va = -1,
                    wa = -1,
                    Mc = 0,
                    y = 0,
                    ec = 0,
                    N = null,
                    ob = 0,
                    pb = 0,
                    qb = 1E4,
                    rb = 1E4,
                    r = 1,
                    K = null,
                    Va = !0,
                    fa = !0,
                    pa = !1,
                    ub = !1,
                    T = 0,
                    ea = !1,
                    Wa = !1,
                    ib = A = ~~((ob + qb) / 2),
                    jb = B = ~~((pb + rb) / 2),
                    kb = 1,
                    Ca = "",
                    I = null,
                    ab = !1,
                    nb = !1,
                    lb = 0,
                    mb = 0,
                    Ha = 0,
                    Ia = 0,
                    Qc = ["#333333", "#FF3333", "#33FF33", "#3333FF"],
                    Bb = !1,
                    ma = !1,
                    Da = 0,
                    P = 1,
                    C = 1,
                    ja = !1,
                    eb = 0,
                    fc = !0,
                    tb = null,
                    sb = !1,
                    J = new Image;
                J.src = "/img/background.png";
                var gc = "ontouchstart" in c && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(c.navigator.userAgent),
                    Cb = new Image;
                Cb.src = "/img/split.png";
                var ra = !1,
                    sa = !1,
                    ta = !1,
                    Xa = !1,
                    Hb, Ib;
                "gamepad" in E && setInterval(function() {
                    Xa && (Y = Ya.ha(Y, Hb), Z = Ya.ha(Z, Ib))
                }, 25);
                c.gamepadAxisUpdate = function(a, b) {
                    var d = .1 > b * b;
                    0 == a && (d ? Hb = q / 2 : (Hb = (b + 1) / 2 * q, Xa = !0));
                    1 == a && (d ? Ib = u / 2 : (Ib = (b + 1) / 2 * u, Xa = !0))
                };
                c.agarioInit = function() {
                    ab = !0;
                    zc();
                    yc();
                    m.core.init();
                    null != c.localStorage.settings && (w = JSON.parse(c.localStorage.settings), Wa = w.showMass, ea = w.blackTheme, fa = w.namesEnabled, pa = w.noColors, Ta = w.statsEnabled, Va = w.skinsEnabled);
                    e("#showMass").prop("checked",
                        w.showMass);
                    e("#noSkins").prop("checked", !w.skinsEnabled);
                    e("#skipStats").prop("checked", !w.statsEnabled);
                    e("#noColors").prop("checked", w.noColors);
                    e("#noNames").prop("checked", !w.namesEnabled);
                    e("#darkTheme").prop("checked", w.blackTheme);
                    Ob();
                    setInterval(Ob, 18E4);
                    O = Ab = document.getElementById("canvas");
                    null != O && (f = O.getContext("2d"), O.onmousedown = function(a) {
                        if (gc) {
                            var b = a.clientX - (5 + q / 5 / 2),
                                d = a.clientY - (5 + q / 5 / 2);
                            if (Math.sqrt(b * b + d * d) <= q / 5 / 2) {
                                Za();
                                return
                            }
                        }
                        Y = 1 * a.clientX;
                        Z = 1 * a.clientY;
                        $a();
                        Ka()
                    }, O.onmousemove = function(a) {
                        Xa = !1;
                        Y = 1 * a.clientX;
                        Z = 1 * a.clientY;
                        $a()
                    }, O.onmouseup = function() {}, /firefox/i.test(navigator.userAgent) ? document.addEventListener("DOMMouseScroll", Nb, !1) : document.body.onmousewheel = Nb, c.onblur = function() {
                        X(19);
                        ta = sa = ra = !1
                    }, c.onresize = $b, c.requestAnimationFrame(tc), setInterval(Ka, 40), K && e("#region").val(K), Qb(), za(e("#region").val()), 0 == eb && K && Q(), ua(0), $b(), c.location.hash && 6 <= c.location.hash.length && mc(c.location.hash))
                };
                var xa = null;
                c.setNick = function(a) {
                    //UPDATE
                    firstStart = false;
                    originalName = a;
                    if (getPlayer().length == 0) {
                        lifeTimer = new Date();
                    }

                    c.ga && c.ga("send", "event", "Nick", a.toLowerCase());
                    Pb();
                    N = a;
                    Vb();
                    T = 0;
                    w.skinsEnabled = Va;
                    w.namesEnabled = fa;
                    w.noColors = pa;
                    w.blackTheme = ea;
                    w.showMass = Wa;
                    w.statsEnabled = Ta;
                    c.localStorage.settings = JSON.stringify(w);
                    Lb()
                };
                c.setSkins = function(a) {
                    Va = a
                };
                c.setNames = function(a) {
                    fa = a
                };
                c.setDarkTheme = function(a) {
                    ea = a
                };
                c.setColors = function(a) {
                    pa = a
                };
                c.setShowMass = function(a) {
                    Wa = a
                };
                c.spectate = function() {
                    N = null;
                    Lb();
                    X(1);
                    Pb()
                };
                c.setRegion = za;
                var bb = !0;
                c.setGameMode = function(a) {
                    a != Ca && (":party" == Ca && e("#helloContainer").attr("data-party-state", "0"), ka(a), ":party" != a && Q())
                };
                c.setAcid = function(a) {
                    Bb = a
                };
                var ad = function(a) {
                    var b = {},
                        d = !1,
                        v = {
                            skipDraw: !0,
                            predictionModifier: 1.1
                        };
                    a.init = function() {
                        m.account.init();
                        m.google.xa();
                        m.fa.init();
                        (d = "debug" in c.queryString) && m.debug.showDebug()
                    };
                    a.bind = function(a, d) {
                        e(b).bind(a, d)
                    };
                    a.unbind = function(a, d) {
                        e(b).unbind(a, d)
                    };
                    a.trigger = function(a, d) {
                        e(b).trigger(a, d)
                    };
                    a.__defineGetter__("debug", function() {
                        return d
                    });
                    a.__defineSetter__("debug", function(a) {
                        return d = a
                    });
                    a.__defineGetter__("proxy", function() {
                        return c.MC
                    });
                    a.__defineGetter__("config", function() {
                        return v
                    });
                    return a
                }({});
                m.core = ad;
                m.cache = {};
                var bd = function(a) {
                    function b(a, b, d, c) {
                        a = a + "Canvas";
                        var g = e("<canvas>", {
                            id: a
                        });
                        p.append(g);
                        d = new SmoothieChart(d);
                        for (g = 0; g < b.length; g++) {
                            var v = b[g],
                                f = _.extend(h, c[g]);
                            d.addTimeSeries(v, f)
                        }
                        d.streamTo(document.getElementById(a), 0)
                    }

                    function d(a, d) {
                        l[a] = c();
                        b(a, [l[a]], d, [{
                            strokeStyle: "rgba(0, 255, 0, 1)",
                            fillStyle: "rgba(0, 255, 0, 0.2)",
                            lineWidth: 2
                        }])
                    }

                    function c() {
                        return new TimeSeries({
                            Ma: !1
                        })
                    }
                    var g = !1,
                        p, f = !1,
                        l = {},
                        h = {
                            strokeStyle: "rgba(0, 255, 0, 1)",
                            fillStyle: "rgba(0, 255, 0, 0.2)",
                            lineWidth: 2
                        };
                    a.showDebug = function() {
                        g || (p = e("#debug-overlay"), d("networkUpdate", {
                            name: "network updates",
                            minValue: 0,
                            maxValue: 120
                        }), d("fps", {
                            name: "fps",
                            minValue: 0,
                            maxValue: 120
                        }), l.rttSDev = c(), l.rttMean = c(), b("rttMean", [l.rttSDev, l.rttMean], {
                            name: "rtt",
                            minValue: 0,
                            maxValue: 120
                        }, [{
                            strokeStyle: "rgba(255, 0, 0, 1)",
                            fillStyle: "rgba(0, 255, 0, 0.2)",
                            lineWidth: 2
                        }, {
                            strokeStyle: "rgba(0, 255, 0, 1)",
                            fillStyle: "rgba(0, 255, 0, 0)",
                            lineWidth: 2
                        }]), g = !0);
                        m.core.debug = !0;
                        p.show()
                    };
                    a.hideDebug = function() {
                        p.hide();
                        m.core.debug = !1
                    };
                    a.updateChart = function(a, b, d) {
                        g && a in l && l[a].append(b, d)
                    };
                    a.__defineGetter__("showPrediction", function() {
                        return f
                    });
                    a.__defineSetter__("showPrediction", function(a) {
                        return f = a
                    });
                    return a
                }({});
                m.debug = bd;
                var la = {
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
                    na = 0,
                    Ea = 0,
                    S = null,
                    Ba = !1,
                    Xb;
                c.connect = fb;
                var Fa = 500,
                    Ec = .875,
                    Gc = .75,
                    Hc = .25,
                    Fc = .125,
                    Yb = -1,
                    Zb = -1;
                c.sendMitosis = Za;
                c.sendEject = Mb;
                m.networking = function(a) {
                    a.loginRealm = {
                        GG: "google",
                        FB: "facebook"
                    };
                    a.sendMessage = function(a) {
                        if (da()) {
                            var d = a.byteView;
                            if (null != d) {
                                a = U(1 + a.length);
                                a.setUint8(0, 102);
                                for (var c = 0; c < d.length; ++c) a.setUint8(1 + c, d[c]);
                                V(a)
                            }
                        }
                    };
                    return a
                }({});
                var H = null,
                    Ma = null,
                    h = m.renderSettings = {
                        high: {
                            warnFps: 30,
                            simpleDraw: !1,
                            maxDetail: 1,
                            minDetail: .6,
                            U: 30
                        },
                        medium: {
                            warnFps: 30,
                            simpleDraw: !1,
                            maxDetail: .5,
                            minDetail: .3,
                            U: 25
                        },
                        low: {
                            warnFps: 30,
                            simpleDraw: !0,
                            maxDetail: .3,
                            minDetail: .2,
                            U: 25
                        },
                        upgrade: function() {
                            h.selected == h.low ? (h.selected = h.medium, h.detail = h.medium.maxDetail) : h.selected == h.medium && (h.selected = h.high, h.detail = h.high.maxDetail)
                        },
                        downgrade: function() {
                            h.selected == h.high ? h.selected = h.medium : h.selected == h.medium && (h.selected = h.low)
                        }
                    };
                h.selected = h.high;
                h.detail = 1;
                h.auto = !1;
                //UPDATE
                /**
                 * Tells you if the game is in Dark mode.
                 * @return Boolean for dark mode.
                 */
                window.getDarkBool = function() {
                    return ea;
                }

                /**
                 * Tells you if the mass is shown.
                 * @return Boolean for player's mass.
                 */
                window.getMassBool = function() {
                    return Wa;
                }

                /**
                 * This is a copy of everything that is shown on screen.
                 * Normally stuff will time out when off the screen, this
                 * memorizes everything that leaves the screen for a little
                 * while longer.
                 * @return The memory object.
                 */
                window.getMemoryCells = function() {
                    return interNodes;
                }

                /**
                 * [getCellsArray description]
                 * @return {[type]} [description]
                 */
                window.getCellsArray = function() {
                    return z;
                }

                /**
                 * [getCellsArray description]
                 * @return {[type]} [description]
                 */
                window.getCells = function() {
                    return L;
                }

                /**
                 * Returns an array with all the player's cells.
                 * @return Player's cells
                 */
                window.getPlayer = function() {
                    return t;
                }

                /**
                 * The canvas' width.
                 * @return Integer Width
                 */
                window.getWidth = function() {
                    return q;
                }

                /**
                 * The canvas' height
                 * @return Integer Height
                 */
                window.getHeight = function() {
                    return u;
                }

                /**
                 * Scaling ratio of the canvas. The bigger this ratio,
                 * the further that you see.
                 * @return Screen scaling ratio.
                 */
                window.getRatio = function() {
                    return r;
                }

                window.getZoomlessRatio = function() {
                    return r2;
                }

                /**
                 * [getOffsetX description]
                 * @return {[type]} [description]
                 */
                window.getOffsetX = function() {
                    return ib;
                }

                window.getOffsetY = function() {
                    return jb;
                }

                window.getX = function() {
                    return A;
                }

                window.getY = function() {
                    return B;
                }

                window.getPointX = function() {
                    return va;
                }

                window.getPointY = function() {
                    return wa;
                }

                /**
                 * The X location of the mouse.
                 * @return Integer X
                 */
                window.getMouseX = function() {
                    return Y;
                }

                /**
                 * The Y location of the mouse.
                 * @return Integer Y
                 */
                window.getMouseY = function() {
                    return Z;
                }

                window.getMapStartX = function() {
                    return ob;
                }

                window.getMapStartY = function() {
                    return pb;
                }

                window.getMapEndX = function() {
                    return qb;
                }

                window.getMapEndY = function() {
                    return rb;
                }

                window.getScreenDistance = function() {
                    var temp = screenDistance();
                    return temp;
                }

                /**
                 * A timestamp since the last time the server sent any data.
                 * @return Last update timestamp
                 */
                window.getLastUpdate = function() {
                    return y;
                }

                window.getCurrentScore = function() {
                    return T;
                }

                /**
                 * The game's current mode. (":ffa", ":experimental", ":teams". ":party")
                 * @return {[type]} [description]
                 */
                window.getMode = function() {
                    return Ca;
                }

                window.getServer = function() {
                    return serverIP;
                }

                window.setPoint = function(x, y) {
                    va = x;
                    wa = y;
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
                    setLauncherCustomParameters(window.botList[a]);
                }

                window.setLauncherCustomParameterOnChange = function(a, b, c) {
                    a.on('change input', function() {
                        var val = window.jQuery(this).val();
                        c.value = val;
                        b.text(val);
                    });
                }

                window.setLauncherCustomParameters = function(a) {
                    window.jQuery('#launcher-custom-params').remove();
                    window.jQuery('#launcher-wrapper').append(window.jQuery('<div id="launcher-custom-params">'));

                    // If no custom parameters are defined, abort
                    if (a.customParameters === undefined) {
                        return;
                    }

                    for (var param in a.customParameters) {
                        var form = window.jQuery('<div class="form-group">');
                        var label = window.jQuery('<label>');
                        var value = window.jQuery('<span style="float: right; display: none;">');
                        var input = window.jQuery('<input class="form-control">');

                        if (a.customParameters[param].label !== undefined) {
                            label.text(a.customParameters[param].label);
                        } else {
                            label.text(param);
                        }

                        for (var paramKey in a.customParameters[param]) {
                            if (paramKey == 'label') {
                                continue;
                            }

                            if (paramKey == 'value') {
                                value.text(a.customParameters[param][paramKey]);
                            } else if (paramKey == 'type' && a.customParameters[param][paramKey] == 'range') {
                                input.removeClass('form-control');
                                value.show();
                            }

                            input.attr(paramKey, a.customParameters[param][paramKey]);
                        }

                        setLauncherCustomParameterOnChange(input, value, a.customParameters[param]);

                        form.append(label);
                        form.append(value);
                        form.append(input);
                        form.appendTo(window.jQuery('#launcher-custom-params'));
                    }
                }

                window.setLauncherBotList = function() {
                    window.jQuery('#launcher-bot-list').remove();
                    window.jQuery('#launcher-wrapper').append(window.jQuery('<div id="launcher-bot-list" class="form-group">'));
                    var select = window.jQuery('<select id="bList" class="form-control" onchange="setBotIndex(window.jQuery(this).val());" />');

                    for (var i = 0; i < window.botList.length; i++) {
                        if (window.botList[i].name == "Human" && window.botList.length > 1) {
                            if (botIndex == i) {
                                botIndex = (botIndex + 1).mod(window.botList.length);
                            }
                            continue;
                        }

                        window.jQuery('<option />', {
                            value: i,
                            text: window.botList[i].name
                        }).appendTo(select);
                    }

                    select.appendTo(window.jQuery('#launcher-bot-list'));
                }

                window.setMessage = function(a) {
                    message = a;
                }

                window.shoot = function() {
                    if (!toggle && shootTime + shootCooldown < new Date().getTime()) {
                        shootTime = new Date().getTime();
                        opCode(21);
                    }
                }

                window.split = function() {

                    if (!toggle && splitTime + splitCooldown < new Date().getTime()) {
                        splitTime = new Date().getTime();
                        opCode(17);
                    }
                }

                window.updateBotList = function() {
                    window.botList = window.botList || [];

                    // Create wrapper for launcher controls
                    window.jQuery('#launcher-wrapper').remove();
                    window.jQuery('<div id="launcher-wrapper">').insertBefore('#agario-main-buttons');

                    setLauncherBotList();

                    // Show initial custom parameters
                    setLauncherCustomParameters(window.botList[window.jQuery('#bList').val()]);
                }

                var Jb = 0,
                    Pa = 0,
                    Oa = 0,
                    tc = function() {
                        var a = Date.now(),
                            b = 1E3 / 60;
                        return function() {
                            c.requestAnimationFrame(tc);
                            var d = Date.now(),
                                e = d - a;
                            if (e > b) {
                                a = d - e % b;
                                var g = Date.now();
                                !da() || 240 > g - Da || !m.core.config.skipDraw ? ac() : console.warn("Skipping draw");
                                cd();
                                Jb = 1E3 / e;
                                m.debug.updateChart("fps", d, Jb);
                                Jb < h.selected.warnFps ? 0 == Oa && (Pa++, Pa > 2 * h.selected.warnFps && (h.selected.ma = !0)) : Pa = 0
                            }
                        }
                    }();
                c.setQuality = Kc;
                var ha = {},
                    Rb = "poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;chaplin;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin;belgium;luxembourg;stussy;prussia;8ch;argentina;scotland;sir;romania;wojak;doge;nasa;byzantium;imperial japan;french kingdom;somalia;turkey;mars;pokerface;8;irs;receita federal;facebook;putin;merkel;tsipras;obama;kim jong-un;dilma;hollande;berlusconi;cameron;clinton;hillary;venezuela;blatter;chavez;cuba;fidel;merkel;palin;queen;boris;bush;trump;underwood".split(";"),
                    dd = "8;nasa;putin;merkel;tsipras;obama;kim jong-un;dilma;hollande;berlusconi;cameron;clinton;hillary;blatter;chavez;fidel;merkel;palin;queen;boris;bush;trump;underwood".split(";"),
                    oa = {};
                Db.prototype = {
                    $: null,
                    x: 0,
                    y: 0,
                    f: 0,
                    b: 0
                };
                var La = -1,
                    cc = !1;
                ca.prototype = {
                    id: 0,
                    a: null,
                    name: null,
                    i: null,
                    R: null,
                    x: 0,
                    y: 0,
                    size: 0,
                    s: 0,
                    u: 0,
                    o: 0,
                    ja: 0,
                    ka: 0,
                    g: 0,
                    L: 0,
                    M: 0,
                    J: 0,
                    K: 0,
                    ea: 0,
                    T: 0,
                    ta: 0,
                    G: !1,
                    c: !1,
                    h: !1,
                    V: !0,
                    da: 0,
                    //UPDATE
                    updateCode: 0,
                    danger: false,
                    dangerTimeOut: 0,
                    isNotMoving: function() {
                        return (this.x == this.s && this.y == this.u);
                    },
                    isVirus: function() {
                        return this.c;
                    },
                    getUptimeTime: function() {
                        return this.T;
                    },

                    C: null,
                    ia: 0,
                    wa: !1,
                    I: !1,
                    ca: function() {
                        var a;
                        for (a = 0; a < z.length; a++)
                            if (z[a] == this) {
                                z.splice(a, 1);
                                break
                            }
                        delete L[this.id];
                        a = t.indexOf(this); - 1 != a && (ub = !0, t.splice(a, 1));
                        a = G.indexOf(this.id); - 1 != a && G.splice(a, 1);
                        this.G = !0;
                        0 < this.da && ba.push(this)
                    },
                    m: function() {
                        return Math.max(~~(.3 * this.size), 24)
                    },
                    A: function(a) {
                        if (this.name = a) null == this.i ? this.i = new Na(this.m(), "#FFFFFF", !0, "#000000") : this.i.O(this.m()), this.i.B(this.name)
                    },
                    ba: function() {
                        for (var a = this.H(); this.a.length > a;) {
                            var b = ~~(Math.random() * this.a.length);
                            this.a.splice(b, 1)
                        }
                        for (0 == this.a.length && 0 < a && this.a.push(new Db(this, this.x, this.y, this.size, Math.random() - .5)); this.a.length < a;) b = ~~(Math.random() * this.a.length), b = this.a[b], this.a.push(new Db(this, b.x, b.y, b.f, b.b))
                    },
                    H: function() {
                        var a = 10;
                        20 > this.size && (a = 0);
                        this.c && (a = m.renderSettings.selected.U);
                        var b = this.size;
                        this.c || (b *= r);
                        b *= h.detail;
                        return ~~Math.max(b, a)
                    },
                    Da: function() {
                        this.ba();
                        for (var a = this.a, b = a.length, d = this, c = this.c ? 0 : (this.id / 1E3 + y / 1E4) % (2 * Math.PI), e = 0, p = 0; p < b; ++p) {
                            var f = a[(p - 1 + b) % b].b,
                                l = a[(p + 1) % b].b,
                                h = a[p];
                            h.b += (Math.random() - .5) * (this.h ? 3 : 1);
                            h.b *= .7;
                            10 < h.b && (h.b = 10); - 10 > h.b && (h.b = -10);
                            h.b = (f + l + 8 * h.b) / 10;
                            var n = h.f,
                                f = a[(p - 1 + b) % b].f,
                                l = a[(p + 1) % b].f;
                            if (15 < this.size && null != ia && 20 < this.size * r && 0 < this.id) {
                                var k = !1,
                                    m = h.x,
                                    q = h.y;
                                ia.Ga(m - 5, q - 5, 10, 10, function(a) {
                                    a.$ != d && 25 > (m - a.x) * (m - a.x) + (q - a.y) * (q - a.y) && (k = !0)
                                });
                                !k && (h.x < ob || h.y < pb || h.x > qb || h.y > rb) && (k = !0);
                                k && (0 < h.b && (h.b = 0), --h.b)
                            }
                            n += h.b;
                            0 > n && (n = 0);
                            n = this.h ? (19 * n + this.size) / 20 : (12 * n + this.size) / 13;
                            h.f = (f + l + 8 * n) / 10;
                            f = 2 * Math.PI / b;
                            l = h.f;
                            this.c && 0 == p % 2 && (l += 5);
                            h.x = this.x + Math.cos(f * p + c) * l;
                            h.y = this.y + Math.sin(f * p + c) * l;
                            e = Math.max(e, l)
                        }
                        this.ia =
                            e
                    },
                    pa: function(a, b) {
                        this.L = a;
                        this.M = b;
                        this.J = a;
                        this.K = b;
                        this.ja = a;
                        this.ka = b
                    },
                    S: function() {
                        if (0 >= this.id) return 1;
                        var a = Ya.ra((y - this.T) / 120, 0, 1);
                        if (this.G && 1 <= a) {
                            var b = ba.indexOf(this); - 1 != b && ba.splice(b, 1)
                        }
                        this.x = a * (this.ja - this.s) + this.s;
                        this.y = a * (this.ka - this.u) + this.u;
                        this.size = a * (this.g - this.o) + this.o;
                        .01 > Math.abs(this.size - this.g) && (this.size = this.g);
                        return a
                    },
                    P: function() {
                        return 0 >= this.id ? !0 : this.x + this.size + 40 < A - q / 2 / r || this.y + this.size + 40 < B - u / 2 / r || this.x - this.size - 40 > A + q / 2 / r || this.y - this.size -
                            40 > B + u / 2 / r ? !1 : !0
                    },
                    sa: function(a) {
                        a.beginPath();
                        var b = this.H();
                        a.moveTo(this.a[0].x, this.a[0].y);
                        for (var d = 1; d <= b; ++d) {
                            var c = d % b;
                            a.lineTo(this.a[c].x, this.a[c].y)
                        }
                        a.closePath();
                        a.stroke()
                    },
                    w: function(a) {
                        if (this.P()) {
                            ++this.da;
                            var b = 0 < this.id && !this.c && !this.h && .4 > r || h.selected.simpleDraw && !this.c;
                            5 > this.H() && 0 < this.id && (b = !0);
                            if (this.V && !b)
                                for (var d = 0; d < this.a.length; d++) this.a[d].f = this.size;
                            this.V = b;
                            a.save();
                            this.ta = y;
                            d = this.S();
                            this.G && (a.globalAlpha *= 1 - d);
                            a.lineWidth = 10;
                            a.lineCap = "round";
                            a.lineJoin = this.c ? "miter" : "round";
                            var e = this.name.toLowerCase(),
                                g = null,
                                p = null,
                                d = !1,
                                f = this.color,
                                l = !1;
                            this.h || !Va || sb || (-1 != Rb.indexOf(e) ? (ha.hasOwnProperty(e) || (ha[e] = new Image, ha[e].src = c.ASSETS_ROOT + "skins/" + e + ".png"), g = 0 != ha[e].width && ha[e].complete ? ha[e] : null) : g = null, null != g ? -1 != dd.indexOf(e) && (d = !0) : (this.I && "%starball" == this.C && "shenron" == e && 7 <= t.length && (cc = d = !0, p = hc("%starball1")), g = hc(this.C), null != g && (l = !0, f = Rc(this.C) || f)));
                            m.core.debug && m.debug.showPrediction && this.I && (a.strokeStyle = "#0000FF", a.beginPath(), a.arc(this.L, this.M, this.size + 5, 0, 2 * Math.PI, !1), a.closePath(), a.stroke(), a.strokeStyle = "#00FF00", a.beginPath(), a.arc(this.J, this.K, this.size + 5, 0, 2 * Math.PI, !1), a.closePath(), a.stroke());
                            pa && !sb ? (a.fillStyle = "#FFFFFF", a.strokeStyle = "#AAAAAA") : (a.fillStyle = f, a.strokeStyle = f);
                            b ? (a.beginPath(), a.arc(this.x, this.y, this.size + 5, 0, 2 * Math.PI, !1), a.closePath()) : (this.Da(), this.sa(a));
                            l || a.fill();
                            null != g && (this.na(a, g), null != p && this.na(a, p, {
                                alpha: Math.sin(.0174 * La)
                            }));
                            (pa || 20 < this.size) && !b && (a.strokeStyle = "#000000", a.globalAlpha *= .1, a.stroke());
                            a.globalAlpha = 1;
                            e = -1 != t.indexOf(this);
                            b = ~~this.y;
                            0 != this.id && (fa || e) && this.name && this.i && !d && (g = this.i, g.B(this.name), g.O(this.m()), d = 0 >= this.id ? 1 : Math.ceil(10 * r) / 10, g.oa(d), g = g.N(), p = Math.ceil(g.width / d), f = Math.ceil(g.height / d), a.drawImage(g, ~~this.x - ~~(p / 2), b - ~~(f / 2), p, f), b += g.height / 2 / d + 4);
                            0 < this.id && Wa && (e || 0 == t.length && (!this.c || this.h) && 20 < this.size) && (null == this.R && (this.R = new Na(this.m() / 2, "#FFFFFF", !0, "#000000")), e = this.R, e.O(this.m() / 2), e.B(~~(this.size * this.size /
                                100)), d = Math.ceil(10 * r) / 10, e.oa(d), g = e.N(), p = Math.ceil(g.width / d), f = Math.ceil(g.height / d), a.drawImage(g, ~~this.x - ~~(p / 2), b - ~~(f / 2), p, f));
                            a.restore()
                        }
                    },
                    na: function(a, b, d) {
                        a.save();
                        a.clip();
                        var c = Math.max(this.size, this.ia);
                        null != d && null != d.alpha && (a.globalAlpha = d.alpha);
                        a.drawImage(b, this.x - c - 5, this.y - c - 5, 2 * c + 10, 2 * c + 10);
                        a.restore()
                    }
                };
                var Ya = function(a) {
                    function b(a, b, c) {
                        return a < b ? b : a > c ? c : a
                    }
                    a.ha = function(a, c) {
                        var e;
                        e = b(.5, 0, 1);
                        return a + e * (c - a)
                    };
                    a.ra = b;
                    a.fixed = function(a, b) {
                        var c = Math.pow(10, b);
                        return ~~(a *
                            c) / c
                    };
                    return a
                }({});
                c.Maths = Ya;
                var hb = function(a) {
                    a.la = function() {
                        for (var a = new Date, d = [a.getMonth() + 1, a.getDate(), a.getFullYear()], a = [a.getHours(), a.getMinutes(), a.getSeconds()], c = 1; 3 > c; c++) 10 > a[c] && (a[c] = "0" + a[c]);
                        return "[" + d.join("/") + " " + a.join(":") + "]"
                    };
                    return a
                }({});
                c.Utils = hb;
                Na.prototype = {
                    F: "",
                    W: "#000000",
                    Y: !1,
                    Z: "#000000",
                    v: 16,
                    j: null,
                    X: null,
                    l: !1,
                    D: 1,
                    O: function(a) {
                        this.v != a && (this.v = a, this.l = !0)
<<<<<<< HEAD
                    },
                    oa: function(a) {
                        this.D != a && (this.D = a, this.l = !0)
                    },
=======
                    },
                    oa: function(a) {
                        this.D != a && (this.D = a, this.l = !0)
                    },
>>>>>>> master
                    B: function(a) {
                        a != this.F && (this.F = a, this.l = !0)
                    },
                    N: function() {
                        null == this.j && (this.j = document.createElement("canvas"), this.X = this.j.getContext("2d"));
                        if (this.l) {
                            this.l = !1;
                            var a = this.j,
                                b = this.X,
                                c = this.F,
                                e = this.D,
                                g = this.v,
                                f = g + "px Ubuntu";
                            b.font = f;
                            var h = ~~(.2 * g);
                            a.width = (b.measureText(c).width + 6) * e;
                            a.height = (g + h) * e;
                            b.font = f;
                            b.scale(e, e);
                            b.globalAlpha = 1;
                            b.lineWidth = 3;
                            b.strokeStyle = this.Z;
                            b.fillStyle = this.W;
                            this.Y && b.strokeText(c, 3, g - h / 2);
                            b.fillText(c, 3, g - h / 2)
                        }
                        return this.j
                    }
                };
                Date.now || (Date.now = function() {
                    return (new Date).getTime()
                });
                (function() {
                    for (var a = ["ms", "moz", "webkit", "o"], b = 0; b < a.length && !c.requestAnimationFrame; ++b) c.requestAnimationFrame = c[a[b] + "RequestAnimationFrame"], c.cancelAnimationFrame = c[a[b] + "CancelAnimationFrame"] || c[a[b] + "CancelRequestAnimationFrame"];
                    c.requestAnimationFrame || (c.requestAnimationFrame = function(a) {
                        return setTimeout(a, 1E3 / 60)
                    }, c.cancelAnimationFrame = function(a) {
                        clearTimeout(a)
                    })
                })();
                var xc = {
                        init: function(a) {
                            function b(a) {
                                a < e && (a = e);
                                a > f && (a = f);
                                return ~~((a - e) / 32)
                            }

                            function c(a) {
                                a < g && (a = g);
                                a > h && (a = h);
                                return ~~((a - g) / 32)
                            }
                            var e = a.Ba,
                                g = a.Ca,
                                f = a.za,
                                h = a.Aa,
                                l = ~~((f - e) / 32) + 1,
                                k = ~~((h - g) / 32) + 1,
                                n = Array(l * k);
                            return {
                                va: function(a) {
                                    var e = b(a.x) + c(a.y) * l;
                                    null == n[e] ? n[e] = a : Array.isArray(n[e]) ? n[e].push(a) : n[e] = [n[e], a]
                                },
                                Ga: function(a, e, g, f, h) {
                                    var p = b(a),
                                        v = c(e);
                                    a = b(a + g);
                                    e = c(e + f);
                                    if (0 > p || p >= l || 0 > v || v >= k) debugger;
                                    for (; v <= e; ++v)
                                        for (f = p; f <= a; ++f)
                                            if (g = n[f + v * l], null != g)
                                                if (Array.isArray(g))
                                                    for (var m = 0; m < g.length; m++) h(g[m]);
                                                else h(g)
                                }
                            }
                        }
                    },
                    Wb = function() {
                        var a = new ca(0, 0, 0, 32, "#ED1C24", ""),
                            b = document.createElement("canvas");
                        b.width = 32;
                        b.height =
                            32;
                        var c = b.getContext("2d");
                        return function() {
                            0 < t.length && (a.color = t[0].color, a.A(t[0].name));
                            c.clearRect(0, 0, 32, 32);
                            c.save();
                            c.translate(16, 16);
                            c.scale(.4, .4);
                            a.w(c);
                            c.restore();
                            var e = document.getElementById("favicon"),
                                g = e.cloneNode(!0);
                            g.setAttribute("href", b.toDataURL("image/png"));
                            //UPDATE -- NO IDEA WHAT I JUST DID THERE!
                            //e.setAttribute("href", b.toDataURL("image/png"));
                            e.parentNode.replaceChild(g, e)
                        }
                    }();
                e(function() {
                    Wb()
                });
                var Qa = {
                        context: null,
                        defaultProvider: "facebook",
                        loginIntent: "0",
                        userInfo: {
                            socialToken: null,
                            tokenExpires: "",
                            level: "",
                            xp: "",
                            xpNeeded: "",
                            name: "",
                            picture: "",
                            displayName: "",
                            loggedIn: "0",
                            socialId: ""
                        }
                    },
                    k = c.defaultSt = Qa;
                c.storageInfo = k;
                c.createDefaultStorage = Tc;
                c.updateStorage = Ra;
                e(function() {
                    null != c.localStorage.storeObjectInfo && (k = JSON.parse(c.localStorage.storeObjectInfo));
                    "1" == k.loginIntent && ic(k.context);
                    "" == k.userInfo.name && "" == k.userInfo.displayName || jc(k.userInfo)
                });
                c.checkLoginStatus = function() {
                    "1" == k.loginIntent && (Sa(), ic(k.context))
                };
                var Sa = function() {
                    c.MC.setProfilePicture(k.userInfo.picture);
                    c.MC.setSocialId(k.userInfo.socialId)
                };
                c.logout = function() {
                    k = Qa;
                    delete c.localStorage.storeObjectInfo;
                    c.localStorage.storeObjectInfo = JSON.stringify(Qa);
                    Ra();
                    uc();
                    m.cache.sentGameServerLogin = !1;
                    delete m.cache.login_info;
                    e("#helloContainer").attr("data-logged-in", "0");
                    e("#helloContainer").attr("data-has-account-data", "0");
                    e(".timer").text("");
                    e("#gPlusShare").hide();
                    e("#fbShare").show();
                    e("#user-id-tag").text("");
                    Q();
                    c.MC.doLogout()
                };
                c.toggleSocialLogin = function() {
                    e("#socialLoginContainer").toggle();
                    e("#settings").hide();
                    e("#instructions").hide();
                    Eb()
<<<<<<< HEAD
                };
                c.toggleSettings = function() {
                    e("#settings").toggle();
                    e("#socialLoginContainer").hide();
                    e("#instructions").hide();
                    Eb()
                };
                m.account = function(a) {
                    function b() {}

                    function d(a, b) {
                        if (null == f || f.id != b.id) f = b, null != c.ssa_json && (c.ssa_json.applicationUserId = "" + b.id, c.ssa_json.custom_user_id = "" + b.id), "undefined" != typeof SSA_CORE && SSA_CORE.start()
                    }
                    var f = null;
                    a.init = function() {
                        m.core.bind("user_login", d);
                        m.core.bind("user_logout", b)
                    };
                    a.setUserData = function(a) {
                        jc(a)
                    };
                    a.setAccountData = function(a, b) {
                        var c = e("#helloContainer").attr("data-has-account-data", "1");
                        k.userInfo.xp = a.xp;
                        k.userInfo.xpNeeded = a.xpNeeded;
                        k.userInfo.level = a.level;
                        Ra();
                        c && b ? ga(a) : (e(".agario-profile-panel .progress-bar-star").text(a.level), e(".agario-exp-bar .progress-bar-text").text(a.xp + "/" + a.xpNeeded + " XP"), e(".agario-exp-bar .progress-bar").css("width", (88 * a.xp / a.xpNeeded).toFixed(2) + "%"))
                    };
                    a.Ia = function(a) {
                        ga(a)
                    };
                    return a
                }({});
                var lc = 0;
                c.fbAsyncInit = function() {
                    function a() {
                        null == c.FB ? alert("You seem to have something blocking Facebook on your browser, please check for any extensions") : (k.loginIntent = "1", c.updateStorage(), c.FB.login(function(a) {
                            kc(a)
                        }, {
                            scope: "public_profile, email"
                        }))
                    }
                    c.FB.init({
                        appId: EnvConfig.fb_app_id,
                        cookie: !0,
                        xfbml: !0,
                        status: !0,
                        version: "v2.2"
                    });
                    ("1" == c.storageInfo.loginIntent && "facebook" == c.storageInfo.context || qc) && c.FB.getLoginStatus(function(b) {
                        "connected" === b.status ? kc(b) : "not_authorized" === b.status ? (c.logout(), a()) : c.logout()
                    });
                    c.facebookRelogin = a;
                    c.facebookLogin = a
                };
=======
                };
                c.toggleSettings = function() {
                    e("#settings").toggle();
                    e("#socialLoginContainer").hide();
                    e("#instructions").hide();
                    Eb()
                };
                m.account = function(a) {
                    function b() {}

                    function d(a, b) {
                        if (null == f || f.id != b.id) f = b, null != c.ssa_json && (c.ssa_json.applicationUserId = "" + b.id, c.ssa_json.custom_user_id = "" + b.id), "undefined" != typeof SSA_CORE && SSA_CORE.start()
                    }
                    var f = null;
                    a.init = function() {
                        m.core.bind("user_login", d);
                        m.core.bind("user_logout", b)
                    };
                    a.setUserData = function(a) {
                        jc(a)
                    };
                    a.setAccountData = function(a, b) {
                        var c = e("#helloContainer").attr("data-has-account-data", "1");
                        k.userInfo.xp = a.xp;
                        k.userInfo.xpNeeded = a.xpNeeded;
                        k.userInfo.level = a.level;
                        Ra();
                        c && b ? ga(a) : (e(".agario-profile-panel .progress-bar-star").text(a.level), e(".agario-exp-bar .progress-bar-text").text(a.xp + "/" + a.xpNeeded + " XP"), e(".agario-exp-bar .progress-bar").css("width", (88 * a.xp / a.xpNeeded).toFixed(2) + "%"))
                    };
                    a.Ia = function(a) {
                        ga(a)
                    };
                    return a
                }({});
                var lc = 0;
                c.fbAsyncInit = function() {
                    function a() {
                        null == c.FB ? alert("You seem to have something blocking Facebook on your browser, please check for any extensions") : (k.loginIntent = "1", c.updateStorage(), c.FB.login(function(a) {
                            kc(a)
                        }, {
                            scope: "public_profile, email"
                        }))
                    }
                    c.FB.init({
                        appId: EnvConfig.fb_app_id,
                        cookie: !0,
                        xfbml: !0,
                        status: !0,
                        version: "v2.2"
                    });
                    ("1" == c.storageInfo.loginIntent && "facebook" == c.storageInfo.context || qc) && c.FB.getLoginStatus(function(b) {
                        "connected" === b.status ? kc(b) : "not_authorized" === b.status ? (c.logout(), a()) : c.logout()
                    });
                    c.facebookRelogin = a;
                    c.facebookLogin = a
                };
>>>>>>> master
                var Kb = !1;
                (function(a) {
                    function b() {
                        var a = document.createElement("script");
                        a.type = "text/javascript";
                        a.async = !0;
                        a.src = "//apis.google.com/js/client:platform.js?onload=gapiAsyncInit";
                        var b = document.getElementsByTagName("script")[0];
                        b.parentNode.insertBefore(a, b);
                        f = !0
                    }
                    var d = {},
                        f = !1;
                    c.gapiAsyncInit = function() {
                        e(d).trigger("initialized")
                    };
                    a.google = {
                        xa: function() {
                            b()
                        },
                        ua: function(a, b) {
                            c.gapi.client.load("plus", "v1", function() {
                                console.log("fetching me profile");
                                gapi.client.plus.people.get({
                                    userId: "me"
                                }).execute(function(a) {
                                    b(a)
                                })
                            })
                        }
                    };
                    a.Fa = function(a) {
                        f || b();
                        "undefined" !== typeof gapi ? a() : e(d).bind("initialized", a)
                    };
                    return a
                })(m);
                var ed = function(a) {
                    function b(a) {
                        c.MC.doLoginWithGPlus(a);
                        m.cache.login_info = [a, "google"]
                    }

                    function d(a) {
                        k.userInfo.picture = a;
                        e(".agario-profile-picture").attr("src", a)
                    }
                    var f = null,
                        g = {
                            client_id: EnvConfig.gplus_client_id,
                            cookie_policy: "single_host_origin",
                            scope: "profile email"
                        };
                    a.fa = {
                        qa: function() {
                            return f
                        },
                        init: function() {
                            var a = this,
                                b = k && "1" == k.loginIntent && "google" == k.context;
                            m.Fa(function() {
                                c.gapi.ytsubscribe.go("agarYoutube");
                                c.gapi.load("auth2", function() {
                                    f = c.gapi.auth2.init(g);
                                    f.attachClickHandler(document.getElementById("gplusLogin"), {}, function(a) {
                                        console.log("googleUser : " + a)
                                    }, function(a) {
                                        console.log("failed to login in google plus: ", JSON.stringify(a, void 0, 2))
                                    });
                                    f.currentUser.listen(_.bind(a.Ea, a));
                                    b && 1 == f.isSignedIn.get() && f.signIn()
                                })
                            })
                        },
                        Ea: function(a) {
                            if (f && a && f.isSignedIn.get() && !Kb) {
                                Kb = !0;
                                k.loginIntent = "1";
                                var e = a.getAuthResponse(),
                                    g = e.access_token;
                                c.qa = e;
                                console.log("loggedIn with G+!");
                                var h = a.getBasicProfile();
                                a = h.getImageUrl();
                                void 0 == a ? m.google.ua(e, function(a) {
                                    a.result.isPlusUser ? (a && d(a.image.url), b(g), a && (k.userInfo.picture = a.image.url), k.userInfo.socialId = h.getId(), Sa()) : (alert("Please add Google+ to your Google account and try again.\nOr you can login with another account."), c.logout())
                                }) : (d(a), k.userInfo.picture = a, k.userInfo.socialId = h.getId(), Sa(), b(g));
                                k.context = "google";
                                c.updateStorage()
                            }
                        },
                        ya: function() {
                            f && (f.signOut(), Kb = !1)
                        }
                    };
                    return a
                }(m);
                c.gplusModule = ed;
                var uc = function() {
                    m.fa.ya()
                };
                c.logoutGooglePlus = uc;
                var cd = function() {
                    function a(a, b, c, d, e) {
                        var f = b.getContext("2d"),
                            g = b.width;
                        b = b.height;
                        a.color = e;
                        a.A(c);
                        a.size = d;
                        f.save();
                        f.translate(g / 2, b / 2);
                        a.w(f);
                        f.restore()
                    }
                    for (var b = new ca(-1, 0, 0, 32, "#5bc0de", ""), c = new ca(-1, 0, 0, 32, "#5bc0de", ""), f = "#0791ff #5a07ff #ff07fe #ffa507 #ff0774 #077fff #3aff07 #ff07ed #07a8ff #ff076e #3fff07 #ff0734 #07ff20 #ff07a2 #ff8207 #07ff0e".split(" "), g = [], h = 0; h < f.length; ++h) {
                        var k = h / f.length * 12,
                            l = 30 * Math.sqrt(h / f.length);
                        g.push(new ca(-1, Math.cos(k) * l, Math.sin(k) * l, 10, f[h], ""))
                    }
                    Sc(g);
                    var m = document.createElement("canvas");
                    m.getContext("2d");
                    m.width = m.height = 70;
                    a(c, m, "", 26, "#ebc0de");
                    return function() {
                        e(".cell-spinner").filter(":visible").each(function() {
                            var c = e(this),
                                d = Date.now(),
                                f = this.width,
                                g = this.height,
                                h = this.getContext("2d");
                            h.clearRect(0, 0, f, g);
                            h.save();
                            h.translate(f / 2, g / 2);
                            for (var k = 0; 10 > k; ++k) h.drawImage(m, (.1 * d + 80 * k) % (f + 140) - f / 2 - 70 - 35, g / 2 * Math.sin((.001 * d + k) % Math.PI * 2) - 35, 70, 70);
                            h.restore();
                            (c = c.attr("data-itr")) && (c = R(c));
                            a(b, this, c || "", +e(this).attr("data-size"), "#5bc0de")
                        });
                        e("#statsPellets").filter(":visible").each(function() {
                            e(this);
                            var b = this.width,
                                c = this.height;
                            this.getContext("2d").clearRect(0, 0, b, c);
                            for (b = 0; b < g.length; b++) a(g[b], this, "", g[b].size, g[b].color)
                        })
                    }
                }();
                c.createParty = function() {
                    ka(":party");
                    S = function(a) {
                        Fb("/#" + c.encodeURIComponent(a));
                        e(".partyToken").val("agar.io/#" + c.encodeURIComponent(a));
                        e("#helloContainer").attr("data-party-state", "1")
                    };
                    Q()
                };
                c.joinParty = mc;
                c.cancelParty = function() {
                    Fb("/");
                    e("#helloContainer").attr("data-party-state", "0");
                    ka("");
                    Q()
                };
                var F = [],
                    wb = 0,
                    xb = "#000000",
                    aa = !1,
                    Aa = !1,
                    Ja = 0,
                    Gb = 0,
                    zb = 0,
                    yb = 0,
                    W = 0,
                    Ta = !0;
                c.onPlayerDeath = Ga;
                setInterval(function() {
                    Aa && F.push(dc() / 100)
                }, 1E3 / 60);
                setInterval(function() {
                    var a = Vc();
                    0 != a && (++zb, 0 == W && (W = a), W = Math.min(W, a))
                }, 1E3);
                c.closeStats = function() {
                    aa = !1;
                    e("#stats").hide();
                    c.destroyAd(c.adSlots.ab);
                    ua(0)
                };
                c.setSkipStats = function(a) {
                    Ta = !a
                };
                c.getStatsString = oc;
                c.gPlusShare = Xc;
                c.twitterShareStats = function() {
                    var a = c.getStatsString("tt_share_stats");
                    c.open("https://twitter.com/intent/tweet?text=" + a, "Agar.io", "width=660,height=310,menubar=no,toolbar=no,resizable=yes,scrollbars=no,left=" +
                        (c.screenX + c.innerWidth / 2 - 330) + ",top=" + (c.innerHeight - 310) / 2)
                };
                c.fbShareStats = function() {
                    var a = c.getStatsString("fb_matchresults_subtitle");
                    c.FB.ui({
                        method: "feed",
                        display: "iframe",
                        name: R("fb_matchresults_title"),
                        caption: R("fb_matchresults_description"),
                        description: a,
                        link: "http://agar.io",
                        La: "http://static2.miniclipcdn.com/mobile/agar/Agar.io_matchresults_fb_1200x630.png",
                        Ha: {
                            name: "play now!",
                            link: "http://agar.io"
                        }
                    })
                };
                c.fillSocialValues = function(a, b) {
                    1 == c.isChrome && "google" == c.storageInfo.context &&
                        c.gapi.interactivepost.render(b, {
                            contenturl: EnvConfig.game_url,
                            clientid: EnvConfig.gplus_client_id,
                            cookiepolicy: "http://agar.io",
                            prefilltext: a,
                            calltoactionlabel: "BEAT",
                            calltoactionurl: EnvConfig.game_url
                        })
                };
                e(function() {
                    "MAsyncInit" in c && c.MAsyncInit()
                })
            }
        }
    }
})(window, window.jQuery);
//UPDATE
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
    window.jQuery.ajax({
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
