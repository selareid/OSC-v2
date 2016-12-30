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

                            if (creep.pos.roomName != targetRoom) {
                                creep.moveTo(targetFlag)
                            }
                            else {
                                var targetStructure = this.getTargetStructure(creep);
                                if (targetStructure) {
                                    var attackStructureResult = creep.attack(targetStructure);

                                    switch (attackStructureResult) {
                                        case -9: // returns ERR_NOT_IN_RANGE
                                            creep.moveTo(attackStructureResult, {reusePath: 3, ignoreRoads: true});
                                            break;
                                        case 0: // returns OK
                                            //creep.say something here using prototype.creepSpeech.js
                                            break;
                                        default:
                                            console.log('Error with creep: ' + creep.name + '' + ' Attack Error: ' + attackStructureResult);
                                    }

                                    creep.basicRangedHandler(targetStructure);

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
        else {
            creep.needTeam(room);
        }

    },

    getTargetStructure: function (creep) {
        return _.min(creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART}), '.hits');
    }
};


/*
*Notes:
* global['warCache'] war Cache
* global[room.name].guardStationFlag for guard station flag
* global[this.name].creepsNotMine to get hostile creeps in room (includes allies)
* global.Allies
*/
