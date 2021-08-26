'use strict'

const { murmur3128 } = require('@multiformats/murmur3')

module.exports = {
  hamtHashCode: murmur3128.code,
  hamtBucketBits: 8,
  /**
   * @param {Uint8Array} buf
   */
  async hamtHashFn (buf) {
    return (await murmur3128.encode(buf))
      // Murmur3 outputs 128 bit but, accidentally, IPFS Go's
      // implementation only uses the first 64, so we must do the same
      // for parity..
      .slice(0, 8)
      // Invert buffer because that's how Go impl does it
      .reverse()
  }
}
