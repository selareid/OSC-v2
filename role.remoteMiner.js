require('global');
require('prototype.creep');
require('prototype.creepSpeech')();

const remoteHarvester = require('role.remoteHarvester');

module.exports = {

    run: function (room, creep) {

        var remoteRooms = Memory.rooms[room].rmtR;

        if (!remoteRooms || remoteRooms.length > 0) {
            var remoteRoom = creep.memory.rr;

            if (!remoteRoom) {
                creep.memory.rr = this.setRemoteRoomMemory(room, creep, remoteRooms);
                remoteRoom = creep.memory.rr;
            }

            if (remoteRoom) {
                if (creep.pos.roomName != remoteRoom) {
                    creep.moveTo(new RoomPosition(25, 25, remoteRoom), {reusePath: 21, range: 23});
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

    setRemoteRoomMemory: function (room, creep, remoteRooms) {

        var zeChosenRoom;

        for (let rr of remoteRooms) {
            let rroomName = rr.split(',')[0];
            let rrMiners = rr.split(',')[2];

            if (rrMiners == undefined) continue;

            let amountOfCreepsAssignedToThisRoom = _.filter(Game.creeps, (c) => c.memory.room == room.name && c.memory.role == 'remoteMiner' && c.memory.rr == rroomName).length;

            if (amountOfCreepsAssignedToThisRoom < rrMiners) {
                zeChosenRoom = rroomName;
                break;
            }
        }

        return zeChosenRoom;
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
            if (!creep.memory.mineral) {
                var foundMineral = creep.room.find(FIND_MINERALS)[0];
                creep.memory.mineral = foundMineral ? foundMineral.id : undefined;
            }

            var mineral = Game.getObjectById(creep.memory.mineral);

            if (mineral && !mineral.ticksToRegeneration) {
                    switch (creep.harvest(mineral)) {
                        case ERR_NOT_IN_RANGE:
                            creep.creepSpeech(room, 'movingToSource');
                            creep.moveTo(mineral, {reusePath: 37, maxRooms: 1});
                            break;
                        case OK:
                            creep.creepSpeech(room, 'harvesting');
                            break;
                    }
            }
            else remoteHarvester.realRun(room, creep);
        }
    }
};
