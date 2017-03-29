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

        if (creep.memory.w == false) {
            this.getEnergy(room, creep)
        }
        else {
            var doing = creep.memory.d;

            var result;

            switch (doing) {
                case 'filler':
                    creep.say('filler');
                    result = this.filler(room, creep);
                    break;
                case 'upgrade':
                    creep.say('upgrading');
                    result = this.upgrade(room, creep);
                    break;
                default:
                    if (this.filler(room, creep) == OK) {
                        creep.memory.d = 'filler';
                    }
                    else if (this.upgrade(room, creep) == OK) {
                        creep.memory.d = 'upgrade';
                    }
            }

            if (result != OK) delete creep.memory.d;



    },

    getEnergy: function (room, creep) {
        var storage = room.storage;

        if (!storage) return 'error no storage';

        var result = creep.withdraw(storage, RESOURCE_ENERGY);
        switch (result) {
            case ERR_NOT_IN_RANGE:
                creep.creepSpeech(room, 'movingToEnergy');
                result = creep.moveTo(storage, {reusePath: 10});
                break;
            case OK:
                creep.creepSpeech(room, 'movingToEnergy');
                break;
        }

        return result;
    },

    findSpawnExtension: function (room, creep) {
        var spawns = _.filter(global[room.name].spawns, (s) => s.energy < s.energyCapacity);
        var extensions = _.filter(global[room.name].extensions, (s) => s.energy < s.energyCapacity);
        return creep.pos.findClosestByRange(spawns.concat(extensions));
    },

    filler: function (room, creep) {

            var spawnExtension = this.findSpawnExtension(room, creep);

            if (spawnExtension) {
                switch (creep.transfer(spawnExtension, RESOURCE_ENERGY)) {
                    case ERR_NOT_IN_RANGE:
                        return creep.moveTo(spawnExtension);
                        break;
                    case OK:
                        return OK;
                        break;
                }
            }
            else {
                var tower = _.filter(global[room.name].towers, (t) => t.energy < t.energyCapacity);
                if (tower) {
                    switch (creep.transfer(tower, RESOURCE_ENERGY)) {
                        case ERR_NOT_IN_RANGE:
                            return creep.moveTo(tower);
                            break;
                        case OK:
                            return OK;
                            break;
                    }
                }
                else return 'complete';

            }

    },

    upgrade: function (room, creep) {
        var controller = room.controller;

        var reslt = creep.upgradeController(controller);
        switch (reslt) {
            case ERR_NOT_IN_RANGE:
                creep.creepSpeech(controller, 'upgrading');
                reslt = creep.moveTo(controller, {reusePath: 10});
                break;
            case OK:
                creep.creepSpeech(room, 'upgrading');
                break;
        }

        return reslt;

    }
};