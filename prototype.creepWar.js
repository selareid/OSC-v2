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
        var targetDangerous = target.hasActiveBodyparts(ATTACK) || target.hasActiveBodyparts(RANGED_ATTACK);

        if (targetDangerous) {
            var directionToTarget = creep.pos.getDirectionTo(target);
            if (creep.pos.getRangeTo(target) <= 2) {
                var fleePath = PathFinder.search(creep.pos, {goal: target, range: 3}, {flee: true, plainCost: 2, swampCost: 10,
                        roomCallback: function(roomName) {

                            let room = Game.rooms[roomName];

                            if (!room) return;
                            let costs = new PathFinder.CostMatrix;

                            room.find(FIND_STRUCTURES).forEach(function(struct) {
                                if (struct.structureType === STRUCTURE_ROAD) {
                                    // Favor roads over plain tiles
                                    costs.set(struct.pos.x, struct.pos.y, 1);
                                } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                    (struct.structureType !== STRUCTURE_RAMPART ||
                                    !struct.my)) {
                                    // Can't walk through non-walkable buildings
                                    costs.set(struct.pos.x, struct.pos.y, 0xff);
                                }
                            });

                            // Avoid creeps in the room
                            room.find(FIND_CREEPS).forEach(function(creep) {
                                costs.set(creep.pos.x, creep.pos.y, 0xff);
                            });

                            return costs;
                        },
                    }
                );

                let pos = fleePath.path[0];
                creep.move(creep.pos.getDirectionTo(pos));
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
    }
};