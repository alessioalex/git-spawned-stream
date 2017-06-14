'use strict';

var gitSpawnedStream = require('./');
var path = require('path');
var gitDir = process.env.REPO ? path.resolve(process.env.REPO) : path.join(__dirname, '.git');
var limit = 5 * 1024 * 1024; // 5 Mb

// sort of a git log -n 2
var stream = gitSpawnedStream([
  'rev-list',
  '--max-count=2',
  '--header',
  'HEAD'
], {
  gitDir: gitDir,
  limit: limit
});

stream.on('data', function (data) {
  console.log('DATA', data.toString('utf8'));
}).on('error', function (err) {
  console.error('An error occurred:');
  console.error('-----------------\n');
  console.error(err.message);
  process.exit(1);
}).on('end', function () {
  console.log("\n±±±±±±±±±±±±±±±±±\nThat's all folks!");
});
