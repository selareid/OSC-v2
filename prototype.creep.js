require('global');

module.exports = function () {
    Creep.prototype.findDroppedEnergy =
        function (room) {
            var droppedEnergy = this.pos.findClosestByRange(FIND_DROPPED_ENERGY, {filter: (e) => e.amount > 1000});
            if (droppedEnergy) {
                return droppedEnergy;
            }
            else {
                droppedEnergy = this.pos.findClosestByRange(FIND_DROPPED_ENERGY, {filter: (e) => e.amount > 500});
                if (droppedEnergy) {
                    return droppedEnergy;
                }
                else {
                    droppedEnergy = this.pos.findClosestByRange(FIND_DROPPED_ENERGY, {filter: (e) => e.amount > 100});
                    if (droppedEnergy) {
                        return droppedEnergy;
                    }
                    else {
                        return undefined;
                    }
                }
            }
        };

    Creep.prototype.findContainer =
        function (room) {
            var allContainersInRoom = room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
            });

            if (allContainersInRoom.length > 0) {

                var containerEnergy = _.max(allContainersInRoom, '.store.energy').store.energy - 400;


                var container = this.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY]
                    && s.store[RESOURCE_ENERGY] >= containerEnergy
                });


                if (container) {
                    return container;
                }
                else {
                    return undefined;
                }
            }
            else {
                return undefined;
            }
        };

    Creep.prototype.runInSquares =
        function () {
            var creep = this;
            switch (creep.memory.lastMove) {
                case TOP:
                    creep.memory.lastMove = LEFT;
                    creep.move(LEFT);
                    break;
                case LEFT:
                    creep.memory.lastMove = BOTTOM;
                    creep.move(BOTTOM);
                    break;
                case BOTTOM:
                    creep.memory.lastMove = RIGHT;
                    creep.move(RIGHT);
                    break;
                case RIGHT:
                    creep.memory.lastMove = TOP;
                    creep.move(TOP);
                    break;
                default:
                    creep.memory.lastMove = TOP;
                    creep.move(TOP);
            }
        };

    /**
     * Creep method optimizations "getActiveBodyparts"
     * credits to proximo
     */
    Creep.prototype.getActiveBodyparts = function (type) {
        var count = 0;
        for (var i = this.body.length; i-- > 0;) {
            if (this.body[i].hits > 0) {
                if (this.body[i].type === type) {
                    count++;
                }
            } else break;
        }
        return count;
    };

    /**
     * Fast check if bodypart exists
     * credits to proximo
     */
    Creep.prototype.hasActiveBodyparts = function (type) {
        for (var i = this.body.length; i-- > 0;) {
            if (this.body[i].hits > 0) {
                if (this.body[i].type === type) {
                    return true;
                }
            } else break;
        }
        return false;
    };

    /**
     * Places road construction site under creep if there is none
     * they're stored as follows
     * roomName,x,y,level
     */
    Creep.prototype.placeRoadUnderCreep =
        function (room = this.room) {
            var lookRoads = _.filter(this.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_ROAD);
            var lookConstructionSite = this.pos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (!lookRoads.length > 0 && !lookConstructionSite.length > 0) {
                var entryInMemory = _.filter(Memory.rooms[room].roadSites, (s) => s.split(',')[0] == this.pos.roomName
                && s.split(',')[1] == this.pos.x && s.split(',')[2])[0];

                if (entryInMemory) {
                    var numberOfStepsNeeded = 7;
                    var level = entryInMemory.split(',')[3];
                    if (level < numberOfStepsNeeded) entryInMemory.level += 1;
                    else {
                        return this.room.createConstructionSite(this.pos, STRUCTURE_ROAD);
                    }
                }
                else Memory.rooms[room].roadSites.push(this.pos.roomName + ',' + this.pos.x + ',' + this.pos.y + ',' + 1);

                Memory.rooms[room].roadSites[Memory.rooms[room].roadSites.indexOf(entryInMemory)] = entryInMemory;
            }
        }
};