// ==UserScript==
// @name        Launcher
// @namespace   AposLauncher
// @include     http://agar.io/
// @version     2.86
// @grant       none
// @author      http://www.twitch.tv/apostolique
// ==/UserScript==

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

Array.prototype.peek = function() {
    return this[this.length-1];
}

$.get('https://raw.githubusercontent.com/Apostolique/Agar.io-bot/master/launcher.user.js?1', function(data) {
	var latestVersion = data.replace(/(\r\n|\n|\r)/gm,"");
	latestVersion = latestVersion.substring(latestVersion.indexOf("// @version")+11,latestVersion.indexOf("// @grant"));

	latestVersion = parseFloat(latestVersion + 0.0000);
    var myVersion = parseFloat(GM_info.script.version + 0.0000); 
	
	if(latestVersion > myVersion)
	{
		alert("Update Available for launcher.user.js: V" + latestVersion + "\nGet the latest version from the GitHub page.");
        window.open('https://github.com/Apostolique/Agar.io-bot/blob/master/launcher.user.js','_blank');
	}
	console.log('Current launcher.user.js Version: ' + myVersion + " on Github: " + latestVersion);
});

console.log("Running Bot Launcher!");
(function (h, f) {

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
            window.onmouseup = function () {
            };
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
    return [getPointX(), getPointY()];
  }

  function Sa() {

    //UPDATE
    if (window.botList == null) {
        window.botList = [];
        window.jQuery('#locationUnknown').append(window.jQuery('<select id="bList" class="form-control" onchange="setBotIndex($(this).val());" />'));
        window.jQuery('#locationUnknown').addClass('form-group');
    }

    window.jQuery('#nick').val(originalName);

    window.botList.push(["Human", humanPlayer]);

    var bList = window.jQuery('#bList');
    window.jQuery('<option />', {value: (window.botList.length - 1), text: "Human"}).appendTo(bList);

    la = !0;
    za();
    setInterval(za, 180000);
    B = ma = document.getElementById('canvas');
    e = B.getContext('2d');
    B.onmousedown = function (a) {
      if (Aa) {
        var b = a.clientX - (5 + p / 5 / 2),
        c = a.clientY - (5 + p / 5 / 2);
        if (Math.sqrt(b * b + c * c) <= p / 5 / 2) {
          K();
          C(17);
          return
        }
      }
      T = a.clientX;
      U = a.clientY;
      na();
      K()
    };
    B.onmousemove = function (a) {
      T = a.clientX;
      U = a.clientY;
      na()
    };
    B.onmouseup = function () {
    };
    /firefox/i.test(navigator.userAgent) ? document.addEventListener('DOMMouseScroll', Ba, !1)  : document.body.onmousewheel = Ba;
    var a = !1,
    b = !1,
    c = !1;
    h.onkeydown = function (d) {
      //UPDATE
      if (!window.jQuery('#nick').is(":focus")) {
        32 != d.keyCode || a || (K(), C(17), a = !0);
        81 != d.keyCode || b || (C(18), b = !0);
        87 != d.keyCode || c || (K(), C(21), c = !0);
        27 == d.keyCode && Ca(!0);

        //UPDATE
        keyAction(d);
      }
    };
    h.onkeyup = function (d) {
      32 == d.keyCode && (a = !1);
      87 == d.keyCode && (c = !1);
      81 == d.keyCode && b && (C(19), b = !1)
    };
    h.onblur = function () {
      C(19);
      c = b = a = !1
    };
    h.onresize = Da;
    Da();
    h.requestAnimationFrame ? h.requestAnimationFrame(Ea)  : setInterval(oa, 1000 / 60);
    setInterval(K, 40);
    v && f('#region').val(v);
    Fa();
    V(f('#region').val());
    null == r && v && W();
    f('#overlays').show()
  }
  function Ba(a) {
    D *= Math.pow(0.9, a.wheelDelta / - 120 || a.detail || 0);
    1 > D && (D = 1);
    D > 4 / g && (D = 4 / g)
  }
  function Ta() {
    if (0.4 > g) L = null;
     else {
      for (var a = Number.POSITIVE_INFINITY, b = Number.POSITIVE_INFINITY, c = Number.NEGATIVE_INFINITY, d = Number.NEGATIVE_INFINITY, e = 0, l = 0; l < u.length; l++) {
        var k = u[l];
        !k.I() || k.M || 20 >= k.size * g || (e = Math.max(k.size, e), a = Math.min(k.x, a), b = Math.min(k.y, b), c = Math.max(k.x, c), d = Math.max(k.y, d))
      }
      L = Ua.ca({
        X: a - (e + 100),
        Y: b - (e + 100),
        fa: c + (e + 100),
        ga: d + (e + 100),
        da: 2,
        ea: 4
      });
      for (l = 0; l < u.length; l++) if (k = u[l], k.I() && !(20 >= k.size * g)) for (a = 0; a < k.a.length; ++a) b = k.a[a].x,
      c = k.a[a].y,
      b < s - p / 2 / g || c < t - q / 2 / g || b > s + p / 2 / g || c > t + q / 2 / g || L.i(k.a[a])
    }
  }
  function na() {
    //UPDATE
    if (toggle ||window.botList[botIndex][0] == "Human") {
      X = (T - p / 2) / g + s;
      Y = (U - q / 2) / g + t
    }
  }
  function za() {
    null == Z && (Z = {
    }, f('#region').children().each(function () {
      var a = f(this),
      b = a.val();
      b && (Z[b] = a.text())
    }));
    f.get($ + '//m.agar.io/info', function (a) {
      var b = {
      },
      c;
      for (c in a.regions) {
        var d = c.split(':') [0];
        b[d] = b[d] || 0;
        b[d] += a.regions[c].numPlayers
      }
      for (c in b) f('#region option[value="' + c + '"]').text(Z[c] + ' (' + b[c] + ' players)')
    }, 'json')
  }
  function Ga() {
    f('#adsBottom').hide();
    f('#overlays').hide();
    Fa()
  }
  function V(a) {
    a && a != v && (f('#region').val() != a && f('#region').val(a), v = h.localStorage.location = a, f('.region-message').hide(), f('.region-message.' + a).show(), f('.btn-needs-server').prop('disabled', !1), la && W())
  }
  function Ca(a) {
    E = null;
    f('#overlays').fadeIn(a ? 200 : 3000);
    a || f('#adsBottom').fadeIn(3000)
  }
  function Fa() {
    f('#region').val() ? h.localStorage.location = f('#region').val()  : h.localStorage.location && f('#region').val(h.localStorage.location);
    f('#region').val() ? f('#locationKnown').append(f('#region'))  : f('#locationUnknown').append(f('#region'))
  }
  function pa() {
    console.log('Find ' + v + M);
    f.ajax($ + '//m.agar.io/', {
      error: function () {
        setTimeout(pa, 1000)
      },
      success: function (a) {
        a = a.split('\n');
        Ha('ws://' + a[0], a[1])
      },
      dataType: 'text',
      method: 'POST',
      cache: !1,
      crossDomain: !0,
      data: v + M || '?'
    })
  }
  function W() {
    la && v && (f('#connecting').show(), pa())
  }
  function Ha(a, hash) {
    if (r) {
      r.onopen = null;
      r.onmessage = null;
      r.onclose = null;
      try {
        r.close()
      } catch (b) {
      }
      r = null
    }
    if (Va) {
      var d = a.split(':');
      a = d[0] + 's://ip-' + d[1].replace(/\./g, '-').replace(/\//g, '') + '.tech.agar.io:' + ( + d[2] + 2000)
    }
    F = [
    ];
    m = [
    ];
    z = {
    };
    u = [
    ];
    H = [
    ];
    A = [
    ];
    w = x = null;
    I = 0;
    console.log('Connecting to ' + a);
    //UPDATE
    serverIP = a;
    r = new WebSocket(a);
    r.binaryType = 'arraybuffer';
    r.onopen = function() {
      var a;
      aa = 500;
      f('#connecting').hide();
      console.log('socket open');
      a = N(5);
      a.setUint8(0, 254);
      a.setUint32(1, 4, !0);
      O(a);
      a = N(5);
      a.setUint8(0, 255);
      a.setUint32(1, 154669603, !0);
      O(a);
      a = N(1 + hash.length);
      a.setUint8(0, 80);
      for (var c = 0; c < hash.length; ++c) {
        a.setUint8(c + 1, hash.charCodeAt(c));
      }
      O(a);
      Ia()
    }
    r.onmessage = Xa;
    r.onclose = Ya;
    r.onerror = function () {
      console.log('socket error')
    }
  }
  function N(a) {
    return new DataView(new ArrayBuffer(a))
  }
  function O(a) {
    r.send(a.buffer)
  }
  function Ya() {
    console.log('socket close');
    setTimeout(W, aa);
    aa *= 1.5
  }
  function Xa(a) {
    Za(new DataView(a.data))
  }
  function Za(a) {
    function b() {
      for (var b = ''; ; ) {
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
        $a(a, c);
        break;
      case 17:
        P = a.getFloat32(c, !0);
        c += 4;
        Q = a.getFloat32(c, !0);
        c += 4;
        R = a.getFloat32(c, !0);
        c += 4;
        break;
      case 20:
        m = [
        ];
        F = [
        ];
        break;
      case 21:
        qa = a.getInt16(c, !0);
        c += 2;
        ra = a.getInt16(c, !0);
        c += 2;
        sa || (sa = !0, ba = qa, ca = ra);
        break;
      case 32:
        F.push(a.getUint32(c, !0));
        c += 4;
        break;
      case 49:
        if (null != x) break;
        var d = a.getUint32(c, !0),
        c = c + 4;
        A = [
        ];
        for (var e = 0; e < d; ++e) {
          var l = a.getUint32(c, !0),
          c = c + 4;
          A.push({
            id: l,
            name: b()
          })
        }
        Ja();
        break;
      case 50:
        x = [
        ];
        d = a.getUint32(c, !0);
        c += 4;
        for (e = 0; e < d; ++e) x.push(a.getFloat32(c, !0)),
        c += 4;
        Ja();
        break;
      case 64:
        da = a.getFloat64(c, !0),
        c += 8,
        ea = a.getFloat64(c, !0),
        c += 8,
        fa = a.getFloat64(c, !0),
        c += 8,
        ga = a.getFloat64(c, !0),
        c += 8,
        P = (fa + da) / 2,
        Q = (ga + ea) / 2,
        R = 1,
        0 == m.length && (s = P, t = Q, g = R)
    }
  }
  function $a(a, b) {
    G = + new Date;
    var c = Math.random();
    ta = !1;
    var d = a.getUint16(b, !0);
    b += 2;
    for (var e = 0; e < d; ++e) {
      var l = z[a.getUint32(b, !0)],
      k = z[a.getUint32(b + 4, !0)];
      b += 8;
      l && k && (k.S(), k.p = k.x, k.q = k.y, k.o = k.size, k.D = l.x, k.F = l.y, k.n = k.size, k.L = G)
    }
    for (e = 0; ; ) {
      d = a.getUint32(b, !0);
      b += 4;
      if (0 == d) break;
      ++e;
      var h,
      l = a.getInt16(b, !0);
      b += 2;
      k = a.getInt16(b, !0);
      b += 2;
      h = a.getInt16(b, !0);
      b += 2;
      for (var g = a.getUint8(b++), f = a.getUint8(b++), p = a.getUint8(b++), g = (g <<
      16 | f << 8 | p).toString(16); 6 > g.length; ) g = '0' + g;
      var g = '#' + g,
      f = a.getUint8(b++),
      p = !!(f & 1),
      r = !!(f & 16);
      f & 2 && (b += 4);
      f & 4 && (b += 8);
      f & 8 && (b += 16);
      for (var q, n = ''; ; ) {
        q = a.getUint16(b, !0);
        b += 2;
        if (0 == q) break;
        n += String.fromCharCode(q)
      }
      q = n;
      n = null;
      z.hasOwnProperty(d) ? (n = z[d], n.K(), n.p = n.x, n.q = n.y, n.o = n.size, n.color = g)  : (n = new Ka(d, l, k, h, g, q), n.ka = l, n.la = k);
      n.d = p;
      n.j = r;
      n.D = l;
      n.F = k;
      n.n = h;
      n.ja = c;
      n.L = G;
      n.W = f;
      q && n.Z(q);
      - 1 != F.indexOf(d) && - 1 == m.indexOf(n) && (document.getElementById('overlays').style.display = 'none', m.push(n), 1 == m.length && (s = n.x, t = n.y))

      //UPDATE
      interNodes[d] = window.getCells()[d];
    }

    //UPDATE
    Object.keys(interNodes).forEach(function (element, index) {
        //console.log("start: " + interNodes[element].updateTime + " current: " + D + " life: " + (D - interNodes[element].updateTime));
        var isRemoved = !window.getCells().hasOwnProperty(element);


        if (isRemoved  && (getLastUpdate() - interNodes[element].L) > 3000) {
            delete interNodes[element];
        } else if (isRemoved && computeDistance(getOffsetX(), getOffsetY(), interNodes[element].x, interNodes[element].y) < screenDistance()) {
            //console.log("Too close! Remove " + computeDistance(getOffsetX(), getOffsetY(), interNodes[element].x, interNodes[element].y) + " || " + screenDistance());

            delete interNodes[element];
        }
    });

    c = a.getUint32(b, !0);
    b += 4;
    for (e = 0; e < c; e++) d = a.getUint32(b, !0),
    b += 4,
    n = z[d],
    null != n && n.S();
    //ta && 0 == m.length && Ca(!1)
  }

  //UPDATE
  function computeDistance(x1, y1, x2, y2) {
      var xdis = x1 - x2; // <--- FAKE AmS OF COURSE!
      var ydis = y1 - y2;
      var distance = Math.sqrt(xdis * xdis + ydis * ydis);

      return distance;
  }

  function screenDistance() {
      return Math.min(computeDistance
        (getOffsetX(), getOffsetY(), screenToGameX(getWidth()), getOffsetY()), computeDistance
        (getOffsetX(), getOffsetY(), getOffsetX(), screenToGameY(getHeight())));
  }

  function screenToGameX(x) {
      return (x - getWidth() / 2) / getRatio() + getX();
  }

  function screenToGameY(y) {
      return (y - getHeight() / 2) / getRatio() + getY();;
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

  window.drawLine =  function(x_1, y_1, x_2, y_2, drawColor) {
      if (!toggleDraw) {
          lines.push([x_1, y_1, x_2, y_2, drawColor]);
      }
  }

  window.drawCircle = function(x_1, y_1, radius, drawColor) {
      if (!toggleDraw) {
          circles.push([x_1, y_1, radius, drawColor]);
      }
  }

  function K() {

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
    if (ua()) {
      a = T - p / 2;
      var b = U - q / 2;
      64 > a * a + b * b || 0.01 > Math.abs(La - X) && 0.01 > Math.abs(Ma - Y) || (La = X, Ma = Y, a = N(21), a.setUint8(0, 16), a.setFloat64(1, X, !0), a.setFloat64(9, Y, !0), a.setUint32(17, 0, !0), O(a))
    }
  }
  function Ia() {
    if (ua() && null != E) {
      var a = N(1 + 2 * E.length);
      a.setUint8(0, 0);
      for (var b = 0; b < E.length; ++b) a.setUint16(1 + 2 * b, E.charCodeAt(b), !0);
      O(a)
    }
  }
  function ua() {
    return null != r && r.readyState == r.OPEN
  }
  function C(a) {
    if (ua()) {
      var b = N(1);
      b.setUint8(0, a);
      O(b)
    }
  }
  function Ea() {
    oa();
    h.requestAnimationFrame(Ea)
  }
  function Da() {
    p = h.innerWidth;
    q = h.innerHeight;
    ma.width = B.width = p;
    ma.height = B.height = q;
    oa()
  }
  function Na() {
    var a;
    a = 1 * Math.max(q / 1080, p / 1920);
    return a *= D
  }
  function ab() {
    if (0 != m.length) {
      for (var a = 0, b = 0; b < m.length; b++) a += m[b].size;
      a = Math.pow(Math.min(64 / a, 1), 0.4) * Na();
      g = (9 * g + a) / 10
    }
  }
  function oa() {

    //UPDATE
    dPoints = [];
    circles = [];
    dArc = [];
    dText = [];
    lines = [];


    var a,
    b = Date.now();
    ++bb;
    G = b;
    if (0 < m.length) {
      ab();
      for (var c = a = 0, d = 0; d < m.length; d++) m[d].K(),
      a += m[d].x / m.length,
      c += m[d].y / m.length;
      P = a;
      Q = c;
      R = g;
      s = (s + a) / 2;
      t = (t + c) / 2
    } else s = (29 * s + P) / 30,
    t = (29 * t + Q) / 30,
    g = (9 * g + R * Na()) / 10;
    Ta();
    na();
    va || e.clearRect(0, 0, p, q);
    va ? (e.fillStyle = ha ? '#111111' : '#F2FBFF', e.globalAlpha = 0.05, e.fillRect(0, 0, p, q), e.globalAlpha = 1)  : cb();
    u.sort(function (a, b) {
      return a.size == b.size ? a.id - b.id : a.size - b.size
    });
    e.save();
    e.translate(p / 2, q / 2);
    e.scale(g, g);
    e.translate( - s, - t);
    for (d = 0; d < H.length; d++) H[d].T();
    for (d = 0; d < u.length; d++) u[d].T();
    //UPDATE
    if (getPlayer().length > 0) {
        var moveLoc = window.botList[botIndex][1](toggleFollow);
        if (!toggle) {
            setPoint(moveLoc[0], moveLoc[1]);
        }
    }
    customRender(e);
    if (sa) {
      ba = (3 * ba + qa) / 4;
      ca = (3 * ca + ra) / 4;
      e.save();
      e.strokeStyle =
      '#FFAAAA';
      e.lineWidth = 10;
      e.lineCap = 'round';
      e.lineJoin = 'round';
      e.globalAlpha = 0.5;
      e.beginPath();
      for (d = 0; d < m.length; d++) e.moveTo(m[d].x, m[d].y),
      e.lineTo(ba, ca);
      e.stroke();
      e.restore()
    }
    e.restore();
    w && w.width && e.drawImage(w, p - w.width - 10, 10);
    I = Math.max(I, db());
    //UPDATE

    var currentDate = new Date();

    var nbSeconds = 0;
    if (getPlayer().length > 0) {
        nbSeconds = (currentDate.getSeconds() + (currentDate.getMinutes() * 60) + (currentDate.getHours() * 60 * 60)) - (lifeTimer.getSeconds() + (lifeTimer.getMinutes() * 60) + (lifeTimer.getHours() * 60 * 60));
    }

    bestTime = Math.max(nbSeconds, bestTime);

    var displayText = 'Score: ' + ~~(I / 100) + " Current Time: " + nbSeconds + " seconds.";

    0 != I && (null == ia && (ia = new ja(24, '#FFFFFF', true,'#000000')), ia.u(displayText), c = ia.G(), a = c.width, e.globalAlpha = 0.2, e.fillStyle = '#000000', e.fillRect(10, q - 10 - 24 - 10, a + 10, 34), e.globalAlpha = 1, e.drawImage(c, 15, q - 10 - 24 - 5));
    eb();
    b = Date.now() - b;
    b > 1000 / 60 ? y -= 0.01 : b < 1000 /
    65 && (y += 0.01);
    0.4 > y && (y = 0.4);
    1 < y && (y = 1)

    drawStats(e);
  }

  //UPDATE
  function customRender(d) {
    d.save();
    for(var i = 0; i < lines.length; i++) {
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
    for(var i = 0; i < circles.length; i++) {
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
    for(var i = 0; i < dArc.length; i++) {
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
            var text = new ja(18, (getDarkBool() ? '#F2FBFF' : '#111111'), true, '#000000');

            text.u(dText[i]);
            var textRender = text.G();
            d.drawImage(textRender, dPoints[i][0], dPoints[i][1]);
        }

    }
    d.restore();
  }
  function drawStats(d) {
    d.save()

    sessionScore = Math.max(I, sessionScore); 

    var debugStrings = [];
    debugStrings.push("Current Bot: " + window.botList[botIndex][0]);
    debugStrings.push("T - Bot: " + (!toggle ? "On" : "Off"));
    debugStrings.push("R - Lines: " + (!toggleDraw ? "On" : "Off"));
    debugStrings.push("Q - Follow Mouse: " + (toggleFollow ? "On" : "Off"));
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
    var text = new ja(18, (getDarkBool() ? '#F2FBFF' : '#111111'));

    for (var i = 0; i < debugStrings.length; i++) {
      text.u(debugStrings[i]);
      var textRender = text.G();
      d.drawImage(textRender, 20, offsetValue);
      offsetValue += textRender.height;
    }

    if (message.length > 0) {
        var mRender = [];
        var mWidth = 0;
        var mHeight = 0;

        for (var i = 0; i < message.length; i++) {
            var mText = new ja(28, '#FF0000', true,'#000000');
            mText.u(message[i]);
            mRender.push(mText.G());

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

  function cb() {
    e.fillStyle = ha ? '#111111' : '#F2FBFF';
    e.fillRect(0, 0, p, q);
    e.save();
    e.strokeStyle = ha ? '#AAAAAA' : '#000000';
    e.globalAlpha = 0.2;
    e.scale(g, g);
    for (var a = p / g, b = q / g, c = - 0.5 + ( - s + a / 2) % 50; c < a; c += 50) e.beginPath(),
    e.moveTo(c, 0),
    e.lineTo(c, b),
    e.stroke();
    for (c = - 0.5 + ( - t + b / 2) % 50; c < b; c += 50) e.beginPath(),
    e.moveTo(0, c),
    e.lineTo(a, c),
    e.stroke();
    e.restore()
  }
  function eb() {
    if (Aa && wa.width) {
      var a = p / 5;
      e.drawImage(wa, 5, 5, a, a)
    }
  }
  function db() {
    for (var a = 0, b = 0; b < m.length; b++) a += m[b].n * m[b].n;
    return a
  }
  function Ja() {
    w = null;
    if (null != x || 0 != A.length) if (null != x || ka) {
      w = document.createElement('canvas');
      var a = w.getContext('2d'),
      b = 60,
      b = null == x ? b + 24 * A.length : b + 180,
      c = Math.min(200, 0.3 * p) / 200;
      w.width = 200 * c;
      w.height = b * c;
      a.scale(c, c);
      a.globalAlpha = 0.4;
      a.fillStyle = '#000000';
      a.fillRect(0, 0, 200, b);
      a.globalAlpha = 1;
      a.fillStyle = '#FFFFFF';
      c = null;
      c = 'Leaderboard';
      a.font = '30px Ubuntu';
      a.fillText(c, 100 - a.measureText(c).width / 2, 40);
      if (null == x) for (a.font = '20px Ubuntu', b = 0; b < A.length; ++b) c = A[b].name || 'An unnamed cell',
      ka || (c = 'An unnamed cell'),
      - 1 != F.indexOf(A[b].id) ? (m[0].name && (c = m[0].name), a.fillStyle = '#FFAAAA')  : a.fillStyle = '#FFFFFF',
      c = b + 1 + '. ' + c,
      a.fillText(c, 100 - a.measureText(c).width / 2, 70 + 24 * b);
       else for (b = c = 0; b < x.length; ++b) {
        var d = c + x[b] * Math.PI * 2;
        a.fillStyle = fb[b + 1];
        a.beginPath();
        a.moveTo(100, 140);
        a.arc(100, 140, 80, c, d, !1);
        a.fill();
        c = d
      }
    }
  }
  function Ka(a, b, c, d, e, l) {
    u.push(this);
    z[a] = this;
    this.id = a;
    this.p = this.x = b;
    this.q = this.y = c;
    this.o = this.size = d;
    this.color = e;
    this.a = [
    ];
    this.l = [
    ];
    this.R();
    this.Z(l)
  }
  function ja(a, b, c, d) {
    a && (this.r = a);
    b && (this.N = b);
    this.P = !!c;
    d && (this.s = d)
  }
  var $ = h.location.protocol,
  Va = 'https:' == $,

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

  ma,
  e,
  B,
  p,
  q,
  L = null,
  r = null,
  s = 0,
  t = 0,
  F = [
  ],
  m = [
  ],
  z = {
  },
  u = [
  ],
  H = [
  ],
  A = [
  ],
  T = 0,
  U = 0,
  X = - 1,
  Y = - 1,
  bb = 0,
  G = 0,
  E = null,
  da = 0,
  ea = 0,
  fa = 10000,
  ga = 10000,
  g = 1,
  v = null,
  Oa = !0,
  ka = !0,
  xa = !1,
  ta = !1,
  I = 0,
  ha = !1,
  Pa = !1,
  P = s = ~~((da + fa) / 2),
  Q = t = ~~((ea + ga) / 2),
  R = 1,
  M = '',
  x = null,
  la = !1,
  sa = !1,
  qa = 0,
  ra = 0,
  ba = 0,
  ca = 0,
  Qa = 0,
  fb = [
    '#333333',
    '#FF3333',
    '#33FF33',
    '#3333FF'
  ],
  va = !1,
  D = 1,
  Aa = 'ontouchstart' in h && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  wa = new Image;
  wa.src = 'img/split.png';
  var Ra = document.createElement('canvas');
  if ('undefined' == typeof console || 'undefined' == typeof DataView || 'undefined' == typeof WebSocket || null == Ra || null == Ra.getContext || null == h.localStorage) alert('You browser does not support this game, we recommend you to use Firefox to play this');
   else {
    var Z = null;
    h.setNick = function (a) {
      //UPDATE
      originalName = a;
      if (getPlayer().length == 0) {
        lifeTimer = new Date();
      }
      Ga();
      E = a;
      Ia();
      I = 0
    };
    h.setRegion = V;
    h.setSkins = function (a) {
      Oa = a
    };
    h.setNames = function (a) {
      ka = a
    };
    h.setDarkTheme = function (a) {
      ha = a
    };
    h.setColors = function (a) {
      xa = a
    };
    h.setShowMass = function (a) {
      Pa = a
    };
    h.spectate = function () {
      E = null;
      C(1);
      Ga()
    };
    h.setGameMode = function (a) {
      a != M && (M = a, W())
    };
    h.setAcid = function (a) {
      va = a
    };
    null != h.localStorage && (null == h.localStorage.AB8 && (h.localStorage.AB8 = 0 + ~~(100 * Math.random())), Qa = + h.localStorage.AB8, h.ABGroup = Qa);
    f.get($ + '//gc.agar.io', function (a) {
      var b = a.split(' ');
      a = b[0];
      b = b[1] || '';
      - 1 == 'DE IL PL HU BR AT UA'.split(' ').indexOf(a) && ya.push('nazi');
      - 1 == ['UA'].indexOf(a) && ya.push('ussr');
      S.hasOwnProperty(a) && ('string' == typeof S[a] ? v || V(S[a])  : S[a].hasOwnProperty(b) && (v || V(S[a][b])))
    }, 'text');
    setTimeout(function () {
    }, 300000);
    var S = {
      AF: 'JP-Tokyo',
      AX: 'EU-London',
      AL: 'EU-London',
      DZ: 'EU-London',
      AS: 'SG-Singapore',
      AD: 'EU-London',
      AO: 'EU-London',
      AI: 'US-Atlanta',
      AG: 'US-Atlanta',
      AR: 'BR-Brazil',
      AM: 'JP-Tokyo',
      AW: 'US-Atlanta',
      AU: 'SG-Singapore',
      AT: 'EU-London',
      AZ: 'JP-Tokyo',
      BS: 'US-Atlanta',
      BH: 'JP-Tokyo',
      BD: 'JP-Tokyo',
      BB: 'US-Atlanta',
      BY: 'EU-London',
      BE: 'EU-London',
      BZ: 'US-Atlanta',
      BJ: 'EU-London',
      BM: 'US-Atlanta',
      BT: 'JP-Tokyo',
      BO: 'BR-Brazil',
      BQ: 'US-Atlanta',
      BA: 'EU-London',
      BW: 'EU-London',
      BR: 'BR-Brazil',
      IO: 'JP-Tokyo',
      VG: 'US-Atlanta',
      BN: 'JP-Tokyo',
      BG: 'EU-London',
      BF: 'EU-London',
      BI: 'EU-London',
      KH: 'JP-Tokyo',
      CM: 'EU-London',
      CA: 'US-Atlanta',
      CV: 'EU-London',
      KY: 'US-Atlanta',
      CF: 'EU-London',
      TD: 'EU-London',
      CL: 'BR-Brazil',
      CN: 'CN-China',
      CX: 'JP-Tokyo',
      CC: 'JP-Tokyo',
      CO: 'BR-Brazil',
      KM: 'EU-London',
      CD: 'EU-London',
      CG: 'EU-London',
      CK: 'SG-Singapore',
      CR: 'US-Atlanta',
      CI: 'EU-London',
      HR: 'EU-London',
      CU: 'US-Atlanta',
      CW: 'US-Atlanta',
      CY: 'JP-Tokyo',
      CZ: 'EU-London',
      DK: 'EU-London',
      DJ: 'EU-London',
      DM: 'US-Atlanta',
      DO: 'US-Atlanta',
      EC: 'BR-Brazil',
      EG: 'EU-London',
      SV: 'US-Atlanta',
      GQ: 'EU-London',
      ER: 'EU-London',
      EE: 'EU-London',
      ET: 'EU-London',
      FO: 'EU-London',
      FK: 'BR-Brazil',
      FJ: 'SG-Singapore',
      FI: 'EU-London',
      FR: 'EU-London',
      GF: 'BR-Brazil',
      PF: 'SG-Singapore',
      GA: 'EU-London',
      GM: 'EU-London',
      GE: 'JP-Tokyo',
      DE: 'EU-London',
      GH: 'EU-London',
      GI: 'EU-London',
      GR: 'EU-London',
      GL: 'US-Atlanta',
      GD: 'US-Atlanta',
      GP: 'US-Atlanta',
      GU: 'SG-Singapore',
      GT: 'US-Atlanta',
      GG: 'EU-London',
      GN: 'EU-London',
      GW: 'EU-London',
      GY: 'BR-Brazil',
      HT: 'US-Atlanta',
      VA: 'EU-London',
      HN: 'US-Atlanta',
      HK: 'JP-Tokyo',
      HU: 'EU-London',
      IS: 'EU-London',
      IN: 'JP-Tokyo',
      ID: 'JP-Tokyo',
      IR: 'JP-Tokyo',
      IQ: 'JP-Tokyo',
      IE: 'EU-London',
      IM: 'EU-London',
      IL: 'JP-Tokyo',
      IT: 'EU-London',
      JM: 'US-Atlanta',
      JP: 'JP-Tokyo',
      JE: 'EU-London',
      JO: 'JP-Tokyo',
      KZ: 'JP-Tokyo',
      KE: 'EU-London',
      KI: 'SG-Singapore',
      KP: 'JP-Tokyo',
      KR: 'JP-Tokyo',
      KW: 'JP-Tokyo',
      KG: 'JP-Tokyo',
      LA: 'JP-Tokyo',
      LV: 'EU-London',
      LB: 'JP-Tokyo',
      LS: 'EU-London',
      LR: 'EU-London',
      LY: 'EU-London',
      LI: 'EU-London',
      LT: 'EU-London',
      LU: 'EU-London',
      MO: 'JP-Tokyo',
      MK: 'EU-London',
      MG: 'EU-London',
      MW: 'EU-London',
      MY: 'JP-Tokyo',
      MV: 'JP-Tokyo',
      ML: 'EU-London',
      MT: 'EU-London',
      MH: 'SG-Singapore',
      MQ: 'US-Atlanta',
      MR: 'EU-London',
      MU: 'EU-London',
      YT: 'EU-London',
      MX: 'US-Atlanta',
      FM: 'SG-Singapore',
      MD: 'EU-London',
      MC: 'EU-London',
      MN: 'JP-Tokyo',
      ME: 'EU-London',
      MS: 'US-Atlanta',
      MA: 'EU-London',
      MZ: 'EU-London',
      MM: 'JP-Tokyo',
      NA: 'EU-London',
      NR: 'SG-Singapore',
      NP: 'JP-Tokyo',
      NL: 'EU-London',
      NC: 'SG-Singapore',
      NZ: 'SG-Singapore',
      NI: 'US-Atlanta',
      NE: 'EU-London',
      NG: 'EU-London',
      NU: 'SG-Singapore',
      NF: 'SG-Singapore',
      MP: 'SG-Singapore',
      NO: 'EU-London',
      OM: 'JP-Tokyo',
      PK: 'JP-Tokyo',
      PW: 'SG-Singapore',
      PS: 'JP-Tokyo',
      PA: 'US-Atlanta',
      PG: 'SG-Singapore',
      PY: 'BR-Brazil',
      PE: 'BR-Brazil',
      PH: 'JP-Tokyo',
      PN: 'SG-Singapore',
      PL: 'EU-London',
      PT: 'EU-London',
      PR: 'US-Atlanta',
      QA: 'JP-Tokyo',
      RE: 'EU-London',
      RO: 'EU-London',
      RU: 'RU-Russia',
      RW: 'EU-London',
      BL: 'US-Atlanta',
      SH: 'EU-London',
      KN: 'US-Atlanta',
      LC: 'US-Atlanta',
      MF: 'US-Atlanta',
      PM: 'US-Atlanta',
      VC: 'US-Atlanta',
      WS: 'SG-Singapore',
      SM: 'EU-London',
      ST: 'EU-London',
      SA: 'EU-London',
      SN: 'EU-London',
      RS: 'EU-London',
      SC: 'EU-London',
      SL: 'EU-London',
      SG: 'JP-Tokyo',
      SX: 'US-Atlanta',
      SK: 'EU-London',
      SI: 'EU-London',
      SB: 'SG-Singapore',
      SO: 'EU-London',
      ZA: 'EU-London',
      SS: 'EU-London',
      ES: 'EU-London',
      LK: 'JP-Tokyo',
      SD: 'EU-London',
      SR: 'BR-Brazil',
      SJ: 'EU-London',
      SZ: 'EU-London',
      SE: 'EU-London',
      CH: 'EU-London',
      SY: 'EU-London',
      TW: 'JP-Tokyo',
      TJ: 'JP-Tokyo',
      TZ: 'EU-London',
      TH: 'JP-Tokyo',
      TL: 'JP-Tokyo',
      TG: 'EU-London',
      TK: 'SG-Singapore',
      TO: 'SG-Singapore',
      TT: 'US-Atlanta',
      TN: 'EU-London',
      TR: 'TK-Turkey',
      TM: 'JP-Tokyo',
      TC: 'US-Atlanta',
      TV: 'SG-Singapore',
      UG: 'EU-London',
      UA: 'EU-London',
      AE: 'EU-London',
      GB: 'EU-London',
      US: {
        AL: 'US-Atlanta',
        AK: 'US-Fremont',
        AZ: 'US-Fremont',
        AR: 'US-Atlanta',
        CA: 'US-Fremont',
        CO: 'US-Fremont',
        CT: 'US-Atlanta',
        DE: 'US-Atlanta',
        FL: 'US-Atlanta',
        GA: 'US-Atlanta',
        HI: 'US-Fremont',
        ID: 'US-Fremont',
        IL: 'US-Atlanta',
        IN: 'US-Atlanta',
        IA: 'US-Atlanta',
        KS: 'US-Atlanta',
        KY: 'US-Atlanta',
        LA: 'US-Atlanta',
        ME: 'US-Atlanta',
        MD: 'US-Atlanta',
        MA: 'US-Atlanta',
        MI: 'US-Atlanta',
        MN: 'US-Fremont',
        MS: 'US-Atlanta',
        MO: 'US-Atlanta',
        MT: 'US-Fremont',
        NE: 'US-Fremont',
        NV: 'US-Fremont',
        NH: 'US-Atlanta',
        NJ: 'US-Atlanta',
        NM: 'US-Fremont',
        NY: 'US-Atlanta',
        NC: 'US-Atlanta',
        ND: 'US-Fremont',
        OH: 'US-Atlanta',
        OK: 'US-Atlanta',
        OR: 'US-Fremont',
        PA: 'US-Atlanta',
        RI: 'US-Atlanta',
        SC: 'US-Atlanta',
        SD: 'US-Fremont',
        TN: 'US-Atlanta',
        TX: 'US-Atlanta',
        UT: 'US-Fremont',
        VT: 'US-Atlanta',
        VA: 'US-Atlanta',
        WA: 'US-Fremont',
        WV: 'US-Atlanta',
        WI: 'US-Atlanta',
        WY: 'US-Fremont',
        DC: 'US-Atlanta',
        AS: 'US-Atlanta',
        GU: 'US-Atlanta',
        MP: 'US-Atlanta',
        PR: 'US-Atlanta',
        UM: 'US-Atlanta',
        VI: 'US-Atlanta'
      },
      UM: 'SG-Singapore',
      VI: 'US-Atlanta',
      UY: 'BR-Brazil',
      UZ: 'JP-Tokyo',
      VU: 'SG-Singapore',
      VE: 'BR-Brazil',
      VN: 'JP-Tokyo',
      WF: 'SG-Singapore',
      EH: 'EU-London',
      YE: 'JP-Tokyo',
      ZM: 'EU-London',
      ZW: 'EU-London'
    };
    h.connect = Ha;

    //UPDATE
    window.getDarkBool = function() {
      return ha;
    }
    window.getMassBool = function() {
      return Pa;
    }

    window.getMemoryCells = function() {
      return interNodes;
    }

    window.getCellsArray = function() {
      return u;
    }

    window.getCells = function() {
      return z;
    }

    window.getPlayer = function() {
      return m;
    }

    window.getWidth = function() {
      return p;
    }

    window.getHeight = function() {
      return q;
    }

    window.getRatio = function() {
      return g;
    }

    window.getOffsetX = function() {
      return P;
    }

    window.getOffsetY = function() {
      return Q;
    }

    window.getX = function() {
      return s;
    }

    window.getY = function() {
      return t;
    }

    window.getPointX = function() {
      return X;
    }

    window.getPointY = function() {
      return Y;
    }

    window.getMouseX = function() {
      return T;
    }

    window.getMouseY = function() {
      return U;
    }

    window.getMapStartX = function() {
      return da;
    }

    window.getMapStartY = function() {
      return ea;
    }

    window.getMapEndX = function() {
      return fa;
    }

    window.getMapEndY = function() {
      return ga;
    }

    window.getScreenDistance = function() {
      var temp = screenDistance();
      return temp;
    }
    window.getLastUpdate = function() {
      return G;
    }

    window.getCurrentScore = function() {
        return I;
    }

    window.setPoint = function(x, y) {
      X = x;
      Y = y;
    }

    window.createFake = function(a, b, c, d, e, f) {
      var n = new Ka(a, b, c, d, e, f);
      return n;
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

    var aa = 500,
    La = - 1,
    Ma = - 1,
    w = null,
    y = 1,
    ia = null,
    J = {
    },
    ya = 'poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;hitler;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin;belgium;luxembourg;stussy;prussia;8ch;argentina;scotland;sir;romania;belarus;wojak;doge;nasa;byzantium;imperial japan;french kingdom;somalia;turkey;mars;pokerface;8;irs;receita federal;facebook'.split(';'),
    gb = [
      '8',
      'nasa'
    ],
    hb = [
      'm\'blob'
    ];
    Ka.prototype = {
      id: 0,
      a: null,      //points
      l: null,      //pointsAcc
      name: null,   //name
      k: null,      //nameCache
      J: null,      //sizeCache
      x: 0,         
      y: 0,
      size: 0,
      p: 0,         //ox
      q: 0,         //oy
      o: 0,         //oSize
      D: 0,         //nx
      F: 0,         //ny
      n: 0,         //nSize
      W: 0,         //drawTime
      L: 0,         //updateTime
      ja: 0,
      ba: 0,
      A: !1,
      d: !1,
      j: !1,
      M: !0,
      //UPDATE
      updateCode: 0,
      danger: false,
      dangerTimeOut: 0,
      S: function () {
        var a;
        for (a = 0; a < u.length; a++) if (u[a] == this) {
          u.splice(a, 1);
          break
        }
        delete z[this.id];
        a = m.indexOf(this);
        - 1 != a && (ta = !0, m.splice(a, 1));
        a = F.indexOf(this.id);
        - 1 != a && F.splice(a, 1);
        this.A = !0;
        H.push(this)
      },
      h: function () {
        return Math.max(~~(0.3 * this.size), 24)
      },
      Z: function (a) {
        if (this.name = a) null == this.k ? this.k = new ja(this.h(), '#FFFFFF', !0, '#000000')  : this.k.H(this.h()),
        this.k.u(this.name)
      },
      R: function () {
        for (var a = this.C(); this.a.length > a; ) {
          var b = ~~(Math.random() * this.a.length);
          this.a.splice(b, 1);
          this.l.splice(b, 1)
        }
        0 == this.a.length && 0 < a && (this.a.push({
          Q: this,
          e: this.size,
          x: this.x,
          y: this.y
        }), this.l.push(Math.random() - 0.5));
        for (; this.a.length < a; ) {
          var b = ~~(Math.random() * this.a.length),
          c = this.a[b];
          this.a.splice(b, 0, {
            Q: this,
            e: c.e,
            x: c.x,
            y: c.y
          });
          this.l.splice(b, 0, this.l[b])
        }
      },
      C: function () {
        var a = 10;
        20 > this.size && (a = 0);
        this.d && (a = 30);
        var b = this.size;
        this.d || (b *= g);
        b *= y;
        this.W & 32 && (b *= 0.25);
        return ~~Math.max(b, a)
      },
      ha: function () {
        this.R();
        for (var a = this.a, b = this.l, c = a.length, d = 0; d < c; ++d) {
          var e = b[(d - 1 + c) % c],
          l = b[(d + 1) % c];
          b[d] += (Math.random() - 0.5) * (this.j ? 3 : 1);
          b[d] *= 0.7;
          10 < b[d] && (b[d] = 10);
          - 10 > b[d] && (b[d] = - 10);
          b[d] = (e + l + 8 * b[d]) / 10
        }
        for (var k = this, h = this.d ? 0 : (this.id / 1000 + G / 10000) % (2 * Math.PI), d = 0; d < c; ++d) {
          var f = a[d].e,
          e = a[(d - 1 + c) % c].e,
          l = a[(d + 1) % c].e;
          if (15 < this.size && null != L && 20 < this.size * g) {
            var m = !1,
            p = a[d].x,
            q = a[d].y;
            L.ia(p - 5, q - 5, 10, 10, function (a) {
              a.Q != k && 25 > (p - a.x) * (p - a.x) + (q - a.y) * (q - a.y) && (m = !0)
            });
            !m && (a[d].x < da || a[d].y < ea || a[d].x > fa || a[d].y > ga) && (m = !0);
            m && (0 < b[d] && (b[d] = 0), b[d] -= 1)
          }
          f += b[d];
          0 > f && (f = 0);
          f = this.j ? (19 * f + this.size) / 20 : (12 * f + this.size) / 13;
          a[d].e = (e + l + 8 * f) / 10;
          e = 2 * Math.PI / c;
          l = this.a[d].e;
          this.d && 0 == d % 2 && (l += 5);
          a[d].x = this.x + Math.cos(e * d + h) * l;
          a[d].y = this.y + Math.sin(e * d + h) * l
        }
      },
      K: function () {
        var a;
        a = (G - this.L) / 120;
        a = 0 > a ? 0 : 1 < a ? 1 : a;
        var b = 0 > a ? 0 : 1 < a ? 1 : a;
        this.h();
        if (this.A && 1 <= b) {
          var c = H.indexOf(this);
          - 1 != c && H.splice(c, 1)
        }
        this.x = a * (this.D - this.p) + this.p;
        this.y = a * (this.F - this.q) + this.q;
        this.size = b * (this.n - this.o) + this.o;
        return b
      },
      I: function () {
        return this.x + this.size + 40 < s - p / 2 / g || this.y + this.size + 40 < t - q / 2 / g || this.x - this.size - 40 > s + p / 2 / g || this.y - this.size - 40 > t + q / 2 / g ? !1 : !0
      },
      T: function () {
        if (this.I()) {
          var a = !this.d && !this.j && 0.4 > g;
          5 > this.C() && (a = !0);
          if (this.M && !a) for (var b = 0; b < this.a.length; b++) this.a[b].e = this.size;
          this.M = a;
          e.save();
          this.ba = G;
          b = this.K();
          this.A && (e.globalAlpha *= 1 - b);
          e.lineWidth = 10;
          e.lineCap = 'round';
          e.lineJoin = this.d ? 'miter' : 'round';
          xa ? (e.fillStyle = '#FFFFFF', e.strokeStyle = '#AAAAAA')  : (e.fillStyle = this.color, e.strokeStyle = this.color);
          if (a) e.beginPath(),
          e.arc(this.x, this.y, this.size, 0, 2 * Math.PI, !1);
           else {
            this.ha();
            e.beginPath();
            var c = this.C();
            e.moveTo(this.a[0].x, this.a[0].y);
            for (b = 1; b <= c; ++b) {
              var d = b % c;
              e.lineTo(this.a[d].x, this.a[d].y)
            }
          }
          e.closePath();
          c = this.name.toLowerCase();
          !this.j && Oa && ':teams' != M ? - 1 != ya.indexOf(c) ? (J.hasOwnProperty(c) || (J[c] = new Image, J[c].src = 'skins/' + c + '.png'), b = 0 != J[c].width && J[c].complete ? J[c] : null)  : b = null : b = null;
          b = (d = b) ? - 1 != hb.indexOf(c)  : !1;
          a || e.stroke();
          e.fill();
          null == d || b || (e.save(), e.clip(), e.drawImage(d, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size), e.restore());
          (xa || 15 < this.size) && !a && (e.strokeStyle = '#000000', e.globalAlpha *= 0.1, e.stroke());
          e.globalAlpha = 1;
          null != d && b && e.drawImage(d, this.x - 2 * this.size, this.y - 2 * this.size, 4 * this.size, 4 * this.size);
          b = - 1 != m.indexOf(this);
          a = ~~this.y;
          if ((ka || b) && this.name && this.k && (null == d || - 1 == gb.indexOf(c))) {
            d = this.k;
            d.u(this.name);
            d.H(this.h());
            c = Math.ceil(10 * g) / 10;
            d.$(c);
            var d = d.G(),
            f = ~~(d.width / c),
            l = ~~(d.height / c);
            e.drawImage(d, ~~this.x - ~~(f / 2), a - ~~(l / 2), f, l);
            a += d.height / 2 / c + 4
          }
          Pa && (b || 0 == m.length && (!this.d || this.j) && 20 < this.size) && (null == this.J && (this.J = new ja(this.h() / 2, '#FFFFFF', !0, '#000000')), b = this.J, b.H(this.h() / 2), b.u(~~(this.size * this.size / 100)), c = Math.ceil(10 * g) / 10, b.$(c), d = b.G(), f = ~~(d.width / c), l = ~~(d.height / c), e.drawImage(d, ~~this.x - ~~(f / 2), a - ~~(l / 2), f, l));
          e.restore()
        }
      }
    };
    ja.prototype = {
      w: '',
      N: '#000000',
      P: !1,
      s: '#000000',
      r: 16,
      m: null,
      O: null,
      g: !1,
      v: 1,
      H: function (a) {
        this.r != a && (this.r = a, this.g = !0)
      },
      $: function (a) {
        this.v != a && (this.v = a, this.g = !0)
      },
      setStrokeColor: function (a) {
        this.s != a && (this.s = a, this.g = !0)
      },
      u: function (a) {
        a != this.w && (this.w = a, this.g = !0)
      },
      G: function () {
        null == this.m && (this.m = document.createElement('canvas'), this.O = this.m.getContext('2d'));
        if (this.g) {
          this.g = !1;
          var a = this.m,
          b = this.O,
          c = this.w,
          d = this.v,
          e = this.r,
          l = e + 'px Ubuntu';
          b.font = l;
          var k = ~~(0.2 * e);
          a.width = (b.measureText(c).width + 6) * d;
          a.height = (e + k) * d;
          b.font = l;
          b.scale(d, d);
          b.globalAlpha = 1;
          b.lineWidth = 3;
          b.strokeStyle = this.s;
          b.fillStyle = this.N;
          this.P && b.strokeText(c, 3, e - k / 2);
          b.fillText(c, 3, e - k / 2)
        }
        return this.m
      }
    };
    Date.now || (Date.now = function () {
      return (new Date).getTime()
    });
    var Ua = {
      ca: function (a) {
        function b(a, b, c, d, e) {
          this.x = a;
          this.y = b;
          this.f = c;
          this.c = d;
          this.depth = e;
          this.items = [
          ];
          this.b = [
          ]
        }
        var c = a.da || 2,
        d = a.ea || 4;
        b.prototype = {
          x: 0,
          y: 0,
          f: 0,
          c: 0,
          depth: 0,
          items: null,
          b: null,
          B: function (a) {
            for (var b = 0; b < this.items.length; ++b) {
              var c = this.items[b];
              if (c.x >= a.x && c.y >= a.y && c.x < a.x + a.f && c.y < a.y + a.c) return !0
            }
            if (0 != this.b.length) {
              var d = this;
              return this.V(a, function (b) {
                return d.b[b].B(a)
              })
            }
            return !1
          },
          t: function (a, b) {
            for (var c = 0; c < this.items.length; ++c) b(this.items[c]);
            if (0 != this.b.length) {
              var d = this;
              this.V(a, function (c) {
                d.b[c].t(a, b)
              })
            }
          },
          i: function (a) {
            0 != this.b.length ? this.b[this.U(a)].i(a)  : this.items.length >= c && this.depth < d ? (this.aa(), this.b[this.U(a)].i(a))  : this.items.push(a)
          },
          U: function (a) {
            return a.x < this.x + this.f / 2 ? a.y < this.y + this.c / 2 ? 0 : 2 : a.y < this.y + this.c / 2 ? 1 : 3
          },
          V: function (a, b) {
            return a.x < this.x + this.f / 2 && (a.y < this.y + this.c / 2 && b(0) || a.y >= this.y + this.c / 2 && b(2)) || a.x >= this.x + this.f / 2 && (a.y < this.y + this.c / 2 && b(1) || a.y >= this.y + this.c / 2 && b(3)) ? !0 : !1
          },
          aa: function () {
            var a = this.depth + 1,
            c = this.f / 2,
            d = this.c / 2;
            this.b.push(new b(this.x, this.y, c, d, a));
            this.b.push(new b(this.x + c, this.y, c, d, a));
            this.b.push(new b(this.x, this.y + d, c, d, a));
            this.b.push(new b(this.x + c, this.y + d, c, d, a));
            a = this.items;
            this.items = [
            ];
            for (c = 0; c < a.length; c++) this.i(a[c])
          },
          clear: function () {
            for (var a = 0; a < this.b.length; a++) this.b[a].clear();
            this.items.length = 0;
            this.b.length = 0
          }
        };
        var e = {
          x: 0,
          y: 0,
          f: 0,
          c: 0
        };
        return {
          root: new b(a.X, a.Y, a.fa - a.X, a.ga - a.Y, 0),
          i: function (a) {
            this.root.i(a)
          },
          t: function (a, b) {
            this.root.t(a, b)
          },
          ia: function (a, b, c, d, f) {
            e.x = a;
            e.y = b;
            e.f = c;
            e.c = d;
            this.root.t(e, f)
          },
          B: function (a) {
            return this.root.B(a)
          },
          clear: function () {
            this.root.clear()
          }
        }
      }
    };
    h.onload = Sa
  }
}) (window, window.jQuery);

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','apos');

apos('create', 'UA-64394184-1', 'auto');
apos('send', 'pageview');

window.ignoreStream = false,
window.refreshTwitch = function() {
    $.ajax({
          url: "https://api.twitch.tv/kraken/streams/apostolique",
          cache: false,
          dataType: "jsonp"
        }).done(function (data) {
            if (data["stream"] == null) { 
                //console.log("Apostolique is not online!");
                window.setMessage([]);
                window.onmouseup = function () {
                };
                window.ignoreStream = false;
            } else {
                //console.log("Apostolique is online!");
                /*if (!window.ignoreStream) {
                    window.setMessage(["twitch.tv/apostolique is online right now!", "Click the screen to open the stream!", "Press E to ignore."]);
                    window.onmouseup = function () {
                        window.open("http://www.twitch.tv/apostolique");
                    };
                }*/
            }
        }).fail(function () {
        });
};
setInterval(window.refreshTwitch, 60000);
window.refreshTwitch();
