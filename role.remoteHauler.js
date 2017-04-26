require('global');
require('prototype.creep');
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep) {
        var remoteRooms = Memory.rooms[room].rmtR;

        if (!remoteRooms || remoteRooms.length > 0) {
            var remoteRoom = creep.memory.rr;

            if (!remoteRoom) {
                creep.memory.rr = this.setRemoteRoomMemory(room, creep, remoteRooms);
                remoteRoom = creep.memory.rr;
            }

            if (remoteRoom) {
                this.realRun(room, creep, remoteRoom);
            }
            else {
                creep.runInSquares();
            }

        }
        else {
            creep.runInSquares();
        }
    },

    setRemoteRoomMemory: function (room, creep, remoteRooms) {
        remoteRooms = _.filter(remoteRooms, (r) => !r.split(',')[1] == 0 && !r.split(',')[2] == 0);

        var zeChosenRoom = remoteRooms[Math.floor(Math.random() * remoteRooms.length)];

        return zeChosenRoom ? zeChosenRoom.split(',')[0] : undefined;
    },

    realRun: function (room, creep, remoteRoom) {
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
                    if (constructionSite && creep.carry.energy > 10) {
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

                    if (creep.carry[RESOURCE_ENERGY] == 0) closer = storage;

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
                if (creep.pos.roomName != remoteRoom) {
                    creep.moveTo(new RoomPosition(25, 25, remoteRoom), {reusePath: 21, range: 23});

                    if (creep.carry.energy > 0) {
                        var storage = creep.pos.isNearTo(room.storage) ? room.storage : undefined;
                        if (storage) creep.transfer(storage, RESOURCE_ENERGY);
                    }
                }
                else {

                    var allDroppedResources = _.max(creep.room.find(FIND_DROPPED_RESOURCES));
                    var droppedResource = allDroppedResources !== Number.POSITIVE_INFINITY && allDroppedResources !== Number.NEGATIVE_INFINITY ? allDroppedResources : undefined;
                    if (droppedResource) {
                        var pickupResult = creep.pickup(droppedResource);
                        switch (pickupResult) {
                            case 0:
                                // pickup successful
                                break;
                            case -9:
                                creep.moveTo(droppedResource, {reusePath: 7, maxRooms: 1});
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
                                            creep.moveTo(container, {reusePath: 10, maxRooms: 1});
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            // randomly pick out a new remote room :)
                            // since there's nothing to pick up in this room
                            var remoteRooms = Memory.rooms[room].rmtR;
                            var counter = 0;
                            do {
                                var newRoom = that.setRemoteRoomMemory(room, creep, remoteRooms);
                                counter =+ 1;
                            }
                            while (counter < (remoteRooms + 1) && (newRoom == remoteRoom || !Game.rooms[newRoom]));

                             creep.memory.rr = newRoom;
                        }
                    }
                }
            })();
        }
    }
};
