const SENTINEL_VALUE = -1;
const ALL = 1;
const GLOBAL_PIXEL_OF_INTEREST = ALL;

const WHITE_PIXEL = [255, 255, 255];

const BLACK_PIXEL = [0, 0, 0];

// const GREEN_PIXEL = [76, 150, 63];
// const YELLOW_PIXEL = [166, 157, 122];
// const BROWN_PIXEL = [70, 40, 60];
// const BROWN_PIXEL2 = [70, 120, 60];
const GREEN_PIXEL = [76, 150, 63];
const YELLOW_PIXEL = [166, 157, 122];
const BROWN_PIXEL = [70, 40, 60];
const BROWN_PIXEL2 = [70, 120, 60];


const yellowLAB = rgb2lab(YELLOW_PIXEL);
const greenLAB = rgb2lab(GREEN_PIXEL);
const brownLAB = rgb2lab(BROWN_PIXEL);
const whiteLAB = rgb2lab(WHITE_PIXEL);

const PIXEL_ARRAY = [YELLOW_PIXEL, GREEN_PIXEL, BROWN_PIXEL, YELLOW_PIXEL];

class ImageService {
  greenBound = new ColorBound([80, 20, 20], [160, 20, 20]);
  yellowBound = new ColorBound([20, 29, 20], [80, 30, 7]);
  brownBound = new ColorBound([0, 15, 20], [20, 29, 20]);

  yellowShades = [new ColorSet([255, 200, 49])];
  greenShades = [new ColorSet([146, 159, 106])];
  brownShades = [new ColorSet(BROWN_PIXEL)];
  
  canvas = null;
  pixelOfInterest = ALL;
  context = null;
  imageData = null;


  luxLevel = 0;
  
  bCount = 0;
  yCount = 0;
  gCount = 0;
  totalCount = 0;
  greenPixels = [];
  lastPixel = BROWN_PIXEL[0];
  

  colorProportions = null;
  outputContext = null;
  constructor() {
    this.pixelOfInterest = GLOBAL_PIXEL_OF_INTEREST;
  }
  
  getDistance(x, y, x_, y_) {
    return Math.sqrt(Math.pow(x - x_, 2) + Math.pow(y - y_, 2));
  }
  
