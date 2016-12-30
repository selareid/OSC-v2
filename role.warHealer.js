require('prototype.creepSpeech')();
require('prototype.creepWar')();

module.exports = {
    run: function (room, creep) {
        PathFinder.use(true);

        if (creep.memory.team) {
            var teamGlobal = global['warCache'][creep.memory.team];
            if (teamGlobal) {
                if (creep.memory.follow) {
                    var creepToFollow = Game.creeps[creep.memory.follow];
                    if (creepToFollow) {
                        creep.moveTo(creepToFollow, {reusePath: 1, ignoreRoads:true});
                    }
                    else {
                        delete creep.memory.follow;
                    }
                }
                else {
                    var timeToAttack = teamGlobal.timeToAttack;
                    if (timeToAttack != undefined && timeToAttack != null) {
                        if (Game.time >= timeToAttack) {
                            var targetFlag = teamGlobal.flag;
                            var targetRoom = teamGlobal.targetRoom;
                            if (targetRoom) {

                                if (creep.pos.roomName != targetRoom) {
                                    creep.moveTo(targetFlag)
                                }
                                else {
                                    var targetCreep = this.getTargetCreep(creep);
                                    if (targetCreep) {
                                        var healCreepResult = creep.heal(targetCreep);

                                        switch (healCreepResult) {
                                            case -9: // returns ERR_NOT_IN_RANGE
                                                creep.moveTo(targetCreep, {reusePath: 3, ignoreRoads: true});
                                                break;
                                            case 0: // returns OK
                                                //creep.say something here using prototype.creepSpeech.js
                                                break;
                                            default:
                                                console.log('Error with creep: ' + creep.name + '' + ' Attack Error: ' + healCreepResult);
                                        }

                                    }
                                    else {
                                        //maybe add a role changing mechanic here ?
                                    }
                                }

                            }
                        }
                        else {
                            creep.beforeRally(room, teamGlobal);
                        }
                    }
                }
            }
        }
        else {
            creep.needTeam(room);
        }

    },

    getTargetCreep: function (creep) {
        return creep.pos.findClosestByRange(FIND_CREEPS, {filter: (c) => (global.Allies.includes(c.owner.username) || c.owner.username == creep.owner.username) && c.hits < c.hitsMax});
    }
};


/*
 *Notes:
 * global['warCache'] war Cache
 * global[room.name].guardStationFlag for guard station flag
 * global[this.name].creepsNotMine to get hostile creeps in room (includes allies)
 * global.Allies
 */
