require('global');
require('prototype.creep')();
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep, energyOfTowers) {

        creep.creepSpeech(room);

        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {

            var spawnExtension = this.findSpawnExtension(room, creep);

            if (spawnExtension) {
                if (creep.transfer(spawnExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawnExtension, {visualizePathStyle: {
                        fill: 'transparent',
                        stroke: '#f46464',
                        lineStyle: 'dashed',
                        strokeWidth: .2,
                        opacity: .5}});
                }
            }
            else {
                var tower = this.findTower(room, energyOfTowers);
                if (tower) {
                    if (creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(tower, {visualizePathStyle: {
                            fill: 'transparent',
                            stroke: '#f46464',
                            lineStyle: 'dashed',
                            strokeWidth: .2,
                            opacity: .5}});
                    }
                }
                else {
                    var flagToGoTo = room.find(FIND_FLAGS, {filter: (f) => (f.memory.type == 'distributorGoTo' || f.name.split(' ')[0] == 'distributorGoTo')})[0];
                    if (flagToGoTo) {
                        creep.moveTo(flagToGoTo, {visualizePathStyle: {
                            fill: 'transparent',
                            stroke: '#f46464',
                            lineStyle: 'dashed',
                            strokeWidth: .2,
                            opacity: .5}});
                    }
                }
            }
        }
        else {

            var storage = room.storage;
            var droppedEnergy = creep.findDroppedEnergy(room);
            var container;

            if (!storage) {

                if (!droppedEnergy) {
                    droppedEnergy = [];
                }

                if (droppedEnergy.amount == undefined || droppedEnergy.amount < 1010) {
                    if (storage && storage.store[RESOURCE_ENERGY] > 1000) {
                        if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage, {reusePath: 10, visualizePathStyle: {
                                fill: 'transparent',
                                stroke: '#f46464',
                                lineStyle: 'dashed',
                                strokeWidth: .2,
                                opacity: .5}})
                        }
                    }
                    else {
                        container = creep.findContainer(room);
                        if (container) {
                            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(container, {visualizePathStyle: {
                                    fill: 'transparent',
                                    stroke: '#f46464',
                                    lineStyle: 'dashed',
                                    strokeWidth: .2,
                                    opacity: .5}});
                            }
                        }
                        else {
                            if (creep.pickup(droppedEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(container, {visualizePathStyle: {
                                    fill: 'transparent',
                                    stroke: '#f46464',
                                    lineStyle: 'dashed',
                                    strokeWidth: .2,
                                    opacity: .5}});
                            }
                        }
                    }
                }
                else {
                    if (creep.pickup(droppedEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(droppedEnergy, {visualizePathStyle: {
                            fill: 'transparent',
                            stroke: '#f46464',
                            lineStyle: 'dashed',
                            strokeWidth: .2,
                            opacity: .5}});
                    }
                }
            }
            else {

                var links = creep.findLinksEnergy();

                var arrayOfBoth = links;
                arrayOfBoth.push(storage);

                var closer = creep.pos.findClosestByPath(arrayOfBoth);

                if (closer != storage) {
                    if (creep.withdraw(closer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closer, {reusePath: 10, visualizePathStyle: {
                            fill: 'transparent',
                            stroke: '#f46464',
                            lineStyle: 'dashed',
                            strokeWidth: .2,
                            opacity: .5}})
                    }
                }
                else if (storage.store[RESOURCE_ENERGY] > 50) {
                    if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage, {visualizePathStyle: {
                            fill: 'transparent',
                            stroke: '#f46464',
                            lineStyle: 'dashed',
                            strokeWidth: .2,
                            opacity: .5}});
                    }
                }
                else {
                    container = creep.findContainer(room);
                    if (container) {
                        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(container, {visualizePathStyle: {
                                fill: 'transparent',
                                stroke: '#f46464',
                                lineStyle: 'dashed',
                                strokeWidth: .2,
                                opacity: .5}});
                        }
                    }
                    else {
                        if (droppedEnergy) {
                            if (creep.pickup(droppedEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(droppedEnergy, {visualizePathStyle: {
                                    fill: 'transparent',
                                    stroke: '#f46464',
                                    lineStyle: 'dashed',
                                    strokeWidth: .2,
                                    opacity: .5}});
                            }
                        }
                    }
                }
                //}
            }
        }
    },

    findSpawnExtension: function (room, creep) {
        var spawns = _.filter(global[room.name].spawns, (s) => s.energy < s.energyCapacity);
        var extensions = _.filter(global[room.name].extensions, (s) => s.energy < s.energyCapacity);
        return creep.pos.findClosestByRange(spawns.concat(extensions));
    },

    findTower: function (room, energyOfTowers) {
        var tower = _.filter(global[room.name].towers, (t) => t.energy <= energyOfTowers && t.energy < t.energyCapacity)[0];
        return tower;
    }
};