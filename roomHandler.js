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

        try {
            var d = new Date();
            if (d.getHours % 10 == 0 && d.getMinutes() % 0 == 0 && d.getSeconds() < 3) {
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

        //remote flag stuff starts
        if (Game.time % 23 == 0 || global[room.name].cachedRemoteCreepFlags == undefined) {
            var newRemoteCreepFlags = room.getRemoteFlags(); // get remote flags
            global[room.name].cachedRemoteCreepFlags = newRemoteCreepFlags; //cache remote flags
        }
        //remote flag stuff ends

        //remote guard stuff starts here
        if (Game.time % 23 == 0 || global[room.name].cachedRemoteGuardFlags == undefined) {
            var newRemoteGuardCreepFlags = room.getRemoteGuardFlags(); // get remote flags
            global[room.name].cachedRemoteGuardFlags = newRemoteGuardCreepFlags; //cache remote flags
        }
        //remote guard stuff ends here

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
        if (Game.time % 4 == 0 || global[room.name].cachedAreRemotesUnderAttack == undefined) {
            var remoteRoomsUnderAttackFlags = [];
            _.forEach(global[room.name].cachedRemoteCreepFlags, (flag) => {
                if (Game.rooms[flag.pos.roomName]) {
                    var enemiesInRemoteRoom = Game.rooms[flag.pos.roomName].find(FIND_HOSTILE_CREEPS, {filter: (c) => !global.Allies.includes(c.owner.username)});
                    if (enemiesInRemoteRoom.length > 0) {
                        remoteRoomsUnderAttackFlags.push(flag);
                    }
                }
            });

            global[room.name].cachedAreRemotesUnderAttack = remoteRoomsUnderAttackFlags.length > 0;
            global[room.name].cachedRemoteRoomsUnderAttackFlags = remoteRoomsUnderAttackFlags[0] || [];

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


        if (Game.time % 11 == 0) grafana.summarize_room_internal(room);
    }
};
