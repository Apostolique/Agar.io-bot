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

window.botList = window.botList || [];

function OgarBot() {
    this.name = "OgarBot V1";
    //his.keyAction = function(key) {};
    this.displayText = function() {return [];}; //TODO do some awesome display text
    //compat stuff (all was replaced because of easyness and stuff)
    //this.cells = getPlayer();
    //this.visibleNodes = getMemoryCells();
    //this.gameServer.nodes = getMemoryCells();

    this.gameState = 0;
    this.path = [];

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
    // Function
    this.getType = function() {
        //TODO get the type m9
        if () //dank meme
    };
    this.getLowestCell = function() {
        // Gets the cell with the lowest mass
        var myCells = getPlayer();
        if (myCells.length <= 0) {
            return null; // Error!
        }

        // Starting cell
        var lowest = myCells[0];
        for (i = 1; i < myCells.length; i++) {
            if (lowest.mass > myCells[i].mass) {
                lowest = myCells[i];
            }
        }
        return lowest;
    };

    this.mainLoop = function() { // Overrides the update function from player tracker
        //TODO make respawn code
        // Calc predators/prey
        var myCells = getPlayer();
        var allCells = getMemoryCells();
        var cell = this.getLowestCell();
        var r = cell.size;
        var player = getPlayer();
        var allMyCellsPosX = []; 
        var allMyCellsPosY = []; 
        this.clearLists();

        for (i in myCells) {
            allMyCellsPosX.push(cell[i].x);
            allMyCellsPosY.push(cell[i].y);
        }

        var left = Math.min(allMyCellsPosX);
        var right = Math.max(allMyCellsPosX);
        var top = Math.min(allMyCellsPosY);
        var bottom = Math.max(allMyCellsPosY);
        this.centerPos.x = (left + right) / 2;
        this.centerPos.y = (top + bottom) / 2;

        // Ignores targeting cells below this mass
        var ignoreMass = Math.min((cell.mass / 10), 150); 

        //sort by dist from circle edges
        allCells.sort(function(a, b){
            return (getDist(a, cell) - cell.size - a.size) - (getDist(b, cell) - cell.size - b.size);
        });
        // Loop
        for (i in this.visibleNodes) {
            var check = this.visibleNodes[i];

            // Cannot target itself
            for (var i = 0; i < player.length; i++) {
                if (check.id == player[i].id) {
                    continue;
                }
            }

            var t = check.getType();
            switch (t) {
                case 0:
                    // Cannot target teammates
                    if (getMode() == ":teams") {
                        if (check.color == cell.color) {
                            continue;
                        }
                    }

                    // Check for danger
                    if (cell.mass > (check.mass * 1.25)) {
                        // Add to prey list
                        this.prey.push(check);
                    } else if (check.mass > (cell.mass * 1.25)) {
                        // Predator
                        var dist = this.getDist(cell, check) - (r + check.size);
                        if (dist < 300) {
                            this.predators.push(check);
                            if ((myCells.length == 1) && (dist < 0)) {
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
                    if (cell.mass > 20) {
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
        var mouseX = this.mouse.x;
        var mouseY = this.mouse.y;
        mousePos = [this.mouse.x, this.mouse.y];
        return mousePos

    };

    // Custom

    this.clearLists = function() {
        this.predators = [];
        this.threats = [];
        this.prey = [];
        this.food = [];
        this.virus = [];
        this.juke = false;
    };

    this.getState = function(cell) {
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
            if ((myCells.length == 1) && (cell.mass > 180)) {
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

    this.decide = function(cell) {
        var myCells = getPlayer();
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
                        pos.x = randomNode.x;
                        pos.y = randomNode.y;
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

                    this.mouse = {x: this.target.x, y: this.target.y};
                }
                break;
            case 2: // Run from (potential) predators
                var avoid = this.combineVectors(this.predators);
                //console.log("[Bot] "+cell.getName()+": Fleeing from "+avoid.getName());

                // Find angle of vector between cell and predator
                var deltaY = avoid.y - cell.y;
                var deltaX = avoid.x - cell.x;
                var angle = Math.atan2(deltaX,deltaY);

                // Now reverse the angle
                if (angle > Math.PI) {
                    angle -= Math.PI;
                } else {
                    angle += Math.PI;
                }

                // Direction to move
                var x1 = cell.x + (500 * Math.sin(angle));
                var y1 = cell.y + (500 * Math.cos(angle));

                this.mouse = {x: x1, y: y1};

                // Cheating
                // No cheating on official agar servers :P
                /*
                if (cell.mass < 250) {
                    cell.mass += 1;
                } 
                */
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


                this.mouse = {x: this.target.x, y: this.target.y};

                var massReq = 1.25 * (this.target.mass * 2); // Mass required to splitkill the target

                var speed = 30 * Math.pow(cell.mass, -1.0 / 4.5) * 50 / 40;

                if ((cell.mass > massReq) && (myCells.length == 1)) { // Will not split into more than 2 cells
                    var splitDist = (4 * (speed * 5)) + (cell.size * 1.75); // Distance needed to splitkill
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
                if ((!this.target) || (!this.targetVirus) ||(!myCells.length == 1) || (this.visibleNodes.indexOf(this.target) == -1) || (this.visibleNodes.indexOf(this.targetVirus) == -1)) {
                    this.gameState = 0; // Reset
                    this.target = null;
                    break;
                }

                // Make sure target is within range
                var dist = this.getDist(this.targetVirus,this.target) - (this.target.size + 100);
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
                    this.mouse = {x: this.targetVirus.x, y: this.targetVirus.y};

                    // Shoot
                    for (var v = 0; v < 7 ;v++) {
                        this.gameServer.ejectMass(this);
                    }

                    // Back to starting pos
                    this.mouse = {x: cell.x, y: cell.y};

                    // Cleanup
                    this.gameState = 0; // Reset
                    this.target = null;
                } else {
                    // Move to position
                    var r = cell.size;
                    var x1 = this.targetVirus.x + ((350 + r) * Math.sin(reversed));
                    var y1 = this.targetVirus.y + ((350 + r) * Math.cos(reversed));
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
        if (myCells.length > 1) {
            var r = 0;
            // Get amount of cells that can merge
            for (var i in myCells) {
                if (myCells[i].recombineTicks == 0) {
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
    this.findNearest = function(cell,list) {
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

    this.getRandom = function(list) {
        // Gets a random cell from the array
        var n = Math.floor(Math.random() * list.length);
        return list[n];
    };

    this.combineVectors = function(list) {
        // Gets the angles of all enemies approaching the cell
        var pos = {x: 0, y: 0};
        var check;
        for (var i = 0; i < list.length; i++) {
            check = list[i];
            pos.x += check.x;
            pos.y += check.y;
        }

        // Get avg
        pos.x = pos.x/list.length;
        pos.y = pos.y/list.length;

        return pos;
    };

    this.checkPath = function(cell,check) {
        // Checks if the cell is in the way

        // Get angle of vector (cell -> path)
        var v1 = Math.atan2(cell.x - this.mouse.x, cell.y - this.mouse.y);

        // Get angle of vector (virus -> cell)
        var v2 = this.getAngle(check,cell);
        v2 = this.reverseAngle(v2);

        if ((v1 <= (v2 + .25) ) && (v1 >= (v2 - .25) )) {
            return true;
        } else {
            return false;
        }
    };

    this.getBiggest = function(list) {
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

    this.findNearbyVirus = function(cell,checkDist,list) {
        var r = cell.size + 100; // Gets radius + virus radius
        for (var i = 0; i < list.length; i++) {
            var check = list[i];
            var dist = this.getDist(cell,check) - r;
            if (checkDist > dist) {
                return check;
            }
        }
        return false; // Returns a bool if no nearby viruses are found
    };

    this.checkPath = function(cell,check) {
        // Get angle of path
        var v1 = Math.atan2(cell.x - player.mouse.x,cell.y - player.mouse.y);

        // Get angle of vector (cell -> virus)
        var v2 = this.getAngle(cell,check);
        var dist = this.getDist(cell,check);

        var inRange = Math.atan((2 * cell.size)/dist); // Opposite/adjacent
        console.log(inRange);
        if ((v1 <= (v2 + inRange)) && (v1 >= (v2 - inRange))) {
            // Path collides
            return true;
        } 

        // No collide
        return false;
    }

    this.getDist = function(cell,check) {
        // Fastest distance - I have a crappy computer to test with :(
        var xd = (check.x - cell.x);
        xd = xd < 0 ? xd * -1 : xd; // Math.abs is slow

        var yd = (check.y - cell.y);
        yd = yd < 0 ? yd * -1 : yd; // Math.abs is slow

        return (xd + yd);
    };

    this.getAccDist = function(cell,check) {
        // Accurate Distance
        var xs = check.x - cell.x;
        xs = xs * xs;

        var ys = check.y - cell.y;
        ys = ys * ys;

        return Math.sqrt( xs + ys );
    };

    this.getAngle = function(c1,c2) {
        var deltaY = c1.y - c2.y;
        var deltaX = c1.x - c2.x;
        return Math.atan2(deltaX,deltaY);
    };

    this.reverseAngle = function(angle) {
        if (angle > Math.PI) {
            angle -= Math.PI;
        } else {
            angle += Math.PI;
        }
        return angle;
    };


}
window.botList.push(new OgarBot());

window.updateBotList(); //This function might not exist yet.
