// ==UserScript==
// @name        Launcher
// @namespace   AposLauncher
// @include     http://agar.io/
// @version     2
// @grant       none
// @author      http://www.twitch.tv/apostolique
// ==/UserScript==

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

Array.prototype.peek = function() {
    return this[this.length-1];
}

console.log("Running Bot Launcher!");
(function (f, g) {


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
      f.setDarkTheme(!getDarkBool());
    }
    if (70 == e.keyCode) {
      f.setShowMass(!getMassBool());
    }
  }

  function humanPlayer() {
    //Don't need to do anything.
    return [getPointX(), getPointY()];
  }

  function Pa() {

    if (f.botList == null) {
        f.botList = [];
        g('#locationUnknown').append(g('<select id="bList" class="form-control" onchange="setBotIndex($(this).val());" />'));
        g('#locationUnknown').addClass('form-group');
    }

    f.botList.push(["Human", humanPlayer]);

    var bList = g('#bList');
    g('<option />', {value: (f.botList.length - 1), text: "Human"}).appendTo(bList);


    ja = !0;
    xa();
    setInterval(xa, 180000);
    A = ka = document.getElementById('canvas');
    e = A.getContext('2d');
    A.onmousedown = function (a) {
      if (ya) {
        var b = a.clientX - (5 + p / 5 / 2),
        c = a.clientY - (5 + p / 5 / 2);
        if (Math.sqrt(b * b + c * c) <= p / 5 / 2) {
          K();
          B(17);
          return
        }
      }
      S = a.clientX;
      T = a.clientY;
      la();
      K()
    };
    A.onmousemove = function (a) {
      S = a.clientX;
      T = a.clientY;
      la()
    };
    A.onmouseup = function (a) {
    };
    /firefox/i.test(navigator.userAgent) ? document.addEventListener('DOMMouseScroll', za, !1)  : document.body.onmousewheel = za;
    var a = !1,
    b = !1,
    c = !1;
    f.onkeydown = function (d) {
      32 != d.keyCode || a || (K(), B(17), a = !0);
      81 != d.keyCode || b || (B(18), b = !0);
      87 != d.keyCode || c || (K(), B(21), c = !0);
      27 == d.keyCode && Aa(!0)

      keyAction(d);
    };
    f.onkeyup = function (d) {
      32 == d.keyCode && (a = !1);
      87 == d.keyCode && (c = !1);
      81 == d.keyCode && b && (B(19), b = !1)
    };
    f.onblur = function () {
      B(19);
      c = b = a = !1
    };
    f.onresize = Ba;
    Ba();
    f.requestAnimationFrame ? f.requestAnimationFrame(Ca)  : setInterval(ma, 1000 / 60);
    setInterval(K, 40);
    u && g('#region').val(u);
    Da();
    U(g('#region').val());
    null == m && u && V();
    g('#overlays').show()
  }
  function za(a) {
    C *= Math.pow(0.9, a.wheelDelta / - 120 || a.detail || 0);
    1 > C && (C = 1);
    C > 4 / h && (C = 4 / h)
  }
  function Qa() {
    if (0.35 > h) L = null;
     else {
      for (var a = Number.POSITIVE_INFINITY, b = Number.POSITIVE_INFINITY, c = Number.NEGATIVE_INFINITY, d = Number.NEGATIVE_INFINITY, e = 0, q = 0; q < n.length; q++) n[q].shouldRender() && (e = Math.max(n[q].size, e), a = Math.min(n[q].x, a), b = Math.min(n[q].y, b), c = Math.max(n[q].x, c), d = Math.max(n[q].y, d));
      L = QUAD.init({
        minX: a - (e + 100),
        minY: b - (e + 100),
        maxX: c + (e + 100),
        maxY: d + (e + 100)
      });
      for (q = 0; q < n.length; q++) if (a = n[q], a.shouldRender()) for (b = 0; b < a.points.length; ++b) L.insert(a.points[b])
    }
  }
  function la() {
    if (toggle ||f.botList[botIndex][0] == "Human") {
      W = (S - p / 2) / h + s;
      X = (T - r / 2) / h + t
    }
  }
  function xa() {
    null == Y && (Y = {
    }, g('#region').children().each(function () {
      var a = g(this),
      b = a.val();
      b && (Y[b] = a.text())
    }));
    g.get(F + '//m.agar.io/info', function (a) {
      var b = {
      },
      c;
      for (c in a.regions) {
        var d = c.split(':') [0];
        b[d] = b[d] || 0;
        b[d] += a.regions[c].numPlayers
      }
      for (c in b) g('#region option[value="' + c + '"]').text(Y[c] + ' (' + b[c] + ' players)')
    }, 'json')
  }
  function Ea() {
    g('#adsBottom').hide();
    g('#overlays').hide();
    Da()
  }
  function U(a) {
    a && a != u && (g('#region').val() != a && g('#region').val(a), u = f.localStorage.location = a, g('.region-message').hide(), g('.region-message.' + a).show(), g('.btn-needs-server').prop('disabled', !1), ja && V())
  }
  function Aa(a) {
    D = null;
    g('#overlays').fadeIn(a ? 200 : 3000);
    a || g('#adsBottom').fadeIn(3000)
  }
  function Da() {
    g('#region').val() ? f.localStorage.location = g('#region').val()  : f.localStorage.location && g('#region').val(f.localStorage.location);
    g('#region').val() ? g('#locationKnown').append(g('#region'))  : g('#locationUnknown').append(g('#region'))
  }
  function na() {
    console.log('Find ' +
    u + M);
    g.ajax(F + '//m.agar.io/', {
      error: function () {
        setTimeout(na, 1000)
      },
      success: function (a) {
        a = a.split('\n');
        '45.79.222.79:443' == a[0] ? na()  : Fa('ws://' + a[0])
      },
      dataType: 'text',
      method: 'POST',
      cache: !1,
      crossDomain: !0,
      data: u + M || '?'
    })
  }
  function V() {
    ja && u && (g('#connecting').show(), na())
  }
  function Fa(a) {
    if (m) {
      m.onopen = null;
      m.onmessage = null;
      m.onclose = null;
      try {
        m.close()
      } catch (b) {
      }
      m = null
    }
    var c = f.location.search.slice(1);
    /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+$/.test(c) && (a = 'ws://' + c);
    Ga && (a = a.split(':'), a = a[0] + 's://ip-' +
    a[1].replace(/\./g, '-').replace(/\//g, '') + '.tech.agar.io:' + ( + a[2] + 2000));
    E = [
    ];
    l = [
    ];
    y = {
    };
    n = [
    ];
    G = [
    ];
    z = [
    ];
    v = w = null;
    H = 0;
    console.log('Connecting to ' + a);
    serverIP = a;
    m = new WebSocket(a, Ga ? [
      'binary',
      'base64'
    ] : [
    ]);
    m.binaryType = 'arraybuffer';
    m.onopen = Ra;
    m.onmessage = Sa;
    m.onclose = Ta;
    m.onerror = function () {
      console.log('socket error')
    }
  }
  function Ra(a) {
    Z = 500;
    g('#connecting').hide();
    console.log('socket open');
    a = new ArrayBuffer(5);
    var b = new DataView(a);
    b.setUint8(0, 254);
    b.setUint32(1, 4, !0);
    m.send(a);
    a = new ArrayBuffer(5);
    b = new DataView(a);
    b.setUint8(0, 255);
    b.setUint32(1, 673720360, !0);
    m.send(a);
    Ha()
  }
  function Ta(a) {
    console.log('socket close');
    setTimeout(V, Z);
    Z *= 1.5
  }
  function Sa(a) {
    function b() {
      for (var a = ''; ; ) {
        var b = d.getUint16(c, !0);
        c += 2;
        if (0 == b) break;
        a += String.fromCharCode(b)
      }
      return a
    }
    var c = 0,
    d = new DataView(a.data);
    240 == d.getUint8(c) && (c += 5);
    switch (d.getUint8(c++)) {
      case 16:
        Ua(d, c);
        break;
      case 17:
        N = d.getFloat32(c, !0);
        c += 4;
        O = d.getFloat32(c, !0);
        c += 4;
        P = d.getFloat32(c, !0);
        c += 4;
        break;
      case 20:
        l = [
        ];
        E = [
        ];
        break;
      case 21:
        oa = d.getInt16(c, !0);
        c += 2;
        pa = d.getInt16(c, !0);
        c += 2;
        qa || (qa = !0, $ = oa, aa = pa);
        break;
      case 32:
        E.push(d.getUint32(c, !0));
        c += 4;
        break;
      case 49:
        if (null != w) break;
        a = d.getUint32(c, !0);
        c += 4;
        z = [
        ];
        for (var e = 0; e < a; ++e) {
          var q = d.getUint32(c, !0),
          c = c + 4;
          z.push({
            id: q,
            name: b()
          })
        }
        Ia();
        break;
      case 50:
        w = [
        ];
        a = d.getUint32(c, !0);
        c += 4;
        for (e = 0; e < a; ++e) w.push(d.getFloat32(c, !0)),
        c += 4;
        Ia();
        break;
      case 64:
        ba = d.getFloat64(c, !0),
        c += 8,
        ca = d.getFloat64(c, !0),
        c += 8,
        da = d.getFloat64(c, !0),
        c += 8,
        ea = d.getFloat64(c, !0),
        c += 8,
        N = (da + ba) / 2,
        O = (ea + ca) / 2,
        P = 1,
        0 == l.length && (s = N, t =
        O, h = P)
    }
  }
  function Ua(a, b) {
    I = + new Date;
    var c = Math.random();
    ra = !1;
    var d = a.getUint16(b, !0);
    b += 2;
    for (var e = 0; e < d; ++e) {
      var q = y[a.getUint32(b, !0)],
      f = y[a.getUint32(b + 4, !0)];
      b += 8;
      q && f && (f.destroy(), f.ox = f.x, f.oy = f.y, f.oSize = f.size, f.nx = q.x, f.ny = q.y, f.nSize = f.size, f.updateTime = I)
    }
    for (e = 0; ; ) {
      d = a.getUint32(b, !0);
      b += 4;
      if (0 == d) break;
      ++e;
      var g,
      q = a.getInt16(b, !0);
      b += 2;
      f = a.getInt16(b, !0);
      b += 2;
      g = a.getInt16(b, !0);
      b += 2;
      for (var h = a.getUint8(b++), m = a.getUint8(b++), p = a.getUint8(b++), h = (h << 16 | m << 8 | p).toString(16); 6 > h.length; ) h = '0' + h;
      var h = '#' + h,
      k = a.getUint8(b++),
      m = !!(k & 1),
      p = !!(k & 16);
      k & 2 && (b += 4);
      k & 4 && (b += 8);
      k & 8 && (b += 16);
      for (var n, k = ''; ; ) {
        n = a.getUint16(b, !0);
        b += 2;
        if (0 == n) break;
        k += String.fromCharCode(n)
      }
      n = k;
      k = null;
      y.hasOwnProperty(d) ? (k = y[d], k.updatePos(), k.ox = k.x, k.oy = k.y, k.oSize = k.size, k.color = h)  : (k = new Ja(d, q, f, g, h, n), k.pX = q, k.pY = f);
      k.isVirus = m;
      k.isAgitated = p;
      k.nx = q;
      k.ny = f;
      k.nSize = g;
      k.updateCode = c;
      k.updateTime = I;
      n && k.setName(n);
      - 1 != E.indexOf(d) && - 1 == l.indexOf(k) && (document.getElementById('overlays').style.display = 'none', l.push(k), 1 == l.length && (s = k.x, t = k.y))

      interNodes[d] = y[d];
    }

    Object.keys(interNodes).forEach(function (element, index) {
        //console.log("start: " + interNodes[element].updateTime + " current: " + D + " life: " + (D - interNodes[element].updateTime));
        var isRemoved = !y.hasOwnProperty(element);

        if (isRemoved  && (getLastUpdate() - interNodes[element].updateTime) > 3000) {
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
    k = y[d],
    null != k && k.destroy();
    //ra && 0 == l.length && (setNick(originalName), restartPlz = true, console.log("Dead"))
  }

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

    f.drawPoint = function(x_1, y_1, drawColor, text) {
        if (!toggleDraw) {
            dPoints.push([x_1, y_1, drawColor]);
            dText.push(text);
        }
    }

    f.drawArc = function(x_1, y_1, x_2, y_2, x_3, y_3, drawColor) {
        if (!toggleDraw) {
            var radius = computeDistance(x_1, y_1, x_3, y_3);
            dArc.push([x_1, y_1, x_2, y_2, x_3, y_3, radius, drawColor]);
        }
    }

    f.drawLine =  function(x_1, y_1, x_2, y_2, drawColor) {
        if (!toggleDraw) {
            lines.push([x_1, y_1, x_2, y_2, drawColor]);
        }
    }

    f.drawCircle = function(x_1, y_1, radius, drawColor) {
        if (!toggleDraw) {
            circles.push([x_1, y_1, radius, drawColor]);
        }
    }

  function K() {

    if (getPlayer().length == 0) {
        setNick(originalName);
        restartPlz = false;
    }

    if (sa()) {
      var a = S - p / 2,
      b = T - r / 2;
      64 > a * a + b * b || Ka == W && La == X || (Ka = W, La = X, a = new ArrayBuffer(21), b = new DataView(a), b.setUint8(0, 16), b.setFloat64(1, W, !0), b.setFloat64(9, X, !0), b.setUint32(17, 0, !0), m.send(a))
    }
  }
  function Ha() {
    if (sa() && null != D) {
      var a = new ArrayBuffer(1 + 2 * D.length),
      b = new DataView(a);
      b.setUint8(0, 0);
      for (var c = 0; c < D.length; ++c) b.setUint16(1 +
      2 * c, D.charCodeAt(c), !0);
      m.send(a)
    }
  }
  function sa() {
    return null != m && m.readyState == m.OPEN
  }
  function B(a) {
    if (sa()) {
      var b = new ArrayBuffer(1);
      (new DataView(b)).setUint8(0, a);
      m.send(b)
    }
  }
  function Ca() {
    ma();
    f.requestAnimationFrame(Ca)
  }
  function Ba() {
    p = f.innerWidth;
    r = f.innerHeight;
    ka.width = A.width = p;
    ka.height = A.height = r;
    ma()
  }
  function Ma() {
    var a;
    a = 1 * Math.max(r / 1080, p / 1920);
    return a *= C
  }
  function Va() {
    if (0 != l.length) {
      for (var a = 0, b = 0; b < l.length; b++) a += l[b].size;
      a = Math.pow(Math.min(64 / a, 1), 0.4) * Ma();
      h = (9 * h + a) / 10
    }
  }
  function ma() {

    dPoints = [];
    circles = [];
    dArc = [];
    dText = [];
    lines = [];

    var a,
    b,
    c = + new Date;
    ++Wa;
    I = + new Date;
    if (0 < l.length) {
      Va();
      for (var d = a = b = 0; d < l.length; d++) l[d].updatePos(),
      b += l[d].x / l.length,
      a += l[d].y / l.length;
      N = b;
      O = a;
      P = h;
      s = (s + b) / 2;
      t = (t + a) / 2
    } else s = (29 * s + N) / 30,
    t = (29 * t + O) / 30,
    h = (9 * h + P * Ma()) / 10;
    Qa();
    la();
    ta || e.clearRect(0, 0, p, r);
    if (ta) e.fillStyle = fa ? '#111111' : '#F2FBFF',
    e.globalAlpha = 0.05,
    e.fillRect(0, 0, p, r),
    e.globalAlpha = 1;
     else {
      e.fillStyle = fa ? '#111111' : '#F2FBFF';
      e.fillRect(0, 0, p, r);
      e.save();
      e.strokeStyle = fa ? '#AAAAAA' : '#000000';
      e.globalAlpha = 0.2;
      e.scale(h, h);
      b = p / h;
      a = r / h;
      for (d =
      - 0.5 + ( - s + b / 2) % 50; d < b; d += 50) e.beginPath(),
      e.moveTo(d, 0),
      e.lineTo(d, a),
      e.stroke();
      for (d = - 0.5 + ( - t + a / 2) % 50; d < a; d += 50) e.beginPath(),
      e.moveTo(0, d),
      e.lineTo(b, d),
      e.stroke();
      e.restore()
    }
    n.sort(function (a, b) {
      return a.size == b.size ? a.id - b.id : a.size - b.size
    });
    e.save();
    e.translate(p / 2, r / 2);
    e.scale(h, h);
    e.translate( - s, - t);
    for (d = 0; d < G.length; d++) G[d].draw();
    for (d = 0; d < n.length; d++) n[d].draw();
    if (getPlayer().length > 0) {
        var moveLoc = f.botList[botIndex][1]();
        if (!toggle) {
            setPoint(moveLoc[0], moveLoc[1]);
        }
    }
    customRender(e);
    if (qa) {
      $ = (3 * $ + oa) / 4;
      aa = (3 * aa + pa) / 4;
      e.save();
      e.strokeStyle = '#FFAAAA';
      e.lineWidth = 10;
      e.lineCap = 'round';
      e.lineJoin = 'round';
      e.globalAlpha =
      0.5;
      e.beginPath();
      for (d = 0; d < l.length; d++) e.moveTo(l[d].x, l[d].y),
      e.lineTo($, aa);
      e.stroke();
      e.restore()
    }
    e.restore();
    v && v.width && e.drawImage(v, p - v.width - 10, 10);
    H = Math.max(H, Xa());
    sessionScore = Math.max(H, sessionScore);
    0 != H && (null == ga && (ga = new ha(24, '#FFFFFF')), ga.setValue('Score: ' + ~~(H / 100) + ' || Best Score: ' + ~~(sessionScore / 100) + " || Best time alive: " + bestTime + " seconds"), a = ga.render(), b = a.width, e.globalAlpha = 0.2, e.fillStyle = '#000000', e.fillRect(10, r - 10 - 24 - 10, b + 10, 34), e.globalAlpha = 1, e.drawImage(a, 15, r - 10 - 24 - 5));
    Ya();
    c = + new Date - c;
    c > 1000 / 60 ? x -= 0.01 : c < 1000 / 65 && (x += 0.01);
    0.4 > x && (x = 0.4);
    1 < x && (x = 1)

    drawStats(e);
  }

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
            var text = new ha(18, (getDarkBool() ? '#F2FBFF' : '#111111'));

            text.setValue(dText[i]);
            var textRender = text.render();
            d.drawImage(textRender, dPoints[i][0], dPoints[i][1]);
        }

    }
    d.restore();
  }
  function drawStats(d) {
    var currentDate = new Date();

    var nbSeconds = 0;
    if (getPlayer().length > 0) {
        nbSeconds = (currentDate.getSeconds() + (currentDate.getMinutes() * 60) + (currentDate.getHours() * 60 * 60)) - (lifeTimer.getSeconds() + (lifeTimer.getMinutes() * 60) + (lifeTimer.getHours() * 60 * 60));
    }

    bestTime = Math.max(nbSeconds, bestTime);

    var debugStrings = [];
    debugStrings.push("T - Bot: " + (!toggle ? "On" : "Off"));
    debugStrings.push("R - Lines: " + (!toggleDraw ? "On" : "Off"));
    debugStrings.push("Server: " + serverIP);
    debugStrings.push("Survived for: " + nbSeconds + " seconds");

    if (getPlayer().length > 0) {
        debugStrings.push("Location: " + Math.floor(getPlayer()[0].x) + ", " + Math.floor(getPlayer()[0].y));
    }

    var offsetValue = 20;
    var text = new ha(18, (getDarkBool() ? '#F2FBFF' : '#111111'));

    for (var i = 0; i < debugStrings.length; i++) {
      text.setValue(debugStrings[i]);
      var textRender = text.render();
      d.drawImage(textRender, 20, offsetValue);
      offsetValue += textRender.height;
    }
  }

  function Ya() {
    if (ya && ua.width) {
      var a = p / 5;
      e.drawImage(ua, 5, 5, a, a)
    }
  }
  function Xa() {
    for (var a = 0, b = 0; b < l.length; b++) a += l[b].nSize * l[b].nSize;
    return a
  }
  function Ia() {
    v = null;
    if (null != w || 0 != z.length) if (null != w || ia) {
      v = document.createElement('canvas');
      var a = v.getContext('2d'),
      b = 60,
      b = null == w ? b + 24 * z.length : b + 180,
      c = Math.min(200, 0.3 * p) / 200;
      v.width = 200 * c;
      v.height = b * c;
      a.scale(c, c);
      a.globalAlpha = 0.4;
      a.fillStyle = '#000000';
      a.fillRect(0, 0, 200, b);
      a.globalAlpha = 1;
      a.fillStyle = '#FFFFFF';
      c = null;
      c = 'Leaderboard';
      a.font = '30px Ubuntu';
      a.fillText(c, 100 - a.measureText(c).width /
      2, 40);
      if (null == w) for (a.font = '20px Ubuntu', b = 0; b < z.length; ++b) c = z[b].name || 'An unnamed cell',
      ia || (c = 'An unnamed cell'),
      - 1 != E.indexOf(z[b].id) ? (l[0].name && (c = l[0].name), a.fillStyle = '#FFAAAA')  : a.fillStyle = '#FFFFFF',
      c = b + 1 + '. ' + c,
      a.fillText(c, 100 - a.measureText(c).width / 2, 70 + 24 * b);
       else for (b = c = 0; b < w.length; ++b) angEnd = c + w[b] * Math.PI * 2,
      a.fillStyle = Za[b + 1],
      a.beginPath(),
      a.moveTo(100, 140),
      a.arc(100, 140, 80, c, angEnd, !1),
      a.fill(),
      c = angEnd
    }
  }
  function Ja(a, b, c, d, e, f) {
    n.push(this);
    y[a] = this;
    this.id = a;
    this.ox = this.x = b;
    this.oy = this.y = c;
    this.oSize = this.size = d;
    this.color = e;
    this.points = [
    ];
    this.pointsAcc = [
    ];
    this.createPoints();
    this.setName(f)
  }
  function ha(a, b, c, d) {
    a && (this._size = a);
    b && (this._color = b);
    this._stroke = !!c;
    d && (this._strokeColor = d)
  }
  var F = f.location.protocol,
  Ga = 'https:' == F;
  if ('agar.io' != f.location.hostname && 'localhost' != f.location.hostname && '10.10.2.13' != f.location.hostname) f.location = F + '//agar.io/';
   else if (f.top != f) f.top.location = F + '//agar.io/';
   else {
    var ka,
    toggle = false,
    toggleDraw = false,
    splitted = false,
    splitting = false,
    virusBait = false,
    tempPoint = [0, 0, 1],
    dPoints = [],
    circles = [],
    dArc = [],
    dText = [],
    lines = [],
    originalName = "Horse Feathers",
    sessionScore = 0,
    serverIP = "",
    interNodes = [],
    lifeTimer = new Date(),
    bestTime = 0,
    botIndex = 0,
    restartPlz = false,
    e,
    A,
    p,
    r,
    L = null,
    m = null,
    s = 0,
    t = 0,
    E = [
    ],
    l = [
    ],
    y = {
    },
    n = [
    ],
    G = [
    ],
    z = [
    ],
    S = 0,
    T = 0,
    W = - 1,
    X = - 1,
    Wa = 0,
    I = 0,
    D = null,
    ba = 0,
    ca = 0,
    da = 10000,
    ea = 10000,
    h = 1,
    u = null,
    Na = !0,
    ia = !0,
    va = !1,
    ra = !1,
    H = 0,
    fa = !1,
    Oa = !1,
    N = s = ~~((ba + da) / 2),
    O = t = ~~((ca + ea) / 2),
    P = 1,
    M = '',
    w = null,
    ja = !1,
    qa = !1,
    oa = 0,
    pa = 0,
    $ = 0,
    aa = 0,
    Q = 0,
    Za = [
      '#333333',
      '#FF3333',
      '#33FF33',
      '#3333FF'
    ],
    ta = !1,
    C = 1,
    ya = 'ontouchstart' in f && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    ua = new Image;
    ua.src = 'img/split.png';
    Q = document.createElement('canvas');
    if ('undefined' == typeof console || 'undefined' == typeof DataView ||
    'undefined' == typeof WebSocket || null == Q || null == Q.getContext || null == f.localStorage) alert('You browser does not support this game, we recommend you to use Firefox to play this');
     else {
      var Y = null;
      f.setNick = function (a) {
        originalName = a;
        if (getPlayer().length == 0) {
          lifeTimer = new Date();
        }
        Ea();
        D = a;
        Ha();
        H = 0
      };
      f.setRegion = U;
      f.setSkins = function (a) {
        Na = a
      };
      f.setNames = function (a) {
        ia = a
      };
      f.setDarkTheme = function (a) {
        fa = a
      };
      f.setColors = function (a) {
        va = a
      };
      f.setShowMass = function (a) {
        Oa = a
      };
      f.spectate = function () {
        D = null;
        B(1);
        Ea()
      };
      f.setGameMode = function (a) {
        a != M && (M = a, V())
      };
      f.setAcid = function (a) {
        ta = a
      };
      null != f.localStorage && (null == f.localStorage.AB8 && (f.localStorage.AB8 = 0 + ~~(100 * Math.random())), Q = + f.localStorage.AB8, f.ABGroup = Q);
      g.get(F + '//gc.agar.io', function (a) {
        var b = a.split(' ');
        a = b[0];
        b = b[1] || '';
        - 1 == 'DE IL PL HU BR AT UA'.split(' ').indexOf(a) && wa.push('nazi');
        - 1 == ['UA'].indexOf(a) && wa.push('ussr');
        R.hasOwnProperty(a) && ('string' == typeof R[a] ? u || U(R[a])  : R[a].hasOwnProperty(b) && (u || U(R[a][b])))
      }, 'text');
      setTimeout(function () {
      }, 300000);
      var R = {
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
      f.connect = Fa;

      f.getDarkBool = function() {
        return fa;
      }
      f.getMassBool = function() {
        return Oa;
      }

      f.getMemoryCells = function() {
        return interNodes;
      }

      f.getCellsArray = function() {
        return n;
      }

      f.getCells = function() {
        return y;
      }

      f.getPlayer = function() {
        return l;
      }

      f.getWidth = function() {
        return p;
      }

      f.getHeight = function() {
        return r;
      }

      f.getRatio = function() {
        return h;
      }

      f.getOffsetX = function() {
        return N;
      }

      f.getOffsetY = function() {
        return O;
      }

      f.getX = function() {
        return s;
      }

      f.getY = function() {
        return t;
      }

      f.getPointX = function() {
        return W;
      }

      f.getPointY = function() {
        return X;
      }

      f.getMouseX = function() {
        return S;
      }

      f.getMouseY = function() {
        return T;
      }

      f.getScreenDistance = function() {
        var temp = screenDistance();
        return temp;
      }
      f.getLastUpdate = function() {
        return I;
      }

      f.setPoint = function(x, y) {
        W = x;
        X = y;
      }

      f.createFake = function(a, b, c, d, e, f) {
        var n = new Ja(a, b, c, d, e, f);
        return n;
      }

      f.setScore = function(a) {
        sessionScore = a * 100;
      }

      f.setBestTime = function(a) {
        bestTime = a;
      }

      f.best = function(a, b) {
        setScore(a);
        setBestTime(b);
      }

      f.setBotIndex = function(a) {
        console.log("Changing bot");
        botIndex = a;
      }


      var Z = 500,
      Ka = - 1,
      La = - 1,
      v = null,
      x = 1,
      ga = null,
      J = {
      },
      wa = 'poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;hitler;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin;belgium;luxembourg;stussy;prussia;8ch;argentina;scotland;sir;romania;belarus;wojak;doge;nasa;byzantium;imperial japan;french kingdom;somalia;turkey;mars;pokerface;8;irs;receita federal'.split(';'),
      $a = [
        '8',
        'nasa'
      ],
      ab = [
        'm\'blob'
      ];
      Ja.prototype = {
        id: 0,
        points: null,
        pointsAcc: null,
        name: null,
        nameCache: null,
        sizeCache: null,
        x: 0,
        y: 0,
        size: 0,
        ox: 0,
        oy: 0,
        oSize: 0,
        nx: 0,
        ny: 0,
        nSize: 0,
        updateTime: 0,
        updateCode: 0,
        drawTime: 0,
        destroyed: !1,
        isVirus: !1,
        isAgitated: !1,
        wasSimpleDrawing: !0,
        danger: false,
        dangerTimeOut: 0,
        destroy: function () {
          var a;
          for (a = 0; a < n.length; a++) if (n[a] == this) {
            n.splice(a, 1);
            break
          }
          delete y[this.id];
          a = l.indexOf(this);
          - 1 != a && (ra = !0, l.splice(a, 1));
          a = E.indexOf(this.id);
          - 1 != a && E.splice(a, 1);
          this.destroyed = !0;
          G.push(this)
        },
        getNameSize: function () {
          return Math.max(~~(0.3 * this.size), 24)
        },
        setName: function (a) {
          if (this.name = a) null == this.nameCache ? this.nameCache = new ha(this.getNameSize(), '#FFFFFF', !0, '#000000')  : this.nameCache.setSize(this.getNameSize()),
          this.nameCache.setValue(this.name)
        },
        createPoints: function () {
          for (var a = this.getNumPoints(); this.points.length > a; ) {
            var b = ~~(Math.random() * this.points.length);
            this.points.splice(b, 1);
            this.pointsAcc.splice(b, 1)
          }
          0 == this.points.length && 0 < a && (this.points.push({
            c: this,
            v: this.size,
            x: this.x,
            y: this.y
          }), this.pointsAcc.push(Math.random() - 0.5));
          for (; this.points.length < a; ) {
            var b = ~~(Math.random() * this.points.length),
            c = this.points[b];
            this.points.splice(b, 0, {
              c: this,
              v: c.v,
              x: c.x,
              y: c.y
            });
            this.pointsAcc.splice(b, 0, this.pointsAcc[b])
          }
        },
        getNumPoints: function () {
          var a = 10;
          20 > this.size && (a = 5);
          this.isVirus && (a = 30);
          var b = this.size;
          this.isVirus || (b *= h);
          b *= x;
          return ~~Math.max(b, a)
        },
        movePoints: function () {
          this.createPoints();
          for (var a = this.points, b = this.pointsAcc, c = a.length, d = 0; d < c; ++d) {
            var e = b[(d - 1 + c) % c],
            f = b[(d + 1) % c];
            b[d] += (Math.random() - 0.5) * (this.isAgitated ? 3 : 1);
            b[d] *= 0.7;
            10 < b[d] && (b[d] = 10);
            - 10 > b[d] && (b[d] = - 10);
            b[d] = (e + f + 8 * b[d]) / 10
          }
          for (var h = this, d = 0; d < c; ++d) {
            var g = a[d].v,
            e = a[(d - 1 + c) % c].v,
            f = a[(d + 1) % c].v;
            if (15 < this.size && null != L) {
              var l = !1,
              m = a[d].x,
              n = a[d].y;
              L.retrieve2(m - 5, n - 5, 10, 10, function (a) {
                a.c != h && 25 > (m - a.x) * (m - a.x) + (n - a.y) * (n - a.y) && (l = !0)
              });
              !l && (a[d].x < ba || a[d].y < ca || a[d].x > da || a[d].y > ea) && (l = !0);
              l && (0 < b[d] && (b[d] = 0), b[d] -= 1)
            }
            g += b[d];
            0 > g && (g = 0);
            g = this.isAgitated ? (19 * g + this.size) / 20 : (12 * g + this.size) / 13;
            a[d].v = (e + f + 8 * g) / 10;
            e = 2 * Math.PI / c;
            f = this.points[d].v;
            this.isVirus && 0 == d % 2 && (f += 5);
            a[d].x = this.x + Math.cos(e * d) * f;
            a[d].y = this.y + Math.sin(e * d) * f
          }
        },
        updatePos: function () {
          var a;
          a = (I - this.updateTime) / 120;
          a = 0 > a ? 0 : 1 < a ? 1 : a;
          var b = 0 > a ? 0 : 1 < a ? 1 : a;
          this.getNameSize();
          if (this.destroyed && 1 <= b) {
            var c = G.indexOf(this);
            - 1 != c && G.splice(c, 1)
          }
          this.x = a * (this.nx - this.ox) + this.ox;
          this.y = a * (this.ny - this.oy) + this.oy;
          this.size = b * (this.nSize - this.oSize) + this.oSize;
          return b
        },
        shouldRender: function () {
          return this.x + this.size + 40 < s - p / 2 / h || this.y + this.size + 40 < t - r / 2 / h || this.x - this.size - 40 >
          s + p / 2 / h || this.y - this.size - 40 > t + r / 2 / h ? !1 : !0
        },
        draw: function () {
          if (this.shouldRender()) {
            var a = !this.isVirus && !this.isAgitated && 0.35 > h;
            if (this.wasSimpleDrawing && !a) for (var b = 0; b < this.points.length; b++) this.points[b].v = this.size;
            this.wasSimpleDrawing = a;
            e.save();
            this.drawTime = I;
            b = this.updatePos();
            this.destroyed && (e.globalAlpha *= 1 - b);
            e.lineWidth = 10;
            e.lineCap = 'round';
            e.lineJoin = this.isVirus ? 'mitter' : 'round';
            va ? (e.fillStyle = '#FFFFFF', e.strokeStyle = '#AAAAAA')  : (e.fillStyle = this.color, e.strokeStyle = this.color);
            if (a) e.beginPath(),
            e.arc(this.x, this.y, this.size, 0, 2 * Math.PI, !1);
             else {
              this.movePoints();
              e.beginPath();
              var c = this.getNumPoints();
              e.moveTo(this.points[0].x, this.points[0].y);
              for (b = 1; b <= c; ++b) {
                var d = b % c;
                e.lineTo(this.points[d].x, this.points[d].y)
              }
            }
            e.closePath();
            c = this.name.toLowerCase();
            !this.isAgitated && Na && '' == M ? - 1 != wa.indexOf(c) ? (J.hasOwnProperty(c) || (J[c] = new Image, J[c].src = 'skins/' + c + '.png'), b = 0 != J[c].width && J[c].complete ? J[c] : null)  : b = null : b = null;
            b = (d = b) ? - 1 != ab.indexOf(c)  : !1;
            a || e.stroke();
            e.fill();
            null == d || b || (e.save(), e.clip(), e.drawImage(d, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size), e.restore());
            (va || 15 < this.size) && !a && (e.strokeStyle = '#000000', e.globalAlpha *= 0.1, e.stroke());
            e.globalAlpha = 1;
            null != d && b && e.drawImage(d, this.x - 2 * this.size, this.y - 2 * this.size, 4 * this.size, 4 * this.size);
            b = - 1 != l.indexOf(this);
            a = ~~this.y;
            if ((ia || b) && this.name && this.nameCache && (null == d || - 1 == $a.indexOf(c))) {
              d = this.nameCache;
              d.setValue(this.name);
              d.setSize(this.getNameSize());
              c = Math.ceil(10 * h) / 10;
              d.setScale(c);
              var d = d.render(),
              f = ~~(d.width / c),
              g = ~~(d.height / c);
              e.drawImage(d, ~~this.x - ~~(f / 2), a - ~~(g / 2), f, g);
              a += d.height / 2 / c + 4
            }
            Oa && (b || 0 == l.length && (!this.isVirus || this.isAgitated) && 20 < this.size) && (null == this.sizeCache && (this.sizeCache = new ha(this.getNameSize() / 2, '#FFFFFF', !0, '#000000')), b = this.sizeCache, b.setSize(this.getNameSize() / 2), b.setValue(~~(this.size * this.size / 100)), c = Math.ceil(10 * h) / 10, b.setScale(c), d = b.render(), f = ~~(d.width / c), g = ~~(d.height / c), e.drawImage(d, ~~this.x - ~~(f / 2), a - ~~(g / 2), f, g));
            e.restore()
          }
        }
      };
      ha.prototype = {
        _value: '',
        _color: '#000000',
        _stroke: !1,
        _strokeColor: '#000000',
        _size: 16,
        _canvas: null,
        _ctx: null,
        _dirty: !1,
        _scale: 1,
        setSize: function (a) {
          this._size != a && (this._size = a, this._dirty = !0)
        },
        setScale: function (a) {
          this._scale != a && (this._scale = a, this._dirty = !0)
        },
        setColor: function (a) {
          this._color != a && (this._color = a, this._dirty = !0)
        },
        setStroke: function (a) {
          this._stroke != a && (this._stroke = a, this._dirty = !0)
        },
        setStrokeColor: function (a) {
          this._strokeColor != a && (this._strokeColor = a, this._dirty = !0)
        },
        setValue: function (a) {
          a != this._value && (this._value = a, this._dirty = !0)
        },
        render: function () {
          null == this._canvas && (this._canvas = document.createElement('canvas'), this._ctx = this._canvas.getContext('2d'));
          if (this._dirty) {
            this._dirty = !1;
            var a = this._canvas,
            b = this._ctx,
            c = this._value,
            d = this._scale,
            e = this._size,
            f = e + 'px Ubuntu';
            b.font = f;
            var g = b.measureText(c).width,
            h = ~~(0.2 * e);
            a.width = (g + 6) * d;
            a.height = (e + h) * d;
            b.font = f;
            b.scale(d, d);
            b.globalAlpha = 1;
            b.lineWidth = 3;
            b.strokeStyle = this._strokeColor;
            b.fillStyle = this._color;
            this._stroke && b.strokeText(c, 3, e - h / 2);
            b.fillText(c, 3, e - h / 2)
          }
          return this._canvas
        }
      };
      f.onload = Pa
    }
  }
}) (window, jQuery);
