require('global');
require('prototype.creep')();
require('prototype.creepSpeech')();

var roleDistributor = require ('role.distributor');

module.exports = {
    run: function (room, creep) {

        creep.say('carry');

        if (_.sum(room.storage.store) < room.storage.storeCapacity) {
                this.normalCarrierCode(room, creep);
        }
        else {
            roleDistributor.run(room, creep, this.getEnergyOfTower(room));
        }
    },

    normalCarrierCode: function (room, creep) {

        if (creep.memory.working == true && _.sum(creep.carry) == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {

            var storage = room.storage;

            if (storage) {
                if (_.sum(room.storage.store) < room.storage.storeCapacity) {
                    for (let resourceType in creep.carry) {
                        var thingToTranferTo = storage;
                        if (creep.transfer(thingToTranferTo, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(thingToTranferTo, {reusePath: 19});
                            break;
                        }
                    }
                }
            }
            else {
                global.creepErrorLog('could not find a storage', creep, room);
            }
        }
        else {

            var droppedResource = room.find(FIND_DROPPED_RESOURCES)[0];
            if (droppedResource) {
                var pickupResult = creep.pickup(droppedResource);
                switch (pickupResult) {
                    case 0:
                        creep.memory.container = undefined;
                        break;
                    case -9:
                        creep.moveTo(droppedResource, {reusePath: 7});
                        break;
                }

            }
            else {

                if (!creep.memory.container) {
                    let foundContainer = this.carrierFindContainer(room, creep);
                    if (foundContainer) {
                        creep.memory.container = foundContainer.id;
                        global.creepLog('recalculating container', creep, room);
                    }
                }

                var container = Game.getObjectById(creep.memory.container);

                if (container) {
                    var containerStore = _.sum(container.store);
                    if (containerStore > 0) {
                        if (container) {
                            for (let resourceType in container.store) {
                                if (containerStore <= 0) {
                                    break;
                                }
                                else if (creep.withdraw(container, resourceType) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(container, {reusePath: 10});
                                }
                            }
                        }
                    }
                    else {
                        creep.memory.container = undefined;
                    }
                }
                else {
                    var flagToGoTo = room.find(FIND_FLAGS, {filter: (f) => f.memory.type == 'distributorGoTo' && f.memory.room == creep.room.name})[0];
                    if (flagToGoTo) {
                        creep.moveTo(flagToGoTo);
                    }
                }
            }

        }
    },

    noEnergyCarrierCode: function (room, creep) {

        if (creep.memory.working == true && _.sum(creep.carry) == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working == true) {

            var storage = room.storage;

            if (storage) {
                if (_.sum(room.storage.store) < room.storage.storeCapacity) {
                    for (let resourceType in creep.carry) {
                        var thingToTranferTo = storage;
                        if (creep.transfer(thingToTranferTo, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(thingToTranferTo, {reusePath: 19});
                        }
                    }
                }
            }
            else {
                global.creepLog('could not find a storage', creep, room);
            }
        }
        else {

            var droppedResource = room.find(FIND_DROPPED_RESOURCES, {filter: (r) => r.resourceType != RESOURCE_ENERGY})[0];
            if (droppedResource) {
                if (creep.pickup(droppedResource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedResource);
                }
            }
            else {

                if (!creep.memory.container) {
                    let foundContainer = this.carrierFindContainerNoEnergy(room, creep);
                    if (foundContainer) {
                        creep.memory.container = foundContainer.id;
                        global.creepLog('recalculating container', creep, room);
                    }
                }

                var container = Game.getObjectById(creep.memory.container);

                if (container) {
                    var containerStore = _.sum(container.store);
                    if (containerStore > 0) {
                        if (container) {
                            for (let resourceType in container.store) {
                                if (containerStore <= 0) {
                                    break;
                                }
                                else if (creep.withdraw(container, resourceType) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(container, {reusePath: 10});
                                }
                            }
                        }
                    }
                    else {
                         creep.memory.container = undefined;
                    }
                }
                else {
                    var flagToGoTo = room.find(FIND_FLAGS, {filter: (f) => f.memory.type == 'distributorGoTo' && f.memory.room == creep.room.name})[0];
                    if (flagToGoTo) {
                        creep.moveTo(flagToGoTo);
                    }
                }

            }

        }
    },

    carrierFindContainer: function (room, creep) {
        var allContainersInRoom = _.filter(global[room.name].containers, (c) => _.sum(c.store) > 0);

        if (allContainersInRoom.length > 0) {

            var container = creep.pos.findClosestByRange(allContainersInRoom);

            if (container) {
                return container;
            }
            else {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    },

    carrierFindContainerNoEnergy: function (room, creep) {
        var allContainersInRoom = _.filter(global[room.name].containers, (c) => _.sum(_.filter(c.store, (r) => r.resourceType != RESOURCE_ENERGY)) > 0);

        if (allContainersInRoom.length > 0) {

            var container = creep.pos.findClosestByRange(allContainersInRoom);

            if (container) {
                return container;
            }
            else {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    },

    getEnergyOfTower: function (room) {
        var towers = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
        var allEnergy = [];

        for (let tower of towers) {
            allEnergy.push(tower.energy);
        }
        return _.min(allEnergy) + 1;
    }
};