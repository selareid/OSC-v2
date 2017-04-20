require('prototype.creepSpeech')();
require('prototype.creepWar')();

module.exports = {
    run: function (room, creep) {

        if (creep.memory.team) {
            var teamGlobal = global['warCache'][creep.memory.team];
            if (teamGlobal) {
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
                                    var attackCreepResult = creep.attack(targetCreep);

                                    switch (attackCreepResult) {
                                        case -9: // returns ERR_NOT_IN_RANGE
                                            creep.moveTo(targetCreep, {reusePath: 3, ignoreRoads: true});
                                            break;
                                        case 0: // returns OK
                                            //creep.say something here using prototype.creepSpeech.js
                                            break;
                                        default:
                                            global.creepErrorLog('Attack Error: ' + attackCreepResult, creep, room);
                                    }

                                    creep.basicRangedHandler(targetCreep);

                                }
                                else {
                                    //role cahing here
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
        else {
            creep.needTeam(room);
        }

    },

    getTargetCreep: function (creep) {
        return creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: (c) => !global.Allies.includes(c.owner.username)});
    }
};


/*
*Notes:
* global['warCache'] war Cache
* global[room.name].guardStationFlag for guard station flag
* global[this.name].creepsNotMine to get hostile creeps in room (includes allies)
* global.Allies
*/
