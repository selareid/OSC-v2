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
     */
    Creep.prototype.placeRoadUnderCreep =
        function () {
            var lookRoads = _.filter(this.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_ROAD);
            var lookConstructionSite = this.pos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (!lookRoads.length > 0 && !lookConstructionSite.length > 0) {

                var flagNextColor = {
                    [COLOR_YELLOW]: COLOR_ORANGE,
                    [COLOR_ORANGE]: COLOR_BROWN,
                    [COLOR_BROWN]: COLOR_GREEN,
                    [COLOR_GREEN]: 'placeSite'
                };


                var flagAtPos = _.filter(this.pos.lookFor(LOOK_FLAGS), (f) => f.color == COLOR_YELLOW || f.color == COLOR_ORANGE || f.color == COLOR_BROWN || f.color == COLOR_GREEN)[0];
                if (flagAtPos) {
                    var toSet = flagNextColor[flagAtPos.color];
                    if (toSet !== 'placeSite') flagAtPos.setColor(toSet);
                    else {
                        return this.room.createConstructionSite(this.pos, STRUCTURE_ROAD);
                    }
                }
                else this.room.createFlag(this.pos, undefined, COLOR_YELLOW);
            }
        }
};