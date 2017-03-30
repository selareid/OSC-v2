require('global');

module.exports = {
    run: function (room) {

        StructureSpawn.prototype.specialCreateCustomCreep = function (energy, role) {

            var numberOfParts;
            var body = [];

            var spawn = this;

            var creepName = function (roleName) {
                var name = roleName + '-' + Game.time % 100000 + '-' + spawn.pos.x + spawn.pos.y;
                return name;
            };

            var sortedParts = function (body) {
                if (body == undefined) return undefined;
                return _(body).sortBy(function (part) {
                    if (part === TOUGH)
                        return 0;
                    else if (part === HEAL)
                        return BODYPARTS_ALL.length;
                    else
                        return _.random(1, BODYPARTS_ALL.length - 1);
                })
                    .value();
            };

            switch (role) {
                case 'specialHarvester':
                    numberOfParts = Math.floor(energy / 250);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 7) {
                            numberOfParts = 7;
                        }

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(WORK);
                            body.push(CARRY);
                            body.push(MOVE);
                            body.push(MOVE);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(role), {
                        role: role,
                        room: room.name,
                        w: false
                    });
                case 'specialCaretaker':
                    numberOfParts = Math.floor(energy / 250);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 12) {
                            numberOfParts = 12;
                        }

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(WORK);
                            body.push(CARRY);
                            body.push(MOVE);
                            body.push(MOVE);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(role), {
                        role: role,
                        room: room.name,
                        w: false
                    });
                case 'upgrader':
                    numberOfParts = Math.floor(energy / 250);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 12) {
                            numberOfParts = 12;
                        }

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(WORK);
                            body.push(CARRY);
                            body.push(MOVE);
                            body.push(MOVE);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(role), {
                        role: role,
                        room: room.name,
                        working: false
                    });
            }
        };

        var numberOfSpecialHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'specialHarvester' && c.memory.room == room.name);
        var numberOfSpecialCaretakers = _.sum(Game.creeps, (c) => c.memory.role == 'specialCaretaker' && c.memory.room == room.name);
        var numberOfUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader' && c.memory.room == room.name);

        var minimumNumberOfSpecialHarvesters = 1;
        var minimumNumberOfSpecialCaretakers = 1;

        var minimumNumberOfUpgraders = Math.floor((room.storage.store.energy - 30000)/20000);

        var creepToSpawn;

        if (numberOfSpecialHarvesters < minimumNumberOfSpecialHarvesters) {
            creepToSpawn = 'specialHarvester'
        }
        else if (numberOfSpecialCaretakers < minimumNumberOfSpecialCaretakers) {
            creepToSpawn = 'specialCaretaker'
        }
        else if (numberOfUpgraders < minimumNumberOfUpgraders) {
            creepToSpawn = 'upgrader'
        }

        if (!creepToSpawn) return;

        var energy = room.energyAvailable * 0.85 > 300 ? room.energyAvailable * 0.85 : room.energyAvailable;
        var spawnToUse = _.filter(global[room.name].spawns, (s) => !s.spawning)[0];

        if (!spawnToUse) return;
        if (energy < 300) return;

        var name = spawnToUse.specialCreateCustomCreep(energy, creepToSpawn);

        if (Game.creeps[name]) global.roomLog("[SPAWNING]" + name, room);



    }
};
