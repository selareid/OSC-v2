require ('global');

module.exports = function () {
    RoomPosition.prototype.getAdjacentRoomPositions =
        function () {
            var room = Game.rooms[this.roomName];
            var results = [];
            var deltas = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
            _.forEach(deltas, delta => {
                var newPos = room.getPositionAt(this.x + delta[0], this.y + delta[1]);
                if (newPos) {
                    results.push(newPos)
                }
            });
            return results
        },

        RoomPosition.prototype.isWalkable =
            function () {
                var atPos = this.look();
                var SWAMP = 'swamp';
                var PLAIN = 'plain';
                for (var i = 0; i < atPos.length; i++) {
                    switch (atPos[i].type) {
                        case LOOK_TERRAIN:
                            if (atPos[i].type == 'terrain' && atPos[i] != PLAIN && atPos[i] != SWAMP) {
                                return false;
                            }
                            break;
                        case LOOK_STRUCTURES:
                            if (OBSTACLE_OBJECT_TYPES.includes(atPos[i].structure.structureType))
                                return false;
                            break;
                        case LOOK_CREEPS:
                        case LOOK_SOURCES:
                        case LOOK_MINERALS:
                        case LOOK_NUKES:
                        case LOOK_ENERGY:
                        case LOOK_RESOURCES:
                        case LOOK_FLAGS:
                        case LOOK_CONSTRUCTION_SITES:
                        default:
                    }
                }
                return true;
            }
};