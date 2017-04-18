require('global');
require('prototype.creep')();
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep) {

        creep.creepSpeech(room);

        var flagToGoTo = room.find(FIND_FLAGS, {filter: (f) => (f.memory.type == 'storageDistributorGoTo' || f.name.split(' ')[0] == 'storageDistributorGoTo') && f.pos.roomName == creep.room.name})[0];
        if (!flagToGoTo) {
            global.creepErrorLog('No storage distribution flag', creep, room);
            return;
        }

        if (!creep.pos.isEqualTo(flagToGoTo.pos)) {
            creep.moveTo(flagToGoTo);
        }
        else { // do stuff

            if (creep.memory.working == true && _.sum(creep.carry) == 0) {
                creep.memory.working = false;
            }
            else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.working = true;
            }

            if (creep.memory.working == true) {
                switch (creep.memory.doing) {
                    case 'link':
                        this.linkToStorage(room, creep);
                        break;
                    case 'terminal':
                        this.putExcessInTerminal(room, creep);
                        break;
                    case 'terminalToStorage':
                        this.terminalToStorage(room, creep);
                        break;
                    case 'labBoost':
                        this.boostLab(room, creep);
                        break;
                    case 'fillNuke':
                        this.fillNuke(room, creep);
                        break;
                    default:
                        global.creepErrorLog('creep.memory.doing is undefined', creep, room);
                        creep.memory.doing = 'link';
                }
            }
            else {
                if (this.linkToStorage(room, creep) == OK) {
                    creep.memory.doing = 'link';
                }
                else if (this.terminalToStorage(room, creep) == OK) {
                    creep.memory.doing = 'terminalToStorage';
                }
                else if (this.boostLab(room, creep) == OK) {
                    creep.memory.doing = 'labBoost';
                }
                else if (this.putExcessInTerminal(room, creep) == OK) {
                    creep.memory.doing = 'terminal';
                }
                else if (this.fillNuke(room, creep) == OK) {
                    creep.memory.doing = 'fillNuke';
                }
                else {
                    creep.creepSpeech(undefined, 'bored');
                    if (room.storage.store.energy < 50000 && room.terminal && room.terminal.store.energy > 100) {creep.withdraw(room.terminal, RESOURCE_ENERGY);}
                }
            }
        }
    },
    
    linkToStorage: function (room, creep) {
        if (creep.memory.working == true) {
            //if carry is full
            var storage = room.storage;
            creep.transfer(storage, RESOURCE_ENERGY);
        }
        else {
            //if carry is empty
            var linkWithEnergy = creep.pos.findInRange(global[room.name].links, 1, {filter: (s) => s.energy > 0})[0];
            if (linkWithEnergy) {
                creep.memory.working = true;
                creep.withdraw(linkWithEnergy, RESOURCE_ENERGY);
                return OK;
            }
            else return 'no structure'
        }
    },

    terminalToStorage: function (room, creep) {
        if (creep.memory.working == true) {//if carry is full, put in Storage

            var terminal = creep.pos.isNearTo(room.terminal) ? room.terminal : undefined;
            if (terminal) {
                if (_.sum(room.storage.store) < room.storage.storeCapacity) {
                    for (let resourceType in creep.carry) {
                        creep.transfer(room.storage, resourceType);
                    }
                }
                else {
                    for (let resourceType in creep.carry) {
                        creep.transfer(terminal, resourceType);
                    }
                    return 'terminal full'
                }
            }
            else {
                for (let resourceType in creep.carry) {
                    creep.transfer(room.storage, resourceType);
                }
                return 'no structure';
            }

        }
        else {//if carry is empty, take out of Terminal

            var terminal = creep.pos.isNearTo(room.terminal) ? room.terminal : undefined;
            if (!terminal) return 'error no terminal';

            var theResourceType;
            for (let resourceType in terminal.store) {
                if (terminal.store[resourceType] < 100) continue;

                if (global.storageData[resourceType]) {
                    if (!room.storage.store[resourceType] || (room.storage.store[resourceType] < global.storageData[resourceType] - creep.carryCapacity)) {
                        theResourceType = resourceType;
                        break;
                    }
                }
                else {
                    if (!global.storageData2[resourceType]) continue;
                    if (!room.storage.store[resourceType] || (room.storage.store[resourceType] < global.storageData2[resourceType] - creep.carryCapacity)) {
                        theResourceType = resourceType;
                        break;
                    }
                }
            }

            if (theResourceType) {
                var result = creep.withdraw(terminal, theResourceType);
                creep.memory.working = true;
                //console.log(result);
                if (result == OK) return OK;
                else return 'failed';
            }
            else {
                return 'nothing to do'
            }
        }
    },

    putExcessInTerminal: function (room, creep) {
        if (creep.memory.working == true) {//if carry is full
            var terminal = creep.pos.isNearTo(room.terminal) ? room.terminal : undefined;
            if (terminal) {
                if (_.sum(terminal.store) < terminal.storeCapacity) {
                    for (let resourceType in creep.carry) {
                        creep.transfer(terminal, resourceType);
                    }
                }
                else {
                    for (let resourceType in creep.carry) {
                        creep.transfer(room.storage, resourceType);
                    }
                    return 'terminal full'
                }
            }
            else {
                for (let resourceType in creep.carry) {
                    creep.transfer(room.storage, resourceType);
                }
                return 'no structure';
            }
        }
        else {//if carry is empty
         var terminal = creep.pos.isNearTo(room.terminal) ? room.terminal : undefined;
         if (!terminal) return 'error no terminal';
            var theResourceType;
            for (let resourceType in room.storage.store) {
                if (resourceType == RESOURCE_ENERGY && terminal.store[resourceType] > 100000) continue;

                if (global.storageData[resourceType]) {
                    if (room.storage.store[resourceType] > global.storageData[resourceType] + creep.carryCapacity) {
                        theResourceType = resourceType;
                        break;
                    }
                }
                else {
                    if (!global.storageData2[resourceType]) continue;
                    if (room.storage.store[resourceType] > global.storageData2[resourceType] + creep.carryCapacity) {
                        theResourceType = resourceType;
                        break;
                    }
                }
            }
            if (theResourceType) {
                var result = creep.withdraw(room.storage, theResourceType);
                creep.memory.working = true;
                //console.log(result);
                if (result == OK) return OK;
                else return 'failed';
            }
            else {
                return 'nothing to do'
            }
        }
    },

    boostLab: function (room, creep) {
        var lab = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: (s) => s.structureType == STRUCTURE_LAB})[0];
        if (!lab) return 'error no labs';

        if (creep.memory.working == true) {
            for (let resourceType in creep.carry) {
                creep.transfer(lab, resourceType);
                creep.memory.working = true;
            }
        }
        else {
            if (lab.energy < lab.energyCapacity * 0.5) {
                if (room.storage.store.energy < 30000) return 'not enough energy';
                var result = creep.withdraw(room.storage, RESOURCE_ENERGY);
                creep.memory.working = true;
                //console.log(result);
                if (result == OK) return OK;
                else return 'failed';
            }
            else {
                var boostNeeded = Memory.rooms[room].br;
                if (lab.mineralAmount >= lab.mineralCapacity || (lab.mineralAmount <= 0 && boostNeeded != lab.mineralType)) return 'lab full';
                if (!boostNeeded) return 'nothing to do';

                var result = creep.withdraw(room.storage, boostNeeded);
                creep.memory.working = true;
                //console.log(result);
                if (result == OK) return OK;
                else return 'failed';
            }
        }
    },
    
    fillNuke: function (room, creep) {
        var nuke = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: (s) => s.structureType == STRUCTURE_NUKER})[0];
        if (!nuke) return 'error no nuke';

        if (creep.memory.working == true) {
            for (let resourceType in creep.carry) {
                var result = creep.transfer(nuke, resourceType);
                creep.memory.working = true;
                if (result != OK) creep.transfer(room.storage, resourceType);
            }
        }
        else {// carry empty
            var needsGhodium = nuke.ghodium < nuke.ghodiumCapacity;
            var needsEnergy = nuke.energy < nuke.energyCapacity;

            if (needsGhodium) {
                if (!room.storage.store[RESOURCE_GHODIUM]) return 'error no ghodium';

                var result = creep.withdraw(room.storage, RESOURCE_GHODIUM, nuke.ghodiumCapacity-nuke.ghodium);
                creep.memory.working = true;
                //console.log(result);
                if (result == OK) return OK;
                else return 'failed';
            }
            else if (needsEnergy) {
                if (!room.storage.store[RESOURCE_ENERGY] || room.storage.store[RESOURCE_ENERGY] < 10000) return 'error not enough energy';

                var result = creep.withdraw(room.storage, RESOURCE_ENERGY, nuke.energy-nuke.energyCapacity);
                creep.memory.working = true;
                //console.log(result);
                if (result == OK) return OK;
                else return 'failed';
            }
        }
    }
};
