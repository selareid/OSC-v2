require('global');

require('prototype.spawn')();

module.exports = {
    run: function (room) {

        //make sure memory is set
        if (!Memory.rooms[room].spawnQueue || Game.time % 50 == 0) {
            this.checkMemory(room);
        }

        //get the population goal from memory
        var minimumNumberOfHarvesters = Memory.rooms[room].populationGoal[0];
        var minimumNumberOfCarriers = Memory.rooms[room].populationGoal[1];
        var minimumNumberOfDistributors = Memory.rooms[room].populationGoal[2];
        var minimumNumberOfUpgraders = Memory.rooms[room].populationGoal[3];
        var minimumNumberOfCaretakers = Memory.rooms[room].populationGoal[4];
        var minimumNumberOfLandlords = Memory.rooms[room].populationGoal[5];
        var minimumNumberOfRemoteHarvesters = Memory.rooms[room].populationGoal[6];
        var minimumNumberOfRemoteHaulers = Memory.rooms[room].populationGoal[7];
        var minimumNumberOfOtherRoomCreeps = Memory.rooms[room].populationGoal[8];
        var minimumNumberOfEnergyThiefs = Memory.rooms[room].populationGoal[9];
        var minimumNumberOfEnergyHelpers = Memory.rooms[room].populationGoal[10];
        var minimumNumberOfMiners = Memory.rooms[room].populationGoal[11];
        var minimumNumberOfGuards = Memory.rooms[room].populationGoal[12];
        var minimumNumberOfCreepHarassers = Memory.rooms[room].populationGoal[13];
        var minimumNumberOfSpawnSmashers = Memory.rooms[room].populationGoal[14];
        var minimumNumberOfStructureDestroyers = Memory.rooms[room].populationGoal[15];
        var minimumNumberOfWallBreakers = Memory.rooms[room].populationGoal[16];
        var minimumNumberOfWarHealers = Memory.rooms[room].populationGoal[17];
        var minimumNumberOfTowerDrainers = Memory.rooms[room].populationGoal[18];
        var minimumNumberOfRemoteMiners = Memory.rooms[room].populationGoal[19];
        var minimumNumberOfRemoteGuards = Memory.rooms[room].populationGoal[20];
        var minimumNumberOfStorageDistributors = Memory.rooms[room].populationGoal[21];

        //get number of each creeps of each role
        var numberOfHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester' && c.memory.room == room.name);
        var numberOfCarriers = _.sum(Game.creeps, (c) => c.memory.role == 'carrier' && c.memory.room == room.name);
        var numberOfDistributors = _.sum(Game.creeps, (c) => c.memory.role == 'distributor' && c.memory.room == room.name);
        var numberOfStorageDistributors = _.sum(Game.creeps, (c) => c.memory.role == 'storageDistributor' && c.memory.room == room.name);
        var numberOfUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader' && c.memory.room == room.name);
        // var numberOfBuilders = _.sum(Game.creeps, (c) => c.memory.role == 'builder' && c.memory.room == room.name);
        var numberOfCaretakers = _.sum(Game.creeps, (c) => c.memory.role == 'caretaker' && c.memory.room == room.name);
        // var numberOfDefenceManagers = _.sum(Game.creeps, (c) => c.memory.role == 'defenceManager' && c.memory.room == room.name);
        var numberOfLandlords = _.sum(Game.creeps, (c) => c.memory.role == 'landlord' && c.memory.room == room.name);
        var numberOfRemoteHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'remoteHarvester' && c.memory.room == room.name);
        var numberOfRemoteHaulers = _.sum(Game.creeps, (c) => c.memory.role == 'remoteHauler' && c.memory.room == room.name);
        var numberOfRemoteMiners = _.sum(Game.creeps, (c) => c.memory.role == 'remoteMiner' && c.memory.room == room.name);
        var numberOfRemoteGuards = _.sum(Game.creeps, (c) => c.memory.role == 'remoteGuard' && c.memory.room == room.name);
        var numberOfOtherRoomCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'otherRoomCreep' && c.memory.room == room.name);
        var numberOfEnergyThiefs = _.sum(Game.creeps, (c) => c.memory.role == 'energyThief' && c.memory.room == room.name);
        var numberOfEnergyHelpers = _.sum(Game.creeps, (c) => c.memory.role == 'energyHelper' && c.memory.room == room.name);
        var numberOfMiners = _.sum(Game.creeps, (c) => c.memory.role == 'miner' && c.memory.room == room.name);
        var numberOfGuards = _.sum(Game.creeps, (c) => c.memory.role == 'guard' && c.memory.room == room.name);
        var numberOfCreepHarassers = _.sum(Game.creeps, (c) => c.memory.role == 'creepHarasser' && c.memory.room == room.name);
        var numberOfSpawnSmashers = _.sum(Game.creeps, (c) => c.memory.role == 'spawnSmasher' && c.memory.room == room.name);
        var numberOfStructureDestroyers = _.sum(Game.creeps, (c) => c.memory.role == 'structureDestroyer' && c.memory.room == room.name);
        var numberOfWallBreakers = _.sum(Game.creeps, (c) => c.memory.role == 'wallBreaker' && c.memory.room == room.name);
        var numberOfWarHealers = _.sum(Game.creeps, (c) => c.memory.role == 'warHealer' && c.memory.room == room.name);
        var numberOfTowerDrainers = _.sum(Game.creeps, (c) => c.memory.role == 'towerDrainer' && c.memory.room == room.name);

        //if no harvesters email me and spam console
        if (numberOfHarvesters <= 0) {
            if (Game.time % 200 == 0) {
                Game.notify("No harvesters in room " + room);
            }
            global.roomLog("No harvesters", room);
        }


        if (numberOfHarvesters == 0 && (Memory.rooms[room].spawnQueue.priority[0] != 'harvester' || Memory.rooms[room].spawnQueue.normal[0] != 'harvester')) {
            //if no harvesters in room and next role in queue is not harvester
            Memory.rooms[room].spawnQueue.normal = [];
            Memory.rooms[room].spawnQueue.priority = [];
            Memory.rooms[room].spawnQueue.priority.push('harvester');
            Memory.rooms[room].spawnQueue.normal.push('harvester');
        }
        else if (numberOfDistributors == 0 && Memory.rooms[room].spawnQueue.normal[0] != 'distributor') {
            Memory.rooms[room].spawnQueue.normal.splice(0, 0, 'distributor');
            Memory.rooms[room].spawnQueue.priority = [];
        }
        else {
            if (Game.time % 3 == 0) {

                //get number of each role in normal queue
                var harvestersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'harvester');
                var carriersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'carrier');
                var distributorsInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'distributor');
                var storageDistributorsInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'storageDistributor');
                var upgradersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'upgrader');
                var buildersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'builder');
                var caretakersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'caretaker');
                var defenceManagersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'defenceManager');
                var landlordsInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'landlord');
                var remoteHarvestersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'remoteHarvester');
                var remoteHaulersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'remoteHauler');
                var remoteMinersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'remoteMiner');
                var remoteGuardsInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'remoteGuard');
                var otherRoomCreepsInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'otherRoomCreep');
                var energyThiefsInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'energyThief');
                var energyHelpersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'energyHelper');
                var minersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'miner');
                var guardsInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'guard');
                var creepHarassersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'creepHarasser');
                var spawnSmashersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'spawnSmasher');
                var structureDestroyersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'structureDestroyer');
                var wallBreakersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'wallBreaker');
                var warHealersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'warHealer');
                var towerDrainersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'towerDrainer');

                //get number of each role in priority queue
                var harvestersInPriorityQueue = _.sum(Memory.rooms[room].spawnQueue.priority, (r) => r == 'harvester');
                var distributorsInPriorityQueue = _.sum(Memory.rooms[room].spawnQueue.priority, (r) => r == 'distributor');
                var storageDistributorsInPriorityQueue = _.sum(Memory.rooms[room].spawnQueue.priority, (r) => r == 'storageDistributor');
                var carriersInPriorityQueue = _.sum(Memory.rooms[room].spawnQueue.priority, (r) => r == 'carrier');

                //get number of each role in war queue
                var guardsInWarQueue = _.sum(Memory.rooms[room].spawnQueue.war, (r) => r == 'guard');
                var creepHarassersInWarQueue = _.sum(Memory.rooms[room].spawnQueue.war, (r) => r == 'creepHarasser');
                var spawnSmashersInWarQueue = _.sum(Memory.rooms[room].spawnQueue.war, (r) => r == 'spawnSmasher');
                var structureDestroyersInWarQueue = _.sum(Memory.rooms[room].spawnQueue.war, (r) => r == 'structureDestroyer');
                var wallBreakersInWarQueue = _.sum(Memory.rooms[room].spawnQueue.war, (r) => r == 'wallBreaker');
                var warHealersInWarQueue = _.sum(Memory.rooms[room].spawnQueue.war, (r) => r == 'warHealer');
                var towerDrainersInWarQueue = _.sum(Memory.rooms[room].spawnQueue.war, (r) => r == 'towerDrainer');
                //nothing here

                //get flag for other room creep and if it exists set minimumNumberOfOtherRoomCreeps to the numberOfCreeps in flag memory, same for energy thief flag
                var otherRoomFlag = global[room.name].cachedOtherRoomCreepsRoomToGoTo;
                if (otherRoomFlag && otherRoomFlag.memory != undefined) {
                    minimumNumberOfOtherRoomCreeps = otherRoomFlag.memory.numberOfCreeps;
                }
                else {
                    minimumNumberOfOtherRoomCreeps = 0;
                }
                var roomToStealFrom = global[room.name].cachedroomToStealFrom;
                if (roomToStealFrom && roomToStealFrom.memory != undefined) {
                    minimumNumberOfEnergyThiefs = roomToStealFrom.memory.numberOfCreeps;
                }
                else {
                    minimumNumberOfEnergyThiefs = 0;
                }
                var energyHelperFlag = global[room.name].cachedEnergyHelperFlags;
                if (energyHelperFlag && energyHelperFlag.memory != undefined) {
                    minimumNumberOfEnergyHelpers = energyHelperFlag.memory.numberOfCreeps;
                }
                else {
                    minimumNumberOfEnergyHelpers = 0;
                }

                var distributorWitchLeastLife = _.min(_.filter(Game.creeps, (c) => c.memory.role == 'distributor' && c.memory.room == room.name), '.ticksToLive');
                if (distributorWitchLeastLife && distributorWitchLeastLife.ticksToLive <= 400) {
                        minimumNumberOfDistributors = 2;
                }
                else minimumNumberOfDistributors = 1;

                var flagToGoTo = room.find(FIND_FLAGS, {filter: (f) => f.memory.type == 'storageDistributorGoTo' && f.pos.roomName == room.name})[0];
                if (flagToGoTo && room.storage && global[room.name].links.length >= 2) {
                    var storageDistributorWitchLeastLife = _.min(_.filter(Game.creeps, (c) => c.memory.role == 'storageDistributor' && c.memory.room == room.name), '.ticksToLive');
                    if (storageDistributorWitchLeastLife && storageDistributorWitchLeastLife.ticksToLive <= 200) {
                        minimumNumberOfStorageDistributors = 2;
                    }
                    else minimumNumberOfStorageDistributors = 1;
                }

                //if there's no storage you don't need carriers
                if (!room.storage) {
                    minimumNumberOfCarriers = 0;
                }
                else { // there is a storage we need carriers
                    if (global[room.name].containers.length > 2) {
                        var containersWithEnergy = _.filter(global[room.name].containers, (s) => s.store && s.store[RESOURCE_ENERGY] && s.store[RESOURCE_ENERGY] > 0);
                        var containersWithEnergyLeast = containersWithEnergy.length > 0 ? _.min(containersWithEnergy, '.store.energy').store.energy : 0;
                        if (containersWithEnergyLeast > 1800) {
                            minimumNumberOfCarriers = minimumNumberOfCarriers < 5 ? minimumNumberOfCarriers + 1 : minimumNumberOfCarriers;
                        }
                        else if (containersWithEnergyLeast < 25) {
                            minimumNumberOfCarriers = minimumNumberOfCarriers > 1 ? minimumNumberOfCarriers - 1 : minimumNumberOfCarriers;
                        }
                    }
                    else {
                        minimumNumberOfCarriers = 1;
                    }
                }

                //set number of harvesters
                if (global[room.name]['cachedMinimumNumberOfHarvesters'] == undefined) {

                        var numberOfSources = room.find(FIND_SOURCES).length;
                        minimumNumberOfHarvesters = numberOfSources;

                    global[room.name]['cachedMinimumNumberOfHarvesters'] = minimumNumberOfHarvesters;
                }
                else {
                    minimumNumberOfHarvesters = global[room.name]['cachedMinimumNumberOfHarvesters'];
                }

                //set number of landlords starts
                if (Game.time % 6 == 0 || global[room.name]['cachedMinimumNumberOfLandlords'] == undefined) {
                    var claimRooms = _.filter(Memory.rooms[room].clm, (a) => a);
                    var reserveRooms = _.filter(Memory.rooms[room].rsv, (a) => a);
                    if (room.energyCapacityAvailable >= 650*3) minimumNumberOfLandlords = claimRooms.length + Math.ceil(reserveRooms.length * 0.3);
                    else minimumNumberOfLandlords = claimRooms.length + Math.round(reserveRooms.length * 1.5);

                    global[room.name]['cachedMinimumNumberOfLandlords'] = minimumNumberOfLandlords;
                }
                else {
                    minimumNumberOfLandlords = global[room.name]['cachedMinimumNumberOfLandlords'];
                }
                //set number of landlords ends

               //remote creeps starts

                var remoteRooms = Memory.rooms[room].rmtR;

                var temp_minimumNumberOfRemoteHarvesters = 0;
                var temp_minimumNumberOfRemoteMiners = 0;
                var temp_minimumNumberOfRemoteHaulers = 0;
                var temp_minimumNumberOfRemoteGuards = 0;

                for (let rmtR in remoteRooms) {
                    let splitRMTR = rmtR.split(',');

                    let temp_room = splitRMTR[0];
                    let temp_harvesters = splitRMTR[1] ? splitRMTR[1] : 0;
                    let temp_miners = splitRMTR[2] ? splitRMTR[2] : 0;

                    if (((temp_harvesters == undefined || temp_harvesters == undefined) && (temp_miners == undefined || temp_miners == null))
                        || (temp_harvesters < 1 && temp_miners < 1)) Memory.rooms[room].rmtR.splice(rmtR.length, 1);

                    let temp_haulers = Math.round(temp_harvesters+temp_miners/2);

                    let temp_guards = 0;

                    function isES456(temp_room) {
                        if (Number.isNaN(temp_room[2]) == false) {
                            switch (temp_room[2]) {
                                case 4:
                                    return true;
                                    break;
                                case 5:
                                    return true;
                                    break;
                                case 6:
                                    return true;
                                    break;
                                default:
                                    return false;
                            }
                        }
                        else {
                            switch (temp_room[1]) {
                                case 4:
                                    return true;
                                    break;
                                case 5:
                                    return true;
                                    break;
                                case 6:
                                    return true;
                                    break;
                                default:
                                    return false;
                            }
                        }
                    }

                    switch (temp_room[temp_room.length-1]) {
                        case 4:
                            if (isES456(temp_room) == true) temp_guards = 0;
                            break;
                        case 5:
                            if (isES456(temp_room) == true) temp_guards = 0;
                            break;
                        case 6:
                            if (isES456(temp_room) == true) temp_guards = 0;
                            break;
                    }

                    temp_minimumNumberOfRemoteHarvesters = temp_harvesters;
                    temp_minimumNumberOfRemoteMiners = temp_miners;
                    temp_minimumNumberOfRemoteHaulers = temp_haulers;
                    temp_minimumNumberOfRemoteGuards = temp_guards;
                }

                minimumNumberOfRemoteHarvesters = temp_minimumNumberOfRemoteHarvesters;
                minimumNumberOfRemoteMiners = temp_minimumNumberOfRemoteMiners;
                minimumNumberOfRemoteHaulers = temp_minimumNumberOfRemoteHaulers;
                minimumNumberOfRemoteGuards = temp_minimumNumberOfRemoteGuards;

               //remote creeps ends

                if (room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTRACTOR})[0]) {
                    var mineral = global[room.name].mineral;
                    if (!mineral.ticksToRegeneration || mineral.ticksToRegeneration < 500) {
                        minimumNumberOfMiners = 1;
                    }
                    else {
                        minimumNumberOfMiners = 0;
                    }
                }
                else {
                    minimumNumberOfMiners = 0;
                }

                }
           

            minimumNumberOfGuards = 1;

            var isUnderAttack = Memory.rooms[room].isUnderAttack;
            //if under attack over ride everything
            if (isUnderAttack === true) {
                let numberOfHostiles = _.filter(global[room.name].creepsNotMine, (c) => c.getActiveBodyparts(ATTACK) >= 1 || c.getActiveBodyparts(RANGED_ATTACK) >= 1
                || c.getActiveBodyparts(HEAL) >= 1 || c.getActiveBodyparts(WORK) >= 1).length;

                minimumNumberOfGuards = Math.round(numberOfHostiles * 2.6);
                minimumNumberOfUpgraders = 0;
                minimumNumberOfCaretakers = 1;
                minimumNumberOfLandlords = 0;
                minimumNumberOfRemoteHarvesters = 0;
                minimumNumberOfRemoteHaulers = 0;
                minimumNumberOfRemoteMiners = 0;
                minimumNumberOfRemoteGuards = 0;
                minimumNumberOfOtherRoomCreeps = 0;
                minimumNumberOfEnergyHelpers = 0;
                minimumNumberOfMiners = 0;
            }
            else {
                switch (room.controller.level) {
                    case 3:
                        minimumNumberOfCaretakers = 1;
                        minimumNumberOfUpgraders = 7;
                        break;
                    case 2:

                        minimumNumberOfCaretakers = 3;
                        minimumNumberOfUpgraders = 5;
                        break;
                    case 1:

                        minimumNumberOfCaretakers = 1;
                        minimumNumberOfUpgraders = 3;
                        break;
                    default:
                        minimumNumberOfCaretakers = 1;
                        if (room.controller.level < 8) {
                            var storage = room.storage;
                            if (minimumNumberOfUpgraders < 1) {
                                minimumNumberOfUpgraders = 1;
                                break;
                            }
                            if (!storage) break;

                            if (room.controller.level >= 6) {
                                if (!global[room.name].minUpgraders || Game.time % 45 == 0) {
                                    var terminalEnergy = room.terminal && room.terminal.store && room.terminal.store[RESOURCE_ENERGY] ? room.terminal.store[RESOURCE_ENERGY] : 0;
                                    global[room.name].minUpgraders = Math.floor(((storage.store.energy + terminalEnergy) - 20000) / 20000) > 1 ?
                                        Math.floor(((storage.store.energy + terminalEnergy) - 20000) / 20000) : 1;
                                }

                                minimumNumberOfUpgraders = global[room.name].minUpgraders;
                            }
                            else {
                                if (!global[room.name].minUpgraders || Game.time % 27 == 0) {
                                    if (storage.store[RESOURCE_ENERGY] > 90000) {
                                        global[room.name].minUpgraders = minimumNumberOfUpgraders < 8 ? minimumNumberOfUpgraders + 1 : minimumNumberOfUpgraders;
                                    }
                                    else {
                                        global[room.name].minUpgraders = minimumNumberOfUpgraders > 1 ? minimumNumberOfUpgraders - 1 : minimumNumberOfUpgraders;
                                    }
                                }

                                minimumNumberOfUpgraders = global[room.name].minUpgraders;
                            }
                        }
                        else minimumNumberOfUpgraders = 1;
                }
            }

            //add creeps close to death to queue
            //if (Game.time % 6 == 0) this.addCreepsAboutToDieToQueue(room, harvestersInPriorityQueue, distributorsInPriorityQueue, carriersInPriorityQueue);

            //add creep that needs to be added to queue to queue
            var creepToAddToQueue;
            var queueToAddTo = 0; // 0 is normal and 1 is priority 2 is war

            if (minimumNumberOfHarvesters > harvestersInQueue + numberOfHarvesters + harvestersInPriorityQueue) {
                queueToAddTo = 1;
                creepToAddToQueue = 'harvester';
            }
            else if (minimumNumberOfDistributors > distributorsInQueue + numberOfDistributors + distributorsInPriorityQueue) {
                if (!distributorsInPriorityQueue > 0) {
                    queueToAddTo = 1;
                }
                creepToAddToQueue = 'distributor';
            }
            else if (minimumNumberOfStorageDistributors > storageDistributorsInQueue + numberOfStorageDistributors + storageDistributorsInPriorityQueue) {
                if (!storageDistributorsInPriorityQueue > 0) {
                    queueToAddTo = 1;
                }
                creepToAddToQueue = 'storageDistributor';
            }
            else if (minimumNumberOfCarriers > carriersInQueue + numberOfCarriers + carriersInPriorityQueue) {
                if (!carriersInPriorityQueue > 0) {
                    queueToAddTo = 1;
                }
                creepToAddToQueue = 'carrier';
            }
            else if (minimumNumberOfCaretakers > caretakersInQueue + numberOfCaretakers) {
                creepToAddToQueue = 'caretaker';
            }
            else if (minimumNumberOfGuards > guardsInQueue + guardsInWarQueue + numberOfGuards) {
                queueToAddTo = 2;
                creepToAddToQueue = 'guard';
            }
            else if (minimumNumberOfUpgraders > upgradersInQueue + numberOfUpgraders) {
                creepToAddToQueue = 'upgrader';
            }
            else if (minimumNumberOfEnergyThiefs > energyThiefsInQueue + numberOfEnergyThiefs) {
                creepToAddToQueue = 'energyThief';
            }
            else if (minimumNumberOfLandlords > landlordsInQueue + numberOfLandlords) {
                creepToAddToQueue = 'landlord';
            }
            else if (minimumNumberOfRemoteGuards > remoteGuardsInQueue + numberOfRemoteGuards) {
                creepToAddToQueue = 'remoteGuard';
            }
            else if (minimumNumberOfRemoteHarvesters > remoteHarvestersInQueue + numberOfRemoteHarvesters) {
                creepToAddToQueue = 'remoteHarvester';
            }
            else if (minimumNumberOfRemoteHaulers > remoteHaulersInQueue + numberOfRemoteHaulers) {
                creepToAddToQueue = 'remoteHauler';
            }
            else if (minimumNumberOfRemoteMiners > remoteMinersInQueue + numberOfRemoteMiners) {
                creepToAddToQueue = 'remoteMiner';
            }
            else if (minimumNumberOfOtherRoomCreeps > otherRoomCreepsInQueue + numberOfOtherRoomCreeps) {
                creepToAddToQueue = 'otherRoomCreep';
            }
            else if (minimumNumberOfEnergyHelpers > energyHelpersInQueue + numberOfEnergyHelpers) {
                creepToAddToQueue = 'energyHelper';
            }
            else if (minimumNumberOfMiners > minersInQueue + numberOfMiners) {
                creepToAddToQueue = 'miner';
            }
            else if (minimumNumberOfCreepHarassers > creepHarassersInQueue + creepHarassersInWarQueue + numberOfCreepHarassers) {
                    queueToAddTo = 2;
                creepToAddToQueue = 'creepHarasser';
            }
            else if (minimumNumberOfSpawnSmashers > spawnSmashersInQueue + spawnSmashersInWarQueue + numberOfSpawnSmashers) {
                    queueToAddTo = 2;
                creepToAddToQueue = 'spawnSmasher';
            }
            else if (minimumNumberOfStructureDestroyers > structureDestroyersInQueue + structureDestroyersInWarQueue + numberOfStructureDestroyers) {
                    queueToAddTo = 2;
                creepToAddToQueue = 'structureDestroyer';
            }
            else if (minimumNumberOfWallBreakers > wallBreakersInQueue + wallBreakersInWarQueue + numberOfWallBreakers) {
                    queueToAddTo = 2;
                creepToAddToQueue = 'wallBreaker';
            }
            else if (minimumNumberOfWarHealers > warHealersInQueue + warHealersInWarQueue + numberOfWarHealers) {
                    queueToAddTo = 2;
                creepToAddToQueue = 'warHealer';
            }
            else if (minimumNumberOfTowerDrainers > towerDrainersInQueue + towerDrainersInWarQueue + numberOfTowerDrainers) {
                    queueToAddTo = 2;
                creepToAddToQueue = 'towerDrainer';
            }

            if (creepToAddToQueue) {
                switch (queueToAddTo) {
                    case 0:
                        Memory.rooms[room].spawnQueue.normal.push(creepToAddToQueue);
                        break;
                    case 1:
                        Memory.rooms[room].spawnQueue.priority.push(creepToAddToQueue);
                        break;
                    case 2:
                        Memory.rooms[room].spawnQueue.war.push(creepToAddToQueue);
                        break;
                }
            }
        }


        //spawn next creep in queue
        this.spawn(room, numberOfHarvesters, minimumNumberOfHarvesters, numberOfDistributors, minimumNumberOfDistributors, numberOfCarriers);

        //memory "cleanup"
        Memory.rooms[room].populationGoal[0] = minimumNumberOfHarvesters;
        Memory.rooms[room].populationGoal[1] = minimumNumberOfCarriers;
        Memory.rooms[room].populationGoal[2] = minimumNumberOfDistributors;
        Memory.rooms[room].populationGoal[3] = minimumNumberOfUpgraders;
        Memory.rooms[room].populationGoal[4] = minimumNumberOfCaretakers;
        Memory.rooms[room].populationGoal[5] = minimumNumberOfLandlords;
        Memory.rooms[room].populationGoal[6] = minimumNumberOfRemoteHarvesters;
        Memory.rooms[room].populationGoal[7] = minimumNumberOfRemoteHaulers;
        Memory.rooms[room].populationGoal[8] = minimumNumberOfOtherRoomCreeps;
        Memory.rooms[room].populationGoal[9] = minimumNumberOfEnergyThiefs;
        Memory.rooms[room].populationGoal[10] = minimumNumberOfEnergyHelpers;
        Memory.rooms[room].populationGoal[11] = minimumNumberOfMiners;
        Memory.rooms[room].populationGoal[12] = minimumNumberOfGuards;
        Memory.rooms[room].populationGoal[13] = minimumNumberOfCreepHarassers;
        Memory.rooms[room].populationGoal[14] = minimumNumberOfSpawnSmashers;
        Memory.rooms[room].populationGoal[15] = minimumNumberOfStructureDestroyers;
        Memory.rooms[room].populationGoal[16] = minimumNumberOfWallBreakers;
        Memory.rooms[room].populationGoal[17] = minimumNumberOfWarHealers;
        Memory.rooms[room].populationGoal[18] = minimumNumberOfTowerDrainers;
        Memory.rooms[room].populationGoal[19] = minimumNumberOfRemoteMiners;
        Memory.rooms[room].populationGoal[20] = minimumNumberOfRemoteGuards;
        Memory.rooms[room].populationGoal[21] = minimumNumberOfStorageDistributors;

        //grafana population stats stuff
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfHarvesters'] = numberOfHarvesters;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfCarriers'] = numberOfCarriers;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfDistributors'] = numberOfDistributors;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfUpgraders'] = numberOfUpgraders;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfBuilders'] = numberOfBuilders;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfRepairers'] = numberOfRepairers;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfDefenceManagers'] = numberOfDefenceManagers;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfLandlords'] = numberOfLandlords;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfRemoteHarvesters'] = numberOfRemoteHarvesters;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfRemoteHaulers'] = numberOfRemoteHaulers;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfOtherRoomCreeps'] = numberOfOtherRoomCreeps;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfEnergyThiefs'] = numberOfEnergyThiefs;
        // Memory.stats['room.' + room.name + '.creeps' + '.numberOfEnergyHelpers'] = numberOfEnergyHelpers;
        //add more cause that's not all

        //var normalSpawnQueue = Memory.rooms[room].spawnQueue.normal;
        //Memory.stats['room.' + room.name + '.spawnQueues' + '.normal'] = normalSpawnQueue.length;
        //var prioritySpawnQueue = Memory.rooms[room].spawnQueue.priority;
        //Memory.stats['room.' + room.name + '.spawnQueues' + '.priority'] = prioritySpawnQueue.length;
        //var warSpawnQueue = Memory.rooms[room].spawnQueue.war;
        //Memory.stats['room.' + room.name + '.spawnQueues' + '.war'] = warSpawnQueue.length;

    },

    checkMemory: function (room) {
        //memory if undefined checking and setting to default value if undefined
        if (!Memory.rooms[room].spawnQueue) {
            Memory.rooms[room].spawnQueue = {};
        }
        if (!Memory.rooms[room].spawnQueue.normal) {
            Memory.rooms[room].spawnQueue.normal = [];
        }
        if (!Memory.rooms[room].spawnQueue.priority) {
            Memory.rooms[room].spawnQueue.priority = [];
        }
        if (!Memory.rooms[room].spawnQueue.war) {
            Memory.rooms[room].spawnQueue.war = [];
        }

        if (!Memory.rooms[room].populationGoal) {
            Memory.rooms[room].populationGoal = [];
        }

        //harvesters
        if (Memory.rooms[room].populationGoal[0] == undefined) {
            Memory.rooms[room].populationGoal[0] = 2;
        }
        //carriers
        if (Memory.rooms[room].populationGoal[1] == undefined) {
            Memory.rooms[room].populationGoal[1] = 0;
        }
        //distributors
        if (Memory.rooms[room].populationGoal[2] == undefined) {
            Memory.rooms[room].populationGoal[2] = 1;
        }
        //upgraders
        if (Memory.rooms[room].populationGoal[3] == undefined) {
            Memory.rooms[room].populationGoal[3] = 1;
        }
        //caretakers
        if (Memory.rooms[room].populationGoal[4] == undefined) {
            Memory.rooms[room].populationGoal[4] = 0;
        }
        //landlords
        if (Memory.rooms[room].populationGoal[5] == undefined) {
            Memory.rooms[room].populationGoal[5] = 0;
        }
        //remoteHarvesters
        if (Memory.rooms[room].populationGoal[6] == undefined) {
            Memory.rooms[room].populationGoal[6] = 0;
        }
        //remoteHaulers
        if (Memory.rooms[room].populationGoal[7] == undefined) {
            Memory.rooms[room].populationGoal[7] = 0;
        }
        //otherRoomCreeps
        if (Memory.rooms[room].populationGoal[8] == undefined) {
            Memory.rooms[room].populationGoal[8] = 0;
        }
        //energyThiefs
        if (Memory.rooms[room].populationGoal[9] == undefined) {
            Memory.rooms[room].populationGoal[9] = 0;
        }
        //energyHelpers
        if (Memory.rooms[room].populationGoal[10] == undefined) {
            Memory.rooms[room].populationGoal[10] = 0;
        }
        //miners
        if (Memory.rooms[room].populationGoal[11] == undefined) {
            Memory.rooms[room].populationGoal[11] = 0;
        }
        //guards
        if (Memory.rooms[room].populationGoal[12] == undefined) {
            Memory.rooms[room].populationGoal[12] = 3;
        }
        //creep harassers
        if (Memory.rooms[room].populationGoal[13] == undefined) {
            Memory.rooms[room].populationGoal[13] = 0;
        }
        //spawn smashers
        if (Memory.rooms[room].populationGoal[14] == undefined) {
            Memory.rooms[room].populationGoal[14] = 0;
        }
        //structure destroyer
        if (Memory.rooms[room].populationGoal[15] == undefined) {
            Memory.rooms[room].populationGoal[15] = 0;
        }
        //wall destroyer
        if (Memory.rooms[room].populationGoal[16] == undefined) {
            Memory.rooms[room].populationGoal[16] = 0;
        }
        //war healer
        if (Memory.rooms[room].populationGoal[17] == undefined) {
            Memory.rooms[room].populationGoal[17] = 0;
        }
         //tower drainer
        if (Memory.rooms[room].populationGoal[18] == undefined) {
            Memory.rooms[room].populationGoal[18] = 0;
        }
        //remote miner
        if (Memory.rooms[room].populationGoal[19] == undefined) {
            Memory.rooms[room].populationGoal[19] = 0;
        }
        //remote guard
        if (Memory.rooms[room].populationGoal[20] == undefined) {
            Memory.rooms[room].populationGoal[20] = 0;
        }
        //storage distributors
        if (Memory.rooms[room].populationGoal[21] == undefined) {
            Memory.rooms[room].populationGoal[21] = 0;
        }
    },

    spawn: function (room, numberOfHarvesters, minimumNumberOfHarvesters, numberOfDistributors, minimumNumberOfDistributors, numberOfCarriers) {
        var spawns = _.filter(global[room.name].spawns, (s) => s.spawning != true);
        var spawn = spawns[Game.time % spawns.length];

        if (spawn) {

            var energy = spawn.room.energyAvailable;
            var amountToSave = 0;//in percent
            var name = undefined;
            var queueUsed = 0; // 0 is normal and 1 is priority 2 is war
            var roleToSpawn;

            if (room.energyAvailable >= 400) {
                if ((numberOfHarvesters >= minimumNumberOfHarvesters)
                    && (numberOfDistributors >= minimumNumberOfDistributors)
                    && (numberOfCarriers > 0)) {
                    amountToSave = 0.15;
                }
            }

            if (room.energyAvailable >= 300) {

                var queuesWithCreeps = _.filter(Memory.rooms[room].spawnQueue, (q) => q.length > 0);
                var queueToUse = queuesWithCreeps[(Game.time % queuesWithCreeps.length)];

                if (queueToUse) {
                    roleToSpawn = queueToUse[0];
                    if (roleToSpawn == 'harvester') amountToSave = 0;
                    else if (roleToSpawn == 'distributor') amountToSave = 0;
                    else {
                        if (roleToSpawn == 'guard') amountToSave = 0;
                    }
                    name = spawn.createCustomCreep(room, energy, roleToSpawn, amountToSave);
                }

                if (Game.creeps[name] || name == 'remove') {
                    _.filter(Memory.rooms[room].spawnQueue, (q) => q.length > 0)[Game.time % _.filter(Memory.rooms[room].spawnQueue, (q) => q.length > 0).length].splice(0, 1);

                    if (!name == 'remove') global.roomLog("[SPAWNING] " + name, room);
                }
            }
        }
    }
};
