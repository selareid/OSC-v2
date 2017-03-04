require('global');

const roleHarvester = require ('role.harvester');
const roleCarrier = require ('role.carrier');
const roleDistributor = require ('role.distributor');
const roleUpgrader = require ('role.upgrader');
const roleCaretaker = require ('role.caretaker');
const roleLandlord = require ('role.landlord');
const otherRoomCreep = require ('role.otherRoomCreep');
const energyThief = require ('role.energyThief');
const roleRemoteHarvester = require ('role.remoteHarvester');
const roleRemoteHauler = require ('role.remoteHauler');
const roleRemoteMiner = require ('role.remoteMiner');
const roleRemoteGuard = require ('role.remoteGuard');
const roleEnergyHelper = require ('role.energyOtherRoomHelper');
const roleMiner = require ('role.miner');
const roleGuard = require ('role.guard');
const roleSigner = require ('role.signer');
const roleCreepHarasser = require ('role.creepHarasser');
const rolespawnSmasher = require ('role.spawnSmasher');
const roleStructureDestroyer = require ('role.structureDestroyer');
const roleWallBreaker = require ('role.wallBreaker');
const roleWarHealer = require ('role.warHealer');
const roleTowerDrainer = require ('role.towerDrainer');
const roleStorageDistributor = require ('role.storageDistributor');

