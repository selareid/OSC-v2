require('global');
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep) {

        var flag = Game.flags[creep.memory.flag];

        if (!flag) {
            let claimFlags = this.findClaimFlags(room, creep);
            let reserveFlags = this.findReserveFlags(room, creep);
            creep.memory.flag = this.findFlagToDo(room, creep, claimFlags, reserveFlags);
        }
        else {
            
            if (creep.pos.roomName == flag.pos.roomName) {
                if (flag.memory.type == 'claimFlag') {
                    if (flag.room && flag.room.controller && flag.room.controller.my === false) {
                        switch (creep.claimController(creep.room.controller)) {
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(creep.room.controller);
                                break;
                            case ERR_INVALID_TARGET:
                                creep.attackController(creep.room.controller);
                                break;
                        }
                    }
                    else {
                        flag.remove();
                    }

                }
                else if (flag.memory.type == 'reserveFlag') {
                    switch (creep.reserveController(creep.room.controller)) {
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(creep.room.controller);
                            break;
                        case ERR_INVALID_TARGET:
                            creep.attackController(creep.room.controller);
                            break;
                    }
                }
            }
            else {
                creep.moveTo(flag.pos);
            }


        }
    },

    findClaimFlags: function (room, creep) {
        var claimFlags = [];
        _.forEach(_.filter(Game.flags, (f) => f.memory.type == 'claimFlag' && f.memory.room == creep.memory.room), function (flag) {
            claimFlags.push(flag);
        });
        return claimFlags;
    },

    findReserveFlags: function (room, creep) {
        var reserveFlags = [];
        _.forEach(_.filter(Game.flags, (f) => f.memory.type == 'reserveFlag' && f.memory.room == creep.memory.room), function (flag) {
            reserveFlags.push(flag);
        });
        return reserveFlags;
    },

    findFlagToDo: function (room, creep, claimFlags, reserveFlags) {

        for (let flag of claimFlags) {

            let myCreepsNearby = _.filter(Game.creeps, (c) => c.memory.role == 'landlord' && c.memory.room == flag.memory.room && c.memory.flag == flag.name)[0];

            if (!myCreepsNearby) {
                return flag.name;
            }
        }
        for (let flag of reserveFlags) {
            var amountOfCreepsAssignedToThisFlag = _.filter(Game.creeps, (c) => c.memory.room == room.name && c.memory.role == 'landlord' && c.memory.flag == flag.name).length;
            if (flag.room) {
                var controller = flag.room.controller;
                if (controller) {
                    if (controller.reservation) {
                        if (controller.reservation.ticksToEnd > 2500) {
                            if (amountOfCreepsAssignedToThisFlag < 1) {
                                return flag.name;
                            }
                        }
                        else {
                            if (amountOfCreepsAssignedToThisFlag < 2) {
                                return flag.name;
                            }
                        }
                    }
                    else {
                        if (amountOfCreepsAssignedToThisFlag < 2) {
                            return flag.name;
                        }
                    }
                }
                else {
                    flag.remove();
                }
            }
            else {
                return flag.name;
            }
        }
    }
};
