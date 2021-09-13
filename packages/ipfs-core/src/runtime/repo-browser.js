'use strict'

const { createRepo } = require('ipfs-repo')
const { LevelDatastore } = require('datastore-level')
const { BlockstoreDatastoreAdapter } = require('blockstore-datastore-adapter')
const { MemoryLock } = require('ipfs-repo/locks/memory')

/**
 * @typedef {import('ipfs-repo-migrations').ProgressCallback} MigrationProgressCallback
 */

/**
 * @param {import('../types').Print} print
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {object} options
 * @param {string} [options.path]
 * @param {boolean} [options.autoMigrate]
 * @param {MigrationProgressCallback} [options.onMigrationProgress]
 */
module.exports = (print, codecs, options) => {
  const repoPath = options.path || 'ipfs'

  return createRepo(repoPath, (codeOrName) => codecs.getCodec(codeOrName), {
    root: new LevelDatastore(repoPath, {
      prefix: '',
      version: 2
    }),
    blocks: new BlockstoreDatastoreAdapter(
      new LevelDatastore(`${repoPath}/blocks`, {
        prefix: '',
        version: 2
      })
    ),
    datastore: new LevelDatastore(`${repoPath}/datastore`, {
      prefix: '',
      version: 2
    }),
    keys: new LevelDatastore(`${repoPath}/keys`, {
      prefix: '',
      version: 2
    }),
    pins: new LevelDatastore(`${repoPath}/pins`, {
      prefix: '',
      version: 2
    })
  }, {
    autoMigrate: options.autoMigrate,
    onMigrationProgress: options.onMigrationProgress || print,
    repoLock: MemoryLock
  })
}
