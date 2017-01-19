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
const roleMarketMover = require ('role.marketMover');
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
                let room = Game.rooms[creep.memory.room];


                this.creepActions(room, creep);

            }
        }
        catch (err) {
            if (err !== null && err !== undefined) {
                Game.notify("Creep Error: \n" + err + "\n " + err.stack);
                console.log("Creep Error: \n" + err + "\n" + err.stack);
            }
        }

    },

    creepActions: function (room, creep) {
        if (creep.memory.room == room.name && creep.spawning === false) {
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
                case 'marketMover':
                    if (Game.cpu.bucket > 2000) roleMarketMover.run(room, creep);
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
    }
};
