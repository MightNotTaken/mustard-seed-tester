const { app, BrowserWindow, remote } = require('electron')
const {exec} = require('child_process')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');
  win.maximize();
}

app.whenReady().then(createWindow)