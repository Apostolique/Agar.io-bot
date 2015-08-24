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
// @name        AposBot
// @namespace   AposBot
// @include     http://agar.io/*
// @version     3.5681
// @grant       none
// @author      http://www.twitch.tv/apostolique
// ==/UserScript==

var aposBotVersion = 3.5681;

//TODO: Team mode
//      Detect when people are merging
//      Split to catch smaller targets
//      Angle based cluster code
//      Better wall code
//      In team mode, make allies be obstacles.

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
            console.dir(data["data"]);
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

            $.get('https://raw.githubusercontent.com/Apostolique/Agar.io-bot/master/bot.user.js?' + Math.floor((Math.random() * 1000000) + 1), function(data) {
                var latestVersion = data.replace(/(\r\n|\n|\r)/gm,"");
                latestVersion = latestVersion.substring(latestVersion.indexOf("// @version")+11,latestVersion.indexOf("// @grant"));

                latestVersion = parseFloat(latestVersion + 0.0000);
                var myVersion = parseFloat(aposBotVersion + 0.0000); 
                
                if(latestVersion > myVersion)
                {
                    update("aposBot", "bot.user.js", "https://github.com/Apostolique/Agar.io-bot/blob/" + sha + "/bot.user.js/");
                }
                console.log('Current bot.user.js Version: ' + myVersion + " on Github: " + latestVersion);
            });

        }).fail(function() {});
}
getLatestCommit();

console.log("Running Apos Bot!");

var f = window;
var g = window.jQuery;

var aposBot = aposBot || {};
aposBot.name = "AposBot " + aposBotVersion;
aposBot.mainLoop = function() {};
aposBot.utility = {};

var u = aposBot.utility;

u.splitDistance = 710;
console.log("Apos Bot!");

if (f.botList == null) {
    f.botList = [];
    g('#locationUnknown').append(g('<select id="bList" class="form-control" onchange="setBotIndex($(this).val());" />'));
    g('#locationUnknown').addClass('form-group');
}

for (var i = f.botList.length - 1; i >= 0; i--) {
    if (f.botList[i][0] == "Human") {
        f.botList.splice(i, 1);
    }
}


//Given an angle value that was gotten from valueAndleBased(),
//returns a new value that scales it appropriately.
u.paraAngleValue = function(angleValue, range) {
    return (15 / (range[1])) * (angleValue * angleValue) - (range[1] / 6);
};

u.valueAngleBased = function(angle, range) {
    var leftValue = (angle - range[0]).mod(360);
    var rightValue = (u.rangeToAngle(range) - angle).mod(360);

    var bestValue = Math.min(leftValue, rightValue);

    if (bestValue <= range[1]) {
        return u.paraAngleValue(bestValue, range);
    }
    return -1;
};

u.computeDistance = function(x1, y1, x2, y2) {
    var xdis = x1 - x2; // <--- FAKE AmS OF COURSE!
    var ydis = y1 - y2;
    var distance = Math.sqrt(xdis * xdis + ydis * ydis);

    return distance;
};

u.computeDistanceFromCircleEdge = function(x1, y1, x2, y2, s2) {
    var tempD = u.computeDistance(x1, y1, x2, y2);

    var offsetX = 0;
    var offsetY = 0;

    var ratioX = tempD / (x1 - x2);
    var ratioY = tempD / (y1 - y2);

    offsetX = x1 - (s2 / ratioX);
    offsetY = y1 - (s2 / ratioY);

    u.drawPoint(offsetX, offsetY, 5, "");

    return u.computeDistance(x2, y2, offsetX, offsetY);
};

u.compareSize = function(player1, player2, ratio) {
    if (player1.size * player1.size * ratio < player2.size * player2.size) {
        return true;
    }
    return false;
};

u.canSplit = function(player1, player2) {
    return u.compareSize(player1, player2, 2.66) && !u.compareSize(player1, player2, 7);
};

u.isItMe = function(player, cell) {
    if (u.getMode() == ":teams") {
        var currentColor = player[0].color;
        var currentRed = currentColor.substring(1,3);
        var currentGreen = currentColor.substring(3,5);
        var currentBlue = currentColor.substring(5,7);
        
        var currentTeam = u.getTeam(currentRed, currentGreen, currentBlue);

        var cellColor = cell.color;

        var cellRed = cellColor.substring(1,3);
        var cellGreen = cellColor.substring(3,5);
        var cellBlue = cellColor.substring(5,7);

        var cellTeam = u.getTeam(cellRed, cellGreen, cellBlue);

        if (currentTeam == cellTeam && !cell.isVirus()) {
            return true;
        }

        //console.log("COLOR: " + color);

    } else {
        for (var i = 0; i < player.length; i++) {
            if (cell.id == player[i].id) {
                return true;
            }
        }
    }
    return false;
};

u.getTeam = function(red, green, blue) {
    if (red == "ff") {
        return 0;
    } else if (green == "ff") {
        return 1;
    }
    return 2;
};

u.isFood = function(blob, cell) {
    if (!cell.isVirus() && u.compareSize(cell, blob, 1.33) || (cell.size <= 11)) {
        return true;
    }
    return false;
}
;
u.isThreat = function(blob, cell) {
    if (!cell.isVirus() && u.isFood(cell, blob)) {
        return true;
    }
    return false;
    /*if (!cell.isVirus() && compareSize(blob, cell, 1.33)) {
        return true;
    }
    return false;*/
};

u.isVirus = function(blob, cell) {
    if (cell.isVirus() && u.compareSize(cell, blob, 1.30)) {
        return true;
    } else if (cell.isVirus() && cell.color.substring(3,5).toLowerCase() != "ff") {
        return true;
    }
    return false;
};

