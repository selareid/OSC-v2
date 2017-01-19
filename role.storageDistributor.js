require('global');
require('prototype.creep')();
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep) {

        creep.creepSpeech(room);

        var flagToGoTo = room.find(FIND_FLAGS, {filter: (f) => f.memory.type == 'storageDistributorGoTo' && f.pos.roomName == creep.room.name})[0];
        if (flagToGoTo && creep.pos != flagToGoTo.pos) {
            creep.moveTo(flagToGoTo);
        }
        else {

            if (creep.memory.working == true && _.sum(creep.carry) == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.working = true;
            }

            if (creep.memory.working == true) {
                //if carry is full
                var storage = room.storage;
                creep.transfer(storage, RESOURCE_ENERGY);
            }
            else {
                //if carry is empty
                var linkWithEnergy = creep.pos.findInRange(global[room.name].links, 1, {filter: (s) => s.energy > 0})[0];
                creep.withdraw(linkWithEnergy, RESOURCE_ENERGY);
            }
        }
    }
};