require('prototype.creep')();

module.exports = function () {
    Creep.prototype.needTeam =
        function (room) {
            global.creepLog('At pos ' + this.pos + ' needs a team', this, room); // this = creep ++

            if (this.memory.team == undefined) this.memory.team = this.memory.room == 'E64S41' || this.memory.room == 'E65S47' || this.memory.room == 'E63S47' ? 'team2' : 'team1';

            this.moveTo(global[room.name].guardStationFlag);
        };

    Creep.prototype.basicRangedHandler =
        function (target) {
            if (target) {
                if (this.hasActiveBodyparts(RANGED_ATTACK)) {
                    this.rangedAttack(target);
                }
            }
        };

        Creep.prototype.basicSelfHeal =
        function () {
            if (this.hasActiveBodyparts(HEAL)) {
                if (this.hits < this.hitsMax) {
                    this.heal(this);
                }
            }
        };

        Creep.prototype.beforeRally =
        function (room, teamGlobal) {
            var timeToRally = Game.time >= teamGlobal.timeToRally;
            if (timeToRally != undefined && timeToRally != null) {
                if (Game.time >= timeToRally) {
                    var rallyFlag = Game.flags[teamGlobal.rallyFlag];
                    if (rallyFlag) {
                        this.moveTo(rallyFlag, {ignoreRoads: true});
                    }
                    else {
                        // something here
                        this.moveTo(global[room.name].guardStationFlag);
                    }
                }
                else {
                    this.moveTo(global[room.name].guardStationFlag);
                }
            }
        };

    function kite(room, creep, target) {
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

        if (creep.hasActiveBodyparts(ATTACK) && creep.hits > creep.hitsMax * 0.5) {
            creep.attack(target);
        }
        else if (creep.hasActiveBodyparts(HEAL) && creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
    };
};