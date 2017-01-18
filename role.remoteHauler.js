require('global');
require('prototype.creep');
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep, remoteCreepFlags) {
        creep.say('yeah');
        if (remoteCreepFlags.length > 0) {

            var creepRemoteFlag = creep.memory.remoteFlag;

            if (!creepRemoteFlag) {
                creep.memory.remoteFlag = this.setRemoteFlagMemory(room, creep, remoteCreepFlags);
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

    setRemoteFlagMemory: function (room, creep, remoteCreepFlags) {

        var zeChosenFlag;

                for (let flag of remoteCreepFlags) {
                    var amountOfCreepsAssignedToThisFlag = _.filter(Game.creeps, (c) => c.memory.room == room.name && c.memory.role == 'remoteHauler' && c.memory.remoteFlag == flag.name).length;
                    if (amountOfCreepsAssignedToThisFlag < flag.memory.numberOfRemoteHaulers) {
                        zeChosenFlag = flag;
                        break;
                    }
                }


        if (zeChosenFlag) {
            return zeChosenFlag.name;
        }
        else {
            return undefined;
        }
    },

    realRun: function (room, creep, remoteFlag) {

        creep.say('hauler remote');

        if (creep.memory.goingHome === true && creep.carry.energy == 0) {
            creep.memory.goingHome = false;
        }
        else if (creep.memory.goingHome === false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.goingHome = true;
        }

        if (creep.memory.goingHome === true) {
            if (creep.pos.roomName != creep.memory.room) {
                var constructionSitesInRange = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
                if (constructionSitesInRange.length > 0) {
                    creep.build(constructionSitesInRange[0]);
                }
                else {
                    var needingRepair = creep.pos.findInRange(FIND_STRUCTURES, 3, {filter: (s) => s.hits < s.hitsMax});
                    creep.repair(needingRepair[0]);
                    creep.moveTo(Game.rooms[creep.memory.room].find(FIND_MY_SPAWNS)[0], {reusePath: 37});
                }
            }
            else {
                var links = _.filter(global[room.name].links, (l) => l.energy < l.energyCapacity);
                var storage = room.storage;

                var arrayOfBoth = links;
                arrayOfBoth.push(storage);

                var closer = creep.pos.findClosestByPath(arrayOfBoth);

                if (closer != storage) {
                    if (creep.transfer(closer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closer, {reusePath: 10})
                    }
                }
                else if (room.storage) {
                    if (_.sum(room.storage.store) >= room.storage.storeCapacity) {
                        creep.drop(RESOURCE_ENERGY);
                    }
                    else if (creep.transfer(room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(room.storage);
                    }
                }
            }
        }
        else {
            if (creep.pos.roomName != remoteFlag.pos.roomName) {
                creep.moveTo(remoteFlag.pos, {reusePath: 37});
            }
            else {

                var droppedEnergy = creep.findDroppedEnergy(remoteFlag.room);

                if (droppedEnergy) {
                    if (creep.pickup(droppedEnergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(droppedEnergy, {reusePath: 10});
                    }
                }
                else {
                    var container = creep.findContainer(remoteFlag.room);

                    if (container) {
                        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(container, {reusePath: 10});
                        }
                    }
                    else {
                        creep.moveTo(remoteFlag.pos, {reusePath: 20});
                    }
                }
            }
        }

    }
};
