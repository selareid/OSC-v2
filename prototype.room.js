module.exports = function () {

        Room.prototype.getGuardStationFlag =
            function () {
                var guardStationFlag = _.filter(Game.flags, f => f.memory.type == 'guardStationFlag' && f.memory.room == this.name)[0];

                if (guardStationFlag) {
                    return guardStationFlag;
                }
                else {
                    return undefined;
                }
            };

        Room.prototype.findOtherRoomToGoTo =
            function () {
                var otherRoomFlag = _.filter(Game.flags, f => f.memory.type == 'otherRoomToGoTo' && f.memory.room == this.name && f.memory.numberOfCreeps > 0)[0];

                if (otherRoomFlag) {
                    return otherRoomFlag;
                }
                else {
                    return undefined;
                }
            };

        Room.prototype.findRoomToStealFrom =
            function () {
                var thiefFlag = _.filter(Game.flags, f => f.memory.type == 'thiefFlag' && f.memory.room == this.name && f.memory.numberOfCreeps > 0)[0];

                if (thiefFlag) {
                    return thiefFlag;
                }
                else {
                    return undefined;
                }
            };

        Room.prototype.getRemoteFlags =
            function () {
                var Flags = _.filter(Game.flags, f => f.name.split(' ')[0] == 'remoteFlag' && f.memory.room == this.name
                && f.memory.numberOfRemoteHarvesters != undefined && f.memory.numberOfRemoteHaulers != undefined);

                if (Flags.length > 0) {
                    return Flags;
                }
                else {
                    return [];
                }
            };

            Room.prototype.getRemoteGuardFlags =
            function () {
                var Flags = _.filter(Game.flags, f => f.name.split(' ')[0] == 'remoteGuardFlag' && f.memory.room == this.name
                && f.memory.numberOfGuards != undefined);

                if (Flags.length > 0) {
                    return Flags;
                }
                else {
                    return [];
                }
            };

        Room.prototype.getEnergyHelperFlags =
            function () {
                var Flags = _.filter(Game.flags, f => f.memory.type == 'energyHelperFlag' && f.memory.room == this.name && f.memory.numberOfCreeps != undefined);

                if (Flags.length > 0) {
                    return Flags[0];
                }
                else {
                    return [];
                }
            };

        Room.prototype.cacheThingsInRoom =
            function () {

                if (global[this.name] == undefined) {
                    global[this.name] = {};
                }

                //hostile creeps
                global[this.name].creepsNotMine = this.find(FIND_HOSTILE_CREEPS);
                //links
                global[this.name].links = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LINK});
                //containers
                global[this.name].containers = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
                //sources
                global[this.name].sources = this.find(FIND_SOURCES);

            };


};