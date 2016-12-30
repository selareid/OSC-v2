require('global');
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep) {
        var spawn = room.find(FIND_MY_SPAWNS)[0];


        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {
            if (spawn.energy < spawn.energyCapacity) {
                var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_SPAWN
                    && s.energy < s.energyCapacity
                });
            }
            else {
                var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_EXTENSION
                });
            }

            if (structure) {
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.creepSpeech(room, 'movingToSpawn');
                    creep.moveTo(structure);

                }
            }
        }
        else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            switch (creep.harvest(source)) {
                case ERR_NOT_IN_RANGE:
                    creep.creepSpeech(room, 'movingToSource');
                    creep.moveTo(source);
                    break;
                case OK:
                    creep.creepSpeech(room, 'harvesting');
                    break;
            }
        }
    }
};