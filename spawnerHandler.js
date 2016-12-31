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
        var minimumNumberOfMarketMovers = Memory.rooms[room].populationGoal[12];
        var minimumNumberOfGuards = Memory.rooms[room].populationGoal[13];
        var minimumNumberOfCreepHarassers = Memory.rooms[room].populationGoal[14];
        var minimumNumberOfSpawnSmashers = Memory.rooms[room].populationGoal[15];
        var minimumNumberOfStructureDestroyers = Memory.rooms[room].populationGoal[16];
        var minimumNumberOfWallBreakers = Memory.rooms[room].populationGoal[17];
        var minimumNumberOfWarHealers = Memory.rooms[room].populationGoal[18];
        var minimumNumberOfTowerDrainers = Memory.rooms[room].populationGoal[19];

        //get number of each creeps of each role
        var numberOfHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester' && c.memory.room == room.name);
        var numberOfCarriers = _.sum(Game.creeps, (c) => c.memory.role == 'carrier' && c.memory.room == room.name);
        var numberOfDistributors = _.sum(Game.creeps, (c) => c.memory.role == 'distributor' && c.memory.room == room.name);
        var numberOfUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader' && c.memory.room == room.name);
        var numberOfBuilders = _.sum(Game.creeps, (c) => c.memory.role == 'builder' && c.memory.room == room.name);
        var numberOfCaretakers = _.sum(Game.creeps, (c) => c.memory.role == 'caretaker' && c.memory.room == room.name);
        var numberOfDefenceManagers = _.sum(Game.creeps, (c) => c.memory.role == 'defenceManager' && c.memory.room == room.name);
        var numberOfLandlords = _.sum(Game.creeps, (c) => c.memory.role == 'landlord' && c.memory.room == room.name);
        var numberOfRemoteHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'remoteHarvester' && c.memory.room == room.name);
        var numberOfRemoteHaulers = _.sum(Game.creeps, (c) => c.memory.role == 'remoteHauler' && c.memory.room == room.name);
        var numberOfOtherRoomCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'otherRoomCreep' && c.memory.room == room.name);
        var numberOfEnergyThiefs = _.sum(Game.creeps, (c) => c.memory.role == 'energyThief' && c.memory.room == room.name);
        var numberOfEnergyHelpers = _.sum(Game.creeps, (c) => c.memory.role == 'energyHelper' && c.memory.room == room.name);
        var numberOfMiners = _.sum(Game.creeps, (c) => c.memory.role == 'miner' && c.memory.room == room.name);
        var numberOfMarketMovers = _.sum(Game.creeps, (c) => c.memory.role == 'marketMover' && c.memory.room == room.name);
        var numberOfGuards = _.sum(Game.creeps, (c) => c.memory.role == 'guard' && c.memory.room == room.name);
        var numberOfCreepHarassers = _.sum(Game.creeps, (c) => c.memory.role == 'creepHarasser' && c.memory.room == room.name);
        var numberOfSpawnSmashers = _.sum(Game.creeps, (c) => c.memory.role == 'spawnSmasher' && c.memory.room == room.name);
        var numberOfStructureDestroyers = _.sum(Game.creeps, (c) => c.memory.role == 'structureDestroyer' && c.memory.room == room.name);
        var numberOfWallBreakers = _.sum(Game.creeps, (c) => c.memory.role == 'wallBreaker' && c.memory.room == room.name);
        var numberOfWarHealers = _.sum(Game.creeps, (c) => c.memory.role == 'warHealer' && c.memory.room == room.name);
        var numberOfTowerDrainers = _.sum(Game.creeps, (c) => c.memory.role == 'towerDrainer' && c.memory.room == room.name);

        // debugging
        // console.log('Harvesters ' + numberOfHarvesters);
        // console.log('Carriers ' + numberOfCarriers);
        // console.log('Distributors ' + numberOfDistributors);
        // console.log('Upgraders ' + numberOfUpgraders);
        // console.log('Builders ' + numberOfBuilders);
        // console.log('Repairer ' + numberOfRepairers);
        // console.log('Defence Managers ' + numberOfDefenceManagers);
        // console.log('Landlords ' + numberOfLandlords);
        // console.log('Other Room Creeps ' + numberOfOtherRoomCreeps);
        // add more cause this ain't all the roles ^

        //if no harvesters email me and spam console
        if (numberOfHarvesters <= 0) {
            if (Game.time % 200 == 0) {
                Game.notify("No harvesters in room " + room);
            }
            console.log("No harvesters in room " + room);
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
                var upgradersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'upgrader');
                var buildersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'builder');
                var caretakersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'caretaker');
                var defenceManagersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'defenceManager');
                var landlordsInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'landlord');
                var remoteHarvestersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'remoteHarvester');
                var remoteHaulersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'remoteHauler');
                var otherRoomCreepsInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'otherRoomCreep');
                var energyThiefsInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'energyThief');
                var energyHelpersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'energyHelper');
                var minersInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'miner');
                var marketMoversInQueue = _.sum(Memory.rooms[room].spawnQueue.normal, (r) => r == 'marketMover');
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

                minimumNumberOfDistributors = room.find(FIND_MY_SPAWNS).length;

                //if there's no storage you don't need carriers
                if (!room.storage) {
                    minimumNumberOfCarriers = 0;

                    let maxDropEn = _.max(room.find(FIND_DROPPED_ENERGY), '.amount').amount;

                    if (maxDropEn) {
                        minimumNumberOfUpgraders = 2;
                    }
                }
                else {
                    if (global[room.name].links[0]) {
                        if (room.storage.store[RESOURCE_ENERGY] > 600000) {
                            minimumNumberOfCarriers = 1;
                        }
                        else minimumNumberOfCarriers = 2;
                    }
                    else {
                        var minContEng = _.max(room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER}), '.store.energy');
                        if (minContEng && minContEng.store && minContEng.store.energy > 1000) {
                            minimumNumberOfCarriers = 3
                        }
                        else {
                            minimumNumberOfCarriers = 2;
                        }
                    }
                }

                //set number of harvesters
                if (global[room.name]['cachedMinimumNumberOfHarvesters'] == undefined) {
                    if (room.controller.level <= 3) {
                        minimumNumberOfHarvesters = 4;
                    }
                    else {
                        var numberOfSources = room.find(FIND_SOURCES).length;
                        minimumNumberOfHarvesters = numberOfSources;
                    }

                    global[room.name]['cachedMinimumNumberOfHarvesters'] = minimumNumberOfHarvesters;
                }
                else {
                    minimumNumberOfHarvesters = global[room.name]['cachedMinimumNumberOfHarvesters'];
                }

                //set number of landlords starts
                if (Game.time % 6 == 0 || global[room.name]['cachedMinimumNumberOfLandlords'] == undefined) {
                    var numberOfClaimFlags = _.sum(Game.flags, (f) => f.memory.type == 'claimFlag' && f.memory.room == room.name);
                    var reserveFlags = _.filter(Game.flags, (f) => f.memory.type == 'reserveFlag' && f.memory.room == room.name);
                    var amountOfReservers = this.getAmountOfReservers(room, reserveFlags);
                    minimumNumberOfLandlords = numberOfClaimFlags + amountOfReservers;

                    global[room.name]['cachedMinimumNumberOfLandlords'] = minimumNumberOfLandlords;
                }
                else {
                    minimumNumberOfLandlords = global[room.name]['cachedMinimumNumberOfLandlords'];
                }
                //set number of landlords ends

                //set number of remote creeps starts
                if (Game.time % 6 == 0 || global[room.name]['cachedMinimumNumberOfRemoteCreeps'] == undefined || global[room.name]['cachedMinimumNumberOfRemoteCreeps'].length < 2) {
                    var remoteCreepFlags = global[room.name].cachedRemoteCreepFlags;
                    var tempRemoteHarvesters = 0;
                    var tempRemoteHaulers = 0;

                    for (let flag of remoteCreepFlags) {
                        tempRemoteHarvesters += flag.memory.numberOfRemoteHarvesters;
                        tempRemoteHaulers += flag.memory.numberOfRemoteHaulers;
                    }

                    minimumNumberOfRemoteHarvesters = tempRemoteHarvesters;
                    minimumNumberOfRemoteHaulers = tempRemoteHaulers;

                    global[room.name]['cachedMinimumNumberOfRemoteCreeps'] = minimumNumberOfRemoteHarvesters + ',' + minimumNumberOfRemoteHaulers;
                }
                else {
                    var foo = global[room.name]['cachedMinimumNumberOfRemoteCreeps'].split(',');
                    minimumNumberOfRemoteHarvesters = foo[0];
                    minimumNumberOfRemoteHaulers = foo[1];
                }
                //set number of remote creeps ends

                if (room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTRACTOR})[0]) {
                    var mineral = room.find(FIND_MINERALS)[0];
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


                if (room.controller.level = 8) {
                    var terminal = room.terminal;
                    var bucket = Game.cpu.bucket;
                    if (terminal && bucket > 2000) {
                        minimumNumberOfMarketMovers = 1;
                    }
                    else {
                        minimumNumberOfMarketMovers = 0;
                    }
                }
                else {
                    minimumNumberOfMarketMovers = 0;
                }
            }

            minimumNumberOfGuards = 1;


            if (room.controller.level < 8) {
                if (room.controller.level < 5) {
                    minimumNumberOfUpgraders = 3;
                }
                else {
                    minimumNumberOfUpgraders = 5;
                }
            }
            else {
                minimumNumberOfUpgraders = 1;
            }

            var isUnderAttack = Memory.rooms[room].isUnderAttack;
            //if under attack over ride everything
            if (isUnderAttack === true) {
                let numberOfHostiles = room.find(FIND_HOSTILE_CREEPS, {
                    filter: (c) => c.getActiveBodyparts(ATTACK) >= 1 || c.getActiveBodyparts(RANGED_ATTACK) >= 1
                    || c.getActiveBodyparts(HEAL) >= 1 || c.getActiveBodyparts(WORK) >= 1
                }).length;

                minimumNumberOfGuards = Math.round(numberOfHostiles * 2.6);
                minimumNumberOfUpgraders = 0;
                minimumNumberOfCaretakers = 1;
                minimumNumberOfLandlords = 0;
                minimumNumberOfRemoteHarvesters = 0;
                minimumNumberOfRemoteHaulers = 0;
                minimumNumberOfOtherRoomCreeps = 0;
                minimumNumberOfEnergyHelpers = 0;
                minimumNumberOfMiners = 0;
            }
            else {
                minimumNumberOfCaretakers = 1;
            }

            //add creeps close to death to queue
            if (Game.time % 6 == 0) this.addCreepsAboutToDieToQueue(room, harvestersInPriorityQueue, distributorsInPriorityQueue, carriersInPriorityQueue);

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
            else if (minimumNumberOfCarriers > carriersInQueue + numberOfCarriers + carriersInPriorityQueue) {
                if (!carriersInPriorityQueue > 0) {
                    queueToAddTo = 1;
                }
                creepToAddToQueue = 'carrier';
            }
            else if (minimumNumberOfUpgraders > upgradersInQueue + numberOfUpgraders) {
                creepToAddToQueue = 'upgrader';
            }
            else if (minimumNumberOfCaretakers > caretakersInQueue + numberOfCaretakers) {
                creepToAddToQueue = 'caretaker';
            }
            else if (minimumNumberOfEnergyThiefs > energyThiefsInQueue + numberOfEnergyThiefs) {
                creepToAddToQueue = 'energyThief';
            }
            else if (minimumNumberOfLandlords > landlordsInQueue + numberOfLandlords) {
                creepToAddToQueue = 'landlord';
            }
            else if (minimumNumberOfRemoteHarvesters > remoteHarvestersInQueue + numberOfRemoteHarvesters) {
                creepToAddToQueue = 'remoteHarvester';
            }
            else if (minimumNumberOfRemoteHaulers > remoteHaulersInQueue + numberOfRemoteHaulers) {
                creepToAddToQueue = 'remoteHauler';
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
            else if (minimumNumberOfMarketMovers > marketMoversInQueue + numberOfMarketMovers) {
                creepToAddToQueue = 'marketMover';
            }
            else if (minimumNumberOfGuards > guardsInQueue + guardsInWarQueue + numberOfGuards) {
                    queueToAddTo = 2;
                creepToAddToQueue = 'guard';
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
        Memory.rooms[room].populationGoal[12] = minimumNumberOfMarketMovers;
        Memory.rooms[room].populationGoal[13] = minimumNumberOfGuards;
        Memory.rooms[room].populationGoal[14] = minimumNumberOfCreepHarassers;
        Memory.rooms[room].populationGoal[15] = minimumNumberOfSpawnSmashers;
        Memory.rooms[room].populationGoal[16] = minimumNumberOfStructureDestroyers;
        Memory.rooms[room].populationGoal[17] = minimumNumberOfWallBreakers;
        Memory.rooms[room].populationGoal[18] = minimumNumberOfWarHealers;
        Memory.rooms[room].populationGoal[19] = minimumNumberOfTowerDrainers;

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

        var normalSpawnQueue = Memory.rooms[room].spawnQueue.normal;
        Memory.stats['room.' + room.name + '.spawnQueues' + '.normal'] = normalSpawnQueue.length;
        var prioritySpawnQueue = Memory.rooms[room].spawnQueue.priority;
        Memory.stats['room.' + room.name + '.spawnQueues' + '.priority'] = prioritySpawnQueue.length;
        var warSpawnQueue = Memory.rooms[room].spawnQueue.war;
        Memory.stats['room.' + room.name + '.spawnQueues' + '.war'] = warSpawnQueue.length;

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
        //marketMovers
        if (Memory.rooms[room].populationGoal[12] == undefined) {
            Memory.rooms[room].populationGoal[12] = 0;
        }
        //guards
        if (Memory.rooms[room].populationGoal[13] == undefined) {
            Memory.rooms[room].populationGoal[13] = 3;
        }
        //creep harassers
        if (Memory.rooms[room].populationGoal[14] == undefined) {
            Memory.rooms[room].populationGoal[14] = 0;
        }
        //spawn smashers
        if (Memory.rooms[room].populationGoal[15] == undefined) {
            Memory.rooms[room].populationGoal[15] = 0;
        }
        //structure destroyer
        if (Memory.rooms[room].populationGoal[16] == undefined) {
            Memory.rooms[room].populationGoal[16] = 0;
        }
        //wall destroyer
        if (Memory.rooms[room].populationGoal[17] == undefined) {
            Memory.rooms[room].populationGoal[17] = 0;
        }
        //war healer
        if (Memory.rooms[room].populationGoal[18] == undefined) {
            Memory.rooms[room].populationGoal[18] = 0;
        }
        //tower drainer
        if (Memory.rooms[room].populationGoal[19] == undefined) {
            Memory.rooms[room].populationGoal[19] = 0;
        }
    },

    getAmountOfReservers: function (room, reserveFlags) {
//find the amount of reservers we need to add to the number of landlords
        var amountToReturn = 0;

        for (let flag of reserveFlags) {
            if (flag.room) {
                if (flag.room.controller.reservation) {
                    if (flag.room.controller.reservation.ticksToEnd <= 2500) {
                        amountToReturn += 2;
                    }
                    else {
                        var landlordsInRoom = flag.room.find(FIND_CREEPS, {filter: (c) => c.memory && c.memory.role == 'landlord' && c.memory.flag == flag.name});
                        if (landlordsInRoom == 0) {
                            amountToReturn += 1;
                        }
                    }
                }
                else {
                    amountToReturn += 2;
                }
            }
            else {
                amountToReturn += 2;
            }
        }

        return amountToReturn + _.sum(Game.creeps, (c) => c.memory.role == 'landlord' && c.memory.room == room && reserveFlags.includes(Game.flags[c.memory.flag]));

    },

    addCreepsAboutToDieToQueue: function (room, harvestersInPriorityQueue, distributorsInPriorityQueue, carriersInPriorityQueue) {
        var creepAboutToDie = _.filter(Game.creeps, (c) => c.memory.room == room.name && c.ticksToLive <= 400 && c.memory.role)[0];

        if (creepAboutToDie) {
            let role = creepAboutToDie.memory.role;
            var whichQueue = 0; //0 is normal queue and 1 is priority 2 is war queue
            switch (role) {
                case 'harvester':
                        whichQueue = 1;
                    break;
                case 'distributor':
                        whichQueue = 1;
                    break;
                case 'carrier':
                    if (carriersInPriorityQueue == 0) {
                        whichQueue = 1;
                    }
                    break;
                case 'guard':
                    whichQueue = 2;
                    break;
            }

            switch (whichQueue) {
                case 0:
                    Memory.rooms[room].spawnQueue.normal.push(role);
                    break;
                case 1:
                    // Memory.rooms[room].spawnQueue.priority.splice(role);
                    Memory.rooms[room].spawnQueue.priority.splice(0, 0, role);
                    break;
                case 2:
                    Memory.rooms[room].spawnQueue.war.push(role);
                    break;
            }

            console.log('role ' + role + ' added to spawn queue ' + whichQueue + ' room ' + room.name);

        }
    },

    spawn: function (room, numberOfHarvesters, minimumNumberOfHarvesters, numberOfDistributors, minimumNumberOfDistributors, numberOfCarriers) {
        var spawns = room.find(FIND_MY_SPAWNS, {filter: (s) => s.spawning != true});
        var spawn = spawns[Game.time % spawns.length];

        if (spawn) {

            var energy = spawn.room.energyAvailable / spawns.length;
            var amountToSave = 0;//in percent
            var name = undefined;
            var queueUsed = 0; // 0 is normal and 1 is priority 2 is war

            if (room.energyAvailable >= 400) {

                if (Memory.rooms[room].energyMode == 'saving') {
                    amountToSave = 0.35;
                }
                else if (Memory.rooms[room].energyMode == 'ok') {
                    amountToSave = 0.25;
                }
                else if ((numberOfHarvesters >= minimumNumberOfHarvesters)
                    && (numberOfDistributors >= minimumNumberOfDistributors)
                    && (numberOfCarriers > 0)) {
                    amountToSave = 0.15;
                }
            }

            if (room.energyAvailable >= 300) {

                if (energy < 300) {
                    energy = room.energyAvailable;
                }

                if (!Memory.rooms[room].spawnQueue.war || !Memory.rooms[room].spawnQueue.war.length > 0 || Game.time % 5 == 0 || Game.time % 5 == 1) {
                    if (!Memory.rooms[room].spawnQueue.priority.length > 0 || Game.time % 3 == 0 || Game.time % 3 == 1) {
                        name = spawn.createCustomCreep(room, energy, Memory.rooms[room].spawnQueue.normal[0], amountToSave);
                    }
                    else {
                        queueUsed = 1;
                        name = spawn.createCustomCreep(room, energy, Memory.rooms[room].spawnQueue.priority[0], amountToSave);
                    }
                }
                else {
                    queueUsed = 2;
                    name = spawn.createCustomCreep(room, energy, Memory.rooms[room].spawnQueue.war[0], amountToSave);
                }

                if (Game.creeps[name]) {

                    switch (queueUsed) {
                        case 0:
                            Memory.rooms[room].spawnQueue.normal.splice(0, 1);
                            break;
                        case 1:
                            Memory.rooms[room].spawnQueue.priority.splice(0, 1);
                            break;
                        case 2:
                            Memory.rooms[room].spawnQueue.war.splice(0, 1);
                            break;
                    }
                    console.log("Creating Creep " + name + ' Room ' + room.name);
                }
            }
        }
    }
};
