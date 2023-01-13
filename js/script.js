

class MainService {
  imageService = new ImageService();
  showImage = false;
  containerDimensions = 0;
  colorSections = null;
  firstTime = true;

  dateContainer;
  timeContainer;

  http = new HTTP();

  monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  setCameraContainerDimensions = function () {
    const container = document.getElementById("cam-cont");
    this.containerDimensions =
      Math.min(window.innerHeight, window.innerWidth) - 64;
    container.style.width = this.containerDimensions + "px";
    container.style.height = this.containerDimensions + "px";
  }

  capture = async function () {
    try {
      await this.processImage();
    } catch (error) {
      this.show('start-button');
    }
  }

  show = function(id) {
    document.getElementById(id).classList.remove('hide');
  }

  hide = function(id) {
    document.getElementById(id).classList.add('hide');
  }

  processImage = async function () {
    this.hide('start-button');
    this.show('spinner');
    // await this.completeProgressBar();
    this.increaseProgressBar(0);
    
    this.resetColors();
    this.increaseProgressBar(10);
    const testID = await this.http.get('http://localhost:3030/getNextID');
    this.setTestNumber(testID.index);
    this.increaseProgressBar(15);
    let sourceContainer = document.querySelector("#image");
    this.imageService.clearAll();
    this.increaseProgressBar(20);
    this.imageService.loadFromImage(
      "#canvas1",
      sourceContainer,
      this.containerDimensions
    );
    this.increaseProgressBar(45);
    this.colorSections = this.imageService.process("#canvas2", sourceContainer);
    for (let i=0; i<this.colorSections.length; i++) {
      document.getElementById('p' + i).innerText = this.colorSections[i].ratio + '%';
      document.getElementById('c' + i).style.background = this.colorSections[i].color;
    }
    this.increaseProgressBar(100);
    this.hide('spinner');
    this.show('result-buttons');
  }

  resetColors = function () {
    this.colorSections = [
      {color: '#FFC831', ratio: '0.00'},
      {color: '#445626', ratio: '0.00'},
      {color: '#6E8B3D', ratio: '0.00'},
      {color: '#96B85D', ratio: '0.00'},
      {color: '#6E4937', ratio: '0.00'}
    ];
    for (let i=0; i<this.colorSections.length; i++) {
      document.getElementById('p' + i).innerText = this.colorSections[i].ratio + '%';
      document.getElementById('c' + i).style.background = this.colorSections[i].color;
    }
    this.clearTestNumber();
  }

  atleastTwoDigit = (x) => {
    if (x < 10) {
      return `0${x}`;
    }
    return x;
  }

  setTestNumber = function(id) {
    const instant = new Date();
    document.getElementById('test-no').innerText = `SQT${this.atleastTwoDigit(instant.getDate())}${this.atleastTwoDigit(instant.getMonth()+1)}${instant.getFullYear()}-${id}`;
  }

  clearTestNumber = function() {
    document.getElementById('test-no').innerText = '---';
  }

  completeProgressBar = function() {
    return new Promise(async (res, rej) => {
      let value = 0;
      while (value < 100) {
        let increase = Math.round(5 * Math.random()) + 25;
        if (value + increase > 100) {
          value = 100;
        } else {
          value += increase;
        }
        await this.increaseProgressBar(value, 200 + Math.round(Math.random() * 200));
      }
      res(true);
    });
  }

  increaseProgressBar = function (value, delay) {
    return new Promise((res, rej) => {
      const progressBar = document.getElementById('status-bar-value');
      progressBar.style.width = `${value}%`;
      setTimeout(() => {
        res(true);
      }, delay);
    });
  }

  resetProgressBar = function () {
    document.getElementById('status-bar-value').style.width = '0%';
  }

  resetImage = function() {
    this.imageService.clearAll();
    this.resetColors();
    this.resetProgressBar();
    this.hide('result-buttons');
    this.show('start-button');
  }

  saveData = async function() {
    const response = await this.http.get('http://localhost:3030/addEntry', JSON.stringify(this.colorSections.map(x => x.ratio)))
    console.log(response);
    this.resetImage();
  }
  
  activate = function (x) {
    this.showImage = true;
    this.activated = x;

    const chips = document.getElementsByClassName('chip');
    for (let i=0; i<chips.length; i++) {
        if (i == this.activated) {
            chips[i].classList.add('active');
        } else {
            chips[i].classList.remove('active');
        }
    }

    this.imageService.choosePixelOfInterest(x);
    this.processImage();
  }

  updateTime = function () {
    const instant = new Date();
    let hour = instant.getHours();
    let amPm = 'AM';
    if (hour > 12) {
      hour -= 12;
      amPm = 'PM';
    }
    if (hour == 0) {
      hour = 12;
    }
    this.dateContainer.innerText = `${this.atleastTwoDigit(instant.getDate())} - ${this.monthName[instant.getMonth()]} - ${instant.getFullYear()}`;
    this.timeContainer.innerText = `${this.atleastTwoDigit(hour)} : ${this.atleastTwoDigit(instant.getMinutes())} : ${this.atleastTwoDigit(instant.getSeconds())} ${amPm}`;
  }

  initialize = function () {
    this.hide('result-buttons');
    this.setCameraContainerDimensions();
    this.hide('spinner');
    this.resetColors();
    this.resetProgressBar();
    this.show('global-splash-screen');
    setTimeout(() => {
      this.hide('global-splash-screen');
    }, 5000);
    this.dateContainer = document.getElementById('date');
    this.timeContainer = document.getElementById('time');
    setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  startExport = async function () {
    try {
      const { total } = await this.http.get('http://localhost:3030/getTotalFiles');
      document.getElementById('progress').innerText = 'Exporting : ';
      for (let i=0; i<total; i++) {
        document.getElementById('proportion').innerText = `( ${i + 1} / ${total} )`;
        this.increaseProgressBar(Math.round(100 * (i + 1) / total), 0);
        await this.http.get('http://localhost:3030/export/' + i);
      }
      setTimeout(() => {
        document.getElementById('progress').innerText = 'Progress : ';
        document.getElementById('proportion').innerText = ``;
      }, 2000);
    } catch (error) {
      console.error(error)
    }
  }

  systemShutdown = async function () {
    try {
      await this.http.get('http://localhost:3030/shutdown');
      console.log('shutdown')
    } catch (error) {
      console.error(error);
    }
  }
}

const _ = new MainService();


window.onload = (event) => {
  _.initialize();
}

window.addEventListener('resize', function(event) {
  _.setCameraContainerDimensions()
})