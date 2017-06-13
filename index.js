'use strict'

var path = require('path')
var run = require('spawn-to-readstream')
var spawn = require('child_process').spawn
var debug = require('debug')('git-spawned-stream')

/**
 * Create a readable stream from a spawned git process.
 * @param   {String[]}                       args                      the arguments that will be passed to the `child_process.spawn` function
 * @param   {Object}                         [options]                 options
 * @param   {String}                         [options.repoPath='.git'] the path to the repo, ex: `/home/alex/node/.git`
 * @param   {String}                         [options.gitBinary='git'] path to the git binary to use
 * @param   {String}                         [options.limit]           kill the process if it exceeds the imposed limit (sends more data than allowed)
 * @param   {String|Buffer|Stream.Readable}  [options.input]           The value which will be passed as stdin to the spawned process
 * @returns {Stream.Readable}                                          readable stream from spawned git process.
 */
module.exports = function (args, options) {
  options = Object.assign({
    repoPath: path.join(process.cwd(), '.git'),
    gitBinary: 'git'
  }, options)

  var _args = ['--git-dir=' + options.repoPath]

  args.forEach(function (item) {
    _args.push(item)
  })

  debug('args', _args)
  debug('limit', options.limit)
  debug('gitBinary', options.gitBinary)

  var ps = spawn(options.gitBinary, _args)

  if (options.input) {
    if (options.input.pipe) {
      options.input.pipe(ps.stdin)
    } else {
      ps.stdin.write(options.input)
      ps.stdin.end()
    }
  }
  return run(ps, options.limit)
}
