require('global');
require('prototype.creep')();
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep) {

        creep.creepSpeech(room);

        var flagToGoTo = room.find(FIND_FLAGS, {filter: (f) => f.memory.type == 'storageDistributorGoTo' && f.pos.roomName == creep.room.name})[0];
        if (!flagToGoTo) {
            console.log('Error no storage distribution flag in room ' + room.name);
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
                    default:
                        console.log('ERROR in storageDistributor logic, creep.memory.doing is undefined');
                }
            }
            else {
                if (this.linkToStorage(room, creep) == OK) {
                    creep.memory.doing = 'link';
                }
                else if (this.putExcessInTerminal(room, creep) == OK) {
                    creep.memory.doing = 'terminal';
                }
                else creep.creepSpeech(undefined, 'bored');
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

    putExcessInTerminal: function (room, creep) {
        if (creep.memory.working == true) {//if carry is full
            var terminal = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: (s) => s.structureType == STRUCTURE_TERMINAL});
            if (terminal) {
                if (_.sum(terminal.store) >= terminal.storeCapacity) {
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
            else return 'no structure';
        }
        else {//if carry is empty
            var theResourceType;
            for (let resourceType in room.storage.store) {
                if (!global.storageData[resourceType]) continue;
                if (room.storage.store[resourceType] > global.storageData[resourceType]) {
                    theResourceType = resourceType;
                    break;
                }
            }
            if (theResourceType) {
                creep.withdraw(room.storage, theResourceType);
                creep.memory.working = true;
                return OK;
            }
            else {
                return 'nothing to do'
            }
        }
    }
};