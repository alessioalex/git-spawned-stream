# git-spawned-stream

Create a readable stream from a spawned git process.

## Usage

```js
gitSpawnedStream(spawnArguments, options)
```

Arguments:

- `spawnArguments` - the arguments that will be passed to the `child_process.spawn` function
- `options` - <optional> options
  - `gitDir`  - <optional> Default: `path.join(process.cwd(), '.git')` - the path to the repo, ex: /home/alex/node/.git (or the path to the git bare repo)
  - `limit`     - <optional> - kill the process if it exceeds the imposed limit (sends more data than allowed)
  - `gitBinary` - <optional> Default: `'git'` - path to the git binary to use
  - `input`     - <optional> - The value which will be passed as stdin to the spawned process

Example:

```js
var gitSpawnedStream = require('git-spawned-stream');
var path = require('path');
var gitDir = process.env.REPO || path.join(__dirname, '.git');
gitDir = path.resolve(gitDir);
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

stream.on('data', function(data) {
  console.log('DATA', data.toString('utf8'));
}).on('error', function(err) {
  console.error('An error occurred:');
  console.error('-----------------\n');
  console.error(err.message);
  process.exit(1);
}).on('end', function(killed) {
  // when the stream is cut, killed === true
  console.log("\n±±±±±±±±±±±±±±±±±\nThat's all folks!");
});
```

## License

MIT
