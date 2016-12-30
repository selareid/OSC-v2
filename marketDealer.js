'use strict';

require('global');

module.exports = {
    run: function (room, terminal) {
        var orders = Memory.rooms[room].market;
        if (orders != undefined) {
            if (orders.length > 0) {
                var order = Game.market.getOrderById(orders[0]);
                if (order && order.amount > 0) {
                    switch (order.type) {
                        case ORDER_BUY:
                            this.sell(room, terminal, order);
                            break;
                        case ORDER_SELL:
                            this.buy(room, terminal, order);
                            break;
                    }
                }
                else {
                    Memory.rooms[room].market.splice(0, 1);
                    console.log('removed order');
                }
            }
        }
        else {
            Memory.rooms[room].market = [];
        }
    },

    sell: function (room, terminal, order) {
        var resourceInTerm = false;
        var resourcesInTerm = [];
        for (let resourceType in terminal.store) {
            resourcesInTerm.push(resourceType);
        }

        if (resourcesInTerm.includes(order.resourceType)) {
            resourceInTerm = true;
        }

        if (resourceInTerm) {
            var amountToDeal = terminal.store[order.resourceType];
            var costOfTrans = Game.market.calcTransactionCost(amountToDeal, room.name, order.roomName);
            var energyNeeded = costOfTrans;
            var amountOver;

            if (amountToDeal > order.amount) {
                amountToDeal = order.amount;
            }

            if (order.resourceType == RESOURCE_ENERGY) {
                energyNeeded = costOfTrans + amountToDeal;
                if (energyNeeded > terminal.store[RESOURCE_ENERGY]) {
                    amountToDeal = 1000;
                    energyNeeded = costOfTrans + amountToDeal;
                    if (energyNeeded > terminal.store[RESOURCE_ENERGY]) {
                        amountToDeal = 10;
                    }
                }
            }
            else if (energyNeeded > terminal.store[RESOURCE_ENERGY]) {
                amountToDeal = 1000;
                if (amountToDeal > terminal.store[order.resourceType]) {
                    amountToDeal = 10;
                }
            }

            var result = Game.market.deal(order.id, amountToDeal, room.name);

            console.log('Market Sell Order Dealt Result = ' + result + ' Room = ' + room.name + ' Amount = ' + amountToDeal + ' Amount In Order = ' + order.amount);
        }
    },

    buy: function (room, terminal, order) {
        if (_.sum(terminal.store) <= order.amount) {
            var creditsAvailable = Game.market.credits - 2000;
            if (creditsAvailable > 0) {
                var amountToBuy = Math.floor(creditsAvailable/order.price);
                if (amountToBuy > 0) {
                    if (amountToBuy > order.amount) {
                        amountToBuy = order.amount;
                    }

                    var result = Game.market.deal(order.id, amountToBuy, room.name);

                    console.log('Market Buy Order Dealt Result = ' + result + ' Room = ' + room.name);

                }
                else {
                    Memory.rooms[room].market.splice(0, 1);
                }
            }
            else {
                Memory.rooms[room].market.splice(0, 1);
            }
        }
        else {
            Memory.rooms[room].market.splice(0, 1);
        }
    }
};