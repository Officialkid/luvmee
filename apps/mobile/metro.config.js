const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Limit worker threads to prevent "Data cannot be cloned, out of memory" on Windows
config.maxWorkers = 2;

module.exports = config;
