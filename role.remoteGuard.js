require('global');
require('prototype.creep');
require('prototype.creepSpeech')();

module.exports = {

    run: function (room, creep, remoteGuardFlags) {
        creep.say('yeah');
        if (remoteGuardFlags.length > 0) {

            var remoteGuardFlag = creep.memory.remoteFlag;

            if (!remoteGuardFlag) {
                creep.memory.remoteFlag = this.setRemoteFlagMemory(room, creep, remoteGuardFlags);
                remoteGuardFlag = creep.memory.remoteFlag;
            }

            var remoteFlag = Game.flags[remoteGuardFlag];

            if (remoteFlag) {
                if (creep.pos.roomName != remoteFlag.pos.roomName) {
                    creep.moveTo(remoteFlag, {reusePath: 37, ignoreCreeps: true});
                }
                else {
                    this.realRun(room, creep, remoteFlag);
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
                    var amountOfCreepsAssignedToThisFlag = _.filter(Game.creeps, (c) => c.memory.room == room.name && c.memory.role == 'remoteGuard' && c.memory.remoteFlag == flag.name).length;
                    if (amountOfCreepsAssignedToThisFlag < flag.memory.numberOfGuards) {
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

    realRun: function (room, creep, remoteFlag) {
        PathFinder.use(true);

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
                    console.log('Error with creep: ' + creep.name + '' + ' Attack Error: ' + attackResult);
            }

        }
        else creep.moveTo(remoteFlag);

    },

    getTarget: function (room, creep) {
        var targets = _.filter(room.find(FIND_HOSTILE_CREEPS), (c) => !global.Allies.includes(c.owner.username));

        if (targets.length > 0) {
            return creep.pos.findClosestByRange(targets);
        }
        else return;
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

        if (creep.hasActiveBodyparts(ATTACK)) {
            creep.attack(target);
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
