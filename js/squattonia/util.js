// import { BloomFilter } from "../libraries/bloomfilter"

// Things handy for multiple files

window.UTIL = {
    base_url: "https://modest-snyder-fa951c.netlify.com/",

    decToRGBA: n => [n >> 24 & 0xFF, n >> 16 & 0xFF, n >> 8 & 0xFF, n & 0xFF],

    decToRGBA2: n => {
        let ret = n.toString(16)
        let prefix = ret.length % 2 === 1 ? "0" : ""
        ret = ret.slice(0, ret.length - 1) + prefix + ret.slice(-1)
        while (ret.length < 8) {
            ret += "0"
        }
        return [ret.slice(0, 2), ret.slice(2, 4), ret.slice(4, 6), ret.slice(-2)].map(h => 255 - parseInt("0x" + h))
    },

    alignBuf32: buf => buf.slice(0, buf.byteLength - (buf.byteLength % Uint32Array.BYTES_PER_ELEMENT)),

    asyncLoadImage: (url, renderer) => new Promise((resolve, reject) => {
        renderer.loadImage(url, img => img ? resolve(img) : reject("Failed to load " + url))
    }),

    // Turn the file at a URL into a data array
    urlToArr32: async (url, renderer, tone) => {
        console.log("Loading " + url)
        let resp = await fetch(new Request(url))
        let blob = await resp.blob()
        let temp
        switch (blob.type) {
            case "image/jpeg":
            case "image/png":
                if (renderer) {
                    temp = await UTIL.asyncLoadImage(url, renderer)
                    temp.loadPixels()
                    return new Uint32Array(temp.pixels)
                } else console.log("Tried to load an image from " + url + " but the renderer wasn't provided, falling back to default array method")
            case "audio/mpeg":
                if (tone) {
                    temp = await tone.Buffer.fromUrl(url)
                    return new Uint32Array(temp.toMono().toArray().buffer)
                } else console.log("Trying to load audio from " + url + " but the Tone.js instance wasn't provided, falling back to default array method")
            default:
                temp = await blob.arrayBuffer()
                return new Uint32Array(UTIL.alignBuf32(temp))
        }
    },

    // taken wholesale from https://gist.github.com/ppseprus/afab8500dec6394c401734cb6922d220
    getEntropy: str => [...new Set(str)]
        .map(chr => {
            return str.match(new RegExp(chr, 'g')).length;
        })
        .reduce((sum, frequency) => {
            let p = frequency / str.length
            return sum + p * Math.log2(1 / p)
        }, 0),

    // Create bloom filters and hyperloglog sets for each file.
    prepareFiles: async (urls, interval, hll_n, renderer, tone) => { 
        let ret = {}
        let prepsize = 0
        let entrysize = 0
        let all_entries = []
        let bloom_hashfns = 0
        for (url of urls) {
            let hll = new HyperLogLog(hll_n)
            let arr = await UTIL.urlToArr32(url, renderer, tone)
            if (arr.length % interval !== 0) {
                let temp = new Uint32Array(arr.length + interval - (arr.length % interval))
                temp.set(arr)
                arr = temp
            }
            let entries = arr.length / interval
            entrysize += entries
            // math from https://hur.st/bloomfilter/
            let bits = Math.ceil((entries * Math.log(0.00001)) / Math.log(1 / Math.pow(2, Math.log(2))))
            bloom_fncount = Math.round((bits / entries) * 0.7)
            let bloom = new BloomFilter(bits, bloom_fncount)
            console.log(Math.round((bits / entries) * 0.7))
            let arr_ent = []
            for (let i = 0; i < arr.length - interval; i += interval) {
                arr_ent.push(arr.slice(i, i + interval).toString())
                let str = arr.slice(i, i + interval).toString()
                hll.add(hll.hash(str))
                bloom.add(str)
            }
            prepsize += hll.output().buckets.length * 8 + bits
            console.log(`${(hll.output().buckets.length * 8 + bits)/4} bytes to store HLL/bloom data for ${url}`)
            ret[url] = [hll, bloom]
            all_entries.push(arr_ent)
        }
        console.log(`Total: ${prepsize/4} bytes (${prepsize/400000} MB) used for ${entrysize} entries`)
        let outfile = {}
        outfile["bloom_fncount"] = bloom_fncount
        for (y in ret) {
            let bloom_arr = [].slice.call(ret[y][1].buckets)
            outfile[y] = [ret[y][0].output(), bloom_arr]
        }
        let jsonstr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(outfile))
        let dl = document.createElement('a');
            dl.setAttribute("href", jsonstr);
            dl.setAttribute("download", "squattonia_data.json");
            dl.click();
        return [all_entries, ret, bloom_hashfns]
    }
}