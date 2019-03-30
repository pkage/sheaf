// Modules to control application life and create native browser window
const {
	app,
	BrowserWindow,
	Menu,
	MenuItem,
	ipcMain
} = require('electron')
const validUrl = require('valid-url')
const { exec } = require('child_process')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow


function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		frame: false
	})

	
	// and load the index.html of the app.
	if (process.argv.length > 2) {
		navigate(process.argv[2])
	} else {
		mainWindow.loadFile('index.html')
	}

	// Open the DevTools.
	//mainWindow.webContents.openDevTools()

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

let prevPage = ""
let chromeActive = true
const getCurrentURL = () => mainWindow.webContents.getURL()
const enableChrome = () => {
	mainWindow.nodeIntegration = true
	chromeActive = true
	prevPage = getCurrentURL()
}
const disableChrome = () => {
	mainWindow.nodeIntegration = false
	chromeActive = false
}
const sendToFirefox = url => exec(`firefox -url ${url}`)

const menu = new Menu()
menu.append(new MenuItem({
	label: "Back",
	accelerator: 'CmdOrCtrl+Left',
	click: () => {
		if (!chromeActive && mainWindow.webContents.canGoBack()) {
			mainWindow.webContents.goBack()
		} else {
			console.log(`can't go back`)
		}
	}
}))
menu.append(new MenuItem({
	label: "Forward",
	accelerator: 'CmdOrCtrl+Right',
	click: () => {
		if (!chromeActive && mainWindow.webContents.canGoForward()) {
			mainWindow.webContents.goBack()
		} else {
			console.log(`can't go back`)
		}
	}
}))
menu.append(new MenuItem({
	label: "Reload",
	accelerator: 'CmdOrCtrl+R',
	click: () => {
		mainWindow.webContents.reload()
	}
}))
menu.append(new MenuItem({
	label: "Show Menu",
	accelerator: 'CmdOrCtrl+L',
	click: () => {
		if (!chromeActive) {
			enableChrome()
		}
		mainWindow.webContents.loadFile('index.html')
	}
}))
menu.append(new MenuItem({
	label: "Show Developer Tooling",
	accelerator: 'CmdOrCtrl+Alt+J',
	click: () => {
		mainWindow.webContents.toggleDevTools()
	}
}))
menu.append(new MenuItem({
	label: "Send to Firefox",
	accelerator: 'CmdOrCtrl+Shift+F',
	click: () => {
		if (!chromeActive) {
			let url = getCurrentURL()
			sendToFirefox(url)
		} else {
			console.log('browser chrome enabled, ignoring firefox send...')
		}
	}
}))


const navigate = url => {
	console.log('navigating to ' + url)
	if (validUrl.isWebUri(url)) {
		console.log('\turl is navigable')
	} else {
		url = 'https://' + url
		console.log('\turl is not navigable, patched to: ' + url)
	}

	disableChrome()
	if (validUrl.isWebUri(url) && url.indexOf('.') > -1) {
		mainWindow.webContents.loadURL(url)
	} else {
		console.log('\turl is invalid, no more attempts will be made')
		mainWindow.webContents.loadFile('error.html')
	}
}
ipcMain.on('navigate', (e, url) => navigate(url))
ipcMain.on('cancel', (e) => {
	console.log('returning control to previous state')
	disableChrome()
	mainWindow.webContents.loadURL(prevPage)
})
ipcMain.on('sendtofirefox', (e, url) => {
	sendToFirefox(url)
	disableChrome()
	mainWindow.webContents.loadURL(prevPage)
})

Menu.setApplicationMenu(menu)
