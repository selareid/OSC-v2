require('global');
require('prototype.creep');
require('prototype.creepSpeech')();

module.exports = {

    run: function (room, creep, remoteCreepFlags) {

        remoteCreepFlags = _.filter(remoteCreepFlags, (f) => f.memory.numberOfRemoteMiners !== undefined);

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
                    creep.moveTo(remoteFlag, {reusePath: 37, ignoreCreeps: true});
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
            var amountOfCreepsAssignedToThisFlag = _.filter(Game.creeps, (c) => c.memory.room == room.name && c.memory.role == 'remoteMiner' && c.memory.remoteFlag == flag.name).length;
            if (amountOfCreepsAssignedToThisFlag < flag.memory.numberOfRemoteMiners) {
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
        if (creep.memory.working == true && _.sum(creep.carry) == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && _.sum(creep.carry) >= creep.carryCapacity) {
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
                for (let resourceType in creep.carry) {
                    creep.transfer(container, resourceType);
                }
            }
            else {
                creep.creepSpeech(room, 'droppingEnergy');
                for (let resourceType in creep.carry) {
                    creep.drop(resourceType);
                }
            }
        }
        else {
            var mineral = creep.room.find(FIND_MINERALS)[0];

            if (mineral) {
                switch (creep.harvest(mineral)) {
                    case ERR_NOT_IN_RANGE:
                        creep.creepSpeech(room, 'movingToSource');
                        creep.moveTo(mineral);
                        break;
                    case OK:
                        creep.creepSpeech(room, 'harvesting');
                        break;
                }
            }
            else console.log('Creep ' + creep.name + "says there's no extractor in room " + creep.pos.roomName);
        }
    }
};
