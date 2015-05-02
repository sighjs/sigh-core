/**
 * Bacon streams don't play well with streams created from different bacon instances,
 * this module returns a single global shared bacon instance.
 */
var cacheName = '$$$$$lovelyKittenFriendshipPowerSailorMoonBaconLove'
module.exports = global[cacheName] || (global[cacheName] = require('baconjs'))
