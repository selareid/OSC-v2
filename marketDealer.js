'use strict';
require('global');
module.exports = {
    run: function (room, terminal) {
        if (terminal.store[RESOURCE_ENERGY] < 1000) return;
        for (let resourceType in terminal.store) {
            if (resourceType == RESOURCE_ENERGY) continue;
            let resource = terminal.store[resourceType];
            if (resource > 1000) {
                let bestOrder = {orderId: undefined, priceOverAll: global.energyValue, energyCostToSend: 0, amount: 0};
                for (let order of Game.market.getAllOrders({resourceType: resourceType, type: ORDER_BUY})) {
                    let orderRoom = order.roomName;
                    let orderPrice = order.price;
                    let energyCostToSend = global.energyCostToSend(room, orderRoom);
                    let priceOverAll = global.priceOverAll(orderPrice, energyCostToSend);
                    if (priceOverAll > bestOrder.priceOverAll) bestOrder = {
                        orderId: order.id,
                        priceOverAll: priceOverAll,
                        energyCostToSend: energyCostToSend,
                        amount: order.amount
                    };

                }
                if (bestOrder.orderId) {
                    let amountToDeal = Math.floor((terminal.store[RESOURCE_ENERGY] - 10) / bestOrder.energyCostToSend) > terminal.store[Game.market.getOrderById(bestOrder.orderId).resourceType] ? terminal.store[Game.market.getOrderById(bestOrder.orderId).resourceType] : Math.floor((terminal.store[RESOURCE_ENERGY] - 10) / bestOrder.energyCostToSend);
                    Game.market.deal(bestOrder.orderId, amountToDeal, room.name);
                    global.roomLog('Order ' + bestOrder.orderId + ' dealt, amount ' + amountToDeal, room);
                    return;
                }
            }
        }
    }
};