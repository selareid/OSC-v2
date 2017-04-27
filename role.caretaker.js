require('global');
require('prototype.creep')();
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep) {

        if (creep.memory.w == true && creep.carry.energy == 0) {
            creep.memory.w = false;
        }
        else if (creep.memory.w == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.w = true;
        }

        if (_.sum(creep.carry) - creep.carry.energy > 0) {
            for (let resourceType in creep.carry) {
                if (resourceType == RESOURCE_ENERGY) continue;
                creep.drop(resourceType);
            }
        }


        if (creep.memory.w == true) {
            var structureToRepair = this.findStructureToRepair(room, creep);
            if (structureToRepair) {
                creep.creepSpeech(room, 'repairing');
                creep.moveTo(structureToRepair);
                creep.repair(structureToRepair)
            }
            else {
                var structureToBuild = creep.pos.findClosestByRange(room.find(FIND_MY_CONSTRUCTION_SITES));
                if (structureToBuild) {
                    creep.creepSpeech(room, 'building');
                    creep.build(structureToBuild);
                        creep.moveTo(structureToBuild);
                }
                else {
                    var towerToRefill = this.getTowerToRefill(room);
                    if (towerToRefill) {
                        creep.creepSpeech(room, 'refillingTower');
                        if (creep.transfer(towerToRefill, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(towerToRefill, {reusePath: 10});
                        }
                    }
                    else {
                        var defenseToRepair = this.findDefence(room, creep);
                        if (defenseToRepair) {
                            creep.creepSpeech(room, 'repairingDefence');
                            creep.repair(defenseToRepair);
                            creep.moveTo(defenseToRepair);

                        }
                    }
                }
            }

        }
        else {
            var droppedEnergy = creep.findDroppedEnergy(room);

            if (!droppedEnergy) {
                droppedEnergy = [];
            }

            if (droppedEnergy.amount == undefined || droppedEnergy.amount < 1010) {
                var links = creep.findLinksEnergy();
                var storage = room.storage;

                var arrayOfBoth = links;
                arrayOfBoth.push(storage);

                var closer = creep.pos.findClosestByRange(arrayOfBoth);

                if (closer != storage) {
                    if (creep.withdraw(closer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closer, {reusePath: 10})
                    }
                }
                else if (storage && storage.store[RESOURCE_ENERGY] > 100) {
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
                    else {
                        if (creep.pickup(droppedEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(droppedEnergy)
                        }
                    }
                }
            }
            else {
                if (creep.pickup(droppedEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergy);
                }
            }
        }
    },

    findStructureToRepair: function (room, creep) {
        var structure = creep.memory.str ? Game.getObjectById(creep.memory.str) : undefined;
        
        if (structure) {
            if (structure.hits < structure.hitsMax) {
                return structure;
            }
            else {
                structure = creep.pos.findClosestByRange(room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
                    && s.hits < (s.hitsMax * 0.5)
                }));
            }
        }
        else {
            structure = creep.pos.findClosestByRange(room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
                && s.hits < (s.hitsMax * 0.5)
            }));
        }

        if (structure) creep.memory.str = structure.id;
        return structure;
    },

    findDefence: function (room, creep) {
        var minDefenceLevel = Memory.rooms[room].mdl;
        if (!Memory.rooms[room].mdl) {
            Memory.rooms[room].mdl = 100000;
            minDefenceLevel = 100000;
        }

        var structures = room.find(FIND_STRUCTURES,
            {filter: (s) => (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) && s.hits < minDefenceLevel});

        var structure = creep.pos.findClosestByRange(structures);

        if (!structure) {
            Memory.rooms[room].mdl = minDefenceLevel + 10000;
            return;
        }

        return structure;
    },

    getTowerToRefill: function (room) {
        var towers = _.filter(global[room.name].towers, (t) => t.energy < t.energyCapacity);

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