module.exports = {
    run: function () {

        try {
            for (let name in Game.creeps) {
                let creep = Game.creeps[name];


                this.creepActions(creep, undefined);

                if (Game.cpu.bucket > 3000) this.roomPositionSaving(Game.rooms[creep.memory.room], creep);
            }
        }
        catch (err) {
            if (err !== null && err !== undefined) {
                Game.notify("Creep Error: \n" + err + "\n " + err.stack);
                console.log("Creep Error: \n" + err + "\n" + err.stack);
            }
        }

    },

    creepActions: function (creep, room = Game.rooms[creep.memory.room]) {
        if (!room) {
            creep.suicide()
        }
        else if (creep.spawning === false) {
            var energyOfTowers = this.getEnergyOfTower(room);
            if (!global[creep.name]) {
                global[creep.name] = {};
            }

            var getRole = function (creepName) {
                var creepNameAsArray = creepName.split('-');
                return creepNameAsArray[0];
            };

            switch (creep.memory.role) {
                case 'harvester':
                    roleHarvester.run(room, creep);
                    break;
                case 'carrier':
                    if (room.storage) {
                        var numberOfDistributors = _.sum(Game.creeps, (c) => c.memory.role == 'distributor' && c.memory.room == room.name);
                        if (numberOfDistributors <= 0) {
                            roleDistributor.run(room, creep, energyOfTowers);
                        }
                        else {
                            roleCarrier.run(room, creep);
                        }
                    }
                    else {
                        creep.memory.role = 'distributor';
                    }
                    break;
                case 'distributor':
                    roleDistributor.run(room, creep, energyOfTowers);
                    break;
                case 'upgrader':
                    roleUpgrader.run(room, creep);
                    break;
                case 'caretaker':
                    roleCaretaker.run(room, creep);
                    break;
                case 'landlord':
                    roleLandlord.run(room, creep);
                    break;
                case 'otherRoomCreep':
                    otherRoomCreep.run(room, creep);
                    break;
                case 'energyThief':
                    if (Game.cpu.bucket > 1000) energyThief.run(room, creep);
                    break;
                case 'remoteHarvester':
                    roleRemoteHarvester.run(room, creep, global[room.name].cachedRemoteCreepFlags);
                    break;
                case 'remoteHauler':
                    roleRemoteHauler.run(room, creep, global[room.name].cachedRemoteCreepFlags);
                    break;
                case 'remoteMiner':
                    roleRemoteMiner.run(room, creep, global[room.name].cachedRemoteCreepFlags);
                    break;
                case 'remoteGuard':
                    roleRemoteGuard.run(room, creep, global[room.name].cachedRemoteGuardFlags);
                    break;
                case 'energyHelper':
                    var energyHelperFlag = global[room.name].cachedEnergyHelperFlags[0];
                    if (energyHelperFlag != undefined && energyHelperFlag.room != undefined) {
                        if (Game.cpu.bucket > 500) roleEnergyHelper.run(room, creep, energyHelperFlag);
                    }
                    else {
                        if (Game.cpu.bucket > 500) creep.memory.role = 'carrier';
                    }
                    break;
                case 'miner':
                    if (Game.cpu.bucket > 500) roleMiner.run(room, creep);
                    break;
                case 'guard':
                    roleGuard.run(room, creep);
                    break;
                case 'signer':
                    roleSigner.run(room, creep);
                    break;
                case 'creepHarasser':
                    roleCreepHarasser.run(room, creep);
                    break;
                case 'spawnSmasher':
                    rolespawnSmasher.run(room, creep);
                    break;
                case 'structureDestroyer':
                    roleStructureDestroyer.run(room, creep);
                    break;
                case 'wallBreaker':
                    roleWallBreaker.run(room, creep);
                    break;
                case 'warHealer':
                    roleWarHealer.run(room, creep);
                    break;
                case 'towerDrainer':
                    roleTowerDrainer.run(room, creep);
                    break;
                case 'storageDistributor':
                    roleStorageDistributor.run(room, creep);
                    break;
                case '':
                    creep.say('ERROR!!!', true);
                    break;
                default:
                    creep.say('ERROR!!!', true);
                    console.log('Unknown Creep Role ' + creep.memory.role);
                    creep.memory.role = getRole(creep.name);
                    break;
            }

        }
    },

    getEnergyOfTower: function (room) {
        var towers = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
        var allEnergy = [];

        for (let tower of towers) {
            allEnergy.push(tower.energy);
        }
        return _.min(allEnergy) + 1;
    },

    roomPositionSaving: function (room, creep) {
        if (creep.pos.roomName != room.name) return; // we're only doing this for the creep's homeroom
        var roadUnderCreep = _.filter(creep.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_ROAD)[0];
        if (!roadUnderCreep) return; // if there's no road under creep don't need to save pos

        if (!Memory.steppedPos) {
            Memory.steppedPos = creep.pos.roomName + ',' + creep.pos.x + ',' + creep.pos.y + ',' + Game.time  + ':'; //if it doesn't exist in memory create it and put our stats in
            return;
        }


        function splitValue(value, index) {
            return value.substring(0, index) + "," + value.substring(index);
        }

        var str = Memory.steppedPos;

        var posToFind = creep.pos.roomName + ',' + creep.pos.x + ',' + creep.pos.y; // the string we'll be looking for in str

        var posInString = str.indexOf(posToFind); // the pos of found posToFind

        var newTime = Game.time; // the new time it'll be changed to

        if (str.search(posToFind) == -1) { //if not in str
            Memory.steppedPos = Memory.steppedPos + creep.pos.roomName + ',' + creep.pos.x + ',' + creep.pos.y + ',' + newTime + ':'; // add it to str
            return;
        }

        var splitStr;
        var split_it = splitValue(str, posInString).split(':,');
        /*
        Example:

         E58S49,19,10,19436:E65S47,26,16,19538:E58S49,22,7,19517:E64S41,22,28,19532:E63S47,45,32,19538:
         is str

         we want E58S49,22,7,19517:
         we have E58S49,22,7
         and it's position in the string
         so we start at that position and add a , at the next :
         and split the :,
         (because if we just split : we'll get an array, come to think of it is that really a bad thing? hmm, dunno if this is efficient)

         now we have E58S49,22,7,19517:
         */

        // I was getting errors so I put in these if statements
        // It's splitting E58S49,22,7,19517: into ["E58S49","22","7","19517"]
        if (!split_it) return;
        else if (split_it[1]) splitStr = split_it[1].split(':')[0].split(',');
        else splitStr = split_it[0].split(':')[0].split(',');

        if (Math.abs(newTime-splitStr[3]) > 199) { // if last time this pos has been stepped on was over 199 ticks ago
            roadUnderCreep.destroy(); // destroy that road
            Memory.steppedPos = str.replace(splitStr, ''); // remove this pos from the string
            // (because there's no road so this'll never run again for this pos, so we don't need to have it saved, since memory costs CPu, and I need to save CPU)
            return;
        }

        Memory.steppedPos = str.replace(splitStr, posToFind + ',' + newTime); // else replace old text with new text and store back in memory

    }
};
