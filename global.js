'use strict';

global.allianceName = 'INT_MAX';
global.Allies = ['Lur', 'starwar15432', 'Leonyx', 'theKraken'];

global.signTime = 4500;
global.sign = [
    'Territory Of INTEGER_MAX',
    'CIRCLE WORLD!',
    'INTEGER_MAX',
    'Cake!',
    'Delicious Cake!',
    'My Cake Is Real',
    'The Cake Is A Lie',
    'Territory Of STARWAR15432, An INTEGER_MAX MEMBER',
    'Cake, and grief counseling, will be available at the conclusion of the test -GLaDOS',
    "In layman's terms, speedy thing goes in, speedy thing comes out -GLaDOS",
    "It's been a long time. I've been *really* busy being dead. You know, after you MURDERED ME? -GLaDOS",
    "When life gives you lemons, don't make lemonade! Make life take the lemons back! -Portal 2",
    "Do you know who I am? I'm the man whose gonna burn your house down - with the lemons! -Portal 2",
    "It's your friend deadly neurotoxin. If I were you, I'd take a deep breath. And hold it. -Portal 2",
    "See that? That is a potato battery. It's a toy for children. And now she lives in it.  -Portal 2"
];

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

global.storageData2 = {};

global.storageData2[RESOURCE_UTRIUM_HYDRIDE] = 6000;
global.storageData2[RESOURCE_UTRIUM_OXIDE] = 6000;
global.storageData2[RESOURCE_KEANIUM_HYDRIDE] = 6000;
global.storageData2[RESOURCE_KEANIUM_OXIDE] = 6000;
global.storageData2[RESOURCE_LEMERGIUM_HYDRIDE] = 6000;
global.storageData2[RESOURCE_LEMERGIUM_OXIDE] = 6000;
global.storageData2[RESOURCE_ZYNTHIUM_HYDRIDE] = 6000;
global.storageData2[RESOURCE_ZYNTHIUM_OXIDE] = 6000;
global.storageData2[RESOURCE_GHODIUM_HYDRIDE] = 6000;
global.storageData2[RESOURCE_GHODIUM_OXIDE] = 6000;

global.storageData2[RESOURCE_UTRIUM_ACID] = 3000;
global.storageData2[RESOURCE_UTRIUM_ALKALIDE] = 3000;
global.storageData2[RESOURCE_KEANIUM_ACID] = 3000;
global.storageData2[RESOURCE_KEANIUM_ALKALIDE] = 3000;
global.storageData2[RESOURCE_LEMERGIUM_ACID] = 3000;
global.storageData2[RESOURCE_LEMERGIUM_ALKALIDE] = 3000;
global.storageData2[RESOURCE_ZYNTHIUM_ACID] = 3000;
global.storageData2[RESOURCE_ZYNTHIUM_ALKALIDE] = 3000;
global.storageData2[RESOURCE_GHODIUM_ACID] = 3000;
global.storageData2[RESOURCE_GHODIUM_ALKALIDE] = 3000;

