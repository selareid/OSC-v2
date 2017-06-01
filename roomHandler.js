require('prototype.room')();

const spawnerHandler = require ('spawnerHandler');
const linkHandler = require ('linkHandler');
const defenceHandler = require ('defenceHandler');
const towerHandler = require ('towerHandler');
const marketDealer = require ('marketDealer');
const labHandler = require ('labHandler');

const grafana = require('stats');

module.exports = {
    run: function (room) {

        room.cacheThingsInRoom();

        linkHandler.run(room);

        if (Memory.rooms[room].br == undefined || Memory.rooms[room].br == null) Memory.rooms[room].br = "";

        if (!Memory.rooms[room].rsv) Memory.rooms[room].rsv = [];
        if (!Memory.rooms[room].clm) Memory.rooms[room].clm = [];
        if (!Memory.rooms[room].rmtR) Memory.rooms[room].rmtR = [];

        try {
            if (Game.time % 1500 == 0) {
                room.buildThings();
            }
        }
        catch (err) {
            if (err !== null && err !== undefined) {
                Game.notify("Error in auto construction sites logic: \n" + err + "\n " + err.stack);
                global.errorLog("Auto construction sites logic: \n" + err + "\n" + err.stack, room);
            }
        }

        try {
            if (Game.time % 101 == 0) {
                if (Game.cpu.bucket > 5000) {
                    var remoteRooms = Memory.rooms[room].rmtR;
                    if (remoteRooms && remoteRooms.length > 0) {
                        for (let rr_it in remoteRooms) {
                            let rr = remoteRooms[rr_it];
                            let rrSpilt = rr.split(',');

                            let rroomName = rrSpilt[0];
                            if (!rroomName) break;

                            let lastCalc = global.isUndefinedOrNull(rrSpilt[4]) ? 0 : Number.parseInt(rrSpilt[4]);

                            if (lastCalc.length > 6) lastCalc = lastCalc % 100000;

                            if (Math.abs(Game.time % 100000 - lastCalc) > 4500 && _.size(Game.constructionSites) < 50) {

                                room.remoteRoad(rroomName);

                                Memory.rooms[room].rmtR[rr_it] = rrSpilt[0] + ',' + rrSpilt[1] + ',' + rrSpilt[2] + ',' + rrSpilt[3] + ',' + Game.time % 100000;
                                break;
                            }
                        }
                    }
                }
            }
        }
        catch (err) {
            if (err !== null && err !== undefined) {
                Game.notify("Error in auto remote roads logic: \n" + err + "\n " + err.stack);
                global.errorLog("Auto remote roads logic: \n" + err + "\n" + err.stack, room);
            }
        }

        try {
            if (Game.time % 103 == 0) {
                if (Game.cpu.bucket > 2000) {
                    var terminal = room.terminal;
                    if (terminal) {
                        marketDealer.run(room, terminal);
                    }
                }
            }
        }
        catch (err) {
            if (err !== null && err !== undefined) {
                Game.notify("Error in market logic: \n" + err + "\n " + err.stack);
                global.errorLog("Market logic: \n" + err + "\n" + err.stack, room);
            }
        }

        //lab stuff starts
        try {
            if (!Memory.rooms[room].labQueue) {
                Memory.rooms[room].labQueue = [];
            }
            if (Game.cpu.bucket > 2000) {
                if (Game.time % 3 == 0) labHandler.run(room);
            }
        }
        catch (err) {
            if (err !== null && err !== undefined) {
                Game.notify("Error in lab logic: \n" + err + "\n " + err.stack);
                global.errorLog("Lab logic: \n" + err + "\n" + err.stack, room);
            }
        }
        //lab stuff ends

        //guard station flag stuff starts
        if (global[room.name].guardStationFlag == undefined) {
            global[room.name].guardStationFlag = room.getGuardStationFlag(); // cache guard station flag
        }
        //guard station flag stuff ends

        // otherRoomCreep stuff starts
        // other room creeps are creeps that start new rooms (build spawns, upgrade controller, etc)
        if (Game.cpu.bucket > 2000) {

            var getOtherRoomCreepsRoomToGoTo = function () {
                if (Game.time % 7 == 0 || global[room.name].cachedOtherRoomCreepsRoomToGoTo == undefined) {
                    var newOtherRoomCreepsRoomToGoTo = room.findOtherRoomToGoTo(); // get data
                    global[room.name].cachedOtherRoomCreepsRoomToGoTo = newOtherRoomCreepsRoomToGoTo; // cache data
                    return newOtherRoomCreepsRoomToGoTo; // return data
                }
                else {
                    return global[room.name].cachedOtherRoomCreepsRoomToGoTo; // use cached data
                }
            };
            var otherRoomCreepsRoomToGoTo = getOtherRoomCreepsRoomToGoTo(); //because getOtherRoomCreepsRoomToGoTo() is always a "truthy"


            if (otherRoomCreepsRoomToGoTo) { //if otherRoomCreepsRoomToGoTo is a thing
                if (otherRoomCreepsRoomToGoTo.room && otherRoomCreepsRoomToGoTo.room.find(FIND_MY_SPAWNS)[0]) { // if it has a spawn in it
                    otherRoomCreepsRoomToGoTo.remove(); // remove the flag
                    global[room.name].cachedOtherRoomCreepsRoomToGoTo = undefined;
                }
            }
        }
        // otherRoomCreep stuff ends

        //room to steal from stuff starts
        if (Game.cpu.bucket > 2000) {
            global[room.name].cachedroomToStealFrom = room.findRoomToStealFrom();
        }
        //room to steal from stuff ends

        //energyHelperFlag stuff starts
        if (Game.cpu.bucket > 2000) {
            if (Game.time % 7 == 0 || global[room.name].cachedEnergyHelperFlags == undefined) {
                global[room.name].cachedEnergyHelperFlags = room.getEnergyHelperFlags(); //cache remote flags
            }
        }
        //energyHelperFlag stuff ends

        //check if we're under attack starts
        if (Game.time % 3 == 0) {
            var underAttack = defenceHandler.isUnderAttack(room);
            if (underAttack === false) {
                Memory.rooms[room].isUnderAttack = false;
            }
            else {
                Memory.rooms[room].isUnderAttack = true;
            }
        }


        //remote room guard stuff starts
        if (Game.time % 11 == 0) {
            var remoteRooms = Memory.rooms[room].rmtR;

            for (let rr_it in remoteRooms) {
                let rroomName = remoteRooms[rr_it].split(',')[0];

                if (Game.rooms[rroomName]) {
                    let enemiesInRemoteRoom = Game.rooms[rroomName].find(FIND_HOSTILE_CREEPS, {filter: (c) => c.owner.username != 'Source Keeper' && !global.Allies.includes(c.owner.username)});
                    if (enemiesInRemoteRoom.length > 0) {
                        Memory.rooms[room].rmtUA = rroomName;
                        break;
                    }
                    else if (Memory.rooms[room].rmtUA == rroomName) {
                        Memory.rooms[room].rmtUA = undefined;
                    }
                }
            }

        }
        //remote room guard stuff ends

        var areWeUnderAttack = Memory.rooms[room].isUnderAttack;
        //check if we're under attack ends

        //defenceHandler stuff starts
        if (areWeUnderAttack == true) { //if we are under attack
            defenceHandler.run(room); //run defence handler
        }
        //defenceHandler stuff ends

        //tower stuff starts
        towerHandler.run(room);
        //tower stuff ends

        try {
            spawnerHandler.run(room);
        }
        catch (err) {
            if (err !== null && err !== undefined) {
                Game.notify("Error in spawner logic: \n" + err + "\n " + err.stack);
                global.errorLog("Spawner logic: \n" + err + "\n" + err.stack, room);
            }
        }

        (function () {
        if (room.terminal) {
            if (!room.terminal.store[RESOURCE_ENERGY] || room.terminal.store[RESOURCE_ENERGY] < 1000) {
                var roomInQueue = _.filter(Memory.eQ, (r) => r == room.name)[0];
                if (roomInQueue == undefined || roomInQueue == null) {
                    Memory.eQ.push(room.name);
                }
            }
            else {
                var queue = Memory.eQ;
                if (room.name == queue[0]) return Memory.eQ.splice(0, 1);

                if (queue.length > 0 && room.terminal.store[RESOURCE_ENERGY] > 100000) { //maybe send resources
                    if (Game.map.getRoomLinearDistance(room.name, queue[0], true) > 15) return Memory.eQ.splice(0, 1);
                    var rsl = room.terminal.send(RESOURCE_ENERGY, 50000, queue[0], 'energy sinking');

                    if (rsl == OK) {
                        Game.notify('Room ' + room.name + ' sent resource energy to room ' + queue[0] + ' as energy sink');
                        console.log('Room ' + room.name + ' sent resource energy to room ' + queue[0] + ' as energy sink');
                        Memory.eQ.splice(0, 1);
                    }
                }
            }
        }})();

        if (Game.time % 11 == 0) grafana.summarize_room_internal(room);
    }
};
