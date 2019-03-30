// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer} = require('electron')

window.onload = () => {
	document.querySelector('#url').addEventListener('keyup', e => {
		if (e.keyCode == 13) { // enter
			console.log(e.target.value)
			ipcRenderer.send('navigate', e.target.value)
		} else if (e.keyCode == 27) { // escape
			console.log('cancelling...')
			ipcRenderer.send('cancel')
		}
	})

	document.querySelector('#firefox').addEventListener('click', e => {
		let url = document.querySelector('#url').value
		ipcRenderer.send('sendtofirefox', url)
	})
}
