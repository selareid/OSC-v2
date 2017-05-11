require('global');
require('prototype.creep');
require('prototype.creepSpeech')();
require('prototype.creepWar')();

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
                    creep.moveTo(new RoomPosition(25, 25, remoteRoom), {reusePath: 21, range: 20, ignoreRoads: true});
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
            let rrSpilt = rr.split(',');
            let rroomName = rrSpilt[0];

            rrSpilt[3] = Number.parseInt(rrSpilt[3]);
            let guardRoom = Number.isNaN(rrSpilt[3]) || global.isUndefinedOrNull(rrSpilt[3]) || rrSpilt[3] < 1;

            if (guardRoom === true) continue;

            let amountOfCreepsAssignedToThisRoom = _.filter(Game.creeps, (c) => c.memory.room == room.name && c.memory.role == 'remoteGuard' && c.memory.rr == rroomName).length;

            if (amountOfCreepsAssignedToThisRoom < rrSpilt[3]) {
                zeChosenRoom = rroomName;
                break;
            }
        }

        return zeChosenRoom;
    },

    realRun: function (room, creep) {
        creep.creepSpeech(room);

        var target = this.getTarget(creep.room, creep);
        if (target) {
            if (creep.hasActiveBodyparts(HEAL) && creep.hits < creep.hitsMax*0.5) creep.heal(creep);
            else {
                var rsl = creep.attack(target);
                if (rsl != OK && creep.hasActiveBodyparts(HEAL)) creep.heal(creep);
            }
            creep.moveTo(target, {reusePath: 3, ignoreRoads: true});
        }
        else {
            if (creep.hasActiveBodyparts(HEAL) && creep.hits < creep.hitsMax) creep.heal(creep);

            var SKL = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_KEEPER_LAIR});
            if (SKL.length > 0) {
                var next = _.min(SKL, (kl) => kl.ticksToSpawn);
                if (!global.isUndefinedOrNull(next)) {
                    creep.moveTo(next, {reusePath: 3, ignoreRoads: true})
                }
            }
        }
    },

    getTarget: function (room, creep) {
        var targets = _.filter(room.find(FIND_HOSTILE_CREEPS), (c) => !global.Allies.includes(c.owner.username));

        if (targets.length > 0) {
            return creep.pos.findClosestByRange(targets);
        }
    }
};


/*
 *Notes:
 * global.Allies
 */
