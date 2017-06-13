'use strict';
/* eslint-env node, mocha */
var proxyquire = require('proxyquire');
require('should');

describe('git-spawned-stream', function () {
  it('should delegate with the correct params', function (done) {
    var spawnArgs = ['rev-list', '--max-count=2', 'HEAD'];
    var limit = 1024 * 1024;

    var gitSpawnedStream = proxyquire.load('./index', {
      'spawn-to-readstream': function (spawnStream, bytes) {
        spawnStream.value.should.eql('spawnStream');
        bytes.should.eql(limit);

        done();
      },
      'child_process': {
        spawn: function (cmd, args) {
          spawnArgs.unshift('--git-dir=/home/node.git');
          cmd.should.eql('git');
          args.should.eql(spawnArgs);

          return {
            value: 'spawnStream',
            stdin: {
              write: function (stdin) {
                stdin.should.eql('spawnInput');
              },
              end: function () {

              }
            }
          };
        }
      }
    });

    gitSpawnedStream(spawnArgs, {
      repoPath: '/home/node.git',
      limit: limit,
      input: 'spawnInput'
    });
  });
});
