require('global');
require('prototype.creep')();
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep, isUnderAttack) {
        creep.say('defend');
        if (creep.memory.w == true && creep.carry.energy == 0) {
            creep.memory.w = false;
        }
        else if (creep.memory.w == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.w = true;
        }

        if (creep.memory.w == true) {
            var towerLowerThan = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < 210});
            if (isUnderAttack === true || towerLowerThan.length > 0) {
                var tower = this.getTowerToRefill(room);
                if (tower) {
                    if (creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(tower);
                    }
                }
            }
            else {
                var defenceToRepair = this.findDefence(room, creep);

                if (defenceToRepair) {
                    if (creep.repair(defenceToRepair) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(defenceToRepair);
                    }
                }
            }
        }
        else {

            var links = _.filter(global[room.name].links, (l) => l.energy > 0);
            var storage = room.storage;

            var arrayOfBoth = links;
            arrayOfBoth.push(storage);

            var closer = creep.pos.findClosestByRange(arrayOfBoth);

            if (closer != storage) {
                if (creep.withdraw(closer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closer, {reusePath: 10})
                }
            }
            else if (storage && storage.store[RESOURCE_ENERGY] > 1000) {
                if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, {reusePath: 10})
                }
            }
            else {
                var container = creep.findContainer(room);
                if (container) {
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container)
                    }
                }
            }
        }
    },

    findDefence: function (room, creep) {
        var minDefenceLevel = Memory.rooms[room].minDefenceLevel;
        if (!Memory.rooms[room].minDefenceLevel) {
            Memory.rooms[room].minDefenceLevel = 100000;
            minDefenceLevel = 100000;
        }

        var structures = room.find(FIND_STRUCTURES,
            {filter: (s) => (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) && s.hits < minDefenceLevel});

        var structure = creep.pos.findClosestByRange(structures);

        if (!structure) {
            Memory.rooms[room].minDefenceLevel = minDefenceLevel + 10000;
            return;
        }

        return structure;
    },

    getTowerToRefill: function (room) {
        var towers = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});

        if (towers.length > 0) {

            var tower = _.min(towers, 'energy');

            if (tower) {
                return tower;
            }
            else {
                return undefined;
            }

        }
        else {
            return undefined;
        }

    }
};