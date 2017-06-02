'use strict';
require('global');
module.exports = {
    run: function (room, terminal) {
        for (let resourceType in terminal.store) {
            if (resourceType == RESOURCE_ENERGY) {
                if (room.storage.store.energy > 110000 && terminal.store.energy > 50000) this.sellEnergy(room, terminal);
                continue;
            }
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

                var avg = this.getAvrg(Game.market.getAllOrders({resourceType: resourceType, type: ORDER_BUY}))+0.02;

                var rslTwo;
                if (Math.abs(order.price - avg) > 0.05) rslTwo = Game.market.changeOrderPrice(order.id, avg);
                if (rslTwo !== undefined && rslTwo !== null) {
                    global.marketLog('Changed Order Price ' + order.id + ' To ' + avg + '\n With Result: ' + rslTwo, room);
                }

            }
        }

        var that = this;

        (function () {
            if (room.controller.level >= 8) {
                var order = _.filter(Game.market.orders, (o) => o.roomName == room.name && o.type == ORDER_BUY && o.resourceType == RESOURCE_GHODIUM)[0];

                if (room.storage && (!room.storage.store[RESOURCE_GHODIUM] || room.storage.store[RESOURCE_GHODIUM] < global.storageData[RESOURCE_GHODIUM]-1000)) {
                    var allOrders = Game.market.getAllOrders({resourceType: RESOURCE_GHODIUM});
                    var avgGhodiumPrice = Math.floor((_.sum(allOrders, '.price') / allOrders.length * 100)) / 100;

                    if (avgGhodiumPrice > 2.5) return;

                    var amountNeeded = room.storage.store[RESOURCE_GHODIUM] ? Math.abs(room.storage.store[RESOURCE_GHODIUM] - room.storage.store[RESOURCE_GHODIUM]) : global.storageData[RESOURCE_GHODIUM];

                    if (!order) {
                        if (amountNeeded * avgGhodiumPrice > Game.market.credits - 10000) return;

                        that.createBuyNewOrder(room, RESOURCE_GHODIUM, amountNeeded, avgGhodiumPrice)
                    }
                    else {
                        if (Math.abs(order.price - avgGhodiumPrice) > 0.05) rslTwo = Game.market.changeOrderPrice(order.id, avgGhodiumPrice);
                        if (order.amount < amountNeeded) Game.market.extendOrder(order.id, amountNeeded-order.amount)
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
        Game.market.createOrder(ORDER_BUY, resource, price, amount, room.name);
    },

    getAvrg: function (allOrders) {
        return Math.floor((_.sum(allOrders, '.price') / allOrders.length * 100)) / 100; //average with only 2 decimal places
    },
        
    sellEnergy: function (room, terminal) {
            var orders = Game.market.getAllOrders(order => order.resourceType == RESOURCE_ENERGY &&
    order.type == ORDER_BUY && Math.ceil(Game.market.calcTransactionCost(1, room.name, order.roomName)*1000) <= 1000);
            if (orders.length < 1) return;
        
            
            var order = _.max(orders, (o) => o.price);
            if (!order) return;
        
            var engRsl = Game.market.deal(order.id, (24000 > order.amount ? order.amount : 24000), room.name)
            
            if (engRsl !== undefined && engRsl !== null) {
                    global.marketLog('Sold Energy: ' + order.id + '\n Amount: ' + (24000 > order.amount ? order.amount : 24000) + '\n At Price: ' + order.price + '\n To Room: ' + order.roomName + '\n With Result: ' + engRsl, room);
            }
    }
};
