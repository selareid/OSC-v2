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
                    creep.moveTo(new RoomPosition(25, 25, remoteRoom), {reusePath: 21, range: 20});
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
            let guardRoom = rrSpilt[3] < 1 || !rrSpilt[3];

            if (guardRoom === true) continue;

            let amountOfCreepsAssignedToThisRoom = _.filter(Game.creeps, (c) => c.memory.room == room.name && c.memory.role == 'remoteGuard' && c.memory.rr == rroomName).length;

            if (amountOfCreepsAssignedToThisRoom < 1) {
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

            var attackResult = creep.rangedAttack(target);

            switch (attackResult) {
                case -9: // returns ERR_NOT_IN_RANGE
                    creep.moveTo(target, {reusePath: 3, ignoreRoads: true});
                    break;
                case 0: // returns OK
                    this.kite(creep.room, creep, target);
                    //creep.say something here using prototype.creepSpeech.js
                    break;
                default:
                    global.creepErrorLog('Attack Error: ' + attackResult, creep, room);
            }

        }
        else {
            if (creep.hasActiveBodyparts(HEAL) && creep.hits < creep.hitsMax) creep.heal(creep);

            var SKL = room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_KEEPER_LAIR});
            if (SKL.length > 0) {
                var next = _.min(SKL, 'ticksToSpawn');
                if (!global.isUndefinedOrNull(next)) {
                    creep.moveTo(next, {reusePath: 3})
                }
            }
        }
    },

    getTarget: function (room, creep) {
        var targets = _.filter(room.find(FIND_HOSTILE_CREEPS), (c) => !global.Allies.includes(c.owner.username));

        if (targets.length > 0) {
            return creep.pos.findClosestByRange(targets);
        }
    },

    kite: function (room, creep, target) {
        var targetDangerous = false;
        if (target.hasActiveBodyparts(ATTACK) || target.hasActiveBodyparts(RANGED_ATTACK)) {
            targetDangerous = true;
        }

        if (targetDangerous) {
            var directionToTarget = creep.pos.getDirectionTo(target);
            if (creep.pos.getRangeTo(target) <= 2) {
                var oppositeDir = global.REVERSE_DIR[directionToTarget];
                var virtualMoveResult = this.virtualMove(creep.pos, oppositeDir);
                if (virtualMoveResult) {
                    var look = virtualMoveResult.look();
                    if (look[0].terrain && look[0].terrain != 'wall') {
                        creep.move(oppositeDir);
                    }
                    else if (look[0].structure && look[0].structure.structureType == STRUCTURE_ROAD) {
                        creep.move(oppositeDir);
                    }
                    else {
                        creep.moveTo(room.find(FIND_MINERALS)[0], {reusePath: 2});
                    }
                }
            }
            else {
                creep.move(directionToTarget);
            }
        }
        else {
            creep.moveTo(target, {reusePath: 2})
        }

        if (creep.hasActiveBodyparts(ATTACK) && creep.hits > creep.hitsMax*0.5) {
            creep.attack(target);
        }
        else if (creep.hasActiveBodyparts(HEAL) && creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
    },

    virtualMove: function (pos, dir) {
        var tempPos;
        var newPos;

        if (!pos) return;

        tempPos = pos;

        switch (dir) {
            case TOP:
                tempPos.y = tempPos.y - 1;
                break;
            case TOP_RIGHT:
                tempPos.y = tempPos.y - 1;
                tempPos.x = tempPos.x + 1;
                break;
            case RIGHT:
                tempPos.x = tempPos.x + 1;
                break;
            case BOTTOM_RIGHT:
                tempPos.y = tempPos.y + 1;
                tempPos.x = tempPos.x + 1;
                break;
            case BOTTOM:
                tempPos.y = tempPos.y + 1;
                break;
            case BOTTOM_LEFT:
                tempPos.y = tempPos.y + 1;
                tempPos.x = tempPos.x - 1;
                break;
            case LEFT:
                tempPos.x = tempPos.x - 1;
                break;
            case TOP_LEFT:
                tempPos.y = tempPos.y - 1;
                tempPos.x = tempPos.x - 1;
                break;
            default:
                return;
        }

        newPos = tempPos;

        return newPos;
    }
};


/*
 *Notes:
 * global.Allies
 */
