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

                var logMsg;
                var rsl;

                if (order.remainingAmount < resource) rsl = Game.market.extendOrder(order.id, resource - order.remainingAmount);
                if (rsl) {
                    logMsg = 'Extended Order ' + order.id + ' By ' + resource - order.remainingAmount;
                    rsl = undefined
                }

                var avg = this.getAvrg(Game.market.getAllOrders({resourceType: resourceType, type: ORDER_BUY}));

                if (Math.abs(order.price - avg) > 0.05) rsl = Game.market.changeOrderPrice(order.id, avg);
                if (rsl) {
                    logMsg = logMsg + ' Changed Order Price ' + order.id + ' To ' + avg;
                    rsl = undefined
                }

                if (logMsg) {
                    console.log(logMsg);
                    Game.notify(logMsg);
                }
            }
        }
    },

    getAvrg: function (allOrders) {
        return Math.floor((_.sum(allOrders, '.price') / allOrders.length * 100)) / 100; //average with only 2 decimal places
    }
};