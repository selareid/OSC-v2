require('global');
require('prototype.creepSpeech')();

var type1 = require ('role.type1');

module.exports = {
    run: function(creep) {

        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {
            var structure = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);

            if (structure) {
                if (creep.build(structure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
            }
            else {
                var tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (t) => t.structureType == STRUCTURE_TOWER
                && t.energy < t.energyCapacity});
                if (tower) {
                    if (creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(tower);
                    }
                }
                else {
                    type1.run(creep);
                }
            }
        }
        else {

            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source) {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source)
                }
            }
        }
    }
};