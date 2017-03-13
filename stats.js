"use strict";


module.exports =  {
    mainStats: function(creepCPU) {
        if (Memory.stats == null) {
            Memory.stats = { tick: Game.time };
        }

        // Note: This is fragile and will change if the Game.cpu API changes
        Memory.stats.cpu = Game.cpu;
        // Memory.stats.cpu.used = Game.cpu.getUsed(); // AT END OF MAIN LOOP

        // Note: This is fragile and will change if the Game.gcl API changes
        Memory.stats.gcl = Game.gcl;

        const memory_used = RawMemory.get().length;
        // console.log('Memory used: ' + memory_used);
        Memory.stats.memory = {
            used: memory_used,
            // Other memory stats here?
        };

        Memory.stats.market = {
            credits: Game.market.credits,
            num_orders: Game.market.orders ? Object.keys(Game.market.orders).length : 0,
        };

        Memory.stats.cpu.creep_handler = creepCPU;

        Memory.stats.cpu.getUsed = Game.cpu.getUsed();
    },

    summarize_room_internal: function(room) {
        if (room instanceof String) {
            room = Game.rooms[room];
        }
        if (room == null) {
            return null;
        }
        if (room.controller == null || !room.controller.my) {
            // Can null even happen?
            return null;
        }

        const controller_level = room.controller.level;
        const controller_progress = room.controller.progress;
        const controller_needed = room.controller.progressTotal;
        const controller_downgrade = room.controller.ticksToDowngrade;
        const controller_blocked = room.controller.upgradeBlocked;
        // const controller_safemode = room.controller.safeMode ? room.controller.safeMode : 0;
        // const controller_safemode_avail = room.controller.safeModeAvailable;
        // const controller_safemode_cooldown = room.controller.safeModeCooldown;
        const storage_energy = room.storage ? room.storage.store[RESOURCE_ENERGY] : 0;
        const storage_minerals = room.storage ? _.sum(room.storage.store) - storage_energy : 0;
        const energy_avail = room.energyAvailable;
        const energy_cap = room.energyCapacityAvailable;
        const container_energy = _.sum(global[room.name].containers, c => c.store.energy);
        const source_energy = _.sum(global[room.name].sources, s => s.energy);
        const link_energy = _.sum(global[room.name].links, l => l.energy);
        // const mineral = global[room.name].mineral;
        // const mineral_type = mineral ? mineral.mineralType : "";
        // const mineral_amount = mineral ? mineral.mineralAmount : 0;
        // const extractors = room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_EXTRACTOR});
        // const num_extractors = extractors.length;
        const creeps = _.filter(Game.creeps, c => c.memory.room == room.name);
        const num_creeps = creeps ? creeps.length : 0;
        const enemy_creeps = global[room.name].creepsNotMine;
        const creep_energy = _.sum(Game.creeps, c => c.pos.roomName == room.name ? c.carry.energy : 0);
        const num_enemies = enemy_creeps ? enemy_creeps.length : 0;
        const spawns = global[room.name].spawns;
        const num_spawns = spawns ? spawns.length : 0;
        const spawns_spawning = _.sum(spawns, s => s.spawning ? 1 : 0);
        const towers = global[room.name].towers;
        const num_towers = towers ? towers.length : 0;
        const tower_energy = _.sum(towers, t => t.energy);
        const const_sites = room.find(FIND_CONSTRUCTION_SITES);
        const num_construction_sites = const_sites.length;
        const terminal_energy = room.terminal ? room.terminal.store[RESOURCE_ENERGY] : 0;
        const terminal_minerals = room.terminal ? _.sum(room.terminal.store) - terminal_energy : 0;
        const spawn_queue_normal = Memory.rooms[room].spawnQueue.normal;
        const spawn_queue_priority = Memory.rooms[room].spawnQueue.priority;
        const spawn_queue_war = Memory.rooms[room].spawnQueue.war;

        // Number of each kind of creeps
        // const creep_types = new Set(creeps.map(c => c.memory.role));
        const creep_counts = _.countBy(creeps, c => c.memory.role);

        // Other things we can count:
        // Tower count, energy
        // Minimum health of ramparts, walls
        // Minimum health of roads
        // Number of roads?
        // Resources (energy/minerals) on the ground?

        // Other things we can't count but we _can_ track manually:
        // Energy spent on repairs
        // Energy spent on making creeps
        // Energy lost to links
        //
        // Energy in a source when it resets (wasted/lost energy)

        let retval = {
            room_name: room.name, // In case this gets taken out of context
            controller_level,
            controller_progress,
            controller_needed,
            controller_downgrade,
            controller_blocked,
            energy_avail,
            energy_cap,
            source_energy,
            // mineral_type,
            // mineral_amount,
            // num_extractors,
            storage_energy,
            storage_minerals,
            terminal_energy,
            terminal_minerals,
            container_energy,
            link_energy,
            num_creeps,
            creep_counts,
            creep_energy,
            num_enemies,
            num_spawns,
            spawns_spawning,
            num_towers,
            tower_energy,
            num_construction_sites,
            spawn_queue_normal,
            spawn_queue_priority,
            spawn_queue_war
        };

        if (!Memory.stats.rooms) Memory.stats.rooms = {};

        // console.log('Room ' + room.name + ': ' + JSON.stringify(retval));
        Memory.stats.rooms[room.name] = retval;
    }

};