global.storageData2[RESOURCE_CATALYZED_UTRIUM_ACID] = 6000;
global.storageData2[RESOURCE_CATALYZED_UTRIUM_ALKALIDE] = 6000;
global.storageData2[RESOURCE_CATALYZED_KEANIUM_ACID] = 6000;
global.storageData2[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 6000;
global.storageData2[RESOURCE_CATALYZED_LEMERGIUM_ACID] = 6000;
global.storageData2[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 6000;
global.storageData2[RESOURCE_CATALYZED_ZYNTHIUM_ACID] = 6000;
global.storageData2[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] = 6000;

global.addReserveRoom = function (room, reserveRoom) {
    return Memory.rooms[Game.rooms[room]].rsv.push(reserveRoom);
};

global.addRemoteMine = function (room, remoteRoom, harvesters = 0, miners = 0) {
    if (!remoteRoom) return 'bad remoteRoom';
    if (harvesters == 0 && miners == 0) return 'bad creeps';

    return Memory.rooms[Game.rooms[room]].rmtR.push(remoteRoom + ',' + harvesters + ',' + miners);
};

global.errorString = "[" + "<p style=\"display:inline; color: #ed4543\">ERROR</p>" + "] ";

global.objectLinker = function(roomArg, text = undefined, select = true) {
    let roomName;
    let id = roomArg.id;
    if (roomArg instanceof Room) {
        roomName = roomArg.name;
    } else if (roomArg.pos != undefined) {
        roomName = roomArg.pos.roomName;
    } else if (roomArg.roomName != undefined) {
        roomName = roomArg.roomName;
    } else if (typeof roomArg === 'string') {
        roomName = roomArg;
    } else {
        console.log(`Invalid parameter to roomLink global function: ${roomArg} of type ${typeof roomArg}`);
    }
    text = text || (id ? roomArg : roomName);
    return `<a style="color: #c49e4c" href="#!/room/${roomName}" ${select && id ? `onclick="angular.element('body').injector().get('RoomViewPendingSelector').set('${id}')"` : ``}>${text}</a>`;
};

// * Author: Helam, Dragnar, Fubz
global.roomLinker = function(roomArg, text = undefined, select = true) {
    let roomName;
    let id = roomArg.id;
    if (roomArg instanceof Room) {
        roomName = roomArg.name;
    } else if (roomArg.pos != undefined) {
        roomName = roomArg.pos.roomName;
    } else if (roomArg.roomName != undefined) {
        roomName = roomArg.roomName;
    } else if (typeof roomArg === 'string') {
        roomName = roomArg;
    } else {
        console.log(`Invalid parameter to roomLink global function: ${roomArg} of type ${typeof roomArg}`);
    }
    text = text || (id ? roomArg : roomName);
    return `<a style="color: #61ed3b" href="#!/room/${roomName}" ${select && id ? `onclick="angular.element('body').injector().get('RoomViewPendingSelector').set('${id}')"` : ``}>${text}</a>`;
};

global.roomLink = function (room) {
    return "[" + "<p style='display:inline'>" + global.roomLinker(room.name) + "</p>" + "] ";
};

global.marketHeader = function () {
    return "[" + "<p style='display:inline'>" + 'MARKET' + "</p>" + "] ";
};

global.roomLog = function (message, room) {
    if (!message) return console.log('[' + Game.time + '] ' + global.errorString + 'No message passed to global.roomLog');

    if (room && room.name) return console.log('[' + Game.time + '] ' + roomLink(room) + message);
    else return console.log('[' + Game.time + '] ' + message); // I swear that else is only there for clarity

};

global.marketLog = function (message, room) {
    if (!message) return console.log('[' + Game.time + '] ' + global.errorString + 'No message passed to global.roomLog');

    if (room && room.name) return console.log('[' + Game.time + '] ' + roomLink(room) + global.marketHeader() + message);
    else return console.log('[' + Game.time + '] ' + global.marketHeader() + message); // I swear that else is only there for clarity

};

global.creepLog = function (message, creep, room) {
    if (!message) return console.log('[' + Game.time + '] ' + global.errorString + 'No message passed to global.creepLog');

    if (room && room.name) return console.log('[' + Game.time + '] ' + roomLink(room) + '[' + global.objectLinker(creep, creep.name) + '] ' + message);
    else if (creep && creep.name) return console.log('[' + Game.time + '] ' + '[' + global.objectLinker(creep, creep.name) + '] ' + message);
    else return console.log('[' + Game.time + '] ' + message); // I swear that else is only there for clarity
};

global.errorLog = function (message, room) {
    if (!message) return console.log('[' + Game.time + '] ' + global.errorString + 'No message passed to global.errorLog');

    if (room && room.name) return console.log('[' + Game.time + '] ' + roomLink(room) + global.errorString + message);
    else return console.log('[' + Game.time + '] ' + global.errorString + message); // I swear that else is only there for clarity

};

global.creepErrorLog = function (message, creep, room) {
    if (!message) return console.log('[' + Game.time + '] ' + global.errorString + 'No message passed to global.creepErrorLog');

    if (room && room.name) return console.log('[' + Game.time + '] ' + roomLink(room) + '[' + global.objectLinker(creep, creep.name) + '] ' + global.errorString + message);
    else if (creep && creep.name) return console.log('[' + Game.time + '] ' + '[' + global.objectLinker(creep, creep.name) + '] ' + global.errorString + message);
    else return console.log('[' + Game.time + '] ' + global.errorString + message); // I swear that else is only there for clarity
};


global.roadTest = function (roomName) {
    if (!roomName) return 'No Room Name';
    var room = Game.rooms[roomName];
    if (!room) return 'bad room';

    if (!Memory.rooms[room].pthSpwn) Memory.rooms[room].pthSpwn = {};
    if (!Memory.rooms[room].srcpth) Memory.rooms[room].srcpth = [];

    var storage = room.storage;
    var terminal = room.terminal;

    var radius = 0.3;
    var style;

    if (storage) {
        let pathController = Memory.rooms[room].pthCntrl ? Room.deserializePath(Memory.rooms[room].pthCntrl) : undefined;

        if (!pathController) {
            pathController = room.findPath(storage.pos, room.controller.pos, {
                    ignoreCreeps: true,
                    ignoreRoads: true,
                    plainCost: 1,
                    swampCost: 1
                }) || [];
            Memory.rooms[room].pthCntrl = Room.serializePath(pathController);
        }

        _.forEach(pathController, (pathData) => {
            room.visual.circle(pathData.x, pathData.y, {radius: radius, lineStyle: style});
        });


        _.forEach(global[room.name].spawns, (spawn) => {
            let pathSpawn = Memory.rooms[room].pthSpwn[spawn.name] ? Room.deserializePath(Memory.rooms[room].pthSpwn[spawn.name]) : undefined;

            if (!pathSpawn) {
                pathSpawn = room.findPath(storage.pos, spawn.pos, {
                        ignoreCreeps: true,
                        ignoreRoads: true,
                        plainCost: 1,
                        swampCost: 1
                    }) || [];
                Memory.rooms[room].pthSpwn[spawn.name] = Room.serializePath(pathSpawn);
            }
            _.forEach(pathSpawn, (pathData) => {
                room.visual.circle(pathData.x, pathData.y, {radius: radius, lineStyle: style});
            });
        });
    }

    _.forEach(global[room.name].sources, (source) => {
        if (!Memory.rooms[room].srcpth[source.id]) Memory.rooms[room].srcpth[source.id] = [];

        // if (storage) {
        //     let pathStorage = Memory.rooms[room].srcpth[source.id][0] ? Room.deserializePath(Memory.rooms[room].srcpth[source.id][0]) : undefined;
        //     if (!pathStorage) {
        //         pathStorage = room.findPath(storage.pos, source.pos, {
        //                 ignoreCreeps: true,
        //                 ignoreRoads: true,
        //                 plainCost: 1,
        //                 swampCost: 1
        //             }) || [];
        //         Memory.rooms[room].srcpth[source.id][0] = Room.serializePath(pathStorage);
        //     }
        //     _.forEach(pathStorage, (pathData) => {
        //         room.visual.circle(pathData.x, pathData.y, {radius: radius, lineStyle: style});
        //     });
        // }
        // else {
        //     let pathController = Memory.rooms[room].srcpth[source.id][1] ? Room.deserializePath(Memory.rooms[room].srcpth[source.id][1]) : undefined;
        //     if (!pathController) {
        //         pathController = room.findPath(room.controller.pos, source.pos, {
        //                 ignoreCreeps: true,
        //                 ignoreRoads: true,
        //                 plainCost: 1,
        //                 swampCost: 1
        //             }) || [];
        //         Memory.rooms[room].srcpth[source.id][1] = Room.serializePath(pathController);
        //     }
        //
        //     _.forEach(pathController, (pathData) => {
        //         room.visual.circle(pathData.x, pathData.y, {radius: radius, lineStyle: style});
        //     });

        if (!Memory.rooms[room].srcpth[source.id][2]) Memory.rooms[room].srcpth[source.id][2] = {};

        _.forEach(global[room.name].spawns, (spawn) => {
            let pathSpawn = Memory.rooms[room].srcpth[source.id][2][spawn.name] ? Room.deserializePath(Memory.rooms[room].srcpth[source.id][2][spawn.name]) : undefined;
            if (!pathSpawn) {
                pathSpawn = room.findPath(spawn.pos, source.pos, {
                        ignoreCreeps: true,
                        ignoreRoads: true,
                        plainCost: 1,
                        swampCost: 1
                    }) || [];
                Memory.rooms[room].srcpth[source.id][2][spawn.name] = Room.serializePath(pathSpawn);
            }

            _.forEach(pathSpawn, (pathData) => {
                room.visual.circle(pathData.x, pathData.y, {radius: radius, lineStyle: style});
            });
        });
        // }

    });
};

global.createFlowField = function (roomName) {
    if (!roomName) return;

    var room = Game.rooms[roomName];
    if (!room) return;

    function getNeighbours(pos) {
        var neighbours = [];
        _.forEach([TOP, TOP_RIGHT, TOP_LEFT, RIGHT, LEFT, BOTTOM, BOTTOM_RIGHT, BOTTOM_LEFT], (s) => {
            function virtualMove(pos, dir) {
                var tempPos;
                var newPos;

                if (!pos) return;
                if (pos.x == 0 || pos.x == 49 || pos.y == 0 || pos.y == 49) return;

                tempPos = pos;
                tempPos.cost += 1;

                switch (dir) {
                    case TOP:
                        tempPos.y = tempPos.y - 1;
                        break;
                    case TOP_RIGHT:
                        tempPos.y = tempPos.y - 1;
                        tempPos.x = tempPos.x + 1;
                        break;
                    case RIGHT:
                        tempPos.x = tempPos.x + 1;
                        break;
                    case BOTTOM_RIGHT:
                        tempPos.y = tempPos.y + 1;
                        tempPos.x = tempPos.x + 1;
                        break;
                    case BOTTOM:
                        tempPos.y = tempPos.y + 1;
                        break;
                    case BOTTOM_LEFT:
                        tempPos.y = tempPos.y + 1;
                        tempPos.x = tempPos.x - 1;
                        break;
                    case LEFT:
                        tempPos.x = tempPos.x - 1;
                        break;
                    case TOP_LEFT:
                        tempPos.y = tempPos.y - 1;
                        tempPos.x = tempPos.x - 1;
                        break;
                    default:
                        return;
                }

                newPos = tempPos;

                neighbours.push(newPos);
            }

            virtualMove(pos, s);
        });
        return neighbours;
    }

    var storage = room.storage;
    var storageXY = {x: storage.pos.x, y: storage.pos.y, cost: 0};
    var storageNeighbours = getNeighbours(storageXY);

    _.forEach(storageNeighbours, (p) => {
        room.visual.text(p.cost, p.x, p.y, {font: 0.7, background: '#ffffff'});
    });
};