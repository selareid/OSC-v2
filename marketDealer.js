'use strict';

require('global');

module.exports = {
    run: function (room, terminal) {
        if (terminal.store[RESOURCE_ENERGY] < 1000) return;

        for (let resourceType in terminal.store) {
            if (resourceType == RESOURCE_ENERGY) continue;
            let resource = terminal.store[resourceType];
            if (resource > 1000) {
                let bestOrder = {orderId: undefined, priceOverAll: 0, energyCostToSend: 0, amount: 0};

                for (let order of Game.market.getAllOrders({resourceType: resourceType})) {
                    let orderRoom = order.roomName;
                    let orderPrice = order.price;
                    let energyCostToSend = global.energyCostToSend(orderRoom);
                    let priceOverAll = global.priceOverAll(orderPrice, energyCostToSend);
                    if (priceOverAll > bestOrder.priceOverAll) bestOrder = {orderId: order.id, priceOverAll: priceOverAll, energyCostToSend: energyCostToSend, amount: order.amount};
                }

                if (bestOrder.orderId) {
                    let amountToDeal = Math.floor((terminal.store[RESOURCE_ENERGY]-10)/bestOrder.energyCostToSend);
                    Game.market.deal(bestOrder.orderId, amountToDeal, room.name);
                    return;
                }
            }
        }

    }
};