u.isSplitTarget = function(blob, cell) {
    /*if (u.canSplit(cell, blob)) {
        return true;
    }*/
    return false;
};

u.getTimeToRemerge = function(mass){
    return ((mass*0.02) + 30);
};

u.separateListBasedOnFunction = function(listToUse, blob) {
    var foodElementList = [];
    var threatList = [];
    var virusList = [];
    var splitTargetList = [];

    var player = u.getPlayer();

    Object.keys(listToUse).forEach(function(element, index) {
        var isMe = u.isItMe(player, listToUse[element]);

        if (!isMe) {
            if (u.isFood(blob, listToUse[element])/* && listToUse[element].isNotMoving()*/) {
                //IT'S FOOD!
                foodElementList.push(listToUse[element]);

                if (u.isSplitTarget(blob, listToUse[element])) {
                    u.drawCircle(listToUse[element].x, listToUse[element].y, listToUse[element].size + 50, 7);
                    u.splitTargetList.push(listToUse[element]);
                }
            } else if (u.isThreat(blob, listToUse[element])) {
                //IT'S DANGER!
                threatList.push(listToUse[element]);
            } else if (u.isVirus(blob, listToUse[element])) {
                //IT'S VIRUS!
                virusList.push(listToUse[element]);
            }
        }/*else if(isMe && (getBlobCount(getPlayer()) > 0)){
            //Attempt to make the other cell follow the mother one
            foodElementList.push(listToUse[element]);
        }*/
    });

    foodList = [];
    for (var i = 0; i < foodElementList.length; i++) {
        foodList.push([foodElementList[i].x, foodElementList[i].y, foodElementList[i].size]);
    }

    return [foodList, threatList, virusList, splitTargetList];
};

u.getAll = function(blob) {
    var dotList = [];
    var player = u.getPlayer();
    var interNodes = u.getMemoryCells();

    dotList = u.separateListBasedOnFunction(interNodes, blob);

    return dotList;
};

