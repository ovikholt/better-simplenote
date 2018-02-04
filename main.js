// See README.md for build instructions

const SetupMoveLines = require('./move-lines');
SetupMoveLines();

const SetupAdvanced = require('./advanced-simplenote');
SetupAdvanced();

const calculateTimecards = require('./coffee-to-js-output/calculate-timecards');

const setupKeyboardShortcuts = require('./setup-keyboard-shortcuts');
setupKeyboardShortcuts(calculateTimecards);
