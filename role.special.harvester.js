require('global');
require('prototype.creepSpeech')();

const roleDistributor = require('role.distributor');

module.exports = {
    run: function (room, creep) {
        
        if (creep.memory.w == true && _.sum(creep.carry) == 0) {
            creep.memory.w = false;
        }
        else if (creep.memory.w == false && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.w = true;
        }

        var doing = creep.memory.d;

        switch (doing) {
            case 'harvest':
                creep.say('harvest');
                this.harvest(room, creep);
                break;
            default:
                if (this.harvest(room, creep) == OK) {
                    creep.memory.doing = 'harvest';
                }
                else {
                    roleDistributor.run(room, creep, 2090);
                }
        }
        
        
    },
    
    harvest: function (room, creep) {

        if (creep.memory.w == false) {
            // needs to harvest

            if (!creep.memory.s || !Game.getObjectById(creep.memory.s))
                creep.memory.s = global[room.name].sources;

            var source = Game.getObjectById(creep.memory.s);

            if (!source) {
                delete creep.memory.s;
                return 'error no source';
            }

            var reslt = creep.harvest(source);
            switch (reslt) {
                case ERR_NOT_IN_RANGE:
                    creep.creepSpeech(room, 'movingToSource');
                    creep.moveTo(source, {reusePath: 10});
                    reslt = OK;
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
                    break;
            }

            return result;
        }

    }
};