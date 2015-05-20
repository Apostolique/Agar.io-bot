// ==UserScript==
// @name        AgarBot
// @namespace   Apos
// @description Plays Agar
// @include     http://agar.io/
// @version     1
// @grant       none
// @author      twitch.tv/apostolique
// ==/UserScript==

(function (g, q) {
  function wa() {
    ha();
    setInterval(ha, 180000);
    z = $ = document.getElementById('canvas');
    d = z.getContext('2d');
    z.onmousedown = function (a) {
      if (ia) {
        var b = a.clientX - (5 + l / 5 / 2),
        c = a.clientY - (5 + l / 5 / 2);
        if (Math.sqrt(b * b + c * c) <= l / 5 / 2) {
          E();
          A(17);
          return
        }
      }
      N = a.clientX;
      O = a.clientY;
      aa();
      E()
    };
    z.onmousemove = function (a) {
      N = a.clientX;
      O = a.clientY;
      aa()
    };
    z.onmouseup = function (a) {
    };
    var a = !1,
    b = !1,
    c = !1;
    g.onkeydown = function (e) {
      32 != e.keyCode || a || (E(), A(17), a = !0);
      81 != e.keyCode || b || (A(18), b = !0);
      87 != e.keyCode || c || (E(), A(21), c = !0);
      27 == e.keyCode && q('#overlays').fadeIn(200)
      
      if (84 == e.keyCode) {
        console.log("Toggle");
        toggle = !toggle;
      }
      if (82 == e.keyCode) {
        console.log("ToggleDraw");
        toggleDraw = !toggleDraw;
      }
    };
    g.onkeyup = function (e) {
      32 == e.keyCode && (a = !1);
      87 == e.keyCode && (c = !1);
      81 == e.keyCode && b && (A(19), b = !1)
    };
    g.onblur = function () {
      A(19);
      c = b = a = !1
    };
    g.onresize = ja;
    ja();
    g.requestAnimationFrame ? g.requestAnimationFrame(ka)  : setInterval(ba, 1000 / 60);
    setInterval(E, 40);
    la(q('#region').val());
    q('#overlays').show()
  }
  function xa() {
    if (0.5 > k) F = null;
     else {
      for (var a = Number.POSITIVE_INFINITY, b = Number.POSITIVE_INFINITY, c = Number.NEGATIVE_INFINITY, e = Number.NEGATIVE_INFINITY, d = 0, f = 0; f < p.length; f++) p[f].shouldRender() && (d = Math.max(p[f].size, d), a = Math.min(p[f].x, a), b = Math.min(p[f].y, b), c = Math.max(p[f].x, c), e = Math.max(p[f].y, e));
      F = QUAD.init({
        minX: a - (d + 100),
        minY: b - (d + 100),
        maxX: c + (d + 100),
        maxY: e + (d + 100)
      });
      for (f = 0; f < p.length; f++) if (a = p[f], a.shouldRender()) for (b = 0; b < a.points.length; ++b) F.insert(a.points[b])
    }
  }
  function aa() {
    P = (N - l / 2) / k + s;
    Q = (O - r / 2) / k + t
  }
  function ha() {
    null == R && (R = {
    }, q('#region').children().each(function () {
      var a = q(this),
      b = a.val();
      b && (R[b] = a.text())
    }));
    q.get('http://m.agar.io/info', function (a) {
      var b = {
      },
      c;
      for (c in a.regions) {
        var e =
        c.split(':') [0];
        b[e] = b[e] || 0;
        b[e] += a.regions[c].numPlayers
      }
      for (c in b) q('#region option[value="' + c + '"]').text(R[c] + ' (' + b[c] + ' players)')
    }, 'json')
  }
  function ma() {
    q('#adsBottom').hide();
    q('#overlays').hide()
  }
  function la(a) {
    a && a != G && (G = a, ca())
  }
  function na() {
    console.log('Find ' + G + H);
    q.ajax('http://m.agar.io/', {
      error: function () {
        setTimeout(na, 1000)
      },
      success: function (a) {
        a = a.split('\n');
        oa('ws://' + a[0])
      },
      dataType: 'text',
      method: 'POST',
      cache: !1,
      crossDomain: !0,
      data: G + H || '?'
    })
  }
  function ca() {
    G && (q('#connecting').show(), na())
  }
  function oa(a) {
    h && (h.onopen = null, h.onmessage = null, h.onclose = null, h.close(), h = null);
    B = [
    ];
    m = [
    ];
    v = {
    };
    p = [
    ];
    C = [
    ];
    w = [
    ];
    x = null;
    console.log('Connecting to ' + a);
    h = new WebSocket(a);
    h.binaryType = 'arraybuffer';
    h.onopen = ya;
    h.onmessage = za;
    h.onclose = Aa;
    h.onerror = function () {
      console.log('socket error')
    }
  }
  function ya(a) {
    q('#connecting').hide();
    console.log('socket open');
    a = new ArrayBuffer(5);
    var b = new DataView(a);
    b.setUint8(0, 254);
    b.setUint32(1, 1, !0);
    h.send(a);
    a = new ArrayBuffer(5);
    b = new DataView(a);
    b.setUint8(0, 255);
    b.setUint32(1, 1, !0);
    h.send(a);
    pa()
  }
  function Aa(a) {
    console.log('socket close');
    setTimeout(ca, 500)
  }
  function za(a) {
    function b() {
      for (var a = ''; ; ) {
        var b = e.getUint16(c, !0);
        c += 2;
        if (0 == b) break;
        a += String.fromCharCode(b)
      }
      return a
    }
    var c = 1,
    e = new DataView(a.data);
    switch (e.getUint8(0)) {
      case 16:
        Ba(e);
        break;
      case 17:
        I = e.getFloat32(1, !0);
        J = e.getFloat32(5, !0);
        K = e.getFloat32(9, !0);
        break;
      case 20:
        m = [
        ];
        B = [
        ];
        break;
      case 32:
        B.push(e.getUint32(1, !0));
        break;
      case 49:
        if (null != x) break;
        a = e.getUint32(c, !0);
        c += 4;
        w = [
        ];
        for (var d = 0; d < a; ++d) {
          var f = e.getUint32(c, !0),
          c = c + 4;
          w.push({
            id: f,
            name: b()
          })
        }
        qa();
        break;
      case 50:
        x = [
        ];
        a = e.getUint32(c, !0);
        c += 4;
        for (d = 0; d < a; ++d) x.push(e.getFloat32(c, !0)),
        c += 4;
        qa();
        break;
      case 64:
        S = e.getFloat64(1, !0),
        T = e.getFloat64(9, !0),
        U = e.getFloat64(17, !0),
        V = e.getFloat64(25, !0),
        I = (U + S) / 2,
        J = (V + T) / 2,
        K = 1,
        0 == m.length && (s = I, t = J, k = K)
    }
  }
  function Ba(a) {
    D = + new Date;
    var b = Math.random(),
    c = 1;
    da = !1;
    for (var e = a.getUint16(c, !0), c = c + 2, d = 0; d < e; ++d) {
      var f = v[a.getUint32(c, !0)],
      g = v[a.getUint32(c + 4, !0)],
      c = c + 8;
      f && g && (g.destroy(), g.ox =
      g.x, g.oy = g.y, g.oSize = g.size, g.nx = f.x, g.ny = f.y, g.nSize = g.size, g.updateTime = D)
    }
    for (; ; ) {
      e = a.getUint32(c, !0);
      c += 4;
      if (0 == e) break;
      for (var d = a.getFloat32(c, !0), c = c + 4, f = a.getFloat32(c, !0), c = c + 4, g = a.getFloat32(c, !0), c = c + 4, h = a.getUint8(c++), k = a.getUint8(c++), l = a.getUint8(c++), h = (h << 16 | k << 8 | l).toString(16); 6 > h.length; ) h = '0' + h;
      h = '#' + h;
      l = a.getUint8(c++);
      k = !!(l & 1);
      l & 2 && (c += 4);
      l & 4 && (c += 8);
      l & 8 && (c += 16);
      for (l = ''; ; ) {
        var n = a.getUint16(c, !0),
        c = c + 2;
        if (0 == n) break;
        l += String.fromCharCode(n)
      }
      n = null;
      v.hasOwnProperty(e) ? (n = v[e], n.updatePos(), n.ox = n.x, n.oy = n.y, n.oSize = n.size, n.color = h)  : (n = new ra(e, d, f, g, h, k, l), n.pX = d, n.pY = f);
      n.nx = d;
      n.ny = f;
      n.nSize = g;
      n.updateCode = b;
      n.updateTime = D;
      - 1 != B.indexOf(e) && - 1 == m.indexOf(n) && (document.getElementById('overlays').style.display = 'none', m.push(n), 1 == m.length && (s = n.x, t = n.y))
    }
    a.getUint16(c, !0);
    c += 2;
    f = a.getUint32(c, !0);
    c += 4;
    for (d = 0; d < f; d++) e = a.getUint32(c, !0),
    c += 4,
    v[e] && (v[e].updateCode = b);
    for (d = 0; d < p.length; d++) p[d].updateCode != b && p[d--].destroy();
    da && 0 == m.length && q('#overlays').fadeIn(3000) && setNick(originalName)
  }
  
    function computeDistance(x1, y1, x2, y2) {
        var xdis = x1 - x2; // <--- FAKE AmS OF COURSE!
        var ydis = y1 - y2;
        var distance = Math.sqrt(Math.pow(xdis, 2)  + Math.pow(ydis, 2));
        
        return distance;
    }

    function computerDistanceFromCircleEdge(x1, y1, x2, y2, s2) {
        var tempD = computeDistance(x2, y2, x1, y1);
        
        var offsetX = 0;
        var offsetY = 0;
        
        var ratioX =  tempD / (x2 - x1);
        var ratioY =  tempD / (y2 - y1);

        offsetX = x2 - (s2 / ratioX);
        offsetY = y2 - (s2 / ratioY);
        
        return computeDistance(x1, y1, offsetX, offsetY);
    }

    function getListmasedOnFunction(booleanFunction, listToUse) {
        var dotList = [];
        Object.keys(listToUse).forEach(function (element, index) {
            if (booleanFunction(element)){
                dotList.push(v[element]);
            }
        });
        
        return dotList;
    }

    //TODO: Make it only go to a virus if it's big enough. If it shrinks, it shouldn't only grab a single dot and go back in.
    function getAllNiceViruses() {
        var dotList = [];
        
        if (m.length == 1) {
            dotList = getListmasedOnFunction(function (element){
                if (v[element].isVirus && (v[element].size *1.10 <= m[0].size) && v[element].size * 1.15 >= m[0].size) {
                        return true;
                }
                return false;
            }, v);
        }

        
        return dotList;
    }

    function getAllThreats() {
        var dotList = [];
        
        dotList = getListmasedOnFunction(function (element){
            var isMe = false;
            
            for (var i = 0; i < m.length; i++) {
                if (v[element].id == m[i].id) {
                    isMe = true;
                    break;
                }
            }
            
            for (var i = 0; i < m.length; i++) {
                if (!isMe && (!v[element].isVirus && (v[element].size >= m[i].oSize * 1.15))) {
                    return true;
                } else if (v[element].isVirus && (v[element].size * 1.15 <= m[i].oSize)) {
                    return true;
                }
                return false;
            }
        }, v);
        
        return dotList;
    }

    function getAllFood() {
        var elementList = [];
        var dotList = [];
        
        elementList = getListmasedOnFunction(function (element){
            var isMe = false;
            
            for (var i = 0; i < m.length; i++) {
                if (v[element].id == m[i].id) {
                    isMe = true;
                    break;
                }
            }
            
            for (var i = 0; i < m.length; i++) {
                if (!isMe && !v[element].isVirus && (v[element].size * 1.25 <= m[i].size)  || (v[element].size <= 11)){return true;} else{return false;}
            }
        }, v);
        
        for (var i = 0; i < elementList.length; i++) {
            dotList.push([elementList[i].x, elementList[i].y, elementList[i].size]);
        }
        
        return dotList;
    }

    function clusterFood(foodList, blobSize) {
        var clusters = [];
        var addedCluster = false;
        for (var i = 0; i < foodList.length; i++) {
            for (var j = 0; j < clusters.length; j++) {
                if (computeDistance(foodList[i][0], foodList[i][1], clusters[j][0], clusters[j][1]) < blobSize * 1.5) {
                    clusters[j][0] = (foodList[i][0] + clusters[j][0]) / 2;
                    clusters[j][1] = (foodList[i][1] + clusters[j][1]) / 2;
                    clusters[j][2] += foodList[i][2];
                    addedCluster = true;
                    break;
                }
            }
            if (!addedCluster) {
                clusters.push([foodList[i][0], foodList[i][1], foodList[i][2]]);
            }
            addedCluster = false;
        }
        return clusters;
    }

    //Given two points on a line, finds the slope of a perpendicular line crossing it.
    function inverseSlope(x1, y1, x2, y2) {
        var m = (y1 - y2) / (x1 - x2);
        return (-1) / m;
    }

    //Given a slope and an offset, returns two points on that line.
    function pointsOnLine(slope, useX, useY) {
        
        var b = useY - slope * useX;
        
        return [[useX - 100, slope * (useX - 100) + b], [useX + 100, slope * (useX + 100) + b]];
    }

    //Using a line formed from point a to b, tells if point c is on S side of that line.
    function isSideLine(a, b, c) {
        if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0) {
            return true;
        }
        return false;
    }

    function findDestination() {
        dPoints = [];
        lines = [];
        
        var tempMoveX = P;
        var tempMoveY = Q;
        
        if (m[0] != null) {
            var allPossibleFood = null;
            allPossibleFood = getAllFood(); // #1
            
            /*for (var i = -1000; i < 1000; i += m[0].size) {
                for (var j = -1000; j < 1000; j += m[0].size) {
                    allPossibleFood.push([m[0].x + i, m[0].y + j, -200]);
                }
            }*/
            
            var allPossibleThreats = getAllThreats();
            
            var allPossibleNiceViruses = getAllNiceViruses();
            var closestNiceViruse = null;
            if (allPossibleNiceViruses.length != 0) {
                closestNiceViruse = [allPossibleNiceViruses[0], computeDistance(allPossibleNiceViruses[0].x, allPossibleNiceViruses[0].y, m[0].x, m[0].y)];
            
                for (var i = 1; i < allPossibleNiceViruses.length; i++) {
                    var testD = computeDistance(allPossibleNiceViruses[i].x, allPossibleNiceViruses[i].y, m[0].x, m[0].y)
                    if (testD < closestNiceViruse[1]) {
                        closestNiceViruse = [allPossibleNiceViruses[i], testD];
                    }
                }
                
                console.log("NO WAY!!! LET THE TROLLING mEGIN!");
            }
            
            var allThreatLines = [];
            var allThreatLinesmool = [];
            var allFallbackPointsLeft = [];
            var allFallbackPointsRight = [];
            var allFallbackmool = [];
            var allFallbackCount = [];
            
            var closestThreatIndex = null;
            var closestThreatD = null;
            var closestThreatIndex2 = null;
            var closestThreatD2 = null;
            
            var isSafeSpot = true;
            
            var clusterAllFood = clusterFood(allPossibleFood, m[0].oSize);
            
            for (var i = 0; i < allPossibleThreats.length; i++) {
                var tempD = computerDistanceFromCircleEdge(m[0].x, m[0].y, allPossibleThreats[i].x, allPossibleThreats[i].y, allPossibleThreats[i].size);
                
                if (closestThreatIndex != null) {
                    if (closestThreatD > tempD) {
                        closestThreatIndex2 = closestThreatIndex;
                        closestThreatD2 = closestThreatD;
                        closestThreatIndex = i;
                        closestThreatD = tempD;
                    }
                } else {
                    closestThreatIndex = i;
                    closestThreatD = tempD;
                }
                
                var ratioX =  tempD / (allPossibleThreats[i].x - m[0].x);
                var ratioY =  tempD / (allPossibleThreats[i].y - m[0].y);
                
                var offsetX = 0;
                var offsetY = 0;
                
                var offsetEscapeX = 0;
                var offsetEscapeY = 0;
                
                var offsetLeftX = 0;
                var offsetLeftY = 0;

                var offsetRightX = 0;
                var offsetRightY = 0;
                
                var offsetEscapeLeftX = 0;
                var offsetEscapeLeftY = 0;

                var offsetEscapeRightX = 0;
                var offsetEscapeRightY = 0;
                
                var escape = 5;
                var escapeMid = 3;
                
                iSlope = inverseSlope(allPossibleThreats[i].x, allPossibleThreats[i].y, m[0].x, m[0].y);
                
                var sidePoints = pointsOnLine(iSlope, allPossibleThreats[i].x, allPossibleThreats[i].y);
                
                var SD = computeDistance(allPossibleThreats[i].x, allPossibleThreats[i].y, sidePoints[0][0], sidePoints[0][1]);

                var ratioLeftX = SD / (allPossibleThreats[i].x - sidePoints[0][0]);
                var ratioLeftY = SD / (allPossibleThreats[i].y - sidePoints[0][1]);
                
                if (allPossibleThreats[i].size >= m[0].size * 4) {
                    offsetX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * 1.5);
                    offsetY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * 1.5);
                    
                    offsetLeftX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioLeftX * 3);
                    offsetLeftY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioLeftY * 3);
                    
                    offsetRightX = allPossibleThreats[i].x + (allPossibleThreats[i].size / ratioLeftX * 3);
                    offsetRightY = allPossibleThreats[i].y + (allPossibleThreats[i].size / ratioLeftY * 3);
                    
                    offsetEscapeX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * escape);
                    offsetEscapeY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * escape);
                    
                    offsetEscapeLeftX = offsetEscapeX - (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                    offsetEscapeLeftY = offsetEscapeY - (allPossibleThreats[i].size / ratioLeftY * escapeMid);

                    offsetEscapeRightX = offsetEscapeX + (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                    offsetEscapeRightY = offsetEscapeY + (allPossibleThreats[i].size / ratioLeftY * escapeMid);
                    
                } else if (allPossibleThreats[i].size >= m[0].size * 2.1) {
                    offsetX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * 4);
                    offsetY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * 4);
                    
                    offsetLeftX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioLeftX * 4);
                    offsetLeftY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioLeftY * 4);
                    
                    offsetRightX = allPossibleThreats[i].x + (allPossibleThreats[i].size / ratioLeftX * 4);
                    offsetRightY = allPossibleThreats[i].y + (allPossibleThreats[i].size / ratioLeftY * 4);
                    
                    offsetEscapeX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * escape);
                    offsetEscapeY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * escape);
                    
                    offsetEscapeLeftX = offsetEscapeX - (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                    offsetEscapeLeftY = offsetEscapeY - (allPossibleThreats[i].size / ratioLeftY * escapeMid);

                    offsetEscapeRightX = offsetEscapeX + (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                    offsetEscapeRightY = offsetEscapeY + (allPossibleThreats[i].size / ratioLeftY * escapeMid);
                } else {
                    offsetX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * 1);
                    offsetY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * 1);
                    
                    offsetLeftX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioLeftX * 3);
                    offsetLeftY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioLeftY * 3);
                    
                    offsetRightX = allPossibleThreats[i].x + (allPossibleThreats[i].size / ratioLeftX * 3);
                    offsetRightY = allPossibleThreats[i].y + (allPossibleThreats[i].size / ratioLeftY * 3);
                    
                    offsetEscapeX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * escape);
                    offsetEscapeY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * escape);
                    
                    offsetEscapeLeftX = offsetEscapeX - (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                    offsetEscapeLeftY = offsetEscapeY - (allPossibleThreats[i].size / ratioLeftY * escapeMid);

                    offsetEscapeRightX = offsetEscapeX + (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                    offsetEscapeRightY = offsetEscapeY + (allPossibleThreats[i].size / ratioLeftY * escapeMid);
                }
                
                if (m[0].x < allPossibleThreats[i].x && m[0].y > allPossibleThreats[i].y) {
                    var c = offsetRightX;
                    offsetRightX = offsetLeftX;
                    offsetLeftX = c;

                    var d = offsetRightY;
                    offsetRightY = offsetLeftY;
                    offsetLeftY = d;
                    
                    var e = offsetEscapeRightX;
                    offsetEscapeRightX = offsetEscapeLeftX;
                    offsetEscapeLeftX = e;

                    var f = offsetEscapeRightY;
                    offsetEscapeRightY = offsetEscapeLeftY;
                    offsetEscapeLeftY = f;
                    //console.log("Swap");
                } else if (m[0].x > allPossibleThreats[i].x && m[0].y > allPossibleThreats[i].y)
                {
                    var c = offsetRightX;
                    offsetRightX = offsetLeftX;
                    offsetLeftX = c;

                    var d = offsetRightY;
                    offsetRightY = offsetLeftY;
                    offsetLeftY = d;
                    
                    var e = offsetEscapeRightX;
                    offsetEscapeRightX = offsetEscapeLeftX;
                    offsetEscapeLeftX = e;

                    var f = offsetEscapeRightY;
                    offsetEscapeRightY = offsetEscapeLeftY;
                    offsetEscapeLeftY = f;
                    //console.log("Swap");
                }
                
                //offsetX = ((allPossibleThreats[i].x + m[0].x) / 2);
                //offsetY = ((allPossibleThreats[i].y + m[0].y) / 2);

                drawPoint(offsetX, offsetY, 2);
                
                drawPoint(offsetLeftX, offsetLeftY, 3);
                drawPoint(offsetRightX, offsetRightY, 3);
                
                var SSlope = inverseSlope(allPossibleThreats[i].x, allPossibleThreats[i].y, sidePoints[0][0], sidePoints[0][1]);
                
                threatLineLeft = [[offsetLeftX, offsetLeftY], [offsetX, offsetY]];
                threatLineRight = [[offsetRightX, offsetRightY], [offsetX, offsetY]];
                
                threatLine = pointsOnLine(iSlope, offsetX, offsetY);
                
                drawLine(allPossibleThreats[i].x, allPossibleThreats[i].y, m[0].x, m[0].y, 3);
                
                //drawLine(threatLine[0][0], threatLine[0][1], threatLine[1][0], threatLine[1][1], 0);
                
                drawLine(threatLineLeft[0][0], threatLineLeft[0][1], threatLineLeft[1][0], threatLineLeft[1][1], 0);
                drawLine(threatLineRight[0][0], threatLineRight[0][1], threatLineRight[1][0], threatLineRight[1][1], 0);
                
                allThreatLines.push([threatLineLeft, threatLineRight]);
                
                drawPoint(offsetEscapeLeftX, offsetEscapeLeftY, 4);
                drawPoint(offsetEscapeRightX, offsetEscapeRightY, 4);
                //drawPoint(offsetEscapeX, offsetEscapeY, 4);
                
                //allFallbackPoints.push([offsetEscapeX, offsetEscapeY]);
                allFallbackPointsLeft.push([offsetEscapeLeftX, offsetEscapeLeftY]);
                allFallbackPointsRight.push([offsetEscapeRightX, offsetEscapeRightY]);
                //allFallbackPoints.push([offsetEscapeRightX, offsetEscapeRightY]);
                
                allFallbackmool.push(true);
                //allFallbackmool.push(true);
                
                allFallbackCount.push(0);
                //allFallbackCount.push(0);
                
                var badSide = isSideLine(threatLine[0], threatLine[1], [allPossibleThreats[i].x, allPossibleThreats[i].y]);
                
                var badSideLeft = isSideLine(threatLineLeft[0], threatLineLeft[1], [allPossibleThreats[i].x, allPossibleThreats[i].y]);
                var badSideRight = isSideLine(threatLineRight[0], threatLineRight[1], [allPossibleThreats[i].x, allPossibleThreats[i].y]);
                
                allThreatLinesmool.push([badSideLeft, badSideRight]);
                
                isSafeSpot = (
                        badSideLeft != isSideLine(threatLineLeft[0], threatLineLeft[1], [m[0].x, m[0].y]) &&
                        badSideRight != isSideLine(threatLineRight[0], threatLineRight[1], [m[0].x, m[0].y]) && isSafeSpot
                );
                
                var removeClusterList = [];
                
                for (var j = 0; j < clusterAllFood.length; j++) {
                    if (
                        badSideLeft == isSideLine(threatLineLeft[0], threatLineLeft[1], [clusterAllFood[j][0], clusterAllFood[j][1]]) &&
                        badSideRight == isSideLine(threatLineRight[0], threatLineRight[1], [clusterAllFood[j][0], clusterAllFood[j][1]])
                    ) {
                        removeClusterList.push(j);
                    }
                }
                for (var j = removeClusterList.length - 1; j >= 0; j--) {
                    if (!toggle) {
                        drawPoint(clusterAllFood[j][0], clusterAllFood[j][1], 0);
                    }
                    clusterAllFood.splice(removeClusterList[j], 1);
                }
                
                if (
                    badSideLeft == isSideLine(threatLineLeft[0], threatLineLeft[1], [tempPoint[0], tempPoint[1]]) &&
                    badSideRight == isSideLine(threatLineRight[0], threatLineRight[1], [tempPoint[0], tempPoint[1]])
                ) {
                    tempPoint[2] = 0;
                } 
            }
            
            for (var i = 0; i < clusterAllFood.length; i++) {
                //console.log("mefore: " + clusterAllFood[i][2]);
                clusterAllFood[i][2] = clusterAllFood[i][2] * 6 - computeDistance(clusterAllFood[i][0], clusterAllFood[i][1], m[0].ox, m[0].oy);
                if (!toggle) {
                    drawPoint(clusterAllFood[i][0], clusterAllFood[i][1], 1);
                }
                //console.log("After: " + clusterAllFood[i][2]);
            }
            
            if (clusterAllFood.length != 0 && isSafeSpot) {
                biggestCluster = clusterAllFood[0];
                for (var i = 1; i < clusterAllFood.length; i++) {
                    if (clusterAllFood[i][2] > biggestCluster[2]) {
                        biggestCluster = clusterAllFood[i];
                    }
                }
                
                /**
                 * #1 Get a list of all the food.
                 * #2 Get a list of all the threats.
                 * #3 Remove all the food near threats.
                 * #4 Find closest food after the filter.
                 */
                
                if (closestNiceViruse != null && closestNiceViruse[0].size * 1.15 <= m[0].size) {
                    for (var i = 0; i < m.length; i++) {
                        drawLine(m[i].ox, m[i].oy, closestNiceViruse[0].x, closestNiceViruse[0].y, 5);
                    }
                    
                    virusmait = true;
     
                    tempMoveX = closestNiceViruse[0].x;
                    tempMoveY = closestNiceViruse[0].y;
                } else {
                    for (var i = 0; i < m.length; i++) {
                        drawLine(m[i].ox, m[i].oy, biggestCluster[0], biggestCluster[1], 1);
                    }
                    
                    virusmait = false;
     
                    tempMoveX = biggestCluster[0];
                    tempMoveY = biggestCluster[1];
                    //console.log("Moving");
                }
                
                //console.log("X: " + P + " Y: " + Q);
                
                if (!toggle) {
                  if (m.length > 1 && splitted) {
                      splitted = false;
                      tempMoveX = biggestCluster[0];
                      tempMoveY = biggestCluster[1];
                  }
                  if (splitting) {
                      tempMoveX = biggestCluster[0];
                      tempMoveY = biggestCluster[1];
                      A(17);
                      splitting = false;
                      splitted = true;
                  }
                  
                  if (biggestCluster[2] * 2.5 < m[0].size && biggestCluster[2] > m[0].size / 5 &&  biggestCluster[2] > 11 && !splitted && !splitting) {
                      drawLine(m[0].x, m[0].y, biggestCluster[0], biggestCluster[1], 4);
                      
                      var worthyTargetDistance = computeDistance(m[0].x, m[0].y, biggestCluster[0], biggestCluster[1]);
                      
                      console.log("I want to split.");
                      
                      if ((worthyTargetDistance < m[0].size * 3) && m.length == 1) {
                          tempMoveX = biggestCluster[0];
                          tempMoveY = biggestCluster[1];
                          splitting = true;
                      }
                  }
                }
                
            } else if (!virusmait) {
                //console.log("I'm lost, where do I go?");
                
                /*if (closestThreatIndex2 != null) {
                    if (allPossibleThreats[closestThreatIndex].x < allPossibleThreats[closestThreatIndex2].x && allPossibleThreats[closestThreatIndex].y < allPossibleThreats[closestThreatIndex2].y) {
                        tempMoveX = allFallbackPointsLeft[closestThreatIndex][0];
                        tempMoveY = allFallbackPointsLeft[closestThreatIndex][1];
                    } else if (allPossibleThreats[closestThreatIndex].x > allPossibleThreats[closestThreatIndex2].x && allPossibleThreats[closestThreatIndex].y < allPossibleThreats[closestThreatIndex2].y) {
                        tempMoveX = allFallbackPointsRight[closestThreatIndex][0];
                        tempMoveY = allFallbackPointsRight[closestThreatIndex][1];
                    } else if (allPossibleThreats[closestThreatIndex].x < allPossibleThreats[closestThreatIndex2].x && allPossibleThreats[closestThreatIndex].y > allPossibleThreats[closestThreatIndex2].y) {
                        tempMoveX = allFallbackPointsRight[closestThreatIndex][0];
                        tempMoveY = allFallbackPointsRight[closestThreatIndex][1];
                    } else if (allPossibleThreats[closestThreatIndex].x > allPossibleThreats[closestThreatIndex2].x && allPossibleThreats[closestThreatIndex].y > allPossibleThreats[closestThreatIndex2].y) {
                        tempMoveX = allFallbackPointsLeft[closestThreatIndex][0];
                        tempMoveY = allFallbackPointsLeft[closestThreatIndex][1];
                    } else {
                        console.log("Hmm, WTF!!!");
                    }
                } else {
                    tempMoveX = allFallbackPointsLeft[closestThreatIndex][0];
                    tempMoveY = allFallbackPointsLeft[closestThreatIndex][1];
                }*/
                tempMoveX = allFallbackPointsLeft[closestThreatIndex][0];
                tempMoveY = allFallbackPointsLeft[closestThreatIndex][1];
                
                if (tempMoveX < S || tempMoveX > U) {
                    tempMoveX = allFallbackPointsRight[closestThreatIndex][0];
                    tempMoveY = allFallbackPointsRight[closestThreatIndex][1];
                } else if (tempMoveX < T || tempMoveX > V) {
                    tempMoveX = allFallbackPointsRight[closestThreatIndex][0];
                    tempMoveY = allFallbackPointsRight[closestThreatIndex][1];
                }
                
                
                drawLine(m[0].x, m[0].y, tempMoveX, tempMoveY, 6);
                //#1 Find closest enemy.
                //#2 go to its teal line.
                
                /*for (var i = 0; i < allFallbackPoints.length; i++) {
                    for (var j = 0; j < allThreatLines.length; j++) {
                        var badSideLeft = allThreatLinesmool[0];
                        var badSideRight = allThreatLinesmool[1];
                        
                        if (allFallbackmool[i] &&
                            badSideLeft != isSideLine(allThreatLines[j][0][0], allThreatLines[j][0][1], allFallbackPoints[i]) &&
                            badSideRight != isSideLine(allThreatLines[j][1][0], allThreatLines[j][1][1], allFallbackPoints[i])
                        ) {
                            allFallbackmool[i] = true;
                            //console.log("Step 1");
                        } else {
                            //console.log("Failed Step 1");
                            allFallbackmool[i] = false;
                            allFallbackCount[i] += 1;
                        }
                    }
                    

                }
                
                var closestFallback = null;
                var fallbackDistance = null;
                for (var i = 1; i < allFallbackPoints.length; i++) {
                    if (allFallbackmool[i]) {
                        var tempDistance = computeDistance(m[0].x, m[0].y, allFallbackPoints[i][0], allFallbackPoints[i][1]);
                        if (closestFallback != null) {
                            if (tempDistance < fallbackDistance) {
                                closestFallback = allFallbackPoints[i];
                                fallbackDistance = tempDistance;
                            }
                        } else {
                            //console.log("FOUND CHILL SPOT!");
                            closestFallback = allFallbackPoints[i];
                            fallbackDistance = tempDistance;
                        }
                    }
                }
                
                if (closestFallback != null) {
                    console.log("ESCAPING");
                    tempMoveX = closestFallback[0];
                    tempMoveY = closestFallback[1];
                    drawLine(m[0].x, m[0].y, tempMoveX, tempMoveY, 6);
                } else {
                    console.log("NOPE! NEVER RUNNING AWAY!");
                }*/
                
                //#1 Loop through fallbackpoints
                //#2 Loop through threatlines
                //#3 Verify if a point is fine. If not, add counter to point's overlaps
                //#4 Go to closest safe point, otherwise find point with lowest counter.
            }
            
            drawPoint(tempPoint[0], tempPoint[1], tempPoint[2]);
            tempPoint[2] = 1;
        }
        
        if (!toggle) {
            P = tempMoveX;
            Q = tempMoveY;
        }
    }

    function drawPoint(x_1, y_1, drawColor) {
        if (!toggleDraw) {
            var x1 = ((x_1 - I) * k) + l/2;
            var y1 = ((y_1 - J) * k) + r/2;
            dPoints.push([x1, y1, drawColor]);
        }
    }

    function drawLine(x_1, y_1, x_2, y_2, drawColor) {
        if (!toggleDraw) {
            var x1 = ((x_1 - I) * k) + l/2;
            var y1 = ((y_1 - J) * k) + r/2;
            var x2 = ((x_2 - I) * k) + l/2;
            var y2 = ((y_2 - J) * k) + r/2;
            lines.push([x1, y1, x2, y2, drawColor]);
        }
    }
  
  function E() {
    findDestination();
      
    if (null != h && h.readyState == h.OPEN) {
      var a = N - l / 2,
      b = O - r / 2;
      64 > a * a + b * b || sa == P && ta == Q || (sa = P, ta = Q, a = new ArrayBuffer(21), b = new DataView(a), b.setUint8(0, 16), b.setFloat64(1, P, !0), b.setFloat64(9, Q, !0), b.setUint32(17, 0, !0), h.send(a))
    }
  }
  function pa() {
    if (null != h && h.readyState == h.OPEN && null != L) {
      var a = new ArrayBuffer(1 + 2 * L.length),
      b = new DataView(a);
      b.setUint8(0, 0);
      for (var c = 0; c < L.length; ++c) b.setUint16(1 + 2 * c, L.charCodeAt(c), !0);
      h.send(a)
    }
  }
  function A(a) {
    if (null != h && h.readyState == h.OPEN) {
      var b = new ArrayBuffer(1);
      (new DataView(b)).setUint8(0, a);
      h.send(b)
    }
  }
  function ka() {
    ba();
    g.requestAnimationFrame(ka)
  }
  function ja() {
    l = g.innerWidth;
    r = g.innerHeight;
    $.width = z.width = l;
    $.height = z.height = r;
    ba()
  }
  function Ca() {
    if (0 != m.length) {
      for (var a = 0, b = 0; b < m.length; b++) a += m[b].size;
      a = Math.pow(Math.min(64 / a, 1), 0.4) * Math.max(r / 1080, l / 1920);
      k = (9 * k + a) / 10
    }
  }
  function ba() {
    var a = + new Date;
    ++Da;
    D = + new Date;
    if (0 < m.length) {
      Ca();
      for (var b = 0, c = 0, e = 0; e < m.length; e++) m[e].updatePos(),
      b += m[e].x / m.length,
      c += m[e].y / m.length;
      I = b;
      J = c;
      K = k;
      s = (s + b) / 2;
      t = (t + c) / 2
    } else s = (29 * s + I) / 30,
    t = (29 * t + J) / 30,
    k = (9 * k + K) / 10;
    xa();
    aa();
    d.clearRect(0, 0, l, r);
    d.fillStyle = ea ? '#111111' : '#F2FBFF';
    d.fillRect(0, 0, l, r);
    d.save();
    d.strokeStyle = ea ? '#AAAAAA' : '#000000';
    d.globalAlpha = 0.2;
    d.scale(k, k);
    b = l / k;
    c = r / k;
    for (e = - 0.5 + ( - s + b / 2) % 50; e < b; e += 50) d.beginPath(),
    d.moveTo(e, 0),
    d.lineTo(e, c),
    d.stroke();
    for (e = - 0.5 + ( - t + c / 2) % 50; e < c; e += 50) d.beginPath(),
    d.moveTo(0, e),
    d.lineTo(b, e),
    d.stroke();
    d.restore();
    p.sort(function (a, b) {
      return a.size == b.size ? a.id - b.id : a.size - b.size
    });
    d.save();
    d.translate(l /
    2, r / 2);
    d.scale(k, k);
    d.translate( - s, - t);
    for (e = 0; e < C.length; e++) C[e].draw();
    for (e = 0; e < p.length; e++) p[e].draw();
    d.restore();
    y && 0 != w.length && d.drawImage(y, l - y.width - 10, 10);
    M = Math.max(M, Ea());
    sessionScore = Math.max(sessionScore, M);
    0 != M && (null == W && (W = new X(24, '#FFFFFF')), W.setValue('Score: ' + ~~(M / 100) + ' || Best Score: ' + ~~(sessionScore / 100)), c = W.render(), b = c.width, d.globalAlpha = 0.2, d.fillStyle = '#000000', d.fillRect(10, r - 10 - 24 - 10, b + 10, 34), d.globalAlpha = 1, d.drawImage(c, 15, r - 10 - 24 - 5));
    Fa();
    a = + new Date - a;
    a > 1000 / 60 ? u -= 0.01 : a < 1000 / 65 && (u += 0.01);
    0.4 > u && (u = 0.4);
    1 < u && (u = 1)
    
    for (var i = 0; i < dPoints.length; i++) {
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
        } else {
            d.fillStyle = "#000000";
        }
          
        d.fill();
        d.lineWidth = 2;
        d.strokeStyle = '#003300';
        d.stroke();
    }
    d.lineWidth = 1;
    
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
        } else {
            d.strokeStyle = "#000000";
        }
        
        d.moveTo(lines[i][0], lines[i][1]);
        d.lineTo(lines[i][2], lines[i][3]);
        
        d.stroke();
    }
    d.lineWidth = 1;
  }
  function Fa() {
    if (ia && fa.width) {
      var a = l / 5;
      d.drawImage(fa, 5, 5, a, a)
    }
  }
  function Ea() {
    for (var a = 0, b = 0; b < m.length; b++) a += m[b].nSize * m[b].nSize;
    return a
  }
  function qa() {
    if (0 != w.length) if (Y) {
      y = document.createElement('canvas');
      var a = y.getContext('2d'),
      b = 60,
      b = null == x ? b + 24 * w.length : b + 180,
      c = Math.min(200, 0.3 * l) / 200;
      y.width = 200 * c;
      y.height = b * c;
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
      if (null == x) {
        for (a.font = '20px Ubuntu', b = 0; b < w.length; ++b) {
            c = w[b].name || 'An unnamed cell',
              Y || (c = 'An unnamed cell'),
              - 1 != B.indexOf(w[b].id) ? (m[0].name && (c = m[0].name), a.fillStyle = '#FFAAAA')  : a.fillStyle = '#FFFFFF',
              c = b + 1 + '. ' + c,
              a.fillText(c, 100 - a.measureText(c).width / 2, 70 + 24 * b);
        }
      } else for (b = c = 0; b < x.length; ++b) angEnd = c + x[b] * Math.PI * 2,
      a.fillStyle = Ga[b + 1],
      a.beginPath(),
      a.moveTo(100, 140),
      a.arc(100, 140, 80, c, angEnd, !1),
      a.fill(),
      c = angEnd
    } else y = null
  }
  function ra(a, b, c, e, d, f, g) {
    p.push(this);
    v[a] = this;
    this.id = a;
    this.ox = this.x = b;
    this.oy = this.y = c;
    this.oSize = this.size = e;
    this.color = d;
    this.isVirus = f;
    this.points = [
    ];
    this.pointsAcc = [
    ];
    this.createPoints();
    this.setName(g)
  }
  function X(a, b, c, e) {
    a && (this._size = a);
    b && (this._color = b);
    this._stroke = !!c;
    e && (this._strokeColor = e)
  }
  if ('agar.io' != g.location.hostname && 'localhost' != g.location.hostname && '10.10.2.13' != g.location.hostname) g.location = 'http://agar.io/';
   else if (g.top != g) g.top.location = 'http://agar.io/';
   else {
    var $,
    toggle = false,
    toggleDraw = false,
    splitted = false,
    splitting = false,
    virusBait = false,
    tempPoint = [0, 0, 1],
    dPoints = [],
    lines = [],
    originalName,
    sessionScore = 0,
    d,
    z,
    l,
    r,
    F = null,
    h = null,
    s = 0,
    t = 0,
    B = [
    ],
    m = [
    ],
    v = {
    },
    p = [
    ],
    C = [
    ],
    w = [
    ],
    N = 0,
    O = 0,
    P = - 1,
    Q = - 1,
    Da = 0,
    D = 0,
    L = null,
    S = 0,
    T = 0,
    U = 10000,
    V = 10000,
    k = 1,
    G = null,
    ua = !0,
    Y = !0,
    ga = !1,
    da = !1,
    M = 0,
    ea = !1,
    va = !1,
    I = s = ~~((S + U) / 2),
    J = t = ~~((T + V) / 2),
    K = 1,
    H = '',
    x = null,
    Ga = [
      '#333333',
      '#FF3333',
      '#33FF33',
      '#3333FF'
    ],
    ia = 'ontouchstart' in g && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    fa = new Image;
    fa.src = 'img/split.png';
    var R = null;
    g.setNick = function (a) {
      originalName = a;
      ma();
      L = a;
      pa();
      M = 0
    };
    g.setRegion = la;
    g.setSkins = function (a) {
      ua = a
    };
    g.setNames = function (a) {
      Y = a
    };
    g.setDarkTheme = function (a) {
      ea = a
    };
    g.setColors =
    function (a) {
      ga = a
    };
    g.setShowMass = function (a) {
      va = a
    };
    g.spectate = function () {
      A(1);
      ma()
    };
    g.setGameMode = function (a) {
      a != H && (H = a, ca())
    };
    g.connect = oa;
    var sa = - 1,
    ta = - 1,
    y = null,
    u = 1,
    W = null,
    Z = {
    },
    Ha = 'notreallyabot;poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;hitler;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;ussr;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;nazi;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin;belgium;luxembourg;stussy;prussia;8ch;argentina;scotland;sir;romania;belarus;wojak;isis;doge;nasa;byzantium;imperial japan;french kingdom;somalia;turkey;mars;pokerface'.split(';'),
    Ia = [
      'm\'blob'
    ];
    ra.prototype = {
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
      destroy: function () {
        var a;
        for (a = 0; a < p.length; a++) if (p[a] == this) {
          p.splice(a, 1);
          break
        }
        delete v[this.id];
        a = m.indexOf(this);
        - 1 != a && (da = !0, m.splice(a, 1));
        a = B.indexOf(this.id);
        - 1 != a && B.splice(a, 1);
        this.destroyed = !0;
        C.push(this)
      },
      getNameSize: function () {
        return Math.max(~~(0.3 * this.size), 24)
      },
      setName: function (a) {
        if (this.name = a) null == this.nameCache ? this.nameCache = new X(this.getNameSize(), '#FFFFFF', !0, '#000000')  : this.nameCache.setSize(this.getNameSize()),
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
        return ~~Math.max(this.size * k * (this.isVirus ? Math.min(2 * u, 1)  : u), a)
      },
      movePoints: function () {
        this.createPoints();
        for (var a = this.points, b = this.pointsAcc, c = b.concat(), e = a.concat(), d = e.length, f = 0; f < d; ++f) {
          var g = c[(f - 1 + d) % d],
          h = c[(f + 1) % d];
          b[f] += Math.random() - 0.5;
          b[f] *= 0.7;
          10 < b[f] && (b[f] = 10);
          - 10 > b[f] && (b[f] = - 10);
          b[f] = (g + h + 8 * b[f]) / 10
        }
        for (var l = this, f = 0; f < d; ++f) {
          c = e[f].v;
          g = e[(f - 1 + d) % d].v;
          h = e[(f + 1) % d].v;
          if (15 < this.size && null != F) {
            var k = !1,
            n = a[f].x,
            m = a[f].y;
            F.retrieve2(n - 5, m - 5, 10, 10, function (a) {
              a.c != l && 25 > (n - a.x) * (n - a.x) + (m - a.y) * (m - a.y) && (k = !0)
            });
            !k && (a[f].x < S || a[f].y < T || a[f].x > U || a[f].y > V) && (k = !0);
            k && (0 < b[f] && (b[f] = 0), b[f] -= 1)
          }
          c += b[f];
          0 > c && (c = 0);
          c = (12 * c + this.size) / 13;
          a[f].v = (g + h + 8 * c) / 10;
          g = 2 * Math.PI / d;
          h = this.points[f].v;
          this.isVirus && 0 == f % 2 && (h += 5);
          a[f].x = this.x + Math.cos(g * f) * h;
          a[f].y = this.y + Math.sin(g * f) *
          h
        }
      },
      updatePos: function () {
        var a;
        a = (D - this.updateTime) / 120;
        a = 0 > a ? 0 : 1 < a ? 1 : a;
        a = a * a * (3 - 2 * a);
        this.getNameSize();
        if (this.destroyed && 1 <= a) {
          var b = C.indexOf(this);
          - 1 != b && C.splice(b, 1)
        }
        this.x = a * (this.nx - this.ox) + this.ox;
        this.y = a * (this.ny - this.oy) + this.oy;
        this.size = a * (this.nSize - this.oSize) + this.oSize;
        return a
      },
      shouldRender: function () {
        return this.x + this.size + 40 < s - l / 2 / k || this.y + this.size + 40 < t - r / 2 / k || this.x - this.size - 40 > s + l / 2 / k || this.y - this.size - 40 > t + r / 2 / k ? !1 : !0
      },
      draw: function () {
        if (this.shouldRender()) {
          var a = !this.isVirus &&
          0.5 > k;
          d.save();
          this.drawTime = D;
          var b = this.updatePos();
          this.destroyed && (d.globalAlpha *= 1 - b);
          d.lineWidth = 10;
          d.lineCap = 'round';
          d.lineJoin = this.isVirus ? 'mitter' : 'round';
          ga ? (d.fillStyle = '#FFFFFF', d.strokeStyle = '#AAAAAA')  : (d.fillStyle = this.color, d.strokeStyle = this.color);
          if (a) d.beginPath(),
          d.arc(this.x, this.y, this.size, 0, 2 * Math.PI, !1);
           else {
            this.movePoints();
            d.beginPath();
            b = this.getNumPoints();
            d.moveTo(this.points[0].x, this.points[0].y);
            for (var c = 1; c <= b; ++c) {
              var e = c % b;
              d.lineTo(this.points[e].x, this.points[e].y)
            }
          }
          d.closePath();
          b = this.name.toLowerCase();
          ua && '' == H ? - 1 != Ha.indexOf(b) ? (Z.hasOwnProperty(b) || (Z[b] = new Image, b == "notreallyabot" ? Z[b].src = "http://i.imgur.com/ZW5T4cd.png" : Z[b].src = 'skins/' + b + '.png'), c = Z[b])  : c = null : c = null;
          b = c ? - 1 != Ia.indexOf(b)  : !1;
          a || d.stroke();
          d.fill();
          null != c && 0 < c.width && !b && (d.save(), d.clip(), d.drawImage(c, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size), d.restore());
          (ga || 15 < this.size) && !a && (d.strokeStyle = '#000000', d.globalAlpha *= 0.1, d.stroke());
          d.globalAlpha = 1;
          null != c && 0 < c.width && b && d.drawImage(c, this.x - 2 * this.size, this.y - 2 * this.size, 4 * this.size, 4 * this.size);
          c = - 1 != m.indexOf(this);
          a = ~~this.y;
          if ((Y || c) && this.name && this.nameCache) {
            e = this.nameCache;
            e.setValue(this.name);
            e.setSize(this.getNameSize());
            b = Math.ceil(10 * k) / 10;
            e.setScale(b);
            var e = e.render(),
            g = ~~(e.width / b),
            f = ~~(e.height / b);
            d.drawImage(e, ~~this.x - ~~(g / 2), a - ~~(f / 2), g, f);
            a += e.height / 2 / b + 4
          }
          va && c && (null == this.sizeCache && (this.sizeCache = new X(this.getNameSize() / 2, '#FFFFFF', !0, '#000000')), c = this.sizeCache, c.setSize(this.getNameSize() / 2), c.setValue(~~(this.size * this.size / 100)), b = Math.ceil(10 *
          k) / 10, c.setScale(b), e = c.render(), g = ~~(e.width / b), f = ~~(e.height / b), d.drawImage(e, ~~this.x - ~~(g / 2), a - ~~(f / 2), g, f));
          d.restore()
        }
      }
    };
    X.prototype = {
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
        this._stroke != a && (this._stroke =
        a, this._dirty = !0)
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
          e = this._scale,
          d = this._size,
          f = d + 'px Ubuntu';
          b.font = f;
          var g = b.measureText(c).width,
          h = ~~(0.2 * d);
          a.width = (g + 6) * e;
          a.height = (d + h) * e;
          b.font = f;
          b.scale(e, e);
          b.globalAlpha = 1;
          b.lineWidth = 3;
          b.strokeStyle = this._strokeColor;
          b.fillStyle = this._color;
          this._stroke && b.strokeText(c, 3, d - h / 2);
          b.fillText(c, 3, d - h / 2)
        }
        return this._canvas
      }
    };
    g.onload = wa
  }
}) (window, jQuery);
