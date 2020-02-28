/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 * 
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 * 
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash 
 */

function murmurhash3_32_gc(key, seed) {
	var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;
	
	remainder = key.length & 3; // key.length % 4
	bytes = key.length - remainder;
	h1 = seed;
	c1 = 0xcc9e2d51;
	c2 = 0x1b873593;
	i = 0;
	
	while (i < bytes) {
	  	k1 = 
	  	  ((key.charCodeAt(i) & 0xff)) |
	  	  ((key.charCodeAt(++i) & 0xff) << 8) |
	  	  ((key.charCodeAt(++i) & 0xff) << 16) |
	  	  ((key.charCodeAt(++i) & 0xff) << 24);
		++i;
		
		k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

		h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
		h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
		h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
	}
	
	k1 = 0;
	
	switch (remainder) {
		case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
		case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
		case 1: k1 ^= (key.charCodeAt(i) & 0xff);
		
		k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
		h1 ^= k1;
	}
	
	h1 ^= key.length;

	h1 ^= h1 >>> 16;
	h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
	h1 ^= h1 >>> 13;
	h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
	h1 ^= h1 >>> 16;

	return h1 >>> 0;
}

if(typeof module !== "undefined") {
  module.exports = murmurhash3_32_gc
}

/*
The MIT License (MIT)
=====================

Copyright (c) 2013 Optimizely, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/ 

// lightly edited from a version by https://github.com/zbone3/hyperloglog to not rely on node

function hashMurmur32Bit (value, seed) {
  seed = seed || 0
  return murmurhash3_32_gc(value, seed)
}

function getSimulated128BitHash (value) {
  return [
    hashMurmur32Bit(value, 0x5C00A7ED),
    hashMurmur32Bit(value, 0x5C00A7ED + 2),
    hashMurmur32Bit(value, 0x5C00A7ED + 4),
    hashMurmur32Bit(value, 0x5C00A7ED + 8)]
}

function compute_alpha_times_bucket_count_squared (bucket_count) {
  return 0.7213 / (1 + 1.079 / bucket_count) * bucket_count * bucket_count
}

// Create a HyperLogLog counter of 2^n buckets.
// 2^0 to 2^32 - requires that many BYTES (really 6 bit words for 64 bit hashing)
// The limit of 2^32 comes from using the first 32 bit int of the hash
// for the bucket index. Theoretically we could scale that to allow more, but that means
// more than 4GB per HLL, which is unlikely.
function HyperLogLog (n) {
  var bucket_count = Math.pow(2, n)
  var alpha_times_bucket_count_squared = compute_alpha_times_bucket_count_squared(
    bucket_count)
  var buckets = new Uint8Array(bucket_count)
  buckets.fill(0)

  // Maintain some running counts so that returning cardinality is cheap.

  var sum_of_inverses = bucket_count
  var count_zero_buckets = bucket_count

  var self = {
    add: function add (unique_hash) {
      if (unique_hash === null) {
        return // nothing to add
      }

      var bucket = unique_hash[0] >>> (32 - n)
      var trailing_zeroes = 1

      count_zeroes:
        for (var i = 3; i >= 2; --i) {
          var data = unique_hash[i]
          for (var j = 32; j; --j) {
            if (data & 0x1) {
              break count_zeroes
            }

            ++trailing_zeroes
            data = data >>> 1
          }
        }

      // Maintain a running sum of inverses for quick cardinality checking.
      var old_value = buckets[bucket]
      var new_value = Math.max(trailing_zeroes, old_value)
      sum_of_inverses += Math.pow(2, -new_value) - Math.pow(2, -old_value)
      if (new_value !== 0 && old_value === 0) {
        --count_zero_buckets
      }

      buckets[bucket] = new_value

      return self
    },

    count: function count () {
      /*var sum_of_inverses = 0;
      var count_zero_buckets = 0;
      for (var i = 0; i < bucket_count; ++i) {
          var bucket = buckets[i];
          if (bucket === 0) ++count_zero_buckets;
          sum_of_inverses += 1 / Math.pow(2, bucket);
      }*/
      // No longer need to compute this all every time, since we keep running counts to keep this cheap.

      var estimate = alpha_times_bucket_count_squared / sum_of_inverses

      // Apply small cardinality correction
      if (count_zero_buckets > 0 && estimate < 5 / 2 * bucket_count) {
        estimate = bucket_count * Math.log(bucket_count / count_zero_buckets)
      }

      return Math.floor(estimate + 0.5)
    },

    relative_error: function relative_error () {
      // Estimate the relative error for this HLL.
      return 1.04 / Math.sqrt(bucket_count)
    },

    output: function output () {
      return {
        n: n,
        buckets: buckets,
      }
    },

    merge: function merge (data) {
      if (n > data.n) {
        // Fold this HLL down to the size of the incoming one.
        var new_bucket_count = Math.pow(2, data.n)
        var old_buckets_per_new_bucket = Math.pow(2, n - data.n)
        var new_buckets = new Buffer(new_bucket_count)

        for (var i = 0; i < new_bucket_count; ++i) {
          var new_bucket_value = data.buckets[i]
          for (var j = 0; j < old_buckets_per_new_bucket; ++j) {
            new_bucket_value = Math.max(new_bucket_value,
              buckets[i * old_buckets_per_new_bucket + j])
          }
          new_buckets[i] = new_bucket_value
        }

        buckets = new_buckets
        n = data.n

        bucket_count = Math.pow(2, n)
        alpha_times_bucket_count_squared = compute_alpha_times_bucket_count_squared(
          bucket_count)
      } else {
        var new_buckets_per_existing = Math.pow(2, data.n - n)
        for (var i = data.buckets.length - 1; i >= 0; --i) {
          var existing_bucket_index = (i / new_buckets_per_existing) | 0
          buckets[existing_bucket_index] = Math.max(
            buckets[existing_bucket_index], data.buckets[i])
        }
      }

      // Recompute running totals
      sum_of_inverses = 0
      count_zero_buckets = 0
      for (var i = 0; i < bucket_count; ++i) {
        var bucket = buckets[i]
        if (bucket === 0) {
          ++count_zero_buckets
        }
        sum_of_inverses += Math.pow(2, -bucket)
      }
    },

    hash: value => getSimulated128BitHash(value)
  }

  return self
}

module.exports = HyperLogLog