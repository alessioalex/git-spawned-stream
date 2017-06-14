'use strict';
/* eslint-env node, mocha */
var proxyquire = require('proxyquire');
var path = require('path');
var fs = require('fs');
var execSync = require('child_process').execSync;
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
          spawnArgs.unshift('--no-pager');
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
      limit: limit,
      input: 'spawnInput'
    });
  });

  it('git rev-list', function (done) {
    var git = proxyquire.load('./', {});
    var result = '';
    git(['log', '--max-count=1'], {
      pager: true,
      workTree: __dirname,
      gitDir: path.join(__dirname, '.git')
    })
      .on('data', function (data) {
        result += data;
      }).on('end', function () {
        result.should.match(/^commit \w+$/im);
        done();
      }).on('error', done);
  });

  it('git blame', function (done) {
    var git = proxyquire.load('./', {});
    var result = '';
    git(['blame', '--contents', '-', '--', 'README.md'], {
      gitDir: path.join(__dirname, '.git'),
      config: {
        'core.quotepath': false
      },
      input: fs.createReadStream(path.join(__dirname, 'README.md'))
    })
      .on('data', function (data) {
        result += data;
      }).on('end', function () {
        result.should.eql(execSync('git blame -- README.md').toString());
        done();
      }).on('error', done);
  });
});