  crop(
    imageData,
    radius,
    width,
    height,
    cx = SENTINEL_VALUE,
    cy = SENTINEL_VALUE
  ) {
    if (cx == SENTINEL_VALUE) {
      cx = width / 2;
    }
    if (cy == SENTINEL_VALUE) {
      cy = height / 2;
    }
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (this.getDistance(j, i, cx, cy) > radius) {
          const index = (width * i + j) * 4 + 3;
          imageData.data[index] = 0;
        }
      }
    }
    return imageData;
  }

  choosePixelOfInterest(color) {
    switch (color) {
      case 0:
        this.pixelOfInterest = GREEN_PIXEL;
        break;
      case 1:
        this.pixelOfInterest = BROWN_PIXEL;
        break;
      case 2:
        this.pixelOfInterest = YELLOW_PIXEL;
        break;
      case 3:
        this.pixelOfInterest = ALL;
        break;
    }
  }

  loadFromImage(canvasID, img, cameraContainerDimensions) {
    this.canvas = document.querySelector(canvasID);
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.context = this.canvas.getContext('2d', {willReadFrequently: true});
    this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    this.context.putImageData(
      this.crop(
        this.context.getImageData(0, 0, this.canvas.width, this.canvas.height),
        Math.min(cameraContainerDimensions / 2, this.canvas.height / 2),
        this.canvas.width,
        this.canvas.height
      ),
      0,
      0
    );
    this.imageData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  load(canvasID, video, cameraContainerDimensions) {
    this.canvas = document.querySelector(canvasID);
    this.canvas.width = video.videoWidth;
    this.canvas.height = video.videoHeight;
    this.context = this.canvas.getContext('2d');
    this.context.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
    this.context.putImageData(
      this.crop(
        this.context.getImageData(0, 0, this.canvas.width, this.canvas.height),
        Math.min(cameraContainerDimensions / 2, this.canvas.height / 2),
        this.canvas.width,
        this.canvas.height
      ),
      0,
      0
    );
    this.imageData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  process(outputCanvasID) {
    this.outputCanvas = document.querySelector(outputCanvasID);
    this.outputContext = this.outputCanvas.getContext('2d');

    this.greenPixels = [GREEN_PIXEL];
    this.initialSegregation();
    this.colorProportions = [
      Math.round((this.yCount * 10000) / this.totalCount) / 100,
      Math.round((this.gCount * 10000) / this.totalCount) / 100,
      Math.round((this.bCount * 10000) / this.totalCount) / 100,
    ];
    return [
      {
        color: this.yellowShades[0].color.toHex(),
        ratio: this.colorProportions[0]
      },
      ...this.segregateGreenColors().map(x => {
        return {
          color: (new Color(x[0], x[1], x[2])).toHex(),
          ratio: Math.round(100 * x[3] * this.colorProportions[1]) / 100
        };
      }),
      {
        color: this.brownShades[0].color.toHex(),
        ratio: this.colorProportions[2]
      },
    ];  
  }
  

  initialSegregation(forced = false) {
    this.bCount = 0;
    this.yCount = 0;
    this.gCount = 0;
    this.totalCount = 0;
    

    for (let i = 0; i < this.imageData.data.length; i += 4) {
      let [r, g, b, a] = [...this.imageData.data.slice(i, i + 4)];
      if (!a) {
        continue;
      }
      let response = this.getRoundedColorX2([r, g, b]);
      
      if (response[0] == GREEN_PIXEL[0]) {
        this.gCount += 1;
        this.greenPixels.push([r, g, b, a]);
        this.totalCount++;
      } else if (response[0] === YELLOW_PIXEL[0]) {
        this.yCount ++;
        this.totalCount ++;
      } else if (response[0] === BROWN_PIXEL[0]) {
        this.bCount ++;
        this.totalCount ++;
      }
      
      for (let j = 0; j < 3; j++) {
        this.imageData.data[i + j] = response[j];
      }
    }
    
    this.context.putImageData(this.imageData, 0, 0);
  }

  
  segregateGreenColors() {
    const darkGreenSet = new ColorSet([68, 86, 38]);
    const mediumGreenSet = new ColorSet([110, 139, 61]);
    const lightGreenSet = new ColorSet([150, 184, 93]);

    const colorSets = [darkGreenSet, mediumGreenSet, lightGreenSet];
    
    for (let pixel of this.greenPixels) {
      let deltas = colorSets.map(cSet => cSet.color.compare(pixel));
      let min = 0;
      for (let i=1; i<3; i++) {
        if (deltas[i] < deltas[min]) {
          min = i;
        }
      }
      colorSets[min].count ++;
    }
    return ([...colorSets.map(x => [...x.color.rgb(), x.count])]).map(x => {
      x[3] /= this.greenPixels.length;
      return x;  
    });
  }

  checkGreen([h, s, v]) {
    if (this.greenBound.contains({h, s, v})) {
      return GREEN_PIXEL;
    }
  }

  checkYellow([h, s, v]) {
    if (this.yellowBound.contains({h, s, v})) {
      return YELLOW_PIXEL;
    }
  }

  checkBrown([h, s, v]) {
    if (this.brownBound.contains({h, s, v})) {
      return BROWN_PIXEL;
    }
  }


  getRoundedColorX2([r, g, b]) {

    const testLAB = rgb2lab([r, g, b]);

    const delta = [
      deltaE(yellowLAB, testLAB) * 0.88,
      deltaE(greenLAB, testLAB),
      deltaE(brownLAB, testLAB),
      deltaE(whiteLAB, testLAB)
    ];

    let least = 0;
    for (let i=0; i<4; i++) {
      if (delta[i] < delta[least]) {
        least = i;
      }
    }
    
    return PIXEL_ARRAY[least];
  }
  
  getRoundedColorX2_([r, g, b]) {
    const color = new HSVColor();
    color.loadRGB(r, g, b);
    const [h, s, v] = color.hsv();
    let pixelColor = this.checkGreen([h, s, v]);
    if (!pixelColor) {
      pixelColor = this.checkYellow([h, s, v]);
      if (!pixelColor) {
        pixelColor = this.checkBrown([h, s, v]);
        if (!pixelColor) {
          // pixelColor = BROWN_PIXEL;
          pixelColor = BLACK_PIXEL;
        }
      }
    }
    if (this.pixelOfInterest === ALL) {
      return pixelColor;
    }
    return pixelColor === this.pixelOfInterest ? [r, g, b] : BLACK_PIXEL;
  }

  clearAll() {
    if (this.context) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.outputContext) {
        this.outputContext.clearRect(
          0,
          0,
          this.outputCanvas.width,
          this.outputCanvas.height
        );
    }
  }
}

