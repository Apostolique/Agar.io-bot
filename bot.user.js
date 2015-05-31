// ==UserScript==
// @name        BestAgarBot
// @namespace   AposBest
// @description Plays Agar
// @include     http://agar.io/
// @version     1
// @grant       none
// @author      twitch.tv/apostolique
// ==/UserScript==

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

Array.prototype.peek = function() {
    return this[this.length-1];
}

console.log("Running Bot!");
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
      if (68 == e.keyCode) {
        g.setDarkTheme(!ea);
      }
      if (70 == e.keyCode) {
        g.setShowMass(!va);
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
    q('#playBtn')[0].disabled = false;
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
    serverIP = a;
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


      //Goal: Update elements that are already in interNodes if they are also in v. If they aren't in v, delete them after they get timed out.

      interNodes[e] = v[e]; //You can compute direction here if you ever need it.
    }


    Object.keys(interNodes).forEach(function (element, index) {
        //console.log("start: " + interNodes[element].updateTime + " current: " + D + " life: " + (D - interNodes[element].updateTime));
        var isRemoved = !v.hasOwnProperty(element);

        if (isRemoved  && (D - interNodes[element].updateTime) > 3000) {

            delete interNodes[element];
        } else if (isRemoved && computeDistance(I, J, interNodes[element].x, interNodes[element].y) < screenDistance()) {
            //console.log("Too close! Remove " + computeDistance(I, J, interNodes[element].x, interNodes[element].y) + " || " + screenDistance());

            delete interNodes[element];
        }
    });

    a.getUint16(c, !0);
    c += 2;
    f = a.getUint32(c, !0);
    c += 4;
    for (d = 0; d < f; d++) e = a.getUint32(c, !0),
    c += 4,
    v[e] && (v[e].updateCode = b);
    for (d = 0; d < p.length; d++) p[d].updateCode != b && p[d--].destroy();
    da && 0 == m.length /*&& q('#overlays').fadeIn(3000)*/ && (setNick(originalName))
  }

    function screenDistance() {
        return Math.min(computeDistance
          (I, J, screenToGameX(l), J), computeDistance
          (I, J, I, screenToGameY(r)));
    }

    //Given an angle value that was gotten from valueAndleBased(),
    //returns a new value that scales it appropriately.
    function paraAngleValue(angleValue, range) {
        return (15 / (range[1])) * (angleValue * angleValue) - (range[1] / 6);
    }

    function valueAngleBased(angle, range) {
        var leftValue = (angle - range[0]).mod(360);
        var rightValue = (rangeToAngle(range) - angle).mod(360);

        var bestValue = Math.min(leftValue, rightValue);

        if (bestValue <= range[1]) {
            return paraAngleValue(bestValue, range);
        }
        var banana = -1;
        return banana;

    }

    function computeDistance(x1, y1, x2, y2) {
        var xdis = x1 - x2; // <--- FAKE AmS OF COURSE!
        var ydis = y1 - y2;
        var distance = Math.sqrt(xdis * xdis + ydis * ydis);

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

    function getListBasedOnFunction(booleanFunction, listToUse) {
        var dotList = [];
        Object.keys(listToUse).forEach(function (element, index) {
            if (booleanFunction(element)){
                dotList.push(interNodes[element]);
            }
        });

        return dotList;
    }

    //TODO: Make it only go to a virus if it's big enough. If it shrinks, it shouldn't only grab a single dot and go back in.
    function getAllNiceViruses() {
        var dotList = [];

        if (m.length == 1) {
            dotList = getListBasedOnFunction(function (element){
                if (interNodes[element].isVirus && (interNodes[element].size *1.10 <= m[0].size) && interNodes[element].size * 1.15 >= m[0].size) {
                        return true;
                }
                return false;
            }, interNodes);
        }


        return dotList;
    }

    function getAllThreats() {
        var dotList = [];

        dotList = getListBasedOnFunction(function (element){
            var isMe = false;

            for (var i = 0; i < m.length; i++) {
                if (interNodes[element].id == m[i].id) {
                    isMe = true;
                    break;
                }
            }

            for (var i = 0; i < m.length; i++) {
                if (!isMe && (!interNodes[element].isVirus && (interNodes[element].size >= m[i].oSize * 1.15))) {
                    return true;
                } else if (interNodes[element].isVirus && (interNodes[element].size * 1.15 <= m[i].oSize)) {
                    return true;
                }
                return false;
            }
        }, interNodes);

        return dotList;
    }

    function getAllFood() {
        var elementList = [];
        var dotList = [];

        elementList = getListBasedOnFunction(function (element){
            var isMe = false;

            for (var i = 0; i < m.length; i++) {
                if (interNodes[element].id == m[i].id) {
                    isMe = true;
                    break;
                }
            }

            for (var i = 0; i < m.length; i++) {
                if (!isMe && !interNodes[element].isVirus && (interNodes[element].size * 1.25 <= m[i].size)  || (interNodes[element].size <= 11)){return true;} else{return false;}
            }
        }, interNodes);

        for (var i = 0; i < elementList.length; i++) {
            dotList.push([elementList[i].x, elementList[i].y, elementList[i].size]);
        }

        return dotList;
    }

    function clusterFood(foodList, blobSize) {
        var clusters = [];
        var addedCluster = false;

        //1: x
        //2: y
        //3: size or value
        //4: Angle, not set here.

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
                clusters.push([foodList[i][0], foodList[i][1], foodList[i][2], 0]);
            }
            addedCluster = false;
        }
        return clusters;
    }

    function getAngle(x1, y1, x2, y2) {
        //Handle vertical and horizontal lines.

        if (x1 == x2) {
            if (y1 < y2) {
                return 271;
                //return 89;
            } else {
                return 89;
            }
        }

        return (Math.round(Math.atan2(-(y1 - y2), -(x1 - x2))/Math.PI*180 + 180));
    }

    function slope(x1, y1, x2, y2) {
        var m = (y1 - y2) / (x1 - x2);

        return m;
    }

    function slopeFromAngle(degree) {
        if (degree == 270) {
            degree = 271;
        } else if (degree == 90) {
            degree = 91;
        }
        return Math.tan((degree - 180) / 180 * Math.PI);
    }

    //Given two points on a line, finds the slope of a perpendicular line crossing it.
    function inverseSlope(x1, y1, x2, y2) {
        var m = slope(x1, y1, x2, y2);
        return (-1) / m;
    }

    //Given a slope and an offset, returns two points on that line.
    function pointsOnLine(slope, useX, useY, distance) {
        var b = useY - slope * useX;
        var r = Math.sqrt(1 + slope * slope);

        var newX1 = (useX + (distance / r));
        var newY1 = (useY + ((distance * slope) / r));
        var newX2 = (useX + ((-distance) / r));
        var newY2 = (useY + (((-distance) * slope) / r));

        return [[newX1, newY1], [newX2, newY2]];
    }

    function followAngle(angle, useX, useY, distance) {
        var slope = slopeFromAngle(angle);
        var coords = pointsOnLine(slope, useX, useY, distance);

        var side = (angle - 90).mod(360);
        if (side < 180) {
            return coords[1];
        } else {
            return coords[0];
        }
    }

    //Using a line formed from point a to b, tells if point c is on S side of that line.
    function isSideLine(a, b, c) {
        if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0) {
            return true;
        }
        return false;
    }

    //angle range2 is within angle range2
    //an Angle is a point and a distance between an other point [5, 40]
    function angleRangeIsWithin(range1, range2) {
        if (range2[0] == (range2[0] + range2[1]).mod(360)) {
            return true;
        }
        //console.log("r1: " + range1[0] + ", " + range1[1] + " ... r2: " + range2[0] + ", " + range2[1]);
        if (angleIsWithin(range1[0], range2) && angleIsWithin((range1[0] + range1[1]).mod(360), range2)) {
            return true;
        }
        return false;
    }

    function angleIsWithin(angle, range) {
        var diff = (angle - range[0]).mod(360);
        if (diff > 0 && diff < range[1]) {
            return true;
        }
        return false;
    }

    function rangeToAngle(range) {
        return (range[0] + range[1]).mod(360);
    }

    function anglePair(range) {
        return (range[0] + ", " + rangeToAngle(range));
    }

    function getEdgeLinesFromPoint(blob1, blob2) {
        // find tangents
        // 
        // TODO: DON'T FORGET TO HANDLE IF BLOB1'S CENTER POINT IS INSIDE BLOB2!!!
        var px = blob1.x;
        var py = blob1.y;

        var cx = blob2.x;
        var cy = blob2.y;

        var radius = blob2.size;

        if (computeDistance(px, py, cx, cy) <= radius) {
            var tempAngle = getAngle(cx, cy, px, py);
            var tempCoord = followAngle(tempAngle, cx, cy, blob1.size);
            px = tempCoord[0];
            py = tempCoord[1];

            drawPoint(px, py, 2, "");
        }

        var dx = cx - px;
        var dy = cy - py;
        var dd = Math.sqrt(dx * dx + dy * dy);
        var a = Math.asin(radius / dd);
        var b = Math.atan2(dy, dx);
        
        var t = b - a
        var ta = { x:radius * Math.sin(t), y:radius * -Math.cos(t) };
        
        t = b + a
        var tb = { x:radius * -Math.sin(t), y:radius * Math.cos(t) };

        var angleLeft = getAngle(cx + ta.x, cy + ta.y, px, py);
        var angleRight = getAngle(cx + tb.x, cy + tb.y, px, py);
        var angleDistance = (angleRight - angleLeft).mod(360);

        return [angleLeft, angleDistance, [cx + tb.x, cy + tb.y], [cx + ta.x, cy + ta.y]];
    }

    function findDestination() {
        dPoints = [];
        dArc = [];
        dText = [];
        lines = [];

        if (/*!toggle*/ 1) {
          var useMouseX = (N - l/2 + s*k) / k;
          var useMouseY = (O - r/2 + t*k) / k;
          tempPoint = [useMouseX, useMouseY, 1];

          var tempMoveX = P;
          var tempMoveY = Q;

          if (m[0] != null) {
              //drawPoint(m[0].x, m[0].y - m[0].size, 3, "" + Math.floor(m[0].x) + ", " + Math.floor(m[0].y));

              var allPossibleFood = null;
              allPossibleFood = getAllFood(); // #1

              var allPossibleThreats = getAllThreats();

              var badAngles = [];

              var isSafeSpot = true;
              var isMouseSafe = true;

              var clusterAllFood = clusterFood(allPossibleFood, m[0].oSize);

              for (var i = 0; i < allPossibleThreats.length; i++) {
                  var offsetX = m[0].x;
                  var offsetY = m[0].y;

                  var enemyAngleStuff = getEdgeLinesFromPoint(m[0], allPossibleThreats[i]);

                  var leftAngle = enemyAngleStuff[0];
                  var rightAngle = rangeToAngle(enemyAngleStuff);
                  var difference = enemyAngleStuff[1];

                  drawPoint(enemyAngleStuff[2][0], enemyAngleStuff[2][1], 3, "");
                  drawPoint(enemyAngleStuff[3][0], enemyAngleStuff[3][1], 3, "");

                  badAngles.push([leftAngle, difference]);

                  //console.log("Adding badAngles: " + leftAngle + ", " + rightAngle + " diff: " + difference);

                  var lineLeft = followAngle(leftAngle, m[0].x, m[0].y, 400);
                  var lineRight = followAngle(rightAngle, m[0].x, m[0].y, 400);
                  if (v.hasOwnProperty(allPossibleThreats[i].id)) {
                      drawLine(m[0].x, m[0].y, lineLeft[0], lineLeft[1], 0);
                      drawLine(m[0].x, m[0].y, lineRight[0], lineRight[1], 0);
                  } else {
                      drawLine(m[0].x, m[0].y, lineLeft[0], lineLeft[1], 3);
                      drawLine(m[0].x, m[0].y, lineRight[0], lineRight[1], 3);
                  }
                  //drawPoint(lineLeft[0], lineLeft[1], 0, "Left 0 - " + i);
                  //drawPoint(lineRight[0], lineRight[1], 0, "Right 1 - " + i);
              }

              var goodAngles = [];
              //TODO: Add wall angles here. Hardcoding temporary values.
              if (m[0].x < 1000 && badAngles.length > 0) {
                  //LEFT
                  var wallI = 1;
                  if (!interNodes.hasOwnProperty(wallI)) {
                      var newX = -100 - screenDistance();

                      var n = new ra(wallI, newX, m[0].y, m[0].size * 10, "#000", false, "Left Wall");
                      delete v[wallI];
                      p.splice(p.length - 1, 1);

                      interNodes[wallI] = n;
                      interNodes[wallI].nx = newX;
                      interNodes[wallI].ny = m[0].ny;
                      interNodes[wallI].nSize = m[0].oSize * 10;
                      interNodes[wallI].updateTime = D;
                      //console.log("Added corner enemy");
                  } else {
                      //console.log("Update Wall!");
                      interNodes[wallI].updateTime = D;
                      interNodes[wallI].y = m[0].y; 
                      interNodes[wallI].ny = m[0].ny;
                  }
              }
              if (m[0].y < 1000 && badAngles.length > 0) {
                  //TOP
                  var wallI = 2;
                  if (!interNodes.hasOwnProperty(wallI)) {
                      var newY = -100 - screenDistance();
                      var n = new ra(wallI, m[0].x, newY, m[0].size * 10, "#000", false, "Top Wall");
                      delete v[wallI];
                      p.pop();

                      interNodes[wallI] = n;
                      interNodes[wallI].nx = m[0].nx;
                      interNodes[wallI].ny = newY;
                      interNodes[wallI].nSize = m[0].oSize * 10;
                      interNodes[wallI].updateTime = D;
                      //console.log("Added corner enemy");
                  } else {
                      //console.log("Update Wall!");
                      interNodes[wallI].updateTime = D;
                      interNodes[wallI].x = m[0].x; 
                      interNodes[wallI].nx = m[0].nx;
                  }
              }
              if (m[0].x > 11180 - 1000 && badAngles.length > 0) {
                  //RIGHT
                  var wallI = 3;
                  if (!interNodes.hasOwnProperty(wallI)) {
                      var newX = 11180 + 100 + screenDistance();
                      var n = new ra(wallI, newX, m[0].y, m[0].size * 10, "#000", false, "Right Wall");
                      delete v[wallI];
                      p.pop();

                      interNodes[wallI] = n;
                      interNodes[wallI].nx = newX;
                      interNodes[wallI].ny = m[0].ny;
                      interNodes[wallI].nSize = m[0].oSize * 10;
                      interNodes[wallI].updateTime = D;
                      //console.log("Added corner enemy");
                  } else {
                      //console.log("Update Wall!");
                      interNodes[wallI].updateTime = D;
                      interNodes[wallI].y = m[0].y; 
                      interNodes[wallI].ny = m[0].ny;
                  }
              }
              if (m[0].y > 11180 - 1000 && badAngles.length > 0) {
                  //BOTTOM
                  var wallI = 4;
                  if (!interNodes.hasOwnProperty(wallI)) {
                      var newY = 11180 + 100 + screenDistance();
                      var n = new ra(wallI, m[0].x, newY, m[0].size * 10, "#000", false, "Bottom Wall");
                      delete v[wallI];
                      p.pop();

                      interNodes[wallI] = n;
                      interNodes[wallI].nx = m[0].nx;
                      interNodes[wallI].ny = newY;
                      interNodes[wallI].nSize = m[0].oSize * 10;
                      interNodes[wallI].updateTime = D;
                      //console.log("Added corner enemy");
                  } else {
                      //console.log("Update Wall!");
                      interNodes[wallI].updateTime = D;
                      interNodes[wallI].x = m[0].x; 
                      interNodes[wallI].nx = m[0].nx;
                  }
              }

              //console.log("1) Good Angles: " + goodAngles.length + " Bad Angles: " + badAngles.length);
              //TODO: Step 1: Write code to substract angle ranges.
              for (var i = 0; i < badAngles.length; i++) {
                  var tempGoodAnglesLength = goodAngles.length;

                  if (tempGoodAnglesLength == 0) {
                      //console.log("First of " + badAngles.length);
                      angle1 = (badAngles[i][0] + badAngles[i][1]).mod(360);
                      angle2 = (badAngles[i][0] - angle1).mod(360);
                      goodAngles.push([angle1, angle2]);
                      //console.log("Setup " + (badAngles[i][0] - goodAngles[j][0]).mod(360) + " or " + (360 - badAngles[i][1]));
                      continue;
                  }
                  var removeIndex = [];
                  for (var j = 0; j < tempGoodAnglesLength; j++) {
                      if (angleRangeIsWithin(goodAngles[j], badAngles[i])) {
                          removeIndex.push(j);
                      } else if (angleRangeIsWithin(badAngles[i], goodAngles[j])) {
                          var diff1 = (badAngles[i][0] - goodAngles[j][0]).mod(360);
                          var newZero = (badAngles[i][0] + badAngles[i][1]).mod(360);
                          var diff2 = (newZero - goodAngles[j][0]).mod(360);
                          goodAngles.push([newZero, goodAngles[j][1] - diff2]);
                          goodAngles[j][1] = diff1;
                          //console.log("\t\t\t\t\tSplit good Angle");

                          break;
                      } else if (angleIsWithin(badAngles[i][0], goodAngles[j])) {
                          var diff = (badAngles[i][0] - goodAngles[j][0]).mod(360);
                          goodAngles[j][1] = diff;
                          //console.log("Modify good Angle 0");
                      } else if (angleIsWithin((badAngles[i][0] + badAngles[i][1]).mod(360), goodAngles[j])) {
                          var oldY = (goodAngles[j][0] + goodAngles[j][1]).mod(360);
                          goodAngles[j][0] = (badAngles[i][0] + badAngles[i][1]).mod(360);
                          var diff = (oldY - goodAngles[j][0]).mod(360);
                          goodAngles[j][1] = diff;
                          //console.log("Modify good Angle 1");
                      }
                  }
                  if (removeIndex.length > 0) {
                      //console.log("I KNEW IT!!! THIS NEEDED TO BE HANDLED");
                      for (var j = 0; j < removeIndex.length; j++) {
                          goodAngles.splice(removeIndex[j], 1);
                      }
                  }
              }
              //console.log("2) Good Angles: " + goodAngles.length);

              for (var i = 0; i < goodAngles.length; i++) {
                  if (goodAngles[i][0] != goodAngles[i][1].mod(360)) {
                      var line1 = followAngle(goodAngles[i][0], m[0].x, m[0].y, 200);
                      var line2 = followAngle((goodAngles[i][0] + goodAngles[i][1]).mod(360), m[0].x, m[0].y, 200);
                      drawLine(m[0].x, m[0].y, line1[0], line1[1], 2);
                      drawLine(m[0].x, m[0].y, line2[0], line2[1], 2);
                      
                      drawArc(line1[0], line1[1], line2[0], line2[1], m[0].x, m[0].y, 200, 1);

                      drawPoint(line1[0], line1[1], 0, "" + i + ": 0");
                      drawPoint(line2[0], line2[1], 0, "" + i + ": 1");
                  }
              }

              if (goodAngles.length > 0) {
                  var bIndex = goodAngles[0];
                  var biggest = goodAngles[0][1];
                  for (var i = 1; i < goodAngles.length; i++) {
                      var size = goodAngles[i][1];
                      if (size > biggest) {
                          biggest = size;
                          bIndex = goodAngles[i];
                      }
                  }
                  var perfectAngle = (bIndex[0] + bIndex[1] / 2).mod(360);
                  //console.log("perfectAngle " + perfectAngle);
                  var line1 = followAngle(perfectAngle, m[0].x, m[0].y, 300);

                  var stuffToEat = false;

                  for (var i = 0; i < clusterAllFood.length; i++) {
                      //console.log("mefore: " + clusterAllFood[i][2]);
                      //This is the cost function. Higher is better.
                      
                      var clusterAngle = getAngle(clusterAllFood[i][0], clusterAllFood[i][1], m[0].x, m[0].y);

                      var angleValue = valueAngleBased(clusterAngle, bIndex);

                      if (angleValue > 0) {
                          clusterAllFood[i][2] = clusterAllFood[i][2] * 6 + angleValue  - computeDistance(clusterAllFood[i][0], clusterAllFood[i][1], m[0].x, m[0].y);
                          stuffToEat = true;
                          clusterAllFood[i][3] = true;
                      } else {
                          clusterAllFood[i][2] = -1;
                          clusterAllFood[i][3] = false;
                      }


                      if (!toggle && angleValue > 0) {

                          drawPoint(clusterAllFood[i][0], clusterAllFood[i][1], 1, "");
                          //drawPoint(clusterAllFood[i][0], clusterAllFood[i][1], 1, "" + clusterAllFood[i][2]);
                      } else if (!toggle) {
                          drawPoint(clusterAllFood[i][0], clusterAllFood[i][1], 0, "");
                      }
                      //console.log("After: " + clusterAllFood[i][2]);
                  }

                  var bestFoodI = null;
                  if (stuffToEat) {
                      bestFoodI = clusterAllFood[0];
                      var bestFood = clusterAllFood[0][2];
                      for (var i = 1; i < clusterAllFood.length; i++) {
                          if (bestFood < clusterAllFood[i][2] && clusterAllFood[i][3]) {
                              bestFood = clusterAllFood[i][2];
                              bestFoodI = clusterAllFood[i];
                          }
                      }
                  }

                  //console.log("Best Value: " + clusterAllFood[bestFoodI][2]);
                  if (stuffToEat && bestFoodI[3]) {
                      tempMoveX = bestFoodI[0];
                      tempMoveY = bestFoodI[1];
                      drawLine(m[0].x, m[0].y, bestFoodI[0], bestFoodI[1], 1);
                  } else {
                      drawLine(m[0].x, m[0].y, line1[0], line1[1], 7);
                      tempMoveX = line1[0];
                      tempMoveY = line1[1];
                  }
                  
                  //drawLine(m[0].x, m[0].y, tempMoveX, tempMoveY, 1);
              } else {
                 for (var i = 0; i < clusterAllFood.length; i++) {
                      //console.log("mefore: " + clusterAllFood[i][2]);
                      //This is the cost function. Higher is better.
                      
                      var clusterAngle = getAngle(clusterAllFood[i][0], clusterAllFood[i][1], m[0].x, m[0].y);

                      clusterAllFood[i][2] = clusterAllFood[i][2] * 6 - computeDistance(clusterAllFood[i][0], clusterAllFood[i][1], m[0].x, m[0].y);
                      //console.log("Current Value: " + clusterAllFood[i][2]);

                      //(goodAngles[bIndex][1] / 2 - (Math.abs(perfectAngle - clusterAngle)));

                      clusterAllFood[i][3] = clusterAngle;

                      if (!toggle) {

                          drawPoint(clusterAllFood[i][0], clusterAllFood[i][1], 1, "");
                      }
                      //console.log("After: " + clusterAllFood[i][2]);
                  }

                  var bestFoodI = 0;
                  var bestFood = clusterAllFood[0][2];
                  for (var i = 1; i < clusterAllFood.length; i++) {
                      if (bestFood < clusterAllFood[i][2]) {
                          bestFood = clusterAllFood[i][2];
                          bestFoodI = i;
                      }
                  }

                  //console.log("Best Value: " + clusterAllFood[bestFoodI][2]);

                  tempMoveX = clusterAllFood[bestFoodI][0];
                  tempMoveY = clusterAllFood[bestFoodI][1];
                  drawLine(m[0].x, m[0].y, tempMoveX, tempMoveY, 1);
              }

              drawPoint(tempPoint[0], tempPoint[1], tempPoint[2], "");
              //drawPoint(tempPoint[0], tempPoint[1], tempPoint[2], "" + Math.floor(computeDistance(tempPoint[0], tempPoint[1], I, J)));
              //drawLine(tempPoint[0], tempPoint[1], m[0].x, m[0].y, 6);
              //console.log("Slope: " + slope(tempPoint[0], tempPoint[1], m[0].x, m[0].y) + " Angle: " + getAngle(tempPoint[0], tempPoint[1], m[0].x, m[0].y) + " Side: " + (getAngle(tempPoint[0], tempPoint[1], m[0].x, m[0].y) - 90).mod(360));
              tempPoint[2] = 1;
          }
          if (!toggle) {
              P = tempMoveX;
              Q = tempMoveY;
          }
        }
    }

    function screenToGameX(x) {
        return (x - l / 2) / k + s;
    }

    function screenToGameY(y) {
        return (y - r / 2) / k + t;
    }

    function gameToScreenX (x) {
        return ((x - I) * k) + l/2;
    }
    function gameToScreenY (y) {
        return ((y - J) * k) + r/2;
    }

    function drawPoint(x_1, y_1, drawColor, text) {
        if (!toggleDraw) {
            var x1 = gameToScreenX(x_1);
            var y1 = gameToScreenY(y_1);
            dPoints.push([x1, y1, drawColor]);
            dText.push(text);
        }
    }

    function drawArc(x_1, y_1, x_2, y_2, x_3, y_3, radius, drawColor) {
        if (!toggleDraw) {
            var x1 = gameToScreenX(x_1);
            var y1 = gameToScreenY(y_1);
            var x2 = gameToScreenX(x_2);
            var y2 = gameToScreenY(y_2);
            var x3 = gameToScreenX(x_3);
            var y3 = gameToScreenY(y_3);
            dArc.push([x1, y1, x2, y2, x3, y3, radius, drawColor]);
        }
    }

    function drawLine(x_1, y_1, x_2, y_2, drawColor) {
        if (!toggleDraw) {
            var x1 = gameToScreenX(x_1);
            var y1 = gameToScreenY(y_1);
            var x2 = gameToScreenX(x_2);
            var y2 = gameToScreenY(y_2);
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
      k = (9 * k + a) / 10;
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
    0 != M && (null == W && (W = new X(24, '#FFFFFF')), W.setValue('Score: ' + ~~(M / 100) + ' || Best Score: ' + ~~(sessionScore / 100) + " || Best time alive: " + bestTime + " seconds"), c = W.render(), b = c.width, d.globalAlpha = 0.2, d.fillStyle = '#000000', d.fillRect(10, r - 10 - 24 - 10, b + 10, 34), d.globalAlpha = 1, d.drawImage(c, 15, r - 10 - 24 - 5));
    Fa();
    a = + new Date - a;
    a > 1000 / 60 ? u -= 0.01 : a < 1000 / 65 && (u += 0.01);
    0.4 > u && (u = 0.4);
    1 < u && (u = 1)


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
    d.lineWidth = 1;

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
    d.lineWidth = 1;

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
          } else {
              d.fillStyle = "#000000";
          }

          d.fill();
          d.lineWidth = 2;
          d.strokeStyle = '#003300';
          d.stroke();
        } else {
            var text = new X(18, (ea ? '#F2FBFF' : '#111111'));

            text.setValue(dText[i]);
            var textRender = text.render();
            d.drawImage(textRender, dPoints[i][0], dPoints[i][1]);
        }

    }
    d.lineWidth = 1;

    var currentDate = new Date();

    var nbSeconds = 0;
    if (m.length > 0) {
        nbSeconds = (currentDate.getSeconds() + (currentDate.getMinutes() * 60) + (currentDate.getHours() * 60 * 60)) - (lifeTimer.getSeconds() + (lifeTimer.getMinutes() * 60) + (lifeTimer.getHours() * 60 * 60));
    }

    bestTime = Math.max(nbSeconds, bestTime);

    var debugStrings = [];
    debugStrings.push("T - Bot: " + (!toggle ? "On" : "Off"));
    debugStrings.push("R - Lines: " + (!toggleDraw ? "On" : "Off"));
    debugStrings.push("Server: " + serverIP);
    debugStrings.push("Survived for: " + nbSeconds + " seconds");

    if (m.length > 0) {
        debugStrings.push("Location: " + Math.floor(m[0].x) + ", " + Math.floor(m[0].y));
    }

    var offsetValue = 20;
    var text = new X(18, (ea ? '#F2FBFF' : '#111111'));

    for (var i = 0; i < debugStrings.length; i++) {
      text.setValue(debugStrings[i]);
      var textRender = text.render();
      d.drawImage(textRender, 20, offsetValue);
      offsetValue += textRender.height;
    }

    //d.fillStyle = ea ? '#FFFFFF' : '#000000';
    //d.fillText("1 - Bot Activated: " + (!toggle ? "On" : "Off"), 20, 20);
    //d.fillText("2 - Lines Activated: " + (!toggleDraw ? "On" : "Off"), 20, 30);

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
    y = null;
    if (null != x || 0 != w.length) if (null != x || Y) {
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
    }
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
    dArc = [],
    dText = [],
    lines = [],
    originalName,
    sessionScore = 0,
    serverIP = "",
    interNodes = [],
    lifeTimer = new Date(),
    bestTime = 0,
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
      lifeTimer = new Date();
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
    g.bestScore = function (a) {
        console.log("Score: " + sessionScore);
        sessionScore = a * 100;
        console.log("Score: " + sessionScore);
    };
    g.bestTime = function (a) {
        bestTime = a;
    }
    g.best = function (a, b) {
        g.bestScore(a);
        g.bestTime(b);
    }
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
