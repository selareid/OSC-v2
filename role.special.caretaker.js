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

            var spawnExtensions = this.findSpawnExtension(room, creep);
            if (spawnExtensions) this.filler(room, creep, spawnExtensions);
            else {
                var buildSites = room.find(FIND_MY_CONSTRUCTION_SITES);
                if (buildSites.length) {
                    this.build(room, creep, creep.pos.findClosestByRange(buildSites))
                }
                else {
                    var tower = _.filter(global[room.name].towers, (t) => t.energy < t.energyCapacity)[0];
                    if (tower) this.towerFiller(room, creep, tower);
                    else this.upgrade(room, creep);
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

    findSpawnExtension: function (room, creep) {
        var spawns = _.filter(global[room.name].spawns, (s) => s.energy < s.energyCapacity);
        var extensions = _.filter(global[room.name].extensions, (s) => s.energy < s.energyCapacity);

        var concatted = spawns.concat(extensions);
        if (concatted.length <= 0) return;
        return creep.pos.findClosestByRange(concatted);
    },

    filler: function (room, creep, spawnExtension) {

        if (!spawnExtension) return;

        switch (creep.transfer(spawnExtension, RESOURCE_ENERGY)) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(spawnExtension);
                break;
            case OK:
                break;
        }

    },

    towerFiller: function (room, creep, tower) {
        if (tower) {
            switch (creep.transfer(tower, RESOURCE_ENERGY)) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(tower);
                    break;
                case OK:
                    break;
            }
        }
    },

    build: function (room, creep, constructionSite) {
        if (!constructionSite) return;

        var reslt = creep.build(constructionSite);
        switch (reslt) {
            case ERR_NOT_IN_RANGE:
                creep.creepSpeech(room, 'building');
                reslt = creep.moveTo(constructionSite, {reusePath: 7});
                break;
            case OK:
                creep.creepSpeech(room, 'building');
                break;
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

    }
};
