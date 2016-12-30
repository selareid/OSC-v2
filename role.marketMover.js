'use strict';

require('global');
require('prototype.creep')();
require('prototype.creepSpeech')();

const roleCarrier = require ('role.carrier');

module.exports = {
    run: function (room, creep) {
        var labQueueFirst = Memory.rooms[room].labQueue[0];
        if (labQueueFirst && labQueueFirst.split(',').length == 2) {
            this.labRun(room, creep, Memory.rooms[room].labQueue)
        }
        else {
            this.normalRun(room, creep);
        }
    },

    normalRun: function (room, creep) {

        var terminal = room.terminal;
        var terminalStore = _.sum(terminal.store);

        var orders = Memory.rooms[room].market;
        var order = Game.market.getOrderById(orders[0]);

        if (order || terminalStore == 0) {
            if (creep.memory.working == true && creep.carry.energy == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.working = true;
            }
        }
        else {
            if (creep.memory.working == false && creep.carry.energy == 0) {
                creep.memory.working = true;
            }
            else if (creep.memory.working == true && _.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.working = false;
            }
        }

        if (creep.memory.working == true) {
            if (terminal) {
                if (order || terminalStore == 0) {
                    if (_.sum(terminal.store) < terminal.storeCapacity) {
                        this.putStuffIntoTerminal(room, creep, terminal);
                    }
                    else roleCarrier.run(room, creep);
                }
                else {
                    if (room.storage.store[RESOURCE_ENERGY] > 600000) {
                        this.putStuffIntoTerminal(room, creep, terminal);
                    }
                    else this.pullStuffFromTerminal(room, creep, terminal);
                }
            }
            else roleCarrier.run(room, creep);
        }
        else {
            var storage = room.storage;
            if (storage) {
                if (orders != undefined) {
                    if (order || terminalStore == 0) {
                        if (order) {
                            var costinEnergy = Game.market.calcTransactionCost(order.amount, room.name, order.roomName);
                            if ((RESOURCE_ENERGY in terminal.store) && terminal.store[RESOURCE_ENERGY] >= costinEnergy) {
                                var resource = order.resourceType;
                                if (_.filter(storage.store, (r) => r.resourceType == resource)) {
                                    if (creep.withdraw(storage, resource) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(storage);
                                    }
                                }
                            }
                            else {
                                this.collectEnergy(room, creep, storage);
                            }
                        }
                        else roleCarrier.run(room, creep);
                    }
                    else {
                        if (room.storage.store[RESOURCE_ENERGY] > 600000) {
                            this.collectEnergy(room, creep, storage);
                        }
                        else {
                            for (let resourceType in creep.carry) {
                                if (creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(storage);
                                    break;
                                }
                            }
                        }
                    }
                }
                else roleCarrier.run(room, creep);
            }
            else roleCarrier.run(room, creep);
        }
    },

    labRun: function (room, creep, labQueue) {
        var storage = room.storage;
        var nextReaction = labQueue[0].split(',');

        if (storage.store[nextReaction[0]] && storage.store[nextReaction[1]]) { //storage has needed resources

            if (creep.memory.working == true && creep.carry.energy == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.working = true;
            }

            if (creep.memory.working == true) {
                var labs = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LAB && Memory.rooms[room].labs[s.id].type == 0});

                if (labs.length == 2) {

                    if (creep.memory.lab == 1) {
                        creep.memory.lab = 0;

                        if (labs[0].mineralAmount > 0 && creep.carry[labs[0].mineralType] != undefined) {
                            if (creep.transfer(labs[0], labs[0].mineralType) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(labs[0]);
                            }
                        }
                        else if (labs[1].mineralAmount > 0 && creep.carry[labs[1].mineralType] != undefined) {
                            if (creep.transfer(labs[1], labs[1].mineralType) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(labs[1]);
                            }
                        }
                        else { //none of the labs have minerals or not the minerals we need
                            if (labs[0].mineralType == undefined) {
                                if (creep.transfer(labs[0], nextReaction[0]) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(labs[0]);
                                }
                            }
                            if (labs[1].mineralType == undefined) {
                                if (creep.transfer(labs[1], nextReaction[1]) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(labs[1]);
                                }
                            }
                        }
                    }
                    else {
                        creep.memory.lab = 1;

                        if (labs[1].mineralAmount > 0 && creep.carry[labs[1].mineralType] != undefined) {
                            if (creep.transfer(labs[1], labs[1].mineralType) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(labs[1]);
                            }
                        }
                        else if (labs[0].mineralAmount > 0 && creep.carry[labs[0].mineralType] != undefined) {
                            if (creep.transfer(labs[0], labs[0].mineralType) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(labs[0]);
                            }
                        }
                        else { //none of the labs have minerals or not the minerals we need
                            if (labs[1].mineralType == undefined) {
                                if (creep.transfer(labs[1], nextReaction[1]) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(labs[1]);
                                }
                            }
                            if (labs[0].mineralType == undefined) {
                                if (creep.transfer(labs[0], nextReaction[0]) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(labs[0]);
                                }
                            }
                        }
                    }

                }

            }
            else {
                switch (Game.time % 2) {
                    case 1:
                        if (creep.withdraw(storage, nextReaction[0], creep.carryCapacity / 2) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage);
                        }
                        break;
                    default:
                        if (creep.withdraw(storage, nextReaction[1], creep.carryCapacity / 2) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage);
                        }
                        break;
                }
            }

        }
        else {
            Memory.rooms[room].labQueue.splice(0, 1);
        }

    },

    collectEnergy: function (room, creep, storage) {
        if (storage.store[RESOURCE_ENERGY] > 350000) {
            if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage);
            }
        }
        else roleCarrier.run(room, creep);
    },

    putStuffIntoTerminal: function (room, creep, terminal) {
        for (let resourceType in creep.carry) {
            if (creep.transfer(terminal, resourceType) == ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal);
            }
        }
    },

    pullStuffFromTerminal: function (room, creep, terminal) {
        for (let resourceType in terminal.store) {
            if (creep.withdraw(terminal, resourceType) == ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal);
                break;
            }
        }
    }
};