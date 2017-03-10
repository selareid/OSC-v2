require('global');
require('prototype.creepSpeech')();
require('prototype.creep')();

module.exports = {
    run: function (room, creep) {

        var flag = Game.flags[creep.memory.flag];

        if (!flag) {
            creep.memory.flag = this.findFlagToDo(room, creep);
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
                    if (creep.room.controller.reservation.ticksToEnd >= 4500) creep.memory.flag = this.findFlagToDo(room, creep);
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
                creep.moveTo(flag.pos, {reusePath: 21});
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

    findFlagToDo: function (room, creep, claimFlags = this.findClaimFlags(room, creep), reserveFlags = this.findReserveFlags(room, creep)) {

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
                        if (controller.reservation.ticksToEnd < 3000) {
                            if (amountOfCreepsAssignedToThisFlag < 1) {
                                return flag.name;
                            }
                            else {
                                if (amountOfCreepsAssignedToThisFlag <= 2 && creep.getActiveBodyparts(CLAIM) == 1) {
                                    return flag.name;
                                }
                            }
                        }
                        else if (controller.reservation.ticksToEnd < 4000) return flag.name;
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