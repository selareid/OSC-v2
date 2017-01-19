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
            else if (creep.memory.working == false && _.sum(creep.carry) >= creep.carryCapacity - (creep.getActiveBodyparts(WORK) * 2)) {
                creep.memory.working = true;
            }

            var containers = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER
            });

            // if working if true do stuff or else mine
            if (creep.memory.working == true) {
                this.dropEnergy(room, creep, containers);
            }
            else {
                this.harvest(room, creep, containers);
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

    dropEnergy: function (room, creep, containers) {
        //if link found transfer energy to it
        // else if container found put transfer energy to container
        // if container full drop energy

        var container = _.filter(containers, (s) => _.sum(s.store) < s.storeCapacity)[0];
        var link = creep.pos.findInRange(global[room.name].links, 1, {filter: (l) => l.energy < l.energyCapacity})[0];

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

    harvest: function (room, creep, containers) {
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
                case ERR_NOT_ENOUGH_ENERGY:
                    if (creep.carry[RESOURCE_ENERGY] > 0) {
                        var container = _.filter(containers, (s) => s.hits < s.hitsMax)[0];
                        if (container) {
                            creep.repair(container);
                        }
                    }
                    else {
                        var containerWithEnergy = _.filter(containers, (c) => c.store[RESOURCE_ENERGY] > 0)[0];
                        creep.withdraw(containerWithEnergy, RESOURCE_ENERGY, (creep.carryCapacity-1));
                    }
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