require('global');

module.exports = {
    run: function (room) {

        StructureSpawn.prototype.createCustomCreep = function (energy, role) {

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
                    numberOfParts = Math.floor(energy / 200);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 16) {
                            numberOfParts = 16;
                        }

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(WORK);
                            body.push(CARRY);
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

        var minimumNumberOfSpecialHarvesters = 1;

        var creepToSpawn;

        if (numberOfSpecialHarvesters < minimumNumberOfSpecialHarvesters) {
            creepToSpawn = 'specialHarvester'
        }

        if (!creepToSpawn) return;

        var energy = room.energyAvailable * 0.85;
        var spawnToUse = _.filter(global[room.name].spawns, (s) => s.spawning == false)[0];

        if (!spawnToUse) return;
        if (energy < 300) return;

        spawnToUse.createCustomCreep(energy, creepToSpawn);

    }
};
