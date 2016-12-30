require('global');
require('prototype.creepSpeech')();
const roleEmergencyHarvester = require ('role.emergencyHarvester');

module.exports = {
    run: function (room, creep) {
        var numberOfDistributors = _.sum(Game.creeps, (c) => c.memory.role == 'distributor' && c.memory.room == room.name);
        if (numberOfDistributors <= 0) {
            roleEmergencyHarvester.run(room, creep);
        }
        else {
            //changes state
            if (creep.memory.working == true && _.sum(creep.carry) == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && _.sum(creep.carry) >= creep.carryCapacity) {
                creep.memory.working = true;
            }

            // if working if true do stuff or else mine
            if (creep.memory.working == true) {
                this.dropEnergy(room, creep);
            }
            else {
                this.harvest(room, creep);
            }

        }

    },

    findSource: function (room, creep, harvesters) {

        var takenSources = [];

        for (let harvester of harvesters) {
            if (harvester.memory.source) {
                takenSources.push(harvester.memory.source);
            }
        }

        var source = creep.pos.findClosestByPath(FIND_SOURCES, {filter: (s) => !takenSources.includes(s.id)});
        if (source) {
            return source;
        }
        else {
            return creep.pos.findClosestByPath(FIND_SOURCES);
        }

    },

    dropEnergy: function (room, creep) {
        //if link found transfer energy to it
        // else if container found put transfer energy to container
        // if container full drop energy

        var link = creep.pos.findInRange(global[room.name].links, 1, {filter: (l) => l.energy < l.energyCapacity})[0];

        var container = creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER
            && _.sum(s.store) < s.storeCapacity
        })[0];

        if (container) {
            creep.creepSpeech(room, 'droppingEnergyContainer');
            creep.transfer(container, RESOURCE_ENERGY);
        }
        else {
            if (link) {
                creep.creepSpeech(room, 'droppingEnergyLink');
                creep.transfer(link, RESOURCE_ENERGY);
            }
            else {
                creep.creepSpeech(room, 'droppingEnergy');
                creep.drop(RESOURCE_ENERGY);
            }
        }
    },

    harvest: function (room, creep) {
        if (!creep.memory.source) {
            var harvesters = _.filter(Game.creeps, c => c.memory.role == 'harvester' && c.memory.room == room.name && c.spawning == false && c.name != creep.name);

            if (harvesters > room.find(FIND_SOURCES).length) {
                var creepNearestToDeath = _.min(harvesters, 'tickToLive');
                if (creepNearestToDeath && creepNearestToDeath.memory.source) {
                    creep.memory.source = creepNearestToDeath.memory.source;
                }
                else {
                    let foundSource = this.findSource(room, creep, harvesters);
                    if (foundSource) {
                        creep.memory.source = foundSource.id;
                    }
                }
            }
            else {
                let foundSource = this.findSource(room, creep, harvesters);
                if (foundSource) {
                    creep.memory.source = foundSource.id;
                }
            }



            console.log('harvesters calculating source');
        }

        var source = Game.getObjectById(creep.memory.source);

        if (source) {
            switch (creep.harvest(source)) {
                case ERR_NOT_IN_RANGE:
                    creep.creepSpeech(room, 'movingToSource');
                    creep.moveTo(source, {reusePath: 10});
                    break;
                case OK:
                    creep.creepSpeech(room, 'harvesting');
                    break;
            }
        }
        else {
            delete creep.memory.source;
        }
    }
};