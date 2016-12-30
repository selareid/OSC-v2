require('global');

const towerHandler = require('towerHandler');

module.exports = {
    run: function (room) {
        var hostileCreepsInRoom = this.getHostileCreeps(room);

        if (Game.time % 20 == 0) {
            console.log('Enemy creeps spotted in room ' + room);
            console.log("<h1 style=\"color: #ff2f3c\"><strong><i>EMERGENCY MODE </i></strong></h1>\nIn Room: " + room.name + "\nEstimated time of death: " + hostileCreepsInRoom.length * 100 + "ticks" + "\nCreeps remaining: " + _.sum(Game.creeps, (s) => s.room.name === room.name));

            if (hostileCreepsInRoom[0] && hostileCreepsInRoom[0].owner && hostileCreepsInRoom[0].owner.username != 'Invader') {
                Game.notify('Enemy creeps spotted in room ' + room);
                Game.notify('Owner of creep = ' + hostileCreepsInRoom[0].owner.username);
                Game.notify('Prepare to die future self');
            }
        }
    },

    getHostileCreeps: function (room) {
        var hostileCreepsInRoom = [];
        hostileCreepsInRoom = room.find(FIND_HOSTILE_CREEPS, {filter: (c) => Allies.includes(c.owner.username) == false});
        return hostileCreepsInRoom;
    },

    isUnderAttack: function (room) {

        var hostileCreepsInRoom = this.getHostileCreeps(room)[0];

        if (hostileCreepsInRoom) {
            return true;
        }
        else {
            return false;
        }
    }
};
