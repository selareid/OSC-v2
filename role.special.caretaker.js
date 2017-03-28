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

        if (creep.memory.w == true) {
            this.getEnergy(room, creep)
        }
        else {
            var doing = creep.memory.d;

            switch (doing) {
                case 'upgrade':
                    creep.say('upgrading');
                    this.upgrade(room, creep);
                    break;
                default:
                    if (this.upgrade(room, creep) == OK) {
                        creep.memory.doing = 'upgrade';
                    }
            }
        }

    },

    getEnergy: function (room, creep) {
        var storage = room.storage;

        if (!storage) return 'error no storage';

        var result = creep.withdraw(storage, RESOURCE_ENERGY);
        switch (result) {
            case ERR_NOT_IN_RANGE:
                creep.creepSpeech(room, 'movingToEnergy');
                creep.moveTo(storage, {reusePath: 10});
                break;
            case OK:
                creep.creepSpeech(room, 'movingToEnergy');
                break;
        }

        return result;
    },

    upgrade: function (room, creep) {
        var controller = room.controller;

        var reslt = creep.upgradeController(controller);
        switch (reslt) {
            case ERR_NOT_IN_RANGE:
                creep.creepSpeech(controller, 'upgrading');
                creep.moveTo(source, {reusePath: 10});
                break;
            case OK:
                creep.creepSpeech(room, 'upgrading');
                break;
        }

        return reslt;

    }
};