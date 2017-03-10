require('global');
require('prototype.creep');
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep, remoteCreepFlags = global[room.name].cachedRemoteGuardFlags) {
        creep.say('yeah');
        if (remoteCreepFlags.length > 0) {

            var creepRemoteFlag = creep.memory.remoteFlag;

            if (!creepRemoteFlag) {
                creep.memory.remoteFlag = this.getRemoteFlag(room, creep, remoteCreepFlags);
                creepRemoteFlag = creep.memory.remoteFlag;
            }

            var remoteFlag = Game.flags[creepRemoteFlag];

            if (remoteFlag) {
                this.realRun(room, creep, remoteFlag);
            }
            else {
                creep.runInSquares();
            }

        }
        else {
            creep.runInSquares();
        }
    },

    getRemoteFlag: function (room, creep, remoteCreepFlags) {

        var zeChosenFlag = remoteCreepFlags[Math.floor(Math.random() * remoteCreepFlags.length)];

        if (zeChosenFlag) {
            return zeChosenFlag.name;
        }
        else {
            return undefined;
        }
    },

    realRun: function (room, creep, remoteFlag) {

        creep.say('hauler remote');

        if (creep.memory.goingHome === true && _.sum(creep.carry) == 0) {
            creep.memory.goingHome = false;
        }
        else if (creep.memory.goingHome === false && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.goingHome = true;
        }

        if (creep.memory.goingHome === true) {
            (function () {
                if (creep.pos.roomName != creep.memory.room) {
                    if (creep.carry.energy > 0) {
                        var constructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                        if (constructionSite) {
                            if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(constructionSite);
                            }
                        }
                        else {
                            var needingRepair = creep.pos.findClosestByRange([creep.pos.findInRange(FIND_STRUCTURES, 3, {filter: (s) => s.hits < s.hitsMax}),
                                creep.room.find(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax * 0.1})]);
                            if (needingRepair) {
                                if (creep.repair(needingRepair) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(needingRepair);
                                }
                            }
                            else {
                                creep.moveTo(Game.rooms[creep.memory.room].find(FIND_MY_SPAWNS)[0], {reusePath: 37});
                            }
                        }
                    }
                    else creep.moveTo(Game.rooms[creep.memory.room].find(FIND_MY_SPAWNS)[0], {reusePath: 37});
                }
                else {
                    var links = _.filter(global[room.name].links, (l) => l.energy < l.energyCapacity);
                    var storage = room.storage;

                    var arrayOfBoth = links;
                    if (storage && _.sum(storage.store) < storage.storeCapacity) arrayOfBoth.push(storage);

                    var closer = creep.pos.findClosestByPath(arrayOfBoth);

                    if (closer) {
                        for (let resourceType in creep.carry) {
                            if (creep.transfer(closer, resourceType) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(closer, {reusePath: 19});
                                break;
                            }
                        }
                    }
                    else {
                        var container = creep.pos.findClosestByRange(global[room.name].containers, {filter: (c) => c.energy < c.energyCapacitys});
                        if (container) {
                            for (let resourceType in creep.carry) {
                                if (creep.transfer(container, resourceType) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(container, {reusePath: 19});
                                    break;
                                }
                            }
                        }
                        else {
                            
                            var structure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (s) => (s.structureType == STRUCTURE_SPAWN && s.energy < s.energyCapacity)
                        || (s.structureType == STRUCTURE_CONTAINER && _.sum(s.store) < s.storeCapacity)
                    });

                    if (structure) {
                        for (let resourceType in creep.carry) {
                        if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(structure);
                            break;
                            }
                            }
                      }
                            else {
                                  for (let resourceType in creep.carry) {
                                  creep.drop(resourceType);
                                 }
                            }
                        }
                    }
                }
            })();
        }
        else {
            (function () {
                if (creep.pos.roomName != remoteFlag.pos.roomName) {
                    creep.moveTo(remoteFlag.pos, {reusePath: 37});
                }
                else {
                    let allDroppedResources = _.max(creep.room.find(FIND_DROPPED_RESOURCES), '.amount');
                    var droppedResource = allDroppedResources !== Number.POSITIVE_INFINITY && allDroppedResources !== Number.NEGATIVE_INFINITY ? allDroppedResources : undefined;
                    if (droppedResource) {
                        var pickupResult = creep.pickup(droppedResource);
                        switch (pickupResult) {
                            case 0:
                                // pickup successful
                                break;
                            case -9:
                                creep.moveTo(droppedResource, {reusePath: 7});
                                break;
                        }

                    }
                    else {

                        var container = creep.pos.findClosestByRange(global[room.name].containers, {filter: (s) => _.sum(s.store) > 0});

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
                        }
                        else {
                            creep.memory.remoteFlag = this.getRemoteFlag(room, creep, global[room.name].cachedRemoteGuardFlags);
                        }
                    }
                }
            })();
        }
    }
};
