'use strict';
require('global');
module.exports = {
    run: function (room, terminal) {
        for (let resourceType in terminal.store) {
            if (resourceType == RESOURCE_ENERGY) continue;
            let resource = terminal.store[resourceType];
            if (resource > 25000) {

                var order = _.filter(Game.market.orders, (o) => o.roomName == room.name && o.type == ORDER_SELL && o.resourceType == resourceType)[0];
                if (!order) {
                    this.createSellNewOrder(room, resourceType);
                    return;
                }

                var rslOne;

                if (order.remainingAmount < resource) rslOne = Game.market.extendOrder(order.id, resource - order.remainingAmount);
                if (rslOne !== undefined && rslTwo !== null) {
                    global.marketLog('Extended Order ' + order.id + ' By ' + (resource - order.remainingAmount) + '\n With Result: ' + rslOne, room);
                }

                var avg = this.getAvrg(Game.market.getAllOrders({resourceType: resourceType, type: ORDER_BUY}));

                var rslTwo;
                if (Math.abs(order.price - avg) > 0.05) rslTwo = Game.market.changeOrderPrice(order.id, avg);
                if (rslTwo !== undefined && rslTwo !== null) {
                    global.marketLog('Changed Order Price ' + order.id + ' To ' + avg + '\n With Result: ' + rslTwo, room);
                }

            }
        }

        (function () {
            if (room.controller.level >= 8) {
                var order = _.filter(Game.market.orders, (o) => o.roomName == room.name && o.type == ORDER_BUY && o.resourceType == RESOURCE_GHODIUM)[0];

                if (room.storage && (!room.storage.store[RESOURCE_GHODIUM] || room.storage.store[RESOURCE_GHODIUM] < global.storageData[RESOURCE_GHODIUM])) {
                    var allOrders = Game.market.getAllOrders({resourceType: RESOURCE_GHODIUM});
                    var avgGhodiumPrice = Math.floor((_.sum(allOrders, '.price') / allOrders.length * 100)) / 100;

                    if (avgGhodiumPrice > 2.5) return;

                    if (!order) {
                        var amountNeeded = room.storage.store[RESOURCE_GHODIUM] ? Math.abs(room.storage.store[RESOURCE_GHODIUM] - room.storage.store[RESOURCE_GHODIUM]) : global.storageData[RESOURCE_GHODIUM];

                        if (amountNeeded * avgGhodiumPrice > Game.market.credits - 10000) return;

                        this.createBuyNewOrder(room, RESOURCE_GHODIUM, amountNeeded, avgGhodiumPrice)
                    }
                    else {
                        if (Math.abs(order.price - avgGhodiumPrice) > 0.05) rslTwo = Game.market.changeOrderPrice(order.id, avgGhodiumPrice);
                    }
                }
                else {
                    if (order) Game.market.cancelOrder(order.id);
                }
            }
        })();
    },
    
    createSellNewOrder: function (room, resource) {
        Game.market.createOrder(ORDER_SELL, resource, 0.01, 1, room.name);
    },

    createBuyNewOrder: function (room, resource, amount, price) {
        Game.market.createOrder(ORDER_BUY, resource, 0.01, 1, room.name);
    },

    getAvrg: function (allOrders) {
        return Math.floor((_.sum(allOrders, '.price') / allOrders.length * 100)) / 100; //average with only 2 decimal places
    }
};