require('global');
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep) {

        if (creep.memory.w == true && _.sum(creep.carry) == 0) {
            creep.memory.w = false;
        }
        else if (creep.memory.w == false && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.w = true;
        }
        else if (!creep.memory.w) creep.memory.w = false;

        var doing = creep.memory.d;

        switch (doing) {
            case 'harvest':
                creep.say('harvest');
               this.harvest(room, creep);
                break;
            default:
                if (this.harvest(room, creep) == OK) {
                    creep.memory.d = 'harvest';
                }
        }

    },

    harvest: function (room, creep) {

        if (creep.memory.w == false) {
            // needs to harvest

            if (!creep.memory.s || !Game.getObjectById(creep.memory.s))
                creep.memory.s = global[room.name].sources[0] ? global[room.name].sources[0].id : undefined;

            var source = Game.getObjectById(creep.memory.s);

            if (!source) {
                creep.memory.s = undefined;
                return 'error no source';
            }

            var reslt = creep.harvest(source);
            switch (reslt) {
                case ERR_NOT_IN_RANGE:
                    creep.creepSpeech(room, 'movingToSource');
                    reslt = creep.moveTo(source, {reusePath: 10});
                    break;
                case OK:
                    creep.creepSpeech(room, 'harvesting');
                    break;
            }

            return reslt;
        }
        else {
            var storage = room.storage;

            if (!storage) return 'error no storage';

            var result = creep.transfer(storage, RESOURCE_ENERGY);
            switch (result) {
                case ERR_NOT_IN_RANGE:
                    creep.creepSpeech(room, 'droppingEnergy');
                    creep.moveTo(storage, {reusePath: 10});
                    break;
                case OK:
                    creep.creepSpeech(room, 'droppingEnergy');
                    return 'complete';
                    break;
            }

            return result;
        }

    }
};