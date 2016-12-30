require('global');

module.exports = {
    run: function (room) {

        if (!Memory.rooms[room].labs) {
            Memory.rooms[room].labs = {};
        }

        var labs = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LAB});

        for (let lab of labs) {
            if (!Memory.rooms[room].labs[lab.id]) {
                Memory.rooms[room].labs[lab.id] = {};
                Memory.rooms[room].labs[lab.id].type = 0; // 0 is a lab that is used
            }

            if (!lab.cooldown > 0) {
                if (Memory.rooms[room].labs[lab.id].type == 1) { // a lab that does the reactions
                    var labsInRange = lab.pos.findInRange(labs, 2, {filter: (l) => l.id !== lab.id && Memory.rooms[room].labs[l.id].type == 0});
                    var resourcesAvailable = [];
                    _.forEach(labsInRange, function (l) {
                        if (l.mineralAmount > 0) {
                            resourcesAvailable.push(l);
                        }
                    });

                    if (lab.mineralAmount < lab.mineralCapacity - 5) {
                        if (resourcesAvailable.length >= 2) {
                            lab.runReaction(resourcesAvailable[0], resourcesAvailable[1]);
                        }
                    }
                }
            }
        }
    }
};