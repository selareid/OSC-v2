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
                                var targetSpawn = this.getTargetSpawn(creep);
                                if (targetSpawn) {
                                    var attackSpawnResult = creep.attack(targetSpawn);

                                    switch (attackSpawnResult) {
                                        case -9: // returns ERR_NOT_IN_RANGE
                                            creep.moveTo(targetSpawn, {reusePath: 3, ignoreRoads: true});
                                            break;
                                        case 0: // returns OK
                                            //creep.say something here using prototype.creepSpeech.js
                                            break;
                                        default:
                                            console.log('Error with creep: ' + creep.name + '' + ' Attack Error: ' + attackSpawnResult);
                                    }

                                    this.rangedHandler(creep, targetSpawn);

                                }
                                else {
                                    creep.memory.role = 'creepHarasser';
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

    rangedHandler: function (creep, targetSpawn) {
        var targetCreep = this.getTargetCreep(creep);
        if (targetCreep) {
            creep.rangedAttack(targetCreep);
        }
        else {
            switch (this.isTargetSpawnInRange(targetSpawn)) {
                case true:
                    creep.rangedAttack(targetSpawn);
                    break;
                case false:
                    // hmmm
                    break;
            }
        }
    },

    getTargetSpawn: function (creep) {
        return creep.room.find(FIND_HOSTILE_SPAWNS)[0];
    },

    getTargetCreep: function (creep) {
        return creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: (c) => !global.Allies.includes(c.owner.username)});
    },
    
    isTargetSpawnInRange: function (targetSpawn) {
        var distance = creep.pos.getRangeTo(targetSpawn);

        if (distance > 3) {
            return false
        }
        else return true;
    }
};


/*
*Notes:
* global['warCache'] war Cache
* global[room.name].guardStationFlag for guard station flag
* global[this.name].creepsNotMine to get hostile creeps in room (includes allies)
* global.Allies
*/
