// ==UserScript==
// @name        AposBot
// @namespace   AposBot
// @include     http://agar.io/
// @version     1
// @grant       none
// ==/UserScript==


Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
};

Array.prototype.peek = function() {
    return this[this.length - 1];
}

console.log("Running Apos Bot!");
(function(f, g) {
    console.log("Apos Bot!");

    if (f.botList == null) {
        f.botList = [];
    }

    f.botList.push(["AposBot", findDestination]);

    var bList = g('#bList');
    g('<option />', {value: (f.botList.length - 1), text: "AposBot"}).appendTo(bList);

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

        var ratioX = tempD / (x2 - x1);
        var ratioY = tempD / (y2 - y1);

        offsetX = x2 - (s2 / ratioX);
        offsetY = y2 - (s2 / ratioY);

        return computeDistance(x1, y1, offsetX, offsetY);
    }

    function getListBasedOnFunction(booleanFunction, listToUse) {
        var dotList = [];
        var interNodes = getMemoryCells();
        Object.keys(listToUse).forEach(function(element, index) {
            if (booleanFunction(element)) {
                dotList.push(interNodes[element]);
            }
        });

        return dotList;
    }

    function processEverything(listToUse) {
        Object.keys(listToUse).forEach(function(element, index) {
            computeAngleRanges(listToUse[element], getPlayer()[0]);
        });
    }

    //TODO: Make it only go to a virus if it's big enough. If it shrinks, it shouldn't only grab a single dot and go back in.
    function getAllNiceViruses() {
        var dotList = [];
        var player = getPlayer();
        var interNodes = getMemoryCells();

        if (player.length == 1) {
            dotList = getListBasedOnFunction(function(element) {
                if (interNodes[element].isVirus && (interNodes[element].size * 1.10 <= player[0].size) && interNodes[element].size * 1.15 >= player[0].size) {
                    return true;
                }
                return false;
            }, interNodes);
        }

        return dotList;
    }

    function getAllThreats() {
        var dotList = [];
        var player = getPlayer();
        var interNodes = getMemoryCells();

        dotList = getListBasedOnFunction(function(element) {
            var isMe = false;

            for (var i = 0; i < player.length; i++) {
                if (interNodes[element].id == player[i].id) {
                    isMe = true;
                    break;
                }
            }

            for (var i = 0; i < player.length; i++) {
                if (!isMe && (!interNodes[element].isVirus && (interNodes[element].size >= player[i].oSize * 1.15))) {
                    return true;
                } else if (interNodes[element].isVirus && (interNodes[element].size * 1.15 <= player[i].oSize)) {
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
        var player = getPlayer();
        var interNodes = getMemoryCells();

        elementList = getListBasedOnFunction(function(element) {
            var isMe = false;

            for (var i = 0; i < player.length; i++) {
                if (interNodes[element].id == player[i].id) {
                    isMe = true;
                    break;
                }
            }

            for (var i = 0; i < player.length; i++) {
                if (!isMe && !interNodes[element].isVirus && (interNodes[element].size * 1.25 <= player[i].size) || (interNodes[element].size <= 11)) {
                    return true;
                } else {
                    return false;
                }
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

        return (Math.round(Math.atan2(-(y1 - y2), -(x1 - x2)) / Math.PI * 180 + 180));
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

        return [
            [newX1, newY1],
            [newX2, newY2]
        ];
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

        var distanceFrom0 = (range1[0] - range2[0]).mod(360);
        var distanceFrom1 = (range1[1] - range2[0]).mod(360);

        if (distanceFrom0 < range2[1] && distanceFrom1 < range2[1] && distanceFrom0 < distanceFrom1) {
            return true;
        }
        return false;
    }

    function angleRangeIsWithinInverted(range1, range2) {
        var distanceFrom0 = (range1[0] - range2[0]).mod(360);
        var distanceFrom1 = (range1[1] - range2[0]).mod(360);

        if (distanceFrom0 < range2[1] && distanceFrom1 < range2[1] && distanceFrom0 > distanceFrom1) {
            return true;
        }
        return false;
    }

    function angleIsWithin(angle, range) {
        var diff = (rangeToAngle(range) - angle).mod(360);
        if (diff >= 0 && diff <= range[1]) {
            return true;
        }
        return false;
    }

    function rangeToAngle(range) {
        return (range[0] + range[1]).mod(360);
    }

    function anglePair(range) {
        return (range[0] + ", " + rangeToAngle(range) + " range: " + range[1]);
    }

    function computeAngleRanges(blob1, blob2) {
        var mainAngle = getAngle(blob1.x, blob1.y, blob2.x, blob2.y);
        var leftAngle = (mainAngle - 90).mod(360);
        var rightAngle = (mainAngle + 90).mod(360);

        var blob1Left = followAngle(leftAngle, blob1.x, blob1.y, blob1.size);
        var blob1Right = followAngle(rightAngle, blob1.x, blob1.y, blob1.size);

        var blob2Left = followAngle(rightAngle, blob2.x, blob2.y, blob2.size);
        var blob2Right = followAngle(leftAngle, blob2.x, blob2.y, blob2.size);

        var blob1AngleLeft = getAngle(blob2.x, blob2.y, blob1Left[0], blob1Left[1]);
        var blob1AngleRight = getAngle(blob2.x, blob2.y, blob1Right[0], blob1Right[1]);

        var blob2AngleLeft = getAngle(blob1.x, blob1.y, blob2Left[0], blob2Left[1]);
        var blob2AngleRight = getAngle(blob1.x, blob1.y, blob2Right[0], blob2Right[1]);

        var blob1Range = (blob1AngleRight - blob1AngleLeft).mod(360);
        var blob2Range = (blob2AngleRight - blob2AngleLeft).mod(360);

        var tempLine = followAngle(blob2AngleLeft, blob2Left[0], blob2Left[1], 400);
        //drawLine(blob2Left[0], blob2Left[1], tempLine[0], tempLine[1], 0);

        if ((blob1Range / blob2Range) > 1) {
            drawPoint(blob1Left[0], blob1Left[1], 3, "");
            drawPoint(blob1Right[0], blob1Right[1], 3, "");
            drawPoint(blob1.x, blob1.y, 3, "" + blob1Range + ", " + blob2Range + " R: " + (Math.round((blob1Range / blob2Range) * 1000) / 1000));
        }

        //drawPoint(blob2.x, blob2.y, 3, "" + blob1Range);
    }

    function debugAngle(angle, text) {
        var player = getPlayer();
        var line1 = followAngle(angle, player[0].x, player[0].y, 300);
        drawLine(player[0].x, player[0].y, line1[0], line1[1], 5);
        drawPoint(line1[0], line1[1], 5, "" + text);
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

        var shouldInvert = false;

        if (computeDistance(px, py, cx, cy) <= radius) {
            radius = computeDistance(px, py, cx, cy) - 1;
            shouldInvert = true;
        }

        var dx = cx - px;
        var dy = cy - py;
        var dd = Math.sqrt(dx * dx + dy * dy);
        var a = Math.asin(radius / dd);
        var b = Math.atan2(dy, dx);

        var t = b - a
        var ta = {
            x: radius * Math.sin(t),
            y: radius * -Math.cos(t)
        };

        t = b + a
        var tb = {
            x: radius * -Math.sin(t),
            y: radius * Math.cos(t)
        };

        var angleLeft = getAngle(cx + ta.x, cy + ta.y, px, py);
        var angleRight = getAngle(cx + tb.x, cy + tb.y, px, py);
        var angleDistance = (angleRight - angleLeft).mod(360);

        return [angleLeft, angleDistance, [cx + tb.x, cy + tb.y],
            [cx + ta.x, cy + ta.y]
        ];
    }

    function invertAngle(range) {
        var angle1 = rangeToAngle(badAngles[i]);
        var angle2 = (badAngles[i][0] - angle1).mod(360);
        return [angle1, angle2];
    }

    function seperateAngle(range) {
        var angle1 = range[0];
        var group1 = [angle1, false];

        var angle2 = rangeToAngle(range);
        var group2 = [angle2, true];
        return [group1, group2];
    }

    function addSorted(listToUse, group) {
        var isAdded = false;
        for (var i = 0; i < listToUse.length; i++) {
            if (group[0] < listToUse[i][0]) {
                listToUse.splice(i, 0, group);
                isAdded = true;
                break;
            }
        }

        if (!isAdded) {
            listToUse.push(group);
        }
        return listToUse;
    }

    function removeDuplicates(listToUse) {
        if (listToUse.length > 0) {
            var lastValue = listToUse[0][0];
            var seriesStartIndex = -1;
            var removeFirst = false;

            var sortedLength = listToUse.length;
            var i = 1;
            while (i < sortedLength) {
                if (lastValue == listToUse[i][0]) {
                    if (seriesStartIndex == -1) {
                        seriesStartIndex = i - 1;
                    }

                    if (listToUse[seriesStartIndex][1] != listToUse[i][1]) {
                        removeFirst = true;
                    }
                    listToUse.splice(i, 1);
                    sortedLength--;
                    i--;

                } else {
                    if (removeFirst) {
                        listToUse.splice(seriesStartIndex, 1);
                        sortedLength--;
                        i--;
                        removeFirst = false;
                    }
                    seriesStartIndex = -1;

                    lastValue = listToUse[i][0];
                }
                i++;
            }
        }

        return listToUse;
    }

    function findFirstUpArrow(listToUse) {
        var sortedLength = listToUse.length;
        var downArrow = false;

        for (var i = 0; i < listToUse.length; i++) {
            if (!listToUse[i][1]) {
                downArrow = true;
            }
            if (downArrow && listToUse[i][1]) {
                return i;
            }
        }
        return 0;
    }

    function mergeAngles(listToUse) {
        var startIndex = findFirstUpArrow(listToUse);
        var angleList = [];
        if (listToUse.length > 0) {
            var currentArrow = true;
            var currentAngle = listToUse[startIndex][0];

            for (var i = 1; i < listToUse.length; i++) {
                if (listToUse[(startIndex + i).mod(listToUse.length)][1] == currentArrow && currentArrow) {
                    currentAngle = listToUse[(startIndex + i).mod(listToUse.length)][0];
                } else if (listToUse[(startIndex + i).mod(listToUse.length)][1] != currentArrow && currentArrow) {
                    currentArrow = false;
                    var endAngle = listToUse[(startIndex + i).mod(listToUse.length)][0];
                    var diff = (endAngle - currentAngle).mod(360);
                    angleList.push([currentAngle, diff]);
                } else if (listToUse[(startIndex + i).mod(listToUse.length)][1] != currentArrow && !currentArrow) {
                    currentArrow = true;
                    currentAngle = listToUse[(startIndex + i).mod(listToUse.length)][0];
                }
            }
            if (currentArrow) {
                var endAngle = listToUse[(startIndex - 1).mod(listToUse.length)][0];
                var diff = (endAngle - startAngle).mod(360);
                angleList.push([startAngle, diff]);
            }
        }
        return angleList;
    }

    function findDestination() {
        var player = getPlayer();
        var interNodes = getMemoryCells();

        if ( /*!toggle*/ 1) {
            var useMouseX = (getMouseX() - getWidth() / 2 + getX() * getRatio()) / getRatio();
            var useMouseY = (getMouseY() - getHeight() / 2 + getY() * getRatio()) / getRatio();
            tempPoint = [useMouseX, useMouseY, 1];

            var tempMoveX = getPointX();
            var tempMoveY = getPointY();

            if (player.length > 0) {
                //drawPoint(player[0].x, player[0].y - player[0].size, 3, "" + Math.floor(player[0].x) + ", " + Math.floor(player[0].y));

                //var allDots = processEverything(interNodes);

                var allPossibleFood = null;
                allPossibleFood = getAllFood(); // #1

                var allPossibleThreats = getAllThreats();
                //console.log("Internodes: " + interNodes.length + " Food: " + allPossibleFood.length + " Threats: " + allPossibleThreats.length);

                var badAngles = [];

                var isSafeSpot = true;
                var isMouseSafe = true;

                var clusterAllFood = clusterFood(allPossibleFood, player[0].oSize);

                for (var i = 0; i < allPossibleThreats.length; i++) {
                    var offsetX = player[0].x;
                    var offsetY = player[0].y;

                    var enemyAngleStuff = getEdgeLinesFromPoint(player[0], allPossibleThreats[i]);

                    var leftAngle = enemyAngleStuff[0];
                    var rightAngle = rangeToAngle(enemyAngleStuff);
                    var difference = enemyAngleStuff[1];

                    drawPoint(enemyAngleStuff[2][0], enemyAngleStuff[2][1], 3, "");
                    drawPoint(enemyAngleStuff[3][0], enemyAngleStuff[3][1], 3, "");

                    badAngles.push([leftAngle, difference]);

                    //console.log("Adding badAngles: " + leftAngle + ", " + rightAngle + " diff: " + difference);

                    var lineLeft = followAngle(leftAngle, player[0].x, player[0].y, 400 - i * 10);
                    var lineRight = followAngle(rightAngle, player[0].x, player[0].y, 400 - i * 10);
                    if (getCells().hasOwnProperty(allPossibleThreats[i].id)) {
                        drawLine(player[0].x, player[0].y, lineLeft[0], lineLeft[1], 0);
                        drawLine(player[0].x, player[0].y, lineRight[0], lineRight[1], 0);
                        drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], player[0].x, player[0].y, 0);
                    } else {
                        drawLine(player[0].x, player[0].y, lineLeft[0], lineLeft[1], 3);
                        drawLine(player[0].x, player[0].y, lineRight[0], lineRight[1], 3);
                        drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], player[0].x, player[0].y, 3);
                    }
                    //drawPoint(lineLeft[0], lineLeft[1], 0, "Left 0 - " + i);
                    //drawPoint(lineRight[0], lineRight[1], 0, "Right 1 - " + i);
                }

                var goodAngles = [];
                //TODO: Add wall angles here. Hardcoding temporary values.
                if (player[0].x < 1000 && badAngles.length > 0) {
                    //LEFT
                    console.log("Left");
                    var wallI = 1;
                    if (!interNodes.hasOwnProperty(wallI)) {
                        console.log("Creating Wall");
                        var newX = -100 - screenDistance();
                        console.log("Got distance");
                        var n = f.createFake(wallI, newX, player[0].y, player[0].size * 10, "#000", false, "Left Wall");
                        console.log("n ID: " + n.id);
                        delete getCells()[wallI];
                        getCellsArray().pop();

                        interNodes[wallI] = n;
                        interNodes[wallI].nx = newX;
                        interNodes[wallI].ny = player[0].ny;
                        interNodes[wallI].nSize = player[0].oSize * 10;
                        interNodes[wallI].updateTime = getUpdate();
                        //console.log("Added corner enemy");
                    } else {
                        //console.log("Update Wall!");
                        interNodes[wallI].updateTime = getUpdate();
                        interNodes[wallI].y = player[0].y;
                        interNodes[wallI].ny = player[0].ny;
                    }
                } else if (player[0].x < 1000 && interNodes.hasOwnProperty(1)) {
                    delete interNodes[1];
                }
                if (player[0].y < 1000 && badAngles.length > 0) {
                    //TOP
                    console.log("TOP");
                    var wallI = 2;
                    if (!interNodes.hasOwnProperty(wallI)) {
                        console.log("Creating Wall");
                        var newY = -100 - screenDistance();
                        console.log("Got distance");
                        var n = f.createFake(wallI, player[0].x, newY, player[0].size * 10, "#000", false, "Top Wall");
                        console.log("n ID: " + n.id);
                        delete getCells()[wallI];
                        getCellsArray().pop();

                        interNodes[wallI] = n;
                        interNodes[wallI].nx = player[0].nx;
                        interNodes[wallI].ny = newY;
                        interNodes[wallI].nSize = player[0].oSize * 10;
                        interNodes[wallI].updateTime = getUpdate();
                        //console.log("Added corner enemy");
                    } else {
                        //console.log("Update Wall!");
                        interNodes[wallI].updateTime = getUpdate();
                        interNodes[wallI].x = player[0].x;
                        interNodes[wallI].nx = player[0].nx;
                    }
                } else if (player[0].y < 1000 && interNodes.hasOwnProperty(2)) {
                    delete interNodes[2];
                }
                if (player[0].x > 11180 - 1000 && badAngles.length > 0) {
                    //RIGHT
                    console.log("RIGHT");
                    var wallI = 3;
                    if (!interNodes.hasOwnProperty(wallI)) {
                        console.log("Creating Wall");
                        var newX = 11180 + 100 + screenDistance();
                        console.log("Got distance");
                        var n = f.createFake(wallI, newX, player[0].y, player[0].size * 10, "#000", false, "Right Wall");
                        console.log("n ID: " + n.id);
                        delete getCells()[wallI];
                        getCellsArray().pop();

                        interNodes[wallI] = n;
                        interNodes[wallI].nx = newX;
                        interNodes[wallI].ny = player[0].ny;
                        interNodes[wallI].nSize = player[0].oSize * 10;
                        interNodes[wallI].updateTime = getUpdate();
                        //console.log("Added corner enemy");
                    } else {
                        //console.log("Update Wall!");
                        interNodes[wallI].updateTime = getUpdate();
                        interNodes[wallI].y = player[0].y;
                        interNodes[wallI].ny = player[0].ny;
                    }
                } else if (player[0].x > 11180 - 1000 && interNodes.hasOwnProperty(3)) {
                    delete interNodes[3];
                }
                if (player[0].y > 11180 - 1000 && badAngles.length > 0) {
                    //BOTTOM
                    console.log("BOTTOM");
                    var wallI = 4;
                    if (!interNodes.hasOwnProperty(wallI)) {
                        console.log("Creating Wall");
                        var newY = 11180 + 100 + screenDistance();
                        console.log("Got distance");
                        var n = f.createFake(wallI, player[0].x, newY, player[0].size * 10, "#000", false, "Bottom Wall");
                        console.log("n ID: " + n.id);
                        delete getCells()[wallI];
                        getCellsArray().pop();

                        interNodes[wallI] = n;
                        interNodes[wallI].nx = player[0].nx;
                        interNodes[wallI].ny = newY;
                        interNodes[wallI].nSize = player[0].oSize * 10;
                        interNodes[wallI].updateTime = getUpdate();
                        //console.log("Added corner enemy");
                    } else {
                        //console.log("Update Wall!");
                        interNodes[wallI].updateTime = getUpdate();
                        interNodes[wallI].x = player[0].x;
                        interNodes[wallI].nx = player[0].nx;
                    }
                } else if (player[0].y > 11180 - 1000 && interNodes.hasOwnProperty(4)) {
                    delete interNodes[4];
                }

                //console.log("1) Good Angles: " + goodAngles.length + " Bad Angles: " + badAngles.length);
                //TODO: Step 1: Write code to substract angle ranges.
                console.log("---");
                var sortedInterList = [];

                for (var i = 0; i < badAngles.length; i++) {

                    var tempGroup = seperateAngle(badAngles[i]);

                    addSorted(sortedInterList, tempGroup[0]);
                    addSorted(sortedInterList, tempGroup[1]);

                }

                console.log("Bad angles added!");

                removeDuplicates(sortedInterList);
                console.log("Duplicates removed!");

                goodAngles = mergeAngles(sortedInterList);
                console.log("Angles merged");

                for (var i = 0; i < goodAngles.length; i++) {
                    if (goodAngles[i][0] != goodAngles[i][1].mod(360)) {
                        var line1 = followAngle(goodAngles[i][0], player[0].x, player[0].y, 200);
                        var line2 = followAngle((goodAngles[i][0] + goodAngles[i][1]).mod(360), player[0].x, player[0].y, 200);
                        drawLine(player[0].x, player[0].y, line1[0], line1[1], 2);
                        drawLine(player[0].x, player[0].y, line2[0], line2[1], 2);

                        drawArc(line1[0], line1[1], line2[0], line2[1], player[0].x, player[0].y, 1);

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
                    var line1 = followAngle(perfectAngle, player[0].x, player[0].y, 300);

                    var stuffToEat = false;

                    for (var i = 0; i < clusterAllFood.length; i++) {
                        //console.log("Before: " + clusterAllFood[i][2]);
                        //This is the cost function. Higher is better.

                        var clusterAngle = getAngle(clusterAllFood[i][0], clusterAllFood[i][1], player[0].x, player[0].y);

                        var angleValue = valueAngleBased(clusterAngle, bIndex);

                        if (angleValue > 0) {
                            clusterAllFood[i][2] = clusterAllFood[i][2] * 6 + angleValue - computeDistance(clusterAllFood[i][0], clusterAllFood[i][1], player[0].x, player[0].y);
                            stuffToEat = true;
                            clusterAllFood[i][3] = true;
                        } else {
                            clusterAllFood[i][2] = -1;
                            clusterAllFood[i][3] = false;
                        }


                        if (angleValue > 0) {

                            drawPoint(clusterAllFood[i][0], clusterAllFood[i][1], 1, "");
                            //drawPoint(clusterAllFood[i][0], clusterAllFood[i][1], 1, "" + clusterAllFood[i][2]);
                        } else {
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
                        drawLine(player[0].x, player[0].y, bestFoodI[0], bestFoodI[1], 1);
                    } else {
                        drawLine(player[0].x, player[0].y, line1[0], line1[1], 7);
                        tempMoveX = line1[0];
                        tempMoveY = line1[1];
                    }

                    //drawLine(player[0].x, player[0].y, tempMoveX, tempMoveY, 1);
                } else {
                    for (var i = 0; i < clusterAllFood.length; i++) {
                        //console.log("mefore: " + clusterAllFood[i][2]);
                        //This is the cost function. Higher is better.

                        var clusterAngle = getAngle(clusterAllFood[i][0], clusterAllFood[i][1], player[0].x, player[0].y);

                        clusterAllFood[i][2] = clusterAllFood[i][2] * 6 - computeDistance(clusterAllFood[i][0], clusterAllFood[i][1], player[0].x, player[0].y);
                        //console.log("Current Value: " + clusterAllFood[i][2]);

                        //(goodAngles[bIndex][1] / 2 - (Math.abs(perfectAngle - clusterAngle)));

                        clusterAllFood[i][3] = clusterAngle;


                        drawPoint(clusterAllFood[i][0], clusterAllFood[i][1], 1, "");
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
                    drawLine(player[0].x, player[0].y, tempMoveX, tempMoveY, 1);
                }

                drawPoint(tempPoint[0], tempPoint[1], tempPoint[2], "");
                //drawPoint(tempPoint[0], tempPoint[1], tempPoint[2], "" + Math.floor(computeDistance(tempPoint[0], tempPoint[1], I, J)));
                //drawLine(tempPoint[0], tempPoint[1], player[0].x, player[0].y, 6);
                //console.log("Slope: " + slope(tempPoint[0], tempPoint[1], player[0].x, player[0].y) + " Angle: " + getAngle(tempPoint[0], tempPoint[1], player[0].x, player[0].y) + " Side: " + (getAngle(tempPoint[0], tempPoint[1], player[0].x, player[0].y) - 90).mod(360));
                tempPoint[2] = 1;
            }
            console.log("MOVING RIGHT NOW!");
            f.setPoint(tempMoveX, tempMoveY);
        }
    }

    function screenToGameX(x) {
        return (x - getWidth() / 2) / getRatio() + getX();
    }

    function screenToGameY(y) {
        return (y - getHeight() / 2) / getRatio() + getY();;
    }

    function drawPoint(x_1, y_1, drawColor, text) {
        f.drawPoint(x_1, y_1, drawColor, text);
    }

    function drawArc(x_1, y_1, x_2, y_2, x_3, y_3, drawColor) {
        f.drawArc(x_1, y_1, x_2, y_2, x_3, y_3, drawColor);
    }

    function drawLine(x_1, y_1, x_2, y_2, drawColor) {
        f.drawLine(x_1, y_1, x_2, y_2, drawColor);
    }

    function customRender(d) {
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
        d.lineWidth = 1;

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
                var text = new ca(18, (ea ? '#F2FBFF' : '#111111'));

                text.setValue(dText[i]);
                var textRender = text.render();
                d.drawImage(textRender, dPoints[i][0], dPoints[i][1]);
            }

        }
        d.lineWidth = 1;

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
        var text = new ca(18, (getDarkBool() ? '#F2FBFF' : '#111111'));

        for (var i = 0; i < debugStrings.length; i++) {
            text.setValue(debugStrings[i]);
            var textRender = text.render();
            d.drawImage(textRender, 20, offsetValue);
            offsetValue += textRender.height;
        }
    }

    function screenDistance() {
        console.log("Trying to get screen distance");
        var temp = f.getScreenDistance();
        console.log("Got distance!");
        return temp;
    }

    function getDarkBool() {
        return f.getDarkBool();
    }

    function getMassBool() {
        return f.getMassBool();
    }

    function getMemoryCells() {
        return f.getMemoryCells();
    }

    function getCellsArray() {
        return f.getCellsArray();
    }

    function getCells() {
        return f.getCells();
    }

    function getPlayer() {
        return f.getPlayer();
    }

    function getWidth() {
        return f.getWidth();
    }

    function getHeight() {
        return f.getHeight();
    }

    function getRatio() {
        return f.getRatio();
    }

    function getOffsetX() {
        return f.getOffsetX();
    }

    function getOffsetY() {
        return f.getOffsetY();
    }

    function getX() {
        return f.getX();
    }

    function getY() {
        return f.getY();
    }

    function getPointX() {
        return f.getPointX();
    }

    function getPointY() {
        return f.getPointY();
    }

    function getMouseX() {
        return f.getMouseX();
    }

    function getMouseY() {
        return f.getMouseY();
    }

    function getUpdate() {
        return f.getLastUpdate();
    }
})(window, jQuery);
