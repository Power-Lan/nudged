/*

*/
exports.Transform = require('./lib/Transform');
exports.estimateTranslation = require('./lib/estimateT');
exports.estimateScaling = require('./lib/estimateS');
exports.estimateRotation = require('./lib/estimateR');
exports.estimateTranslationScaling = require('./lib/estimateTS');
exports.estimateScalingRotation = require('./lib/estimateSR');
exports.estimateTranslationScalingRotation = require('./lib/estimateTSR');
exports.estimate = exports.estimateTranslationScalingRotation;
exports.version = require('./lib/version');
