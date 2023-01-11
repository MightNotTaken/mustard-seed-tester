class HSVColor {
  h;
  s;
  v;
  constructor(h = 0, s = 0, v = 0) {
    this.setHSV([h, s, v]);
  }

  hsv() {
    return [this.h, this.s, this.v];
  }

  setHSV([h, s, v]) {
    this.h = h;
    this.s = s;
    this.v = v;
  }

  loadRGB(r, g, b) {
    [this.h, this.s, this.v] = rgb2hsv([r, g, b]);
  }
}

class ColorBound {
  upper;
  lower;
  constructor(lower, upper) {
    const [h1, s1, v1] = upper;
    const [h2, s2, v2] = lower;
    this.upper = new HSVColor(h1, s1, v1);
    this.lower = new HSVColor(h2, s2, v2);
  }
  contains(c) {
    return c.h < this.upper.h && c.h >= this.lower.h && c.s > this.upper.s && c.v > this.upper.v;
  }
  containsRGB([r, g, b]) {
    const colorHSV = new HSVColor();
    colorHSV.loadRGB(r, g, b);
    return this.contains(colorHSV);
  }

  setLower([h, s, v]) {
    console.log('lower', [h, s, v])
    this.lower.setHSV([h, s, v]);
  }

  setUpper([h, s, v]) {
    console.log('upper', [h, s, v])
    this.upper.setHSV([h, s, v]);
  }

  getLower() {
    return this.lower.hsv();
  }
  getUpper() {
    return this.upper.hsv();
  }
}
