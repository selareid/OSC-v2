'use strict';

global.allianceName = 'INT_MAX';
global.Allies = ['Lur', 'starwar15432', 'Leonyx'];

global.REVERSE_DIR = {
    [TOP]            : BOTTOM,
    [TOP_RIGHT]        : BOTTOM_LEFT,
    [RIGHT]            : LEFT,
    [BOTTOM_RIGHT]    : TOP_LEFT,
    [BOTTOM]        : TOP,
    [BOTTOM_LEFT]    : TOP_RIGHT,
    [LEFT]            : RIGHT,
    [TOP_LEFT]        : BOTTOM_RIGHT
};

global.STRUCTUREDECAY = {
    [STRUCTURE_ROAD] : 500,
    [STRUCTURE_RAMPART] : 300,
    [STRUCTURE_CONTAINER] : 5000
};

global.buildFromFlags = function (room) {
    /*
     *      WHITE:
     *		RED         container
     *		PURPLE      extension
     *		BLUE        link
     *		CYAN		rampart
     *		GREEN		extractor
     *		YELLOW		spawn
     *		ORANGE		storage
     *		BROWN		tower
     *		GREY		wall
     *		WHITE		road
     *		GREY:
     *	    WHITE      lab
     *	    GREY       terminal
     */

    if (global.rooms == undefined || global.rooms[room.name] == undefined) {
        //console.log(room.name + ': Setting Global.rooms');
        _.set(global, ['rooms', room.name, 'controllerLevel'], undefined);
    }

    if (global.rooms[room.name].controllerLevel != room.controller.level) {
        _.set(global, ['rooms', room.name, 'constructionTargets'], _.transform(CONTROLLER_STRUCTURES, (r, v, k) => r[k] = v[room.controller.level]));
        _.set(global, ['rooms', room.name, 'controllerLevel'], room.controller.level);
        //console.log(room.name + ': global.rooms', JSON.stringify(global.rooms));
    }

    //console.log(room.name + ': Check room');
    let sites = room.find(FIND_CONSTRUCTION_SITES);
    let existing = {};
    if (sites.length == 0) {
        for (let flagName in Game.flags) {
            let flag = Game.flags[flagName];
            if ((flag.color == COLOR_WHITE || flag.color == COLOR_GREY) && flag.pos.roomName == room.name) {
                let object = undefined;
                switch (flag.secondaryColor) {
                    case COLOR_GREY:
                        switch (flag.color) {
                            case COLOR_WHITE:
                                object = STRUCTURE_WALL;
                                break;
                            case COLOR_GREY:
                                object = STRUCTURE_TERMINAL;
                                break;
                        }
                        break;
                    case COLOR_CYAN:
                        object = STRUCTURE_RAMPART;
                        break;
                    case COLOR_BROWN:
                        object = STRUCTURE_TOWER;
                        break;
                    case COLOR_RED:
                        object = STRUCTURE_CONTAINER;
                        break;
                    case COLOR_PURPLE:
                        object = STRUCTURE_EXTENSION;
                        break;
                    case COLOR_BLUE:
                        object = STRUCTURE_LINK;
                        break;
                    case COLOR_GREEN:
                        object = STRUCTURE_EXTRACTOR;
                        break;
                    case COLOR_YELLOW:
                        object = STRUCTURE_SPAWN;
                        break;
                    case COLOR_ORANGE:
                        object = STRUCTURE_STORAGE;
                        break;
                    case COLOR_WHITE:
                        switch (flag.color) {
                            case COLOR_WHITE:
                                object = STRUCTURE_ROAD;
                                break;
                            case COLOR_GREY:
                                object = STRUCTURE_LAB;
                                break;
                        }
                        break;
                    default:
                        console.log('Color error: ' + flag.secondaryColor);
                }
                if (object != undefined) {
                    let atPos = flag.pos.look();
                    atPos = atPos.filter(o => o.type == LOOK_STRUCTURES && o.structure.structureType == object);
                    if (existing[object] == undefined) {
                        existing[object] = room.find(FIND_STRUCTURES, {filter: o => o.structureType == object});
                    }
                    //console.log(room.name + `: check ${object} : ${atPos.length} vs ${global.rooms[room.name].constructionTargets[object]} vs ${existing[object].length}`);
                    if (atPos.length == 0 &&
                        global.rooms[room.name].constructionTargets[object] != undefined &&
                        global.rooms[room.name].constructionTargets[object] > existing[object].length) {
                        let res = flag.room.createConstructionSite(flag.pos, object);
                        if (res != 0) {
                            console.log(room.name + `: Failed to create construction site at ${flag.name}: ${res}`);
                        } else {
                            console.log(room.name + `: Created construction site at ${flag.name}: ${res}`);
                            break;
                        }
                    }
                }
            }
        }

    }
//        console.log(`Check construction in ${room.name}`);
    room.memory.constructionTargets = _.map(sites, 'id');
};