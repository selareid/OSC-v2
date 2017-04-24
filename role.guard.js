require('global');
require('prototype.creep');
require('prototype.creepSpeech')();
require('prototype.creepWar')();

module.exports = {
    run: function (room, creep) {

        creep.creepSpeech(room);

        if (Memory.rooms[room].isUnderAttack == true) {
            if (creep.pos.roomName != room.name) {
                creep.moveTo(room.controller, {reusePath: 7, ignoreRoads: true});
                if (creep.hasActiveBodyparts(HEAL) && creep.hits < creep.hitsMax) creep.heal(creep);
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
                            creep.kite(room, creep, target);
                            //creep.say something here using prototype.creepSpeech.js
                            break;
                        default:
                            global.creepErrorLog('Attack Error: ' + attackResult, creep, room);
                    }

                }
                else {
                    creep.moveTo(global[room.name].guardStationFlag, {ignoreRoads: true});
                    if (creep.hasActiveBodyparts(HEAL) && creep.hits < creep.hitsMax) creep.heal(creep);
                }
            }
        }
        else {
            var remoteRoom = Memory.rooms[room].rmtUA;
            if (remoteRoom && Game.rooms[remoteRoom]) {
                remoteRoom = Game.rooms[remoteRoom];

                if (creep.pos.roomName != remoteRoom.name) {
                    var posToMoveTo = new RoomPosition(25, 25, remoteRoom.name);
                    creep.moveTo(posToMoveTo, {reusePath: 13, range: 23, ignoreRoads: true});

                    if (creep.hasActiveBodyparts(HEAL) && creep.hits < creep.hitsMax) creep.heal(creep);
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
                                creep.kite(creep.room, creep, target);
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
            else {
                creep.moveTo(global[room.name].guardStationFlag, {ignoreRoads: true});
                if (creep.hasActiveBodyparts(HEAL) && creep.hits < creep.hitsMax) creep.heal(creep);
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
    }
};


/*
*Notes:
* global[room.name].guardStationFlag for guard station flag
* global[this.name].creepsNotMine to get hostile creeps in room (includes allies)
* Memory.rooms[room].isUnderAttack
* global.Allies
*/
