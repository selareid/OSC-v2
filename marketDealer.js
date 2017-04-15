'use strict';
require('global');
module.exports = {
    run: function (room, terminal) {
        for (let resourceType in terminal.store) {
            if (resourceType == RESOURCE_ENERGY) continue;
            let resource = terminal.store[resourceType];
            if (resource > 25000) {

                var order = _.filter(Game.market.orders, (o) => o.roomName == room.name && o.type == ORDER_SELL && o.resourceType == resourceType)[0];
                if (!order) return; //Todo: add create order code

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
    },

    getAvrg: function (allOrders) {
        return Math.floor((_.sum(allOrders, '.price') / allOrders.length * 100)) / 100; //average with only 2 decimal places
    }
};