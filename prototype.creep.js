require('global');

module.exports = function () {
    Creep.prototype.findDroppedEnergy =
        function (room) {
            var droppedEnergy = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: (e) => e.amount > 1000 && e.resourceType == RESOURCE_ENERGY});
            if (droppedEnergy) {
                return droppedEnergy;
            }
            else {
                droppedEnergy = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: (e) => e.amount > 500 && e.resourceType == RESOURCE_ENERGY});
                if (droppedEnergy) {
                    return droppedEnergy;
                }
                else {
                    droppedEnergy = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: (e) => e.amount > 100 && e.resourceType == RESOURCE_ENERGY});
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

    Creep.prototype.findLinksEnergy =
        function (room = Game.rooms[this.memory.room]) {
            return _.filter(global[room.name].links, (link) => link.energy > 0 && global['linkRole'][link.id] == 'taker');
        };
};
