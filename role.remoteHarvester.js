require('global');
require('prototype.creep');
require('prototype.creepSpeech')();

module.exports = {

    run: function (room, creep, remoteCreepFlags) {
        creep.say('yeah');
        if (remoteCreepFlags.length > 0) {

            var creepRemoteFlag = creep.memory.remoteFlag;

            if (!creepRemoteFlag) {
                creep.memory.remoteFlag = this.setRemoteFlagMemory(room, creep, remoteCreepFlags);
                creepRemoteFlag = creep.memory.remoteFlag;
            }

            var remoteFlag = Game.flags[creepRemoteFlag];

            if (remoteFlag) {
                if (creep.pos.roomName != remoteFlag.pos.roomName) {
                    creep.moveTo(remoteFlag, {reusePath: 37});
                }
                else {
                    this.realRun(room, creep);
                }
            }
            else {
                creep.runInSquares();
            }

        }
        else {
            creep.runInSquares();
        }
    },

    setRemoteFlagMemory: function (room, creep, remoteCreepFlags) {

        var zeChosenFlag;

                for (let flag of remoteCreepFlags) {
                    var amountOfCreepsAssignedToThisFlag = _.filter(Game.creeps, (c) => c.memory.room == room.name && c.memory.role == 'remoteHarvester' && c.memory.remoteFlag == flag.name).length;
                    if (amountOfCreepsAssignedToThisFlag < flag.memory.numberOfRemoteHarvesters) {
                        zeChosenFlag = flag;
                        break;
                    }
                }


        if (zeChosenFlag) {
            return zeChosenFlag.name;
        }
        else {
            return undefined;
        }
    },

    realRun: function (room, creep) {
creep.say('harvester remote');

        //changes state
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy >= creep.carryCapacity) {
            creep.memory.working = true;
        }

        // if working if true do stuff or else mine
        if (creep.memory.working == true) {

            //if container found put transfer energy to container if container full drop energy

            var container = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER
                && _.sum(s.store) < s.storeCapacity
            })[0];

            if (container) {
                creep.creepSpeech(room, 'droppingEnergyContainer');
                creep.transfer(container, RESOURCE_ENERGY);
            }
            else {
                creep.creepSpeech(room, 'droppingEnergy');
                creep.drop(RESOURCE_ENERGY);
            }
        }
        else {

            if (!creep.memory.source) {
                var harvesters = _.filter(Game.creeps, c => c.memory.role == 'remoteHarvester' && c.memory.room == room.name && c.spawning == false && c.name != creep.name);
                var takenSources = [];

                for (let harvester of harvesters) {
                    if (harvester.memory.source) {
                        takenSources.push(harvester.memory.source);
                    }
                }

                creep.memory.source = this.findSource(room, creep, takenSources).id;
                global.creepLog('calculating source', creep, room);
            }
            else {

                var source = Game.getObjectById(creep.memory.source);

                if (source) {
                    switch (creep.harvest(source)) {
                        case ERR_NOT_IN_RANGE:
                            creep.creepSpeech(room, 'movingToSource');
                            creep.moveTo(source, {reusePath: 37});
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
        }
    },

    findSource: function (room, creep, takenSources) {

        var source = creep.pos.findClosestByPath(FIND_SOURCES, {filter: (s) => !takenSources.includes(s.id)});
        if (source) {
            return source;
        }
        else {
            return creep.pos.findClosestByRange(FIND_SOURCES);
        }

    }
};
