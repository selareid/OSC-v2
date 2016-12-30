require('prototype.creep')();

module.exports = function () {
    Creep.prototype.needTeam =
        function (room) {
            console.log(this.memory.role + ' creep ' + this.name + ' At pos ' + this.pos + ' needs a team');

            if (this.memory.team == undefined) this.memory.team = null;

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
};