// ==UserScript==
// @name        AposBot
// @namespace   AposBot
// @include     http://agar.io/
// @version     3.05
// @grant       none
// @author      http://www.twitch.tv/apostolique
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
        g('#locationUnknown').append(g('<select id="bList" class="form-control" onchange="setBotIndex($(this).val());" />'));
        g('#locationUnknown').addClass('form-group');
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


    function compareSize(player1, player2, ratio) {
        if (player1.size * player1.size * ratio < player2.size * player2.size) {
            return true;
        }
        return false;
    }

    function canSplit(player1, player2) {
        return compareSize(player1, player2, 2.30) && !compareSize(player1, player2, 9);
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
                //Check this see if this is still right.
                if (interNodes[element].d && compareSize(interNodes[element], player[0], 1.10) && !compareSize(interNodes[element], player[0], 1.15)) {
                    return true;
                }
                return false;
            }, interNodes);
        }

        return dotList;
    }

    function getAll() {
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
                if (!isMe) {
                    return true;
                }
                return false;
            }
        }, interNodes);

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
                if (!isMe && (!interNodes[element].d && compareSize(player[i], interNodes[element], 1.30))) {
                    return true;
                } else if (interNodes[element].d && compareSize(interNodes[element], player[i], 1.30)) {
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
                if (!isMe && !interNodes[element].d && compareSize(interNodes[element], player[i], 1.30) || (interNodes[element].size <= 11)) {
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

        if (canSplit(blob1, blob2)) {
            radius += 710;
        } else {
            radius += blob1.size * 2;
        }

        var shouldInvert = false;

        if (computeDistance(px, py, cx, cy) <= radius) {
            radius = computeDistance(px, py, cx, cy) - 5;
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

        /*if (shouldInvert) {
            var temp = angleLeft;
            angleLeft = (angleRight + 180).mod(360);
            angleRight = (temp + 180).mod(360);
            angleDistance = (angleRight - angleLeft).mod(360);
        }*/

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
        var group1 = [angle1, false, -1];

        var angle2 = rangeToAngle(range);
        var group2 = [angle2, true, 1];
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
            var sectionCount = 0;
            var i = 1;
            while (i < sortedLength) {
                if (lastValue == listToUse[i][0]) {
                    if (seriesStartIndex == -1) {
                        seriesStartIndex = i - 1;
                    }

                    if (listToUse[seriesStartIndex][1] != listToUse[i][1]) {
                        removeFirst = true;
                    }
                    listToUse[(i - 1).mod(sortedLength)][2] += listToUse[i][2];
                    //console.log("Merging: " + listToUse[(i - 1).mod(sortedLength)][2]);
                    listToUse.splice(i, 1);
                    sortedLength--;
                    i--;

                } else {
                    if (removeFirst) {
                        listToUse[(seriesStartIndex - 1).mod(sortedLength)][2] += listToUse[seriesStartIndex][2];
                        //console.log("Merging: " + listToUse[(seriesStartIndex - 1).mod(sortedLength)][2]);
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

        var recursiveList = [];
        var recursiveCount = 0;

        for (var i = 0; i < listToUse.length; i++) {
            if (!listToUse[i][1]) {
                recursiveCount -= listToUse[i][2];
                recursiveList.push(recursiveCount);
            }
            else {
                recursiveCount -= listToUse[i][2];
                recursiveList.push(recursiveCount);
            }
        }

        var smallestCount = recursiveList[0];
        var smallestIndex = 0;

        for (var i = 1; i < recursiveList.length; i++) {
            if (recursiveList[i] < smallestCount) {
                smallestCount = recursiveList[i];
                smallestIndex = i;
            }
        }

        return smallestIndex;
    }

    function mergeAngles(listToUse) {
        var startIndex = findFirstUpArrow(listToUse);
        var angleList = [];
        var recursiveCount = 0;
        if (listToUse.length > 0) {
            var currentArrow = true;
            var currentAngle = listToUse[startIndex][0];

            for (var i = 1; i < listToUse.length; i++) {
                //console.log("i: " + i + " length: " + listToUse.length + " offset: " + startIndex);
                if (listToUse[(startIndex + i).mod(listToUse.length)][1] != currentArrow && !currentArrow && recursiveCount > 0) {
                    //console.log("-1, " + listToUse[(startIndex + i).mod(listToUse.length)][2]);
                    recursiveCount -= listToUse[(startIndex + i).mod(listToUse.length)][2];
                    //console.log("Unskip " + recursiveCount);
                } else if (listToUse[(startIndex + i).mod(listToUse.length)][1] == currentArrow && currentArrow) {
                    currentAngle = listToUse[(startIndex + i).mod(listToUse.length)][0];
                } else if (listToUse[(startIndex + i).mod(listToUse.length)][1] != currentArrow && currentArrow) {
                    //console.log("Add good angle: " + recursiveCount);
                    currentArrow = false;
                    var endAngle = listToUse[(startIndex + i).mod(listToUse.length)][0];
                    var diff = (endAngle - currentAngle).mod(360);
                    angleList.push([currentAngle, diff]);
                } else if (listToUse[(startIndex + i).mod(listToUse.length)][1] != currentArrow && !currentArrow) {
                    //console.log("Ready for take off " + recursiveCount);
                    currentArrow = true;
                    currentAngle = listToUse[(startIndex + i).mod(listToUse.length)][0];
                } else if (listToUse[(startIndex + i).mod(listToUse.length)][1] == currentArrow && !currentArrow) {
                    //console.log("1, " + listToUse[(startIndex + i).mod(listToUse.length)][2]);
                    recursiveCount -= listToUse[(startIndex + i).mod(listToUse.length)][2];
                    currentArrow = false;
                    //console.log("Skip angle " + recursiveCount);
                }
                //console.log("");
            }
            /*if (currentArrow) {
                console.log("Was this needed?");
                var endAngle = listToUse[(startIndex - 1).mod(listToUse.length)][0];
                var diff = (endAngle - currentAngle).mod(360);
                angleList.push([currentAngle, diff]);
            }*/
        }
        return angleList;
    }

    //listToUse contains angles in the form of [angle, boolean].
    //boolean is true when the range is starting. False when it's ending.
    //range = [[angle1, true], [angle2, false]]
    function addAngle(listToUse, range) {
        //#1 Find first open element
        //#2 Try to add range1 to the list. If it is within other range, don't add it, set a boolean.
        //#3 Try to add range2 to the list. If it is withing other range, don't add it, set a boolean.

        var startIndex = 0;

        if (listToUse.length > 0 && !listToUse[0][1]) {
            startIndex = 1;
        }

        var startMark = 0;
        var startBool = false;

        for (var i = 0; i < listToUse.length; i++) {
            var angle1 = listToUse[(i + startIndex).mod(listToUse.length)][0]; 
            var angle2 = listToUse[(i + 1 + startIndex).mod(listToUse.length)][0];

            console.log("Current Index: " + (i + startIndex).mod(listToUse.length) + " angle: " + angle1 + ", " + angle2);

            var segmentRange = (angle2 - angle1).mod(360);

            if (angleIsWithin(range[0][0], [angle1, segmentRange])) {

                startMark = (i + 1 + startIndex).mod(listToUse.length);

                if (i.mod(2) == 0) {
                    startBool = true;
                }

                break;
            }

            //If startBool is false, add range[0] to array at index startMark.
        }

        var endMark = 0;
        var endBool = false;

        for (var i = 0; i < listToUse.length; i++) {
            var angle1 = listToUse[(i + startIndex).mod(listToUse.length)][0]; 
            var angle2 = listToUse[(i + 1 + startIndex).mod(listToUse.length)][0];

            var segmentRange = (angle2 - angle1).mod(360);

            if (angleIsWithin(range[1][0], [angle1, segmentRange])) {

                endMark = (i + 1 + startIndex).mod(listToUse.length);

                if (i.mod(2) == 0) {
                    endBool = true;
                }

                break;
            }
        }

        if (startMark <= endMark) {
            var tempLen = listToUse.length;

            if (!startBool) {
                tempLen++;
            }

            if (!endBool) {
                console.log("Truly added end: " + endMark + " value: " + range[1]);
                listToUse.splice(endMark, 0, range[1]);
                //endMark = (endMark + 1).mod(tempLen);
            }
            if (!startBool) {
                console.log("Truly added sta: " + startMark + " value: " + range[0]);
                listToUse.splice(startMark, 0, range[0]);
                //startMark = (startMark + 1).mod(listToUse.length);
            }
        } else {
            var tempLen = listToUse.length;

            if (!endBool) {
                tempLen++;
            }

            if (!startBool) {
                console.log("Truly added sta: " + startMark + " value: " + range[0]);
                listToUse.splice(startMark, 0, range[0]);
                //startMark = (startMark + 1).mod(tempLen);
            }
            if (!endBool) {
                console.log("Truly added end: " + endMark + " value: " + range[1]);
                listToUse.splice(endMark, 0, range[1]);
                //endMark = (endMark + 1).mod(listToUse.length);
            }
        }

        console.log("Okay... " + startMark + ", " + endMark + " len: " + listToUse.length + " sb:" + startBool + " eb: " + endBool);

        /*if (startBool && endBool) {
            startMark = (startMark - 1).mod(listToUse.length);
        }*/

        for (var i = 0; i < listToUse.length; i++) {
            console.log("Hands are clean: " + i + " " + listToUse[i]);
        }

        var startDist = (listToUse[startMark][0] - range[0][0]).mod(360);
        var endDist = (listToUse[endMark][0] - range[1][0]).mod(360);

        if (startMark != endMark && listToUse.length > 2) {
            console.log("I really should get rid of someone.");
            var diff = (endMark - startMark);

            if (endMark > startMark) {
                for (var i = endMark; i > (endMark - diff); i--) {
                    console.log("#lolRekt1 " + (i).mod(listToUse.length) + " value: " + listToUse[(i).mod(listToUse.length)][0]);
                    listToUse.splice((i).mod(listToUse.length), 1);
                }
            } else {
                for (var i = endMark - 1; i >= 0; i--) {
                    console.log("#lolRekt2 " + (i).mod(listToUse.length) + " value: " + listToUse[(i).mod(listToUse.length)][0]);
                    listToUse.splice((i).mod(listToUse.length), 1);
                    startMark = (startMark - 1).mod(listToUse.length);
                }
                console.log("Secret agent! Keep out: " + (listToUse.length - 1) + " to " + startMark);
                for (var i = listToUse.length - 1; i > startMark; i--) {
                    console.log("#lolRekt3 " + (i).mod(listToUse.length) + " value: " + listToUse[(i).mod(listToUse.length)][0]);
                    listToUse.splice((i).mod(listToUse.length), 1);
                }
            }
        } else if (startMark != endMark) {
            console.log("startMark: " + startMark + " endMark " + endMark);
        } else if (startMark == endMark && startBool && endBool && startDist < endDist) {
            for (var i = listToUse.length - 1; i >= 0; i--) {
                console.log("#lolRekt4 " + (i).mod(listToUse.length) + " value: " + listToUse[(i).mod(listToUse.length)][0]);
                listToUse.splice((i).mod(listToUse.length), 1);
            }
        }

        return listToUse;
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
                drawCircle(player[0].x, player[0].y, player[0].size + 710, 5);
                //drawPoint(player[0].x, player[0].y - player[0].size, 3, "" + Math.floor(player[0].x) + ", " + Math.floor(player[0].y));

                //var allDots = processEverything(interNodes);

                var allPossibleFood = null;
                allPossibleFood = getAllFood(); // #1

                var allPossibleThreats = getAllThreats();
                //console.log("Internodes: " + interNodes.length + " Food: " + allPossibleFood.length + " Threats: " + allPossibleThreats.length);

                var badAngles = [];

                var isSafeSpot = true;
                var isMouseSafe = true;

                var clusterAllFood = clusterFood(allPossibleFood, player[0].size);

                for (var i = 0; i < allPossibleThreats.length; i++) {

                    var enemyDistance = computeDistance(allPossibleThreats[i].x, allPossibleThreats[i].y, player[0].x, player[0].y);


                    if (canSplit(player[0], allPossibleThreats[i])) {
                        drawCircle(allPossibleThreats[i].x, allPossibleThreats[i].y, allPossibleThreats[i].size + 710, 0);
                    } else {
                        drawCircle(allPossibleThreats[i].x, allPossibleThreats[i].y, allPossibleThreats[i].size + player[0].size + player[0].size, 3);
                    }

                    if (allPossibleThreats[i].danger && f.getLastUpdate() - allPossibleThreats[i].dangerTimeOut > 1000) {

                        allPossibleThreats[i].danger = false;
                    }

                    if ((canSplit(player[0], allPossibleThreats[i]) && enemyDistance < allPossibleThreats[i].size + 710 + player[0].size) || (!canSplit(player[0], allPossibleThreats[i]) && enemyDistance < allPossibleThreats[i].size + player[0].size + player[0].size)) {

                        allPossibleThreats[i].danger = true;
                        allPossibleThreats[i].dangerTimeOut = f.getLastUpdate();
                    }

                    if ((canSplit(player[0], allPossibleThreats[i]) && enemyDistance < allPossibleThreats[i].size + 710 + player[0].size) || (!canSplit(player[0], allPossibleThreats[i]) && enemyDistance < allPossibleThreats[i].size + player[0].size) || allPossibleThreats[i].danger) {

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

                        var lineLeft = followAngle(leftAngle, player[0].x, player[0].y, 200 + player[0].size - i * 10);
                        var lineRight = followAngle(rightAngle, player[0].x, player[0].y, 200 + player[0].size - i * 10);
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
                }

                var goodAngles = [];
                //TODO: Add wall angles here. Hardcoding temporary values.
                if (player[0].x < 1000 && badAngles.length > 0) {
                    //LEFT
                    //console.log("Left");
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
                        interNodes[wallI].L = getUpdate();
                        //console.log("Added corner enemy");
                    } else {
                        //console.log("Update Wall!");
                        interNodes[wallI].L = getUpdate();
                        interNodes[wallI].y = player[0].y;
                    }
                } else if (player[0].x < 1000 && interNodes.hasOwnProperty(1)) {
                    delete interNodes[1];
                }
                if (player[0].y < 1000 && badAngles.length > 0) {
                    //TOP
                    //console.log("TOP");
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
                        interNodes[wallI].L = getUpdate();
                        //console.log("Added corner enemy");
                    } else {
                        //console.log("Update Wall!");
                        interNodes[wallI].L = getUpdate();
                        interNodes[wallI].x = player[0].x;
                    }
                } else if (player[0].y < 1000 && interNodes.hasOwnProperty(2)) {
                    delete interNodes[2];
                }
                if (player[0].x > 11180 - 1000 && badAngles.length > 0) {
                    //RIGHT
                    //console.log("RIGHT");
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
                        interNodes[wallI].L = getUpdate();
                        //console.log("Added corner enemy");
                    } else {
                        //console.log("Update Wall!");
                        interNodes[wallI].L = getUpdate();
                        interNodes[wallI].y = player[0].y;
                    }
                } else if (player[0].x > 11180 - 1000 && interNodes.hasOwnProperty(3)) {
                    delete interNodes[3];
                }
                if (player[0].y > 11180 - 1000 && badAngles.length > 0) {
                    //BOTTOM
                    //console.log("BOTTOM");
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
                        interNodes[wallI].L = getUpdate();
                        //console.log("Added corner enemy");
                    } else {
                        //console.log("Update Wall!");
                        interNodes[wallI].L = getUpdate();
                        interNodes[wallI].x = player[0].x;
                    }
                } else if (player[0].y > 11180 - 1000 && interNodes.hasOwnProperty(4)) {
                    delete interNodes[4];
                }

                var stupidList = [];

                for (var i = 0; i < badAngles.length; i++) {
                    var angle1 = badAngles[i][0];
                    var angle2 = rangeToAngle(badAngles[i]);
                    stupidList.push([[angle1, true], [angle2, false]]);

                }

                /*stupidList.push([[0, true], [90, false]]);
                stupidList.push([[100, true], [120, false]]);
                stupidList.push([[45, true], [150, false]]);
                stupidList.push([[60, true], [140, false]]);
                stupidList.push([[270, true], [300, false]]);
                stupidList.push([[45, true], [20, false]]);*/

                console.log("Added random noob stuff.");

                var sortedInterList = [];

                for (var i = 0; i < stupidList.length; i++) {
                    console.log("Adding: " + stupidList[i][0][0] + ", " + stupidList[i][1][0]);
                    sortedInterList = addAngle(sortedInterList, stupidList[i])

                    if (sortedInterList.length == 0) {
                        break;
                    }
                }

                var offsetI = 0;

                if (sortedInterList.length > 0 && sortedInterList[0][1]) {
                    offsetI = 1;
                }

                var goodAngles = [];
                for (var i = 0; i < sortedInterList.length; i += 2) {
                    var angle1 = sortedInterList[(i + offsetI).mod(sortedInterList.length)][0];
                    var angle2 = sortedInterList[(i + 1 + offsetI).mod(sortedInterList.length)][0];
                    var diff = (angle2 - angle1).mod(360);
                    goodAngles.push([angle1, diff]);
                    console.log("Yo man! Cool stuff added man! " + angle1 + ", " + diff + ", " + angle2 + " len: " + sortedInterList.length);
                }


                console.log("Already done? That was quick.");

                for (var i = 0; i < goodAngles.length; i++) {
                    if (goodAngles[i][0] != goodAngles[i][1].mod(360)) {

                        var line1 = followAngle(goodAngles[i][0], player[0].x, player[0].y, 100 + player[0].size);
                        var line2 = followAngle((goodAngles[i][0] + goodAngles[i][1]).mod(360), player[0].x, player[0].y, 100 + player[0].size);
                        drawLine(player[0].x, player[0].y, line1[0], line1[1], 1);
                        drawLine(player[0].x, player[0].y, line2[0], line2[1], 1);

                        drawArc(line1[0], line1[1], line2[0], line2[1], player[0].x, player[0].y, 1);

                        //drawPoint(player[0].x, player[0].y, 2, "");

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

                    drawLine(player[0].x, player[0].y, line1[0], line1[1], 7);
                    tempMoveX = line1[0];
                    tempMoveY = line1[1];
                } else if (badAngles.length > 0 && goodAngles == 0) {
                    //TODO: CODE TO HANDLE WHEN THERE IS NO GOOD ANGLE BY THERE ARE ENEMIES AROUND!!!!!!!!!!!!!
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
            //console.log("MOVING RIGHT NOW!");

            console.log("______Never lied ever in my life.");

            return [tempMoveX, tempMoveY];
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

    function drawCircle(x_1, y_1, radius, drawColor) {
        f.drawCircle(x_1, y_1, radius, drawColor);
    }

    function screenDistance() {
        var temp = f.getScreenDistance();
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
