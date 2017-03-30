'use strict';

global.allianceName = 'INT_MAX';
global.Allies = ['Lur', 'starwar15432', 'Leonyx', 'theKraken'];

global.REVERSE_DIR = {
    [TOP]            : BOTTOM,
    [TOP_RIGHT]        : BOTTOM_LEFT,
    [RIGHT]            : LEFT,
    [BOTTOM_RIGHT]    : TOP_LEFT,
    [BOTTOM]        : TOP,
    [BOTTOM_LEFT]    : TOP_RIGHT,
    [LEFT]            : RIGHT,
    [TOP_LEFT]        : BOTTOM_RIGHT
};

global.STRUCTUREDECAY = {
    [STRUCTURE_ROAD] : 500,
    [STRUCTURE_RAMPART] : 300,
    [STRUCTURE_CONTAINER] : 5000
};

global.energyValue = 0.05;
global.energyCostToSend = function (room, roomName2) {return Game.market.calcTransactionCost(1000, room.name, roomName2)/1000;};
global.priceOverAll =  function (price, energyCostPerMineral, energyCreditCost = global.energyValue) {return price - energyCostPerMineral * energyCreditCost;};

global.storageData = {};

global.storageData[RESOURCE_ENERGY] = 50000;
global.storageData[RESOURCE_HYDROGEN] = 6000;
global.storageData[RESOURCE_OXYGEN] = 6000;
global.storageData[RESOURCE_UTRIUM] = 6000;
global.storageData[RESOURCE_KEANIUM] = 6000;
global.storageData[RESOURCE_LEMERGIUM] = 6000;
global.storageData[RESOURCE_ZYNTHIUM] = 6000;
global.storageData[RESOURCE_CATALYST] = 6000;

global.storageData[RESOURCE_HYDROXIDE] = 6000;
global.storageData[RESOURCE_GHODIUM] = 6000;
global.storageData[RESOURCE_ZYNTHIUM_KEANITE] = 6000;
global.storageData[RESOURCE_UTRIUM_LEMERGITE] = 6000;


global.storageData[RESOURCE_UTRIUM_HYDRIDE] = 6000;
global.storageData[RESOURCE_UTRIUM_OXIDE] = 6000;
global.storageData[RESOURCE_KEANIUM_HYDRIDE] = 6000;
global.storageData[RESOURCE_KEANIUM_OXIDE] = 6000;
global.storageData[RESOURCE_LEMERGIUM_HYDRIDE] = 6000;
global.storageData[RESOURCE_LEMERGIUM_OXIDE] = 6000;
global.storageData[RESOURCE_ZYNTHIUM_HYDRIDE] = 6000;
global.storageData[RESOURCE_ZYNTHIUM_OXIDE] = 6000;
global.storageData[RESOURCE_GHODIUM_HYDRIDE] = 6000;
global.storageData[RESOURCE_GHODIUM_OXIDE] = 6000;

global.storageData[RESOURCE_UTRIUM_ACID] = 3000;
global.storageData[RESOURCE_UTRIUM_ALKALIDE] = 3000;
global.storageData[RESOURCE_KEANIUM_ACID] = 3000;
global.storageData[RESOURCE_KEANIUM_ALKALIDE] = 3000;
global.storageData[RESOURCE_LEMERGIUM_ACID] = 3000;
global.storageData[RESOURCE_LEMERGIUM_ALKALIDE] = 3000;
global.storageData[RESOURCE_ZYNTHIUM_ACID] = 3000;
global.storageData[RESOURCE_ZYNTHIUM_ALKALIDE] = 3000;
global.storageData[RESOURCE_GHODIUM_ACID] = 3000;
global.storageData[RESOURCE_GHODIUM_ALKALIDE] = 3000;

global.storageData[RESOURCE_CATALYZED_UTRIUM_ACID] = 6000;
global.storageData[RESOURCE_CATALYZED_UTRIUM_ALKALIDE] = 6000;
global.storageData[RESOURCE_CATALYZED_KEANIUM_ACID] = 6000;
global.storageData[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 6000;
global.storageData[RESOURCE_CATALYZED_LEMERGIUM_ACID] = 6000;
global.storageData[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 6000;
global.storageData[RESOURCE_CATALYZED_ZYNTHIUM_ACID] = 6000;
global.storageData[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] = 6000;

global.errorString = "[" + "<p style=\"display:inline; color: #ed4543\">ERROR</p>" + "] ";

global.roomLink = function (room) {
    return "[" + "<p style=\"display:inline; color: #ed4543\"><a href='#!/room/" + room.name +"' target='_blank'>" + room.name + "</a></p>" + "] ";
};


global.roomLog = function (message, room) {
    if (!message) return console.log(global.errorString + 'No message passed to global.roomLog');

    if (room && room.name) return console.log(roomLink(room) + message);
    else return console.log(message); // I swear that else is only there for clarity

};

global.creepLog = function (message, creep, room) {
    if (!message) return console.log(global.errorString + 'No message passed to global.creepLog');

    if (room && room.name) return console.log(roomLink(room) + '[' + creep.name + '] ' + message);
    else if (creep && creep.name) return console.log('[' + creep.name + '] ' + message);
    else return console.log(message); // I swear that else is only there for clarity
};

global.errorLog = function (message, room) {
    if (!message) return console.log(global.errorString + 'No message passed to global.errorLog');

    if (room && room.name) return console.log(roomLink(room) + global.errorString + message);
    else return console.log(global.errorString + message); // I swear that else is only there for clarity

};

global.creepErrorLog = function (message, creep, room) {
    if (!message) return console.log(global.errorString + 'No message passed to global.creepErrorLog');

    if (room && room.name) return console.log(roomLink(room) + '[' + creep.name + '] ' + global.errorString + message);
    else if (creep && creep.name) return console.log('[' + creep.name + '] ' + global.errorString + message);
    else return console.log(global.errorString + message); // I swear that else is only there for clarity
};