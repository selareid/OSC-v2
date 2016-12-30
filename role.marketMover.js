'use strict';

require('global');
require('prototype.creep')();
require('prototype.creepSpeech')();

const roleCarrier = require ('role.carrier');

module.exports = {
    run: function (room, creep) {

        var terminal = room.terminal;
        var orders = Memory.rooms[room].market;

        if (Game.market.getOrderById(orders[0])) {
            this.orderRun(room, creep, terminal, orders);
        }
        else {
            this.fillRun(room, creep, terminal);
        }
    },

    orderRun: function (room, creep, terminal, orders) {

        var order = Game.market.getOrderById(orders[0]);

            if (creep.memory.working == true && _.sum(creep.carry) == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.working = true;
            }

        if (creep.memory.working == true) {
            if (terminal) {
                if (_.sum(terminal.store) < terminal.storeCapacity) {
                    this.putStuffIntoTerminal(room, creep, terminal);
                }
                else roleCarrier.run(room, creep);
            }
        }
        else {
            var storage = room.storage;
            if (storage) {
                if (orders != undefined) {
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
                else roleCarrier.run(room, creep);
            }
            else roleCarrier.run(room, creep);
        }
    },

    fillRun: function (room, creep) {

        var terminal = room.terminal;

        if (creep.memory.working == false && _.sum(creep.carry) == 0) {
            creep.memory.working = true;
        }
        else if (creep.memory.working == true && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.working = false;
        }

        if (creep.memory.working == true) {
            var resourceToFill;

            do {
                resourceToFill = this.getResourceToFill(terminal).split(',');
            }
            while (resourceToFill.length < 2);

            var result = creep.withdraw(room.storage, resourceToFill[0], resourceToFill[1]);
            switch (result) {
                case 0:
                    creep.memory.working = false;
                    break;
                case -9:
                    creep.moveTo(rooms.storage);
                    break;
            }
        }
        else {
            for (let resourceType in creep.carry) {
                if (creep.transfer(terminal, resourceType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(terminal, {reusePath: 10});
                    break;
                }
            }
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
    },
    
    getResourceToFill: function (terminal) {
        if (terminal.store[RESOURCE_ENERGY] < 50000) {
            return RESOURCE_ENERGY + ',' + (50000-terminal.store[RESOURCE_ENERGY])
        }
        else {
            return ['',0];
        }
    }
};