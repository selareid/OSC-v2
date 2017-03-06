require('global');

var type1 = require ('role.type1'); //RCL upgrader
var type2 = require ('role.type2'); //builder
var type3 = require ('role.type3'); //repairer
var type4 = require ('role.type4'); //wallRepairer and tower replenisher

module.exports = {
    run: function (room, creep) {
        var otherRoomFlag = global[room.name].cachedOtherRoomCreepsRoomToGoTo;

        if (otherRoomFlag) {

            if (otherRoomFlag.room && otherRoomFlag.room.find(FIND_MY_SPAWNS)[0]) {
                otherRoomFlag.remove();
            }

            if (creep.pos.roomName != otherRoomFlag.pos.roomName) {
                creep.moveTo(otherRoomFlag, {reusePath: 13});
            }
            else {
                if (!creep.memory.type) {
                    if (_.sum(Game.creeps, (c) => c.memory.type == 'type1') < 2) {
                        creep.memory.type = 'type1';
                    }
                    else if (_.sum(Game.creeps, (c) => c.memory.type == 'type2') < 1) {
                        creep.memory.type = 'type2';
                    }
                    if (_.sum(Game.creeps, (c) => c.memory.type == 'type3') < 1) {
                        creep.memory.type = 'type3';
                    }
                    if (_.sum(Game.creeps, (c) => c.memory.type == 'type4') < 0) {
                        creep.memory.type = 'type4';
                    }
                    else {
                        creep.memory.type = 'type2';
                    }
                }
                else {

                    switch (creep.memory.type) {
                        case 'type1':
                            type1.run(creep);
                            break;
                        case 'type2':
                            type2.run(creep);
                            break;
                        case 'type3':
                            type3.run(creep);
                            break;
                        case 'type4':
                            type4.run(creep);
                            break;
                        default:
                            creep.say('ERR TYPE');
                    }

                }
            }

        }
        else {
            creep.memory.role = 'harvester';
            if (Game.rooms[creep.pos.roomName].find(FIND_MY_SPAWNS)[0]) {
                creep.memory.room = creep.pos.roomName;
            }
        }
    }
};