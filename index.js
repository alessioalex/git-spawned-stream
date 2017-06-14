'use strict';

/**
 * git-spawned-stream
 * @module git-spawned-stream
 */

var run = require('spawn-to-readstream');
var spawn = require('child_process').spawn;
var debug = require('debug')('git-spawned-stream');

/**
 * Create a readable stream from a spawned git process.
 * @param   {string[]}                       args                      the arguments that will be passed to the `child_process.spawn` function
 * @param   {Object}                         [options]                 options
 * @param   {Object}                         [options.config]          `-c` from `git`
 * @param   {string}                         [options.gitDir]          `--git-dir` from `git`
 * @param   {string}                         [options.workTree]        `--work-tree` from `git`
 * @param   {boolean}                        [options.pager=false]     `--no-pager` from `git`
 * @param   {string}                         [options.gitBinary='git'] path to the git binary to use
 * @param   {number}                         [options.limit]           kill the process if it exceeds the imposed limit (sends more data than allowed)
 * @param   {string|Buffer|Stream.Readable}  [options.input]           The value which will be passed as stdin to the spawned process
 * @param   {string}                         [options.cwd]             Current working directory of git process
 * @param   {Object}                         [options.env]             Environment key-value pairs
 * @returns {Stream.Readable}                                          readable stream from spawned git process.
 */
module.exports = function (args, options) {
  options = Object.assign({
    gitBinary: 'git'
  }, options);

  var _args = [];

  if (!options.pager) {
    _args.push('--no-pager');
  }

  if (options.gitDir) {
    _args.push('--git-dir=' + options.gitDir);
  }

  if (options.workTree) {
    _args.push('--work-tree=' + options.workTree);
  }

  if (options.config) {
    Object.keys(options.config).forEach(function (key) {
      _args.push('-c', key + '=' + String(options.config[key]));
    });
  }

  args.forEach(function (item) {
    _args.push(item);
  });

  debug('args', _args);
  debug('limit', options.limit);
  debug('gitBinary', options.gitBinary);

  var ps = spawn(options.gitBinary, _args, {
    cwd: options.cwd,
    env: options.env
  });

  if (options.input) {
    if (options.input.pipe) {
      options.input.pipe(ps.stdin);
    } else {
      ps.stdin.write(options.input);
      ps.stdin.end();
    }
  }
  return run(ps, options.limit);
};
