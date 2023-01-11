class Color {
    r;
    g;
    b;
    lab;
    _hsv;
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.lab = rgb2lab([r, g, b]);
        this._hsv = rgb2hsv([r, g, b]);
    }
    
    toHex() {
        return `#${this.hex(this.r)}${this.hex(this.g)}${this.hex(this.b)}`
    }

    rgb() {
        return [this.r, this.g, this.b];
    }

    hsv() {
        return this._hsv;
    }

    hex(x, width = 2) {
        let m = '';
        for (let i=0; i<width; i++) {
            m += '0';
        }
       const string = m + x.toString(16).toUpperCase();
       return string.slice(string.length - width);
    }

    compareHSV([r, g, b]) {
        const hsv = rgb2hsv([r, g, b]);
        const [h, s, v] = this._hsv;
        const [h_, s_, v_] = hsv;
        return  Math.sqrt((this.r - r)*(this.r - r) + (this.g - g)*(this.g - g) + (this.b - b)*(this.b - b));
    }

    compareLAB([r, g, b]) {
        return deltaE(this.lab, rgb2lab([r, g, b]));
    }

    compare([r, g, b]) {
        return Math.sqrt((this.r - r)*(this.r - r) + (this.g - g)*(this.g - g) + (this.b - b)*(this.b - b));
    }

    toRGBA(a=255) {
        return [this.r, this.g, this.b, a];
    }

    match ([r, g, b]) {
        return this.r === r && this.g === g && this.b === b;
    }
    
}
