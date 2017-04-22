require ('prototype.creepSpeech')();
require('prototype.creepWar')();

module.exports = {
    run: function (room, creep) {

        creep.creepSpeech(room);

        if (Memory.rooms[room].isUnderAttack == true) {
            if (creep.pos.roomName != room.name) {
                creep.moveTo(room.controller, {reusePath: 7, ignoreRoads: true});
            }
            else {
                var target = this.getTarget(room, creep);
                if (target) {
                    var attackResult = creep.rangedAttack(target);

                    switch (attackResult) {
                        case -9: // returns ERR_NOT_IN_RANGE
                            creep.moveTo(target, {reusePath: 3, ignoreRoads: true});
                            break;
                        case 0: // returns OK
                            this.kite(room, creep, target);
                            //creep.say something here using prototype.creepSpeech.js
                            break;
                        default:
                            global.creepErrorLog('Attack Error: ' + attackResult, creep, room);
                    }

                }
                else if (creep.hasActiveBodyparts(HEAL) && creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }
            }
        }
        else {
            var remoteRoom = Memory.rooms[room].rmtUA;
            if (remoteRoom && Game.rooms[remoteRoom]) {
                remoteRoom = Game.rooms[remoteRoom];

                if (creep.pos.roomName != remoteRoom.name) {
                    var posToMoveTo = new RoomPosition(25, 25, remoteRoom.name);
                    creep.moveTo(posToMoveTo, {reusePath: 13, range: 23});
                }
                else {
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
                        if (creep.hasActiveBodyparts(HEAL) && creep.hits < creep.hitsMax) {
                            creep.heal(creep);
                        }
                        Memory.rooms[room].rmtUA = undefined;
                    }

                }
            }
        }
    },

    getTarget: function (room, creep) {
        var notMine = global[room.name] ? global[room.name].creepsNotMine : room.find(FIND_HOSTILE_CREEPS);
        var targets = _.filter(notMine, (c) => !global.Allies.includes(c.owner.username));

        if (targets.length > 0) {
            return creep.pos.findClosestByRange(targets);
        }
        else {
            if (Memory.rooms[room]) Memory.rooms[room].isUnderAttack = false;
            return;
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
        if (pos.x == 0 || pos.x == 49 || pos.y == 0 || pos.y == 49) return;

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
* global[room.name].guardStationFlag for guard station flag
* global[this.name].creepsNotMine to get hostile creeps in room (includes allies)
* Memory.rooms[room].isUnderAttack
* global.Allies
*/
