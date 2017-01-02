require('prototype.creepSpeech')();
require('prototype.creepWar')();

module.exports = {
    run: function (room, creep) {
        PathFinder.use(true);

        if (creep.memory.team) {
            var teamGlobal = global['warCache'][creep.memory.team];
            if (teamGlobal) {
                var timeToAttack = teamGlobal.timeToAttack;
                if (timeToAttack != undefined && timeToAttack != null) {
                    if (Game.time >= timeToAttack) {
                        var targetFlag = teamGlobal.flag;
                        var targetRoom = teamGlobal.targetRoom;
                        if (targetRoom) {
                                creep.heal(creep);

                                if (creep.pos.roomName != targetRoom) {
                                    creep.moveTo(teamGlobal.flag);
                                }
                                else {
                                    if (creep.pos.y == 0 || creep.pos.y == 49 || creep.pos.x == 0 || creep.pos.x == 49) {
                                        //is on edge
                                    }
                                    else {
                                        creep.moveTo(creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER})[0]);
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

    }
};


/*
 *Notes:
 * global['warCache'] war Cache
 * global[room.name].guardStationFlag for guard station flag
 * global[this.name].creepsNotMine to get hostile creeps in room (includes allies)
 * global.Allies
 */
