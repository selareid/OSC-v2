require('global');

const roomHandler = require('roomHandler');
const specialRoomHandler = require('special.roomHandler');
const creepHandler = require('creepHandler');

const profiler = require('screeps-profiler');
const grafana = require('stats');

console.log("[" + "<p style=\"display:inline; color: #ededed\">RESET</p>" + "] " + "<p style=\"display:inline; color: #6dbbff\">" + Game.cpu.bucket + "</p>"); // reset log

profiler.enable();
module.exports.loop = function () {
    if (Game.cpu.bucket < 1000) return;
    profiler.wrap(function () {
        PathFinder.use(true);

        try {
            //memory stuff
            if (!Memory.eQ) Memory.eQ = [];
            if (!Memory.cs) Memory.cs = {};

            if (Game.time % 13 == 0) {
                for (let name in Memory.creeps) {
                    if (!Game.creeps[name]) {
                        delete Memory.creeps[name];
                    }
                }
                for (let spawn in Memory.spawns) {
                    if (!Game.spawns[spawn]) {
                        delete Memory.spawns[spawn];
                    }
                    else if (!Memory.spawns[spawn].room) {
                        Memory.spawns[spawn].room = '' + Game.spawns[spawn].room.name;
                    }
                }
                for (let flag in Memory.flags) {
                    if (Game.flags[flag] == undefined) {
                        delete Memory.flags[flag];
                    }
                }
            }
        }
        catch (err) {
            if (err !== null && err !== undefined) {
                Game.notify("Error in memory management logic: \n" + err + "\n " + err.stack);
                console.log("Error in memory management logic: \n" + err + "\n" + err.stack);
            }
        }


        try {
            //construction site stuff
            if (_.size(Game.constructionSites) < 5) {

                var structKey = Object.keys(Memory.cs)[0];
                if (structKey) {
                    var struct = Memory.cs[structKey];
                    var splitKey = structKey.split(',');
                    var structPos = {room: splitKey[0], x: splitKey[1], y: splitKey[2]};
                    var structRoom = Game.rooms[structPos.room];

                    if (!global.isUndefinedOrNull(struct)) {
                        if (structRoom && !structPos.x && !Number.isNaN(structPos.x) && !structPos.y && !Number.isNaN(structPos.y) && struct) {
                            var rsl = structRoom.createConstructionSite(structPos.x, structPos.y, struct);
                            if (rsl == OK) {
                                delete Memory.cs[structKey];
                            }
                            else {
                                var message = 'Error ' + rsl + ' when creating cosntruction site at X: ' + structPos.x + ' Y: ' + structPos.y + ' Room: ' + structPos.room + ' Struct: ' + struct;
                                global.errorLog(message);
                                Game.notify(message);
                            }
                        }
                        else delete Memory.cs[structKey];
                    }
                }
            }
        }
        catch (err) {
            if (err !== null && err !== undefined) {
                Game.notify("Error in construction site logic: \n" + err + "\n " + err.stack);
                console.log("Error in construction site logic: \n" + err + "\n" + err.stack);
            }
        }


        //do actual stuff

        //attack team flag stuff and global starts
        if (global['warCache'] == undefined) {
            global['warCache'] = {};
        }

        var attackTeamFlags = _.filter(Game.flags, f => f.memory.type == 'attackTeamFlag' && f.memory.team != undefined
        && f.memory.timeToAttack != undefined && f.memory.timeToAttack != null && f.memory.timeToRally != undefined && f.memory.timeToRally != null
        && f.memory.rallyFlag);

        for (let flag of attackTeamFlags) {
            if (global['warCache'][flag.memory.team] == undefined || Game.time % 3 == 0) {
                global['warCache'][flag.memory.team] = {
                    flag: flag,
                    rallyFlag: flag.memory.rallyFlag,
                    targetRoom: flag.pos.roomName,
                    timeToAttack: flag.memory.timeToAttack,
                    timeToRally: flag.memory.timeToRally
                };
            }
        }
        //attack team flag stuff and global ends

        //room stuff
        for (let room_it in Game.rooms) {
            var room = Game.rooms[room_it];
            var controller = room.controller;
            if (controller && controller.my) {
                try {
                    if (Memory.rooms) {
                        if (!Memory.rooms[room]) {
                            Memory.rooms[room] = {};
                        }
                    }
                    else {
                        Memory.rooms = {};
                    }
                }
                catch (err) {
                    if (err !== null && err !== undefined) {
                        Game.notify("Error in Memory.room logic: \n" + err + "\n " + err.stack);
                        console.log("Error in Memory.room logic: \n" + err + "\n" + err.stack);
                    }
                }

                try {
                    if (room.find(FIND_MY_SPAWNS)[0]) {
                        var sources = room.find(FIND_SOURCES);
                        if (!sources || sources.length <= 0) continue;

                        if (sources.length >= 2) roomHandler.run(room);
                        else specialRoomHandler.run(room);
                    }
                    else {
                        //put automatic otherRoomCreep flag placer here
                    }
                }
                catch (err) {
                    if (err !== null && err !== undefined) {
                        Game.notify("Error in room logic: \n" + err + "\n " + err.stack);
                        console.log("Error in room logic: \n" + err + "\n" + err.stack);
                    }
                }
            }
        }

        var bfrCH = Game.cpu.getUsed();
        creepHandler.run();
        var creepHandlerCPU = Game.cpu.getUsed() - bfrCH;

        if (Game.time % 2 == 0) grafana.mainStats(creepHandlerCPU);
    });
};
