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

/*
Copyright 2015 Devin Ryan

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this project except in compliance with the License. You may obtain a copy of
the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by
applicable law or agreed to in writing, software distributed under the License
is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
either express or implied. See the License for the specific language governing
permissions and limitations under the License.
*/

// ==UserScript==
// @name        AposBot
// @namespace   AposBot
// @include     http://agar.io/*
// @version     3.564
// @grant       none
// @author      http://www.twitch.tv/apostolique
// ==/UserScript==

var aposBotVersion = 3.564;

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
(function(f, g) {
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

    f.botList.push(["AposBot " + aposBotVersion, findDestination]);

    var bList = g('#bList');
    g('<option />', {value: (f.botList.length - 1), text: "AposBot"}).appendTo(bList);

    //var PlayerTracker = require('../PlayerTracker');

    function BotPlayer() {
        //PlayerTracker.apply(this, Array.prototype.slice.call(arguments));
        //this.color = gameServer.getRandomColor();

        // AI only
        this.everything = f.getMemoryCells();
        this.gameState = 0;
        this.path = [];
        this.cells = f.getPlayer();

        this.predators = []; // List of cells that can eat this bot
        this.threats = []; // List of cells that can eat this bot but are too far away
        this.prey = []; // List of cells that can be eaten by this bot
        this.food = [];
        this.foodImportant = []; // Not used - Bots will attempt to eat this regardless of nearby prey/predators
        this.virus = []; // List of viruses

        this.juke = false;

        this.target;
        this.targetVirus; // Virus used to shoot into the target

        this.ejectMass = 0; // Amount of times to eject mass
        this.oldPos = {x: 0, y:0};
    }

    //module.exports = BotPlayer;
    //BotPlayer.prototype = new PlayerTracker();

    // Functions

    BotPlayer.prototype.getLowestCell = function() {
        // Gets the cell with the lowest mass
        if (this.cells.length <= 0) {
            return null; // Error!
        }

        // Starting cell
        var lowest = this.cells[0];
        for (i = 1; i < this.cells.length; i++) {
            if (lowest.size > this.cells[i].size) {
                lowest = this.cells[i];
            }
        }
        return lowest;
    };

/**
    // Override

    BotPlayer.prototype.updateSightRange = function() { // For view distance
        var range = 1000; // Base sight range

        if (this.cells[0]) {
            range += this.cells[0].getSize() * 2.5;
        }

        this.sightRangeX = range;
        this.sightRangeY = range;
    };
**/
    BotPlayer.prototype.isMe = function(cell){
        for (var i = 0; i < this.cells.length; i++) {
            if (cell.id == this.cells[i].id) {
                return true;
            }
        }
        return false;
    };

    BotPlayer.prototype.getType = function(cellInput){
        //TODO:
        //Make this work XD
    };

    BotPlayer.prototype.update = function() { // Overrides the update function from player tracker
        /**
        // Remove nodes from visible nodes if possible
        for (var i = 0; i < this.nodeDestroyQueue.length; i++) {
            var index = this.visibleNodes.indexOf(this.nodeDestroyQueue[i]);
            if (index > -1) {
                this.visibleNodes.splice(index, 1);
            }
        }

        // Update every 500 ms
        if ((this.tickViewBox <= 0) && (this.gameServer.run)) {
            this.visibleNodes = this.calcViewBox();
            this.tickViewBox = 10;
        } else {
            this.tickViewBox--;
            return;
        }

        // Respawn if bot is dead
        if (this.cells.length <= 0) {
            this.gameServer.gameMode.onPlayerSpawn(this.gameServer,this);
            if (this.cells.length == 0) {
                // If the bot cannot spawn any cells, then disconnect it
                this.socket.close();
                return;
            }
        }
        **/
        //TODO:
        //make sure there is other respawn code
        // Calc predators/prey
        var cell = this.getLowestCell();
        var r = cell.size;
        this.clearLists();

        // Ignores targeting cells below this mass
        var ignoreMass = Math.min((cell.size * cell.size / 10), 150); 

        // Loop
        for (i in this.everything) {
            var check = this.everything[i];

            // Cannot target itself
            if (!this.isMe(check)){
                continue;
            }

            var t = this.getType(check);
            switch (t) {
                case 0:
                    // Cannot target teammates
                    //TODO:
                    //make getTeam function or alternative
                    if (f.getMode() == ":teams") {
                        var currentColor = cell.color;

                        var currentRed = parseInt(currentColor.substring(1,3), 16);
                        var currentGreen = parseInt(currentColor.substring(3,5), 16);
                        var currentBlue = parseInt(currentColor.substring(5,7), 16);

                        var currentTeam = getTeam(currentRed, currentGreen, currentBlue);

                        var cellColor = check.color;

                        var cellRed = parseInt(cellColor.substring(1,3), 16);
                        var cellGreen = parseInt(cellColor.substring(3,5), 16);
                        var cellBlue = parseInt(cellColor.substring(5,7), 16);

                        var cellTeam = getTeam(cellRed, cellGreen, cellBlue);

                        if (currentTeam == cellTeam && this.getType() != 2) {
                            continue;
                        }
                    }

                    // Check for danger
                    if (cell.size * cell.size > (check.size * cell.size * 1.25)) {
                        // Add to prey list
                        this.prey.push(check);
                    } else if (check.mass > (cell.mass * 1.25)) {
                        // Predator
                        var dist = this.getDist(cell, check) - (r + check.size());
                        if (dist < 300) {
                            this.predators.push(check);
                            if ((this.cells.length == 1) && (dist < 0)) {
                                this.juke = true;
                            }
                        }
                        this.threats.push(check);
                    } else {
                        this.threats.push(check);
                    }
                    break;
                case 1:
                    this.food.push(check);
                    break;
                case 2: // Virus
                    this.virus.push(check);
                    break;
                case 3: // Ejected mass
                    if (cell.size * cell.size > 20) {
                        this.food.push(check);
                    }
                    break;
                default:
                    break;
            }
        }

        // Get gamestate
        var newState = this.getState(cell);
        if ((newState != this.gameState) && (newState != 4)) {
            // Clear target
            this.target = null;
        }
        this.gameState = newState;

        // Action
        this.decide(cell);

        this.nodeDestroyQueue = []; // Empty

    };

    // Custom

    BotPlayer.prototype.clearLists = function() {
        this.predators = [];
        this.threats = [];
        this.prey = [];
        this.food = [];
        this.virus = [];
        this.juke = false;
    };

    BotPlayer.prototype.getState = function(cell) {
        // Continue to shoot viruses
        if (this.gameState == 4) {
            return 4;
        }

        // Check for predators
        if (this.predators.length <= 0) {
            if (this.prey.length > 0) {
                return 3;
            } else if (this.food.length > 0) {
                return 1;
            }
        } else if (this.threats.length > 0) {
            if ((this.cells.length == 1) && (cell.mass > 180)) {
                var t = this.getBiggest(this.threats);
                var tl = this.findNearbyVirus(t,500,this.virus);
                if (tl != false) {
                    this.target = t;
                    this.targetVirus = tl;
                    return 4;
                }
            } else {
                // Run
                return 2;
            }
        }

        // Bot wanders by default
        return 0;
    };

    BotPlayer.prototype.decide = function(cell) {
        // The bot decides what to do based on gamestate
        switch (this.gameState) {
            case 0: // Wander
                //console.log("[Bot] "+cell.getName()+": Wandering");
                if ((this.centerPos.x == this.mouse.x) && (this.centerPos.y == this.mouse.y)) {
                    // Get a new position
                    var index = Math.floor(Math.random() * this.gameServer.nodes.length);
                    var randomNode = this.gameServer.nodes[index];
                    var pos = {x: 0, y: 0};

                    if ((randomNode.getType() == 3) || (randomNode.getType() == 1)) {
                        pos.x = randomNode.position.x;
                        pos.y = randomNode.position.y;
                    } else {
                        // Not a food/ejected cell
                        pos = this.gameServer.getRandomPosition();
                    }

                    // Set bot's mouse coords to this location
                    this.mouse = {x: pos.x, y: pos.y};
                }
                break;
            case 1: // Looking for food
                //console.log("[Bot] "+cell.getName()+": Getting Food");
                if ((!this.target) || (this.visibleNodes.indexOf(this.target) == -1)) {
                    // Food is eaten/out of sight... so find a new food cell to target
                    this.target = this.findNearest(cell,this.food);

                    this.mouse = {x: this.target.position.x, y: this.target.position.y};
                }
                break;
            case 2: // Run from (potential) predators
                var avoid = this.combineVectors(this.predators);
                //console.log("[Bot] "+cell.getName()+": Fleeing from "+avoid.getName());

                // Find angle of vector between cell and predator
                var deltaY = avoid.y - cell.position.y;
                var deltaX = avoid.x - cell.position.x;
                var angle = Math.atan2(deltaX,deltaY);

                // Now reverse the angle
                if (angle > Math.PI) {
                    angle -= Math.PI;
                } else {
                    angle += Math.PI;
                }

                // Direction to move
                var x1 = cell.position.x + (500 * Math.sin(angle));
                var y1 = cell.position.y + (500 * Math.cos(angle));

                this.mouse = {x: x1, y: y1};

                // Cheating
                if (cell.mass < 250) {
                    cell.mass += 1;
                } 

                if (this.juke) {
                    // Juking
                    this.gameServer.splitCells(this);
                }

                break;
            case 3: // Target prey
                if ((!this.target) || (cell.mass < (this.target.mass * 1.25)) || (this.visibleNodes.indexOf(this.target) == -1)) {
                    this.target = this.getRandom(this.prey);
                }
                //console.log("[Bot] "+cell.getName()+": Targeting "+this.target.getName());


                this.mouse = {x: this.target.position.x, y: this.target.position.y};

                var massReq = 1.25 * (this.target.mass * 2 ); // Mass required to splitkill the target

                if ((cell.mass > massReq) && (this.cells.length == 1)) { // Will not split into more than 2 cells
                    var splitDist = (4 * (cell.getSpeed() * 5)) + (cell.getSize() * 1.75); // Distance needed to splitkill
                    var distToTarget = this.getAccDist(cell,this.target); // Distance between the target and this cell

                    if (splitDist >= distToTarget) {
                        if ((this.threats.length > 0) && (this.getBiggest(this.threats).mass > (1.25 * (cell.mass/2)))) {
                            // Dont splitkill when they are cells that can possibly eat you after the split
                            break;
                        }
                        // Splitkill
                        this.gameServer.splitCells(this);
                    }
                }
                break;
            case 4: // Shoot virus
                if ((!this.target) || (!this.targetVirus) ||(!this.cells.length == 1) || (this.visibleNodes.indexOf(this.target) == -1) || (this.visibleNodes.indexOf(this.targetVirus) == -1)) {
                    this.gameState = 0; // Reset
                    this.target = null;
                    break;
                }

                // Make sure target is within range
                var dist = this.getDist(this.targetVirus,this.target) - (this.target.getSize() + 100);
                if (dist > 500) {
                    this.gameState = 0; // Reset
                    this.target = null;
                    break;
                }

                // Find angle of vector between target and virus
                var angle = this.getAngle(this.target,this.targetVirus);

                // Now reverse the angle
                var reversed = this.reverseAngle(angle);

                // Get this bot cell's angle
                var ourAngle = this.getAngle(cell,this.targetVirus);

                // Check if bot cell is in position
                if ((ourAngle <= (reversed + .25) ) && (ourAngle >= (reversed - .25) )) {
                    // In position!
                    this.mouse = {x: this.targetVirus.position.x, y: this.targetVirus.position.y};

                    // Shoot
                    for (var v = 0; v < 7 ;v++) {
                        this.gameServer.ejectMass(this);
                    }

                    // Back to starting pos
                    this.mouse = {x: cell.position.x, y: cell.position.y};

                    // Cleanup
                    this.gameState = 0; // Reset
                    this.target = null;
                } else {
                    // Move to position
                    var r = cell.getSize();
                    var x1 = this.targetVirus.position.x + ((350 + r) * Math.sin(reversed));
                    var y1 = this.targetVirus.position.y + ((350 + r) * Math.cos(reversed));
                    this.mouse = {x: x1, y: y1};
                }

                // console.log("[Bot] "+cell.getName()+": Targeting (virus) "+this.target.getName());
                break;
            default:
                //console.log("[Bot] "+cell.getName()+": Idle "+this.gameState);
                this.gameState = 0;
                break;
        }

        // Recombining
        if (this.cells.length > 1) {
            var r = 0;
            // Get amount of cells that can merge
            for (var i in this.cells) {
                if (this.cells[i].recombineTicks == 0) {
                    r++;
                }
            }
            // Merge 
            if (r >= 2) {
                this.mouse.x = this.centerPos.x;
                this.mouse.y = this.centerPos.y;
            }
        } 
    };

    // Finds the nearest cell in list
    BotPlayer.prototype.findNearest = function(cell,list) {
        if (this.currentTarget) {
            // Do not check for food if target already exists
            return null;
        }

        // Check for nearest cell in list
        var shortest = list[0];
        var shortestDist = this.getDist(cell,shortest);
        for (var i = 1; i < list.length; i++) {
            var check = list[i];
            var dist = this.getDist(cell,check);
            if (shortestDist > dist) {
                shortest = check;
                shortestDist = dist;
            }
        }

        return shortest;
    };

    BotPlayer.prototype.getRandom = function(list) {
        // Gets a random cell from the array
        var n = Math.floor(Math.random() * list.length);
        return list[n];
    };

    BotPlayer.prototype.combineVectors = function(list) {
        // Gets the angles of all enemies approaching the cell
        var pos = {x: 0, y: 0};
        var check;
        for (var i = 0; i < list.length; i++) {
            check = list[i];
            pos.x += check.position.x;
            pos.y += check.position.y;
        }

        // Get avg
        pos.x = pos.x/list.length;
        pos.y = pos.y/list.length;

        return pos;
    };

    BotPlayer.prototype.checkPath = function(cell,check) {
        // Checks if the cell is in the way

        // Get angle of vector (cell -> path)
        var v1 = Math.atan2(cell.position.x - this.mouse.x,cell.position.y - this.mouse.y);

        // Get angle of vector (virus -> cell)
        var v2 = this.getAngle(check,cell);
        v2 = this.reverseAngle(v2);

        if ((v1 <= (v2 + .25) ) && (v1 >= (v2 - .25) )) {
            return true;
        } else {
            return false;
        }
    };

    BotPlayer.prototype.getBiggest = function(list) {
        // Gets the biggest cell from the array
        var biggest = list[0];
        for (var i = 1; i < list.length; i++) {
            var check = list[i];
            if (check.mass > biggest.mass) {
                biggest = check;
            }
        }

        return biggest;
    };

    BotPlayer.prototype.findNearbyVirus = function(cell,checkDist,list) {
        var r = cell.getSize() + 100; // Gets radius + virus radius
        for (var i = 0; i < list.length; i++) {
            var check = list[i];
            var dist = this.getDist(cell,check) - r;
            if (checkDist > dist) {
                return check;
            }
        }
        return false; // Returns a bool if no nearby viruses are found
    };

    BotPlayer.prototype.checkPath = function(cell,check) {
        // Get angle of path
        var v1 = Math.atan2(cell.position.x - player.mouse.x,cell.position.y - player.mouse.y);

        // Get angle of vector (cell -> virus)
        var v2 = this.getAngle(cell,check);
        var dist = this.getDist(cell,check);

        var inRange = Math.atan((2 * cell.getSize())/dist); // Opposite/adjacent
        console.log(inRange);
        if ((v1 <= (v2 + inRange)) && (v1 >= (v2 - inRange))) {
            // Path collides
            return true;
        } 

        // No collide
        return false;
    }

    BotPlayer.prototype.getDist = function(cell,check) {
        // Fastest distance - I have a crappy computer to test with :(
        var xd = (check.position.x - cell.position.x);
        xd = xd < 0 ? xd * -1 : xd; // Math.abs is slow

        var yd = (check.position.y - cell.position.y);
        yd = yd < 0 ? yd * -1 : yd; // Math.abs is slow

        return (xd + yd);
    };

    BotPlayer.prototype.getAccDist = function(cell,check) {
        // Accurate Distance
        var xs = check.position.x - cell.position.x;
        xs = xs * xs;

        var ys = check.position.y - cell.position.y;
        ys = ys * ys;

        return Math.sqrt( xs + ys );
    };

    BotPlayer.prototype.getAngle = function(c1,c2) {
        var deltaY = c1.position.y - c2.position.y;
        var deltaX = c1.position.x - c2.position.x;
        return Math.atan2(deltaX,deltaY);
    };

    BotPlayer.prototype.reverseAngle = function(angle) {
        if (angle > Math.PI) {
            angle -= Math.PI;
        } else {
            angle += Math.PI;
        }
        return angle;
    };



})(window, jQuery);
