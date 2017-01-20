require('prototype.room')();

const spawnerHandler = require ('spawnerHandler');
const linkHandler = require ('linkHandler');
const defenceHandler = require ('defenceHandler');
const towerHandler = require ('towerHandler');
const marketDealer = require ('marketDealer');
const labHandler = require ('labHandler');

module.exports = {
    run: function (room) {

        room.cacheThingsInRoom();

        linkHandler.run(room);

        try {
            if (Game.time % 7 == 0) {
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
                Game.notify("Error in every 7 tick room logic: \n" + err + "\n " + err.stack);
                console.log("Error in every 7 tick room logic: \n" + err + "\n" + err.stack + " room: " + room.name);
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
                console.log("Error in lab logic: \n" + err + "\n" + err.stack + " room: " + room.name);
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
                console.log("Error in spawner logic: \n" + err + "\n" + err.stack + " room: " + room.name);
            }
        }

    }
};
