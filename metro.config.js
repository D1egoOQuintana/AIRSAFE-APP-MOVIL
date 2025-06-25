// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configurar alias para resolver @/* como src/*
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
};

module.exports = config;
