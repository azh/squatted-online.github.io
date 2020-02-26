// Things handy for multiple files

window.BASE_URL = "http://localhost:3000/"

window.UTIL = {
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

    urlToArr: async (url, renderer, tone) => {
        let resp = await fetch(new Request(url))
        let blob = await resp.blob()
        let temp
        switch (blob.type) {
            case "image/jpeg":
            case "image/png":
                if (renderer) {
                    temp = await UTIL.asyncLoadImage(url, renderer)
                    temp.loadPixels()
                    return temp.pixels
                } else console.log("Tried to load an image from " + url + " but the renderer wasn't provided, falling back to default array method")
            case "audio/mpeg":
                if (tone) {
                    temp = await tone.Buffer.fromUrl(url)
                    return temp.toMono().toArray()
                } else console.log("Trying to load audio from " + url + " but the Tone.js instance wasn't provided, falling back to default array method")
            default:
                temp = await blob.arrayBuffer()
                return new Uint32Array(UTIL.alignBuf32(temp))
        }
    },

    getEntropy: model => {

    },
}