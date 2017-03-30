require('global');
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep, roomFlagToGiveEnergyTo) {

        creep.say('helper!!');

        var roomToGiveEnergyTo = roomFlagToGiveEnergyTo.room;

        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {

            if (creep.room.name === roomToGiveEnergyTo.name) {

                var storage = roomToGiveEnergyTo.storage;

                if (storage) {
                    if (storage.store[RESOURCE_ENERGY] <= 200000) {
                        if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage, {reusePath: 40, ignoreCreeps: true});
                        }
                    }
                    else {
                        roomFlagToGiveEnergyTo.remove();
                    }
                }
                else {

                    var structure = creep.findClosestByRange(FIND_STRUCTURES, {
                        filter: (s) => (s.structureType == STRUCTURE_SPAWN && s.energy < s.energyCapacity)
                        || (s.structureType == STRUCTURE_CONTAINER && _.sum(s.store) < s.storeCapacity)
                    });

                    if (structure) {
                        if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(structure);
                        }
                    }
                    else {
                        global.creepErrorLog('could not find structure in room' + creep + room);
                    }
                }
            }
            else {
                creep.moveTo(roomFlagToGiveEnergyTo);
            }
        }
        else {

            if (creep.room.name === room.name) {
                var storage = room.storage;

                if (storage.store[RESOURCE_ENERGY] >= 200000) {
                    if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage);
                    }
                }
                else {
                    roomFlagToGiveEnergyTo.remove();
                }
            }
            else {
                creep.moveTo(room.controller);
            }

        }
    }
};
