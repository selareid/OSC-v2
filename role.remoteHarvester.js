require('global');
require('prototype.creep');
require('prototype.creepSpeech')();

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
            let rrHarvesters = rr.split(',')[1];

            let amountOfCreepsAssignedToThisRoom = _.filter(Game.creeps, (c) => c.memory.room == room.name && c.memory.role == 'remoteHarvester' && c.memory.rr == rroomName).length;

            if (amountOfCreepsAssignedToThisRoom < rrHarvesters) {
                zeChosenRoom = rroomName;
                break;
            }
        }

        return zeChosenRoom;
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
                            creep.moveTo(source, {reusePath: 37, maxRooms: 1});
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
