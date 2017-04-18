require('global');
require('prototype.creep');
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep, remoteCreepFlags = global[room.name].cachedRemoteCreepFlags) {
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
        var that = this;
        creep.say('hauler remote');

        //repair structure underneath
        if (creep.carry.energy > 0) {
            var needingRepair = _.filter(creep.pos.lookFor(LOOK_STRUCTURES), (s) => s.hits < s.hitsMax);
            if (needingRepair.length > 0) creep.repair(needingRepair[Game.time % needingRepair.length]); //repairs random structure underneath
        }

        if (creep.memory.goingHome === true && _.sum(creep.carry) == 0) {
            creep.memory.goingHome = false;
        }
        else if (creep.memory.goingHome === false && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.goingHome = true;
        }

        if (creep.memory.goingHome === true) {
            (function () {
                if (creep.pos.roomName != creep.memory.room) {
                    var constructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                    if (constructionSite) {
                        if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(constructionSite);
                        }
                    }
                    else creep.moveTo(Game.rooms[creep.memory.room].find(FIND_MY_SPAWNS)[0], {reusePath: 37});
                }
                else {
                    var links = _.filter(global[room.name].links, (l) => global['linkRole'][l.id] == 'giver' && l.energy < l.energyCapacity);
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

                    if (creep.carry.energy > 0) {
                        var storage = creep.pos.isNearTo(room.storage) ? room.storage : undefined;
                        if (storage) creep.transfer(storage, RESOURCE_ENERGY);
                    }
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
                            // randomly pick out a new remote flag :)
                            // since there's nothing to pick up in this room
                            var counter = 0;
                            do {
                                var newFlag = that.getRemoteFlag(room, creep, global[room.name].cachedRemoteCreepFlags);
                                counter =+ 1;
                            }
                            while (counter < (global[room.name].cachedRemoteCreepFlags.length + 1) && (newFlag == Game.flags[newFlag] || !Game.flags[newFlag].room));

                             creep.memory.remoteFlag = newFlag;
                        }
                    }
                }
            })();
        }
    }
};
