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

        if (!Memory.rooms[room].roadSites || Game.time % 34 == 0) {
            Memory.rooms[room].roadSites = [];
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
                    let enemiesInRemoteRoom = Game.rooms[rroomName].find(FIND_HOSTILE_CREEPS, {filter: (c) => !global.Allies.includes(c.owner.username)});
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
            if (!room.terminal[RESOURCE_ENERGY] || room.terminal[RESOURCE_ENERGY] < 1000) {
                var roomInQueue = _.filter(Memory.eQ, (r) => r == room.name)[0];
                if (roomInQueue == undefined || roomInQueue == null) {
                    Memory.eQ.push(room.name);
                }
            }
            else if (room.terminal[RESOURCE_ENERGY] > 100000) { //maybe send resources
                var queue = Memory.eQ;
                if (Game.map.getRoomLinearDistance(room.name, queue[0], true) > 15) return Memory.eQ.splice(0, 1);
                var rsl = room.terminal.send(RESOURCE_ENERGY, 50000, queue[0], 'energy sinking');

                if (rsl == OK) {
                    Memory.eQ.splice(0, 1);
                    Game.notify('Room ' + room.name + ' sent resource energy to room ' + queue[0] + ' as energy sink');
                }
            }
        }})();

        if (Game.time % 11 == 0) grafana.summarize_room_internal(room);
    }
};
