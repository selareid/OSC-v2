require('prototype.room')();

const specialSpawnerHandler = require ('special.spawnerHandler');
const linkHandler = require ('linkHandler');
const defenceHandler = require ('defenceHandler');
const towerHandler = require ('towerHandler');
const marketDealer = require ('marketDealer');
const labHandler = require ('labHandler');

// const grafana = require('stats');

module.exports = {
    run: function (room) {

        room.cacheThingsInRoom();

        linkHandler.run(room);

        if (Memory.rooms[room].br == undefined || Memory.rooms[room].br == null) Memory.rooms[room].br = "";

        // try {
        //     var d = new Date();
        //     if (d.getHours % 10 == 0 && d.getMinutes() % 0 == 0 && d.getSeconds() < 3) {
        //         room.buildThings();
        //     }
        // }
        // catch (err) {
        //     if (err !== null && err !== undefined) {
        //         Game.notify("Error in auto construction sites logic: \n" + err + "\n " + err.stack);
        //         console.log("Error in auto construction sites logic: \n" + err + "\n" + err.stack + " room: " + room.name);
        //     }
        // }

        // try {
        //     if (Game.time % 301 == 0) {
        //         if (Game.cpu.bucket > 2000) {
        //             var terminal = room.terminal;
        //             if (terminal) {
        //                 marketDealer.run(room, terminal);
        //             }
        //         }
        //     }
        // }
        // catch (err) {
        //     if (err !== null && err !== undefined) {
        //         Game.notify("Error in market logic: \n" + err + "\n " + err.stack);
        //         console.log("Error in market logic: \n" + err + "\n" + err.stack + " room: " + room.name);
        //     }
        // }

        if (!Memory.rooms[room].roadSites || Game.time % 34 == 0) {
            Memory.rooms[room].roadSites = [];
        }

        // //remote flag stuff starts
        // if (Game.time % 23 == 0 || global[room.name].cachedRemoteCreepFlags == undefined) {
        //     var newRemoteCreepFlags = room.getRemoteFlags(); // get remote flags
        //     global[room.name].cachedRemoteCreepFlags = newRemoteCreepFlags; //cache remote flags
        // }
        // //remote flag stuff ends

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
            specialSpawnerHandler.run(room);
        }
        catch (err) {
            if (err !== null && err !== undefined) {
                Game.notify("Error in special spawner logic: \n" + err + "\n " + err.stack);
                console.log("Error in special spawner logic: \n" + err + "\n" + err.stack + " room: " + room.name);
            }
        }


        // if (Game.time % 11 == 0) grafana.summarize_room_internal(room);
    }
};
