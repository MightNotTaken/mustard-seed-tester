class ColorSet {
    color;
    count = 0;
    constructor([r, g, b]) {
        this.color = new Color(r, g, b);
    }
    reset = () => {
        this.count = 0;
    }
}
