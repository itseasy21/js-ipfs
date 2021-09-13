'use strict'

const os = require('os')
const { createRepo } = require('ipfs-repo')
const path = require('path')
const { FsDatastore } = require('datastore-fs')
const { LevelDatastore } = require('datastore-level')
const { BlockstoreDatastoreAdapter } = require('blockstore-datastore-adapter')
const { ShardingDatastore } = require('datastore-core/sharding')
const { NextToLast } = require('datastore-core/shard')
const { FSLock } = require('ipfs-repo/locks/fs')

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
module.exports = (print, codecs, options = {}) => {
  const repoPath = options.path || path.join(os.homedir(), '.jsipfs')
  /**
   * @type {number}
   */
  let lastMigration

  /**
   * @type {MigrationProgressCallback}
   */
  const onMigrationProgress = options.onMigrationProgress || function (version, percentComplete, message) {
    if (version !== lastMigration) {
      lastMigration = version

      print(`Migrating repo from v${version - 1} to v${version}`)
    }

    print(`${percentComplete.toString().padStart(6, ' ')}% ${message}`)
  }

  return createRepo(repoPath, (codeOrName) => codecs.getCodec(codeOrName), {
    root: new FsDatastore(repoPath, {
      extension: ''
    }),
    blocks: new BlockstoreDatastoreAdapter(
      new ShardingDatastore(
        new FsDatastore(`${repoPath}/blocks`, {
          extension: '.data'
        }),
        new NextToLast(2)
      )
    ),
    datastore: new LevelDatastore(`${repoPath}/datastore`),
    keys: new FsDatastore(`${repoPath}/keys`),
    pins: new LevelDatastore(`${repoPath}/pins`)
  }, {
    autoMigrate: options.autoMigrate != null ? options.autoMigrate : true,
    onMigrationProgress: onMigrationProgress,
    repoLock: FSLock
  })
}
