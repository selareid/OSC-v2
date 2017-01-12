require('global');
require('prototype.creep')();
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep) {

        creep.creepSpeech(room);

        if (!creep.memory.roomsBeenIn) {
            creep.memory.roomsBeenIn = [];
        }

        if (!creep.memory.roomsBeenIn.includes(creep.pos.roomName)) {
            creep.memory.roomsBeenIn.push(creep.pos.roomName);
        }

        if (!creep.memory.directionWays) {
            creep.memory.directionWays = [];
        }

        var currentRoom = creep.room;
        var roomController = currentRoom.controller;
        if (!roomController || (roomController.sign && roomController.sign.username == creep.owner.username)) {
            this.moveToOtherRoom(room, creep);
        }
        else {
            this.signController(creep, roomController)
        }
    },
    
    signController: function (creep, controller) {
        var result = creep.signController(controller, '“◯”');
        if (result == -9) {
            creep.moveTo(controller);
        }
    },

    moveToOtherRoom: function (room, creep) {
        var roomToMoveTo = this.getRoomToGoTo(room, creep);

        creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(roomToMoveTo)), {reusePath: 10});
    },
    
    getRoomToGoTo: function (room, creep) {
        var exits = _.filter(Game.map.describeExits(creep.pos.roomName), (e) => !creep.memory.roomsBeenIn.includes(e) && !Game.rooms[e]);
        var exit = exits[0];

        return exit;
    }
};
