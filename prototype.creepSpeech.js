require('global');

global.CHRISTMAS = 'Merry Christmas'.split(' ');
global.NEW_YEAR = 'Happy New Year'.split(' ');
global.MY_BIRTHDAY = "It's My BirthDay".split(' ');

module.exports = function () {
    Creep.prototype.creepSpeech = function (room, doingWhat) {

        if (Game.cpu.bucket > 3000) {

            var timeOfYear = function () {
                var fullDate = new Date;
                var month = fullDate.getUTCMonth();
                var date = fullDate.getUTCDate();

                switch (month) {
                    case 0:
                        if (date < 5) {
                            return NEW_YEAR;
                        }
                        break;
                    case 1:
                        break;
                    case 2:
                        break;
                    case 3:
                        break;
                    case 4:
                        break;
                    case 5:
                        break;
                    case 6:
                        break;
                    case 7:
                        break;
                    case 8:
                        break;
                    case 9:
                        break;
                    case 10:
                        if (date == 2) {
                            return MY_BIRTHDAY;
                        }
                        break;
                    case 11:
                        if (date <= 26) {
                            return CHRISTMAS;
                        }
                        else {
                            return NEW_YEAR;
                        }
                        break;
                }
            };

            var toSay;
            var partToSay;
            var isFestive = timeOfYear();

            switch (doingWhat) {
                case 'movingToSource':
                    toSay = "Moving To That Source Oh Yeah I'm Moving To That Source ...".split(' ');
                    break;
                case 'movingToSpawn':
                    toSay = "Oh I Must Go Back To My Birth Place Go Back To My Birth Place Ooooh Why Must I Go Back To My Birth Place ...".split(' ');
                    break;
                case 'harvesting':
                    toSay = "I'm A Miner It's What I Do Mine Mine Mine Don't Let That Energy Waste In The Source Gotta Mine It ...".split(' ');
                    break;
                case 'droppingEnergy':
                    toSay = "Dropping DropDaBeat Ground".split(' ');
                    break;
                case 'droppingEnergyContainer':
                    toSay = "Container NotDGround1".split(' ');
                    break;
                case 'droppingEnergyLink':
                    toSay = "Link NtDGround2".split(' ');
                    break;
                case 'movingToEnergy':
                    toSay = "I Need To Get Some Energy To Do Some Things Around You See ...".split(' ');
                    break;
                case 'upgrading':
                    toSay = "The GCl Needs Pumped The RCl Needs Pumped LUN Needs Praise Cause It Is Great ...".split(' ');
                    break;
                default:
                    if (isFestive) {
                    toSay = isFestive;
                    }
                    else {
                        toSay = "Praise LUN The Luranian United Nations Find It On SLACK and the LOAN Alliance Website ...".split(' ');
                    }
                    break;
            }

            if (toSay != undefined) {
                partToSay = toSay[Game.time % toSay.length];
                this.say(partToSay, true);
            }

        }

    }
};