u.clusterFood = function(foodList, blobSize) {
    var clusters = [];
    var addedCluster = false;

    //1: x
    //2: y
    //3: size or value
    //4: Angle, not set here.

    for (var i = 0; i < foodList.length; i++) {
        for (var j = 0; j < clusters.length; j++) {
            if (u.computeDistance(foodList[i][0], foodList[i][1], clusters[j][0], clusters[j][1]) < blobSize * 1.5) {
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
};

u.getAngle = function(x1, y1, x2, y2) {
    //Handle vertical and horizontal lines.

    if (x1 == x2) {
        if (y1 < y2) {
            return 271;
            //return 89;
        } else {
            return 89;
        }
    }

    return (Math.round(Math.atan2(-(y1 - y2), -(x1 - x2)) / Math.PI * 180 + 180));
};

u.slope = function(x1, y1, x2, y2) {
    var m = (y1 - y2) / (x1 - x2);

    return m;
};

u.slopeFromAngle = function(degree) {
    if (degree == 270) {
        degree = 271;
    } else if (degree == 90) {
        degree = 91;
    }
    return Math.tan((degree - 180) / 180 * Math.PI);
};

//Given two points on a line, finds the slope of a perpendicular line crossing it.
u.inverseSlope = function(x1, y1, x2, y2) {
    var m = slope(x1, y1, x2, y2);
    return (-1) / m;
};

//Given a slope and an offset, returns two points on that line.
u.pointsOnLine = function(slope, useX, useY, distance) {
    var b = useY - slope * useX;
    var r = Math.sqrt(1 + slope * slope);

    var newX1 = (useX + (distance / r));
    var newY1 = (useY + ((distance * slope) / r));
    var newX2 = (useX + ((-distance) / r));
    var newY2 = (useY + (((-distance) * slope) / r));

    return [
        [newX1, newY1],
        [newX2, newY2]
    ];
};

u.followAngle = function(angle, useX, useY, distance) {
    var slope = u.slopeFromAngle(angle);
    var coords = u.pointsOnLine(slope, useX, useY, distance);

    var side = (angle - 90).mod(360);
    if (side < 180) {
        return coords[1];
    } else {
        return coords[0];
    }
};

//Using a line formed from point a to b, tells if point c is on S side of that line.
u.isSideLine = function(a, b, c) {
    if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0) {
        return true;
    }
    return false;
};

//angle range2 is within angle range2
//an Angle is a point and a distance between an other point [5, 40]
u.angleRangeIsWithin = function(range1, range2) {
    if (range2[0] == (range2[0] + range2[1]).mod(360)) {
        return true;
    }
    //console.log("r1: " + range1[0] + ", " + range1[1] + " ... r2: " + range2[0] + ", " + range2[1]);

    var distanceFrom0 = (range1[0] - range2[0]).mod(360);
    var distanceFrom1 = (range1[1] - range2[0]).mod(360);

    if (distanceFrom0 < range2[1] && distanceFrom1 < range2[1] && distanceFrom0 < distanceFrom1) {
        return true;
    }
    return false;
};

u.angleRangeIsWithinInverted = function(range1, range2) {
    var distanceFrom0 = (range1[0] - range2[0]).mod(360);
    var distanceFrom1 = (range1[1] - range2[0]).mod(360);

    if (distanceFrom0 < range2[1] && distanceFrom1 < range2[1] && distanceFrom0 > distanceFrom1) {
        return true;
    }
    return false;
};

u.angleIsWithin = function(angle, range) {
    var diff = (u.rangeToAngle(range) - angle).mod(360);
    if (diff >= 0 && diff <= range[1]) {
        return true;
    }
    return false;
};

u.rangeToAngle = function(range) {
    return (range[0] + range[1]).mod(360);
};

u.anglePair = function(range) {
    return (range[0] + ", " + u.rangeToAngle(range) + " range: " + range[1]);
};

u.computeAngleRanges = function(blob1, blob2) {
    var mainAngle = u.getAngle(blob1.x, blob1.y, blob2.x, blob2.y);
    var leftAngle = (mainAngle - 90).mod(360);
    var rightAngle = (mainAngle + 90).mod(360);

    var blob1Left = u.followAngle(leftAngle, blob1.x, blob1.y, blob1.size);
    var blob1Right = u.followAngle(rightAngle, blob1.x, blob1.y, blob1.size);

    var blob2Left = u.followAngle(rightAngle, blob2.x, blob2.y, blob2.size);
    var blob2Right = u.followAngle(leftAngle, blob2.x, blob2.y, blob2.size);

    var blob1AngleLeft = u.getAngle(blob2.x, blob2.y, blob1Left[0], blob1Left[1]);
    var blob1AngleRight = u.getAngle(blob2.x, blob2.y, blob1Right[0], blob1Right[1]);

    var blob2AngleLeft = u.getAngle(blob1.x, blob1.y, blob2Left[0], blob2Left[1]);
    var blob2AngleRight = u.getAngle(blob1.x, blob1.y, blob2Right[0], blob2Right[1]);

    var blob1Range = (blob1AngleRight - blob1AngleLeft).mod(360);
    var blob2Range = (blob2AngleRight - blob2AngleLeft).mod(360);

    var tempLine = u.followAngle(blob2AngleLeft, blob2Left[0], blob2Left[1], 400);
    //drawLine(blob2Left[0], blob2Left[1], tempLine[0], tempLine[1], 0);

    if ((blob1Range / blob2Range) > 1) {
        drawPoint(blob1Left[0], blob1Left[1], 3, "");
        drawPoint(blob1Right[0], blob1Right[1], 3, "");
        drawPoint(blob1.x, blob1.y, 3, "" + blob1Range + ", " + blob2Range + " R: " + (Math.round((blob1Range / blob2Range) * 1000) / 1000));
    }

    //drawPoint(blob2.x, blob2.y, 3, "" + blob1Range);
};

u.debugAngle = function(angle, text) {
    var player = u.getPlayer();
    var line1 = u.followAngle(angle, player[0].x, player[0].y, 300);
    u.drawLine(player[0].x, player[0].y, line1[0], line1[1], 5);
    u.drawPoint(line1[0], line1[1], 5, "" + text);
};

//TODO: Don't let this function do the radius math.
u.getEdgeLinesFromPoint = function(blob1, blob2, radius) {
    var px = blob1.x;
    var py = blob1.y;

    var cx = blob2.x;
    var cy = blob2.y;

    //var radius = blob2.size;

    /*if (blob2.isVirus()) {
        radius = blob1.size;
    } else if(canSplit(blob1, blob2)) {
        radius += splitDistance;
    } else {
        radius += blob1.size * 2;
    }*/

    var shouldInvert = false;

    var tempRadius = u.computeDistance(px, py, cx, cy);
    if (tempRadius <= radius) {
        radius = tempRadius - 5;
        shouldInvert = true;
    }

    var dx = cx - px;
    var dy = cy - py;
    var dd = Math.sqrt(dx * dx + dy * dy);
    var a = Math.asin(radius / dd);
    var b = Math.atan2(dy, dx);

    var t = b - a;
    var ta = {
        x: radius * Math.sin(t),
        y: radius * -Math.cos(t)
    };

    t = b + a;
    var tb = {
        x: radius * -Math.sin(t),
        y: radius * Math.cos(t)
    };

    var angleLeft = u.getAngle(cx + ta.x, cy + ta.y, px, py);
    var angleRight = u.getAngle(cx + tb.x, cy + tb.y, px, py);
    var angleDistance = (angleRight - angleLeft).mod(360);

    /*if (shouldInvert) {
        var temp = angleLeft;
        angleLeft = (angleRight + 180).mod(360);
        angleRight = (temp + 180).mod(360);
        angleDistance = (angleRight - angleLeft).mod(360);
    }*/

    return [angleLeft, angleDistance, [cx + tb.x, cy + tb.y],
        [cx + ta.x, cy + ta.y]
    ];
};

u.invertAngle = function(range) {
    var angle1 = u.rangeToAngle(badAngles[i]);
    var angle2 = (badAngles[i][0] - angle1).mod(360);
    return [angle1, angle2];
};

u.addWall = function(listToUse, blob) {
    //var mapSizeX = Math.abs(f.getMapStartX - f.getMapEndX);
    //var mapSizeY = Math.abs(f.getMapStartY - f.getMapEndY);
    //var distanceFromWallX = mapSizeX/3;
    //var distanceFromWallY = mapSizeY/3;
    var distanceFromWallY = 2000;
    var distanceFromWallX = 2000;
    if (blob.x < f.getMapStartX() + distanceFromWallX) {
        //LEFT
        //console.log("Left");
        listToUse.push([
            [90, true],
            [270, false], u.computeDistance(getMapStartX(), blob.y, blob.x, blob.y)
        ]);
        var lineLeft = u.followAngle(90, blob.x, blob.y, 190 + blob.size);
        var lineRight = u.followAngle(270, blob.x, blob.y, 190 + blob.size);
        u.drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
        u.drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
        u.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
    }
    if (blob.y < getMapStartY() + distanceFromWallY) {
        //TOP
        //console.log("TOP");
        listToUse.push([
            [180, true],
            [0, false], u.computeDistance(blob.x, getMapStartY, blob.x, blob.y)
        ]);
        var lineLeft = u.followAngle(180, blob.x, blob.y, 190 + blob.size);
        var lineRight = u.followAngle(360, blob.x, blob.y, 190 + blob.size);
        u.drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
        u.drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
        u.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
    }
    if (blob.x > getMapEndX() - distanceFromWallX) {
        //RIGHT
        //console.log("RIGHT");
        listToUse.push([
            [270, true],
            [90, false], u.computeDistance(getMapEndX(), blob.y, blob.x, blob.y)
        ]);
        var lineLeft = u.followAngle(270, blob.x, blob.y, 190 + blob.size);
        var lineRight = u.followAngle(90, blob.x, blob.y, 190 + blob.size);
        u.drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
        u.drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
        u.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
    }
    if (blob.y > getMapEndY() - distanceFromWallY) {
        //BOTTOM
        //console.log("BOTTOM");
        listToUse.push([
            [0, true],
            [180, false], u.computeDistance(blob.x, getMapEndY(), blob.x, blob.y)
        ]);
        var lineLeft = u.followAngle(0, blob.x, blob.y, 190 + blob.size);
        var lineRight = u.followAngle(180, blob.x, blob.y, 190 + blob.size);
        u.drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
        u.drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
        u.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
    }
    return listToUse;
};

//listToUse contains angles in the form of [angle, boolean].
//boolean is true when the range is starting. False when it's ending.
//range = [[angle1, true], [angle2, false]]

u.getAngleIndex = function(listToUse, angle) {
    if (listToUse.length == 0) {
        return 0;
    }

    for (var i = 0; i < listToUse.length; i++) {
        if (angle <= listToUse[i][0]) {
            return i;
        }
    }

    return listToUse.length;
};

u.addAngle = function(listToUse, range) {
    //#1 Find first open element
    //#2 Try to add range1 to the list. If it is within other range, don't add it, set a boolean.
    //#3 Try to add range2 to the list. If it is withing other range, don't add it, set a boolean.

    //TODO: Only add the new range at the end after the right stuff has been removed.

    var newListToUse = listToUse.slice();

    var startIndex = 1;

    if (newListToUse.length > 0 && !newListToUse[0][1]) {
        startIndex = 0;
    }

    var startMark = u.getAngleIndex(newListToUse, range[0][0]);
    var startBool = startMark.mod(2) != startIndex;

    var endMark = u.getAngleIndex(newListToUse, range[1][0]);
    var endBool = endMark.mod(2) != startIndex;

    var removeList = [];

    if (startMark != endMark) {
        //Note: If there is still an error, this would be it.
        var biggerList = 0;
        if (endMark == newListToUse.length) {
            biggerList = 1;
        }

        for (var i = startMark; i < startMark + (endMark - startMark).mod(newListToUse.length + biggerList); i++) {
            removeList.push((i).mod(newListToUse.length));
        }
    } else if (startMark < newListToUse.length && endMark < newListToUse.length) {
        var startDist = (newListToUse[startMark][0] - range[0][0]).mod(360);
        var endDist = (newListToUse[endMark][0] - range[1][0]).mod(360);

        if (startDist < endDist) {
            for (var i = 0; i < newListToUse.length; i++) {
                removeList.push(i);
            }
        }
    }

    removeList.sort(function(a, b){return b-a;});

    for (var i = 0; i < removeList.length; i++) {
        newListToUse.splice(removeList[i], 1);
    }

    if (startBool) {
        newListToUse.splice(u.getAngleIndex(newListToUse, range[0][0]), 0, range[0]);
    }
    if (endBool) {
        newListToUse.splice(u.getAngleIndex(newListToUse, range[1][0]), 0, range[1]);
    }

    return newListToUse;
};

u.getAngleRange = function(blob1, blob2, index, radius) {
    var angleStuff = u.getEdgeLinesFromPoint(blob1, blob2, radius);

    var leftAngle = angleStuff[0];
    var rightAngle = u.rangeToAngle(angleStuff);
    var difference = angleStuff[1];

    u.drawPoint(angleStuff[2][0], angleStuff[2][1], 3, "");
    u.drawPoint(angleStuff[3][0], angleStuff[3][1], 3, "");

    //console.log("Adding badAngles: " + leftAngle + ", " + rightAngle + " diff: " + difference);

    var lineLeft = u.followAngle(leftAngle, blob1.x, blob1.y, 150 + blob1.size - index * 10);
    var lineRight = u.followAngle(rightAngle, blob1.x, blob1.y, 150 + blob1.size - index * 10);

    if (blob2.isVirus()) {
        u.drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 6);
        u.drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 6);
        u.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 6);
    } else if(getCells().hasOwnProperty(blob2.id)) {
        u.drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 0);
        u.drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 0);
        u.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 0);
    } else {
        u.drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 3);
        u.drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 3);
        u.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 3);
    }

    return [leftAngle, difference];
};

//Given a list of conditions, shift the angle to the closest available spot respecting the range given.
u.shiftAngle = function(listToUse, angle, range) {
    //TODO: shiftAngle needs to respect the range! DONE?
    for (var i = 0; i < listToUse.length; i++) {
        if (u.angleIsWithin(angle, listToUse[i])) {
            //console.log("Shifting needed!");

            var angle1 = listToUse[i][0];
            var angle2 = u.rangeToAngle(listToUse[i]);

            var dist1 = (angle - angle1).mod(360);
            var dist2 = (angle2 - angle).mod(360);

            if (dist1 < dist2) {
                if (u.angleIsWithin(angle1, range)) {
                    return angle1;
                } else {
                    return angle2;
                }
            } else {
                if (u.angleIsWithin(angle2, range)) {
                    return angle2;
                } else {
                    return angle1;
                }
            }
        }
    }
    //console.log("No Shifting Was needed!");
    return angle;
};

/**
 * This is the main bot logic. This is called quite often.
 * @param  followMouse Is a boolean. If set to true, it means the user is asking for the bot to follow the mouse coordinates.
 * @return A 2 dimensional array with coordinates for every cells.  [[x, y], [x, y]]
 */
u.findDestination = function(followMouse) {
    var player = getPlayer();
    var interNodes = getMemoryCells();
    //console.warn("findDestination(followMouse) was called from line " + arguments.callee.caller.toString());

    if ( /*!toggle*/ 1) {

        //The following code converts the mouse position into an
        //absolute game coordinate.
        var useMouseX = u.screenToGameX(getMouseX());
        var useMouseY = u.screenToGameY(getMouseY());
        tempPoint = [useMouseX, useMouseY, 1];

        //The current destination that the cells were going towards.
        var tempMoveX = getPointX();
        var tempMoveY = getPointY();

        //This variable will be returned at the end.
        //It will contain the destination choices for all the cells.
        //BTW!!! ERROR ERROR ABORT MISSION!!!!!!! READ BELOW -----------
        //
        //SINCE IT'S STUPID NOW TO ASK EACH CELL WHERE THEY WANT TO GO,
        //THE BOT SHOULD SIMPLY PICK ONE AND THAT'S IT, I MEAN WTF....
        var destinationChoices = []; //destination, size, danger

        //Just to make sure the player is alive.
        if (player.length > 0) {

            //Loop through all the player's cells.
            for (var k = 0; k < player.length; k++) {
                if (true) {
                    u.drawPoint(player[k].x, player[k].y + player[k].size, 0, "" + (getLastUpdate() - player[k].birth) + " / " + (30000 + (player[k].birthMass * 57) - (getLastUpdate() - player[k].birth)) + " / " + player[k].birthMass);
                }
            }


            //Loops only for one cell for now.
            for (var k = 0; /*k < player.length*/ k < 1; k++) {

                //console.log("Working on blob: " + k);

                u.drawCircle(player[k].x, player[k].y, player[k].size + u.splitDistance, 5);
                //drawPoint(player[0].x, player[0].y - player[0].size, 3, "" + Math.floor(player[0].x) + ", " + Math.floor(player[0].y));

                //var allDots = processEverything(interNodes);

                //loop through everything that is on the screen and
                //separate everything in it's own category.
                var allIsAll = u.getAll(player[k]);

                //The food stored in element 0 of allIsAll
                var allPossibleFood = allIsAll[0];
                //The threats are stored in element 1 of allIsAll
                var allPossibleThreats = allIsAll[1];
                //The viruses are stored in element 2 of allIsAll
                var allPossibleViruses = allIsAll[2];

                //The bot works by removing angles in which it is too
                //dangerous to travel towards to.
                var badAngles = [];
                var obstacleList = [];

                var isSafeSpot = true;
                var isMouseSafe = true;

                var clusterAllFood = u.clusterFood(allPossibleFood, player[k].size);

                //console.log("Looking for enemies!");

                //Loop through all the cells that were identified as threats.
                for (var i = 0; i < allPossibleThreats.length; i++) {

                    var enemyDistance = u.computeDistanceFromCircleEdge(allPossibleThreats[i].x, allPossibleThreats[i].y, player[k].x, player[k].y, allPossibleThreats[i].size);

                    allPossibleThreats[i].enemyDist = enemyDistance;
                }

                /*allPossibleThreats.sort(function(a, b){
                    return a.enemyDist-b.enemyDist;
                })*/

                for (var i = 0; i < allPossibleThreats.length; i++) {

                    var enemyDistance = u.computeDistance(allPossibleThreats[i].x, allPossibleThreats[i].y, player[k].x, player[k].y);

                    var splitDangerDistance = allPossibleThreats[i].size + u.splitDistance + 150;

                    var normalDangerDistance = allPossibleThreats[i].size + 150;

                    var shiftDistance = player[k].size;

                    //console.log("Found distance.");

                    var enemyCanSplit = u.canSplit(player[k], allPossibleThreats[i]);
                    
                    for (var j = clusterAllFood.length - 1; j >= 0 ; j--) {
                        var secureDistance = (enemyCanSplit ? splitDangerDistance : normalDangerDistance);
                        if (u.computeDistance(allPossibleThreats[i].x, allPossibleThreats[i].y, clusterAllFood[j][0], clusterAllFood[j][1]) < secureDistance)
                            clusterAllFood.splice(j, 1);
                    }

                    //console.log("Removed some food.");

                    if (enemyCanSplit) {
                        u.drawCircle(allPossibleThreats[i].x, allPossibleThreats[i].y, splitDangerDistance, 0);
                        u.drawCircle(allPossibleThreats[i].x, allPossibleThreats[i].y, splitDangerDistance + shiftDistance, 6);
                    } else {
                        u.drawCircle(allPossibleThreats[i].x, allPossibleThreats[i].y, normalDangerDistance, 3);
                        u.drawCircle(allPossibleThreats[i].x, allPossibleThreats[i].y, normalDangerDistance + shiftDistance, 6);
                    }

                    if (allPossibleThreats[i].danger && getLastUpdate() - allPossibleThreats[i].dangerTimeOut > 1000) {

                        allPossibleThreats[i].danger = false;
                    }

                    /*if ((enemyCanSplit && enemyDistance < splitDangerDistance) ||
                        (!enemyCanSplit && enemyDistance < normalDangerDistance)) {

                        allPossibleThreats[i].danger = true;
                        allPossibleThreats[i].dangerTimeOut = f.getLastUpdate();
                    }*/

                    //console.log("Figured out who was important.");

                    if ((enemyCanSplit && enemyDistance < splitDangerDistance) || (enemyCanSplit && allPossibleThreats[i].danger)) {

                        badAngles.push(u.getAngleRange(player[k], allPossibleThreats[i], i, splitDangerDistance).concat(allPossibleThreats[i].enemyDist));

                    } else if ((!enemyCanSplit && enemyDistance < normalDangerDistance) || (!enemyCanSplit && allPossibleThreats[i].danger)) {

                        badAngles.push(u.getAngleRange(player[k], allPossibleThreats[i], i, normalDangerDistance).concat(allPossibleThreats[i].enemyDist));

                    } else if (enemyCanSplit && enemyDistance < splitDangerDistance + shiftDistance) {
                        var tempOb = u.getAngleRange(player[k], allPossibleThreats[i], i, splitDangerDistance + shiftDistance);
                        var angle1 = tempOb[0];
                        var angle2 = u.rangeToAngle(tempOb);

                        obstacleList.push([[angle1, true], [angle2, false]]);
                    } else if (!enemyCanSplit && enemyDistance < normalDangerDistance + shiftDistance) {
                        var tempOb = u.getAngleRange(player[k], allPossibleThreats[i], i, normalDangerDistance + shiftDistance);
                        var angle1 = tempOb[0];
                        var angle2 = u.rangeToAngle(tempOb);

                        obstacleList.push([[angle1, true], [angle2, false]]);
                    }
                    //console.log("Done with enemy: " + i);
                }

                //console.log("Done looking for enemies!");

                var goodAngles = [];
                var stupidList = [];

                for (var i = 0; i < allPossibleViruses.length; i++) {
                    if (player[k].size < allPossibleViruses[i].size) {
                        u.drawCircle(allPossibleViruses[i].x, allPossibleViruses[i].y, allPossibleViruses[i].size + 10, 3);
                        u.drawCircle(allPossibleViruses[i].x, allPossibleViruses[i].y, allPossibleViruses[i].size * 2, 6);

                    } else {
                        u.drawCircle(allPossibleViruses[i].x, allPossibleViruses[i].y, player[k].size + 50, 3);
                        u.drawCircle(allPossibleViruses[i].x, allPossibleViruses[i].y, player[k].size * 2, 6);
                    }
                }

                for (var i = 0; i < allPossibleViruses.length; i++) {
                    var virusDistance = u.computeDistance(allPossibleViruses[i].x, allPossibleViruses[i].y, player[k].x, player[k].y);
                    if (player[k].size < allPossibleViruses[i].size) {
                        if (virusDistance < (allPossibleViruses[i].size * 2)) {
                            var tempOb = u.getAngleRange(player[k], allPossibleViruses[i], i, allPossibleViruses[i].size + 10);
                            var angle1 = tempOb[0];
                            var angle2 = u.rangeToAngle(tempOb);
                            obstacleList.push([[angle1, true], [angle2, false]]);
                        }
                    } else {
                        if (virusDistance < (player[k].size * 2)) {
                            var tempOb = u.getAngleRange(player[k], allPossibleViruses[i], i, player[k].size + 50);
                            var angle1 = tempOb[0];
                            var angle2 = u.rangeToAngle(tempOb);
                            obstacleList.push([[angle1, true], [angle2, false]]);
                        }
                    }
                }

                if (badAngles.length > 0) {
                    //NOTE: This is only bandaid wall code. It's not the best way to do it.
                    stupidList = u.addWall(stupidList, player[k]);
                }

                for (var i = 0; i < badAngles.length; i++) {
                    var angle1 = badAngles[i][0];
                    var angle2 = u.rangeToAngle(badAngles[i]);
                    stupidList.push([[angle1, true], [angle2, false], badAngles[i][2]]);
                }

                //stupidList.push([[45, true], [135, false]]);
                //stupidList.push([[10, true], [200, false]]);

                stupidList.sort(function(a, b){
                    //console.log("Distance: " + a[2] + ", " + b[2]);
                    return a[2]-b[2];
                });

                //console.log("Added random noob stuff.");

                var sortedInterList = [];
                var sortedObList = [];

                for (var i = 0; i < stupidList.length; i++) {
                    //console.log("Adding to sorted: " + stupidList[i][0][0] + ", " + stupidList[i][1][0]);
                    var tempList = u.addAngle(sortedInterList, stupidList[i]);

                    if (tempList.length == 0) {
                        console.log("MAYDAY IT'S HAPPENING!");
                        break;
                    } else {
                        sortedInterList = tempList;
                    }
                }

                for (var i = 0; i < obstacleList.length; i++) {
                    sortedObList = u.addAngle(sortedObList, obstacleList[i]);

                    if (sortedObList.length == 0) {
                        break;
                    }
                }

                var offsetI = 0;
                var obOffsetI = 1;

                if (sortedInterList.length > 0 && sortedInterList[0][1]) {
                    offsetI = 1;
                }
                if (sortedObList.length > 0 && sortedObList[0][1]) {
                    obOffsetI = 0;
                }

                var goodAngles = [];
                var obstacleAngles = [];

                for (var i = 0; i < sortedInterList.length; i += 2) {
                    var angle1 = sortedInterList[(i + offsetI).mod(sortedInterList.length)][0];
                    var angle2 = sortedInterList[(i + 1 + offsetI).mod(sortedInterList.length)][0];
                    var diff = (angle2 - angle1).mod(360);
                    goodAngles.push([angle1, diff]);
                }

                for (var i = 0; i < sortedObList.length; i += 2) {
                    var angle1 = sortedObList[(i + obOffsetI).mod(sortedObList.length)][0];
                    var angle2 = sortedObList[(i + 1 + obOffsetI).mod(sortedObList.length)][0];
                    var diff = (angle2 - angle1).mod(360);
                    obstacleAngles.push([angle1, diff]);
                }

                for (var i = 0; i < goodAngles.length; i++) {
                    var line1 = u.followAngle(goodAngles[i][0], player[k].x, player[k].y, 100 + player[k].size);
                    var line2 = u.followAngle((goodAngles[i][0] + goodAngles[i][1]).mod(360), player[k].x, player[k].y, 100 + player[k].size);
                    u.drawLine(player[k].x, player[k].y, line1[0], line1[1], 1);
                    u.drawLine(player[k].x, player[k].y, line2[0], line2[1], 1);

                    u.drawArc(line1[0], line1[1], line2[0], line2[1], player[k].x, player[k].y, 1);

                    //drawPoint(player[0].x, player[0].y, 2, "");

                    u.drawPoint(line1[0], line1[1], 0, "" + i + ": 0");
                    u.drawPoint(line2[0], line2[1], 0, "" + i + ": 1");
                }

                for (var i = 0; i < obstacleAngles.length; i++) {
                    var line1 = u.followAngle(obstacleAngles[i][0], player[k].x, player[k].y, 50 + player[k].size);
                    var line2 = u.followAngle((obstacleAngles[i][0] + obstacleAngles[i][1]).mod(360), player[k].x, player[k].y, 50 + player[k].size);
                    u.drawLine(player[k].x, player[k].y, line1[0], line1[1], 6);
                    u.drawLine(player[k].x, player[k].y, line2[0], line2[1], 6);

                    u.drawArc(line1[0], line1[1], line2[0], line2[1], player[k].x, player[k].y, 6);

                    //drawPoint(player[0].x, player[0].y, 2, "");

                    u.drawPoint(line1[0], line1[1], 0, "" + i + ": 0");
                    u.drawPoint(line2[0], line2[1], 0, "" + i + ": 1");
                }

                if (followMouse && goodAngles.length == 0) {
                    //This is the follow the mouse mode
                    var distance = u.computeDistance(player[k].x, player[k].y, tempPoint[0], tempPoint[1]);

                    var shiftedAngle = u.shiftAngle(obstacleAngles, u.getAngle(tempPoint[0], tempPoint[1], player[k].x, player[k].y), [0, 360]);

                    var destination = u.followAngle(shiftedAngle, player[k].x, player[k].y, distance);

                    destinationChoices = destination;
                    u.drawLine(player[k].x, player[k].y, destination[0], destination[1], 1);
                    //tempMoveX = destination[0];
                    //tempMoveY = destination[1];

                } else if (goodAngles.length > 0) {
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

                    perfectAngle = u.shiftAngle(obstacleAngles, perfectAngle, bIndex);

                    var line1 = u.followAngle(perfectAngle, player[k].x, player[k].y, verticalDistance());

                    destinationChoices = line1;
                    u.drawLine(player[k].x, player[k].y, line1[0], line1[1], 7);
                    //tempMoveX = line1[0];
                    //tempMoveY = line1[1];
                } else if (badAngles.length > 0 && goodAngles == 0) {
                    //When there are enemies around but no good angles
                    //You're likely screwed. (This should never happen.)

                    console.log("Failed");
                    destinationChoices = [tempMoveX, tempMoveY];
                    /*var angleWeights = [] //Put weights on the angles according to enemy distance
                    for (var i = 0; i < allPossibleThreats.length; i++){
                        var dist = computeDistance(player[k].x, player[k].y, allPossibleThreats[i].x, allPossibleThreats[i].y);
                        var angle = getAngle(allPossibleThreats[i].x, allPossibleThreats[i].y, player[k].x, player[k].y);
                        angleWeights.push([angle,dist]);
                    }
                    var maxDist = 0;
                    var finalAngle = 0;
                    for (var i = 0; i < angleWeights.length; i++){
                        if (angleWeights[i][1] > maxDist){
                            maxDist = angleWeights[i][1];
                            finalAngle = (angleWeights[i][0] + 180).mod(360);
                        }
                    }
                    var line1 = followAngle(finalAngle,player[k].x,player[k].y,f.verticalDistance());
                    drawLine(player[k].x, player[k].y, line1[0], line1[1], 2);
                    destinationChoices.push(line1);*/
                } else if (clusterAllFood.length > 0) {
                    for (var i = 0; i < clusterAllFood.length; i++) {
                        //console.log("mefore: " + clusterAllFood[i][2]);
                        //This is the cost function. Higher is better.

                            var clusterAngle = u.getAngle(clusterAllFood[i][0], clusterAllFood[i][1], player[k].x, player[k].y);

                            clusterAllFood[i][2] = clusterAllFood[i][2] * 6 - u.computeDistance(clusterAllFood[i][0], clusterAllFood[i][1], player[k].x, player[k].y);
                            //console.log("Current Value: " + clusterAllFood[i][2]);

                            //(goodAngles[bIndex][1] / 2 - (Math.abs(perfectAngle - clusterAngle)));

                            clusterAllFood[i][3] = clusterAngle;

                            u.drawPoint(clusterAllFood[i][0], clusterAllFood[i][1], 1, "");
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

                    var distance = u.computeDistance(player[k].x, player[k].y, clusterAllFood[bestFoodI][0], clusterAllFood[bestFoodI][1]);

                    var shiftedAngle = u.shiftAngle(obstacleAngles, u.getAngle(clusterAllFood[bestFoodI][0], clusterAllFood[bestFoodI][1], player[k].x, player[k].y), [0, 360]);

                    var destination = u.followAngle(shiftedAngle, player[k].x, player[k].y, distance);

                    destinationChoices = destination;
                    //tempMoveX = destination[0];
                    //tempMoveY = destination[1];
                    u.drawLine(player[k].x, player[k].y, destination[0], destination[1], 1);
                } else {
                    //If there are no enemies around and no food to eat.
                    destinationChoices = [tempMoveX, tempMoveY];
                }

                u.drawPoint(tempPoint[0], tempPoint[1], tempPoint[2], "");
                //drawPoint(tempPoint[0], tempPoint[1], tempPoint[2], "" + Math.floor(computeDistance(tempPoint[0], tempPoint[1], I, J)));
                //drawLine(tempPoint[0], tempPoint[1], player[0].x, player[0].y, 6);
                //console.log("Slope: " + slope(tempPoint[0], tempPoint[1], player[0].x, player[0].y) + " Angle: " + getAngle(tempPoint[0], tempPoint[1], player[0].x, player[0].y) + " Side: " + (getAngle(tempPoint[0], tempPoint[1], player[0].x, player[0].y) - 90).mod(360));
                tempPoint[2] = 1;

                //console.log("Done working on blob: " + i);
            }

            //TODO: Find where to go based on destinationChoices.
            /*var dangerFound = false;
            for (var i = 0; i < destinationChoices.length; i++) {
                if (destinationChoices[i][2]) {
                    dangerFound = true;
                    break;
                }
            }

            destinationChoices.sort(function(a, b){return b[1] - a[1]});

            if (dangerFound) {
                for (var i = 0; i < destinationChoices.length; i++) {
                    if (destinationChoices[i][2]) {
                        tempMoveX = destinationChoices[i][0][0];
                        tempMoveY = destinationChoices[i][0][1];
                        break;
                    }
                }
            } else {
                tempMoveX = destinationChoices.peek()[0][0];
                tempMoveY = destinationChoices.peek()[0][1];
                //console.log("Done " + tempMoveX + ", " + tempMoveY);
            }*/
        }
        //console.log("MOVING RIGHT NOW!");

        //console.log("______Never lied ever in my life.");

        return destinationChoices;
    }
};

/**
 * A conversion from the screen's horizontal coordinate system
 * to the game's horizontal coordinate system.
 * @param x in the screen's coordinate system
 * @return x in the game's coordinate system
 */
u.screenToGameX = function(x) {
    return (x - getWidth() / 2) / getRatio() + getX();
};

/**
 * A conversion from the screen's vertical coordinate system
 * to the game's vertical coordinate system.
 * @param y in the screen's coordinate system
 * @return y in the game's coordinate system
 */
u.screenToGameY = function(y) {
    return (y - getHeight() / 2) / getRatio() + getY();
};

u.drawPoint = function(x_1, y_1, drawColor, text) {
    f.drawPoint(x_1, y_1, drawColor, text);
};

u.drawArc = function(x_1, y_1, x_2, y_2, x_3, y_3, drawColor) {
    f.drawArc(x_1, y_1, x_2, y_2, x_3, y_3, drawColor);
};

u.drawLine = function(x_1, y_1, x_2, y_2, drawColor) {
    f.drawLine(x_1, y_1, x_2, y_2, drawColor);
};

u.drawCircle = function(x_1, y_1, radius, drawColor) {
    f.drawCircle(x_1, y_1, radius, drawColor);
};

/**
 * Some horse shit of some sort.
 * @return Horse Shit
 */
u.screenDistance = function() {
    var temp = f.getScreenDistance();
    return temp;
};

/**
 * Tells you if the game is in Dark mode.
 * @return Boolean for dark mode.
 */
u.getDarkBool = function() {
    return f.getDarkBool();
};

/**
 * Tells you if the mass is shown.
 * @return Boolean for player's mass.
 */
u.getMassBool = function() {
    return f.getMassBool();
};

/**
 * This is a copy of everything that is shown on screen.
 * Normally stuff will time out when off the screen, this
 * memorizes everything that leaves the screen for a little
 * while longer.
 * @return The memory object.
 */
u.getMemoryCells = function() {
    return f.getMemoryCells();
};

/**
 * [getCellsArray description]
 * @return {[type]} [description]
 */
u.getCellsArray = function() {
    return f.getCellsArray();
};

/**
 * This is the original "getMemoryCells" without the memory part.
 * @return Non memorized object.
 */
u.getCells = function() {
    return f.getCells();
};

/**
 * Returns an array with all the player's cells.
 * @return Player's cells
 */
u.getPlayer = function () {
    return f.getPlayer();
};

/**
 * The canvas' width.
 * @return Integer Width
 */
u.getWidth = function() {
    return f.getWidth();
};

/**
 * The canvas' height
 * @return Integer Height
 */
u.getHeight = function() {
    return f.getHeight();
};

/**
 * Scaling ratio of the canvas. The bigger this ration,
 * the further that you see.
 * @return Screen scaling ratio.
 */
u.getRatio = function() {
    return f.getRatio();
};

/**
 * [getOffsetX description]
 * @return {[type]} [description]
 */
u.getOffsetX = function() {
    return f.getOffsetX();
};

u.getOffsetY = function() {
    return f.getOffsetY();
};

u.getX = function() {
    return f.getX();
};

u.getY = function() {
    return f.getY();
};

u.getPointX = function() {
    return f.getPointX();
};

u.getPointY = function() {
    return f.getPointY();
};

/**
 * The X location of the mouse.
 * @return Integer X
 */
u.getMouseX = function() {
    return f.getMouseX();
};

/**
 * The Y location of the mouse.
 * @return Integer Y
 */
u.getMouseY = function() {
    return f.getMouseY();
};

/**
 * A timestamp since the last time the server sent any data.
 * @return Last update timestamp
 */
u.getUpdate = function() {
    return f.getLastUpdate();
};

/**
 * The game's current mode. (":ffa", ":experimental", ":teams". ":party")
 * @return {[type]} [description]
 */
u.getMode = function() {
    return f.getMode();
};

f.botList.push(["AposBot " + aposBotVersion, u.findDestination]);

u.bList = g('#bList');
g('<option />', {value: (f.botList.length - 1), text: "AposBot"}).appendTo(bList);
