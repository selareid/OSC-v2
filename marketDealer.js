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

                if (order.remainingAmount < resource) Game.market.extendOrder(order.id, resource - order.remainingAmount);

                var avg = this.getAvrg(Game.market.getAllOrders({resourceType: resourceType, type: ORDER_BUY}));

                if (Math.abs(order.price - avg) > 0.05) Game.market.changeOrderPrice(order.id, avg);

            }
        }
    },

    getAvrg: function (allOrders) {
        return Math.floor((_.sum(allOrders, '.price') / allOrders.length * 100)) / 100; //average with only 2 decimal places
    }
};