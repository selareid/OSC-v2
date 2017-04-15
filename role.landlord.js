require('global');
require('prototype.creepSpeech')();
require('prototype.creep')();

module.exports = {
    run: function (room, creep) {
//Memory.rooms[room].clm
//Memory.rooms[room].rsv
        var roomToGoTo = creep.memory.lndR;

        if (!roomToGoTo) {
            creep.memory.lndR = this.findRoomToDo(room, creep);
            creep.memory.qR = this.whatQueue(room, creep.memory.lndR);
        }
        else if (!creep.memory.qR) creep.memory.qR = this.whatQueue(room, creep.memory.lndR);
        else {
            if (creep.pos.roomName == roomToGoTo) {
                if (creep.memory.qR == 'reserve') {

                    if (creep.room.controller && creep.room.controller.reservation && creep.room.controller.reservation.ticksToEnd >= 5000) {
                        delete creep.memory.lndR;
                        delete creep.memory.qR;
                    }
                    switch (creep.reserveController(creep.room.controller)) {
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(creep.room.controller, {reusePath: 21, maxRooms: 1});
                            break;
                        case ERR_INVALID_TARGET:
                            creep.attackController(creep.room.controller);
                            break;
                    }

                }
                else if (creep.memory.qR == 'claim') {

                    if (Game.rooms[roomToGoTo] && Game.rooms[roomToGoTo].controller && Game.rooms[roomToGoTo].controller.my === false) {
                        switch (creep.claimController(creep.room.controller)) {
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(creep.room.controller, {reusePath: 21, maxRooms: 1});
                                break;
                            case ERR_INVALID_TARGET:
                                creep.attackController(creep.room.controller);
                                break;
                        }
                    }
                    else {
                        delete creep.memory.lndR;
                        delete creep.memory.qR;
                    }

                }
            }
            else {
                creep.moveTo(new RoomPosition(25, 25, roomToGoTo), {reusePath: 21, range: 23});
            }


        }
    },

    findRoomToDo: function (room) {
        for (let claimRoom_it in Memory.rooms[room].clm) {
            let claimRoom = Game.rooms[Memory.rooms[room].clm[claimRoom_it]];
            if (!claimRoom) return claimRoom.name;
            if (!claimRoom.controller) Memory.rooms[room].clm.splice(0, 1);
            if (claimRoom.controller.my) Memory.rooms[room].clm.splice(0, 1);

            return claimRoom.name;
        }

        return _.filter(Memory.rooms[room].rsv, function (r_it) {
            let r = Game.rooms[r_it];
            if (!r) return r_it;

            if (!r.controller) Game.notify(r_it + ' reserve room for room ' + room.name + " doesn't have a controller");

            if (!r.controller.reservation) return r_it;
            if (!r.controller.reservation.ticksToEnd < 3000) return r_it;
        })[0];
    },

    whatQueue: function (room, roomToCheck) {
        if (!roomToCheck) return;
        if (!typeof roomToCheck == 'string') roomToCheck = roomToCheck.room;

        var queue;

        for (let clmR of Memory.rooms[room].clm) {
            if (clmR == roomToCheck) queue = 'claim';
        }

        for (let rsvR of Memory.rooms[room].rsv) {
            if (rsvR == roomToCheck) queue = 'reserve';
        }

        return queue;
    }
};