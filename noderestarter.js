#!/usr/bin/env node

var fs = require('fs'),
	path = require('path'),
	cp = require('child_process');

var exec = cp.exec, 
	cprocess,
	cpath = '',
	cprocessName = '',
	cargs = [],
	watchExec = false,
	restart = false,
	lastRestart = 0,
	lastChange = new Date().getTime(),
	currentlyRunning = false,
	exited = false,
	startingProcess = false;

if (process.argv.length < 3) {
	console.log('Missing required arguments');
	process.exit();
}

for (var i = 0; i < process.argv.length; i++) {
	if (process.argv[i] == 'node') continue;
	if (process.argv[i] == '/usr/local/bin/noderestarter') continue;

	if (process.argv[i].indexOf('.js') != -1) {

		cprocessName = process.argv[i].substring(process.argv[i].lastIndexOf('/') + 1, process.argv[i].lastIndexOf('.'));

		if (path.resolve(process.argv[i]) === path.normalize(process.argv[i])) { //if absolute path
			//use what they input as full path
			cpath = process.argv[i]; 
		} else {
			//set full path
			cpath = process.cwd() + (process.argv[i].indexOf('/') != 0 ? '/' : '') + process.argv[i]; 
		}

		if (process.argv.length > i + 1) cargs = process.argv.slice(i + 1);
		//if there's anything following the node app path, set it to the child's arguments
		
		break; //exit this loop so we don't accidentally set args from child process's args
	}

	if (process.argv[i] == 'watch') watchExec = true;
	if (process.argv[i] == 'restart') restart = true;
};

startProcess();

function startProcess(){

	startingProcess = true; //prevents it from going into the restart process from the on(exit)

	if (cprocess) cprocess.kill('SIGINT'); //quit process if already running


	setTimeout(function(){ //give it a second in case it takes a while to quit

		startingProcess = false;

		console.log('\033[36mStarting ' + cprocessName + '\033[0m');

		cprocess = cp.fork(cpath, cargs); //this creates the child process

		currentlyRunning = true;

		cprocess.on('exit', function (code) {
			console.log('\033[31m' + cprocessName + ' stopped\033[0m');

			if (!startingProcess && restart && currentlyRunning && !exited) {
				currentlyRunning = false;
				if ((new Date()).getTime() - lastRestart < 5000){
					console.log('\033[31mERROR: App stopped too quickly since last stop, not attempting to restart\033[0m');
				} else {
					startProcess();
				}
				lastRestart = new Date().getTime();
			};
		});

		if (watchExec) {
			fs.watchFile(cpath, function (curr, prev) {
				if ((new Date()).getTime() - lastChange > 1000 && !exited) {
					lastChange = new Date().getTime();
					console.log('\033[31mWatched file changed, restarting\033[0m');
					startProcess();
				}
			});
		}

	}, 1000);
}


process.stdin.resume(); //keep the app running

process.on('exit', exitApp);

process.on('SIGINT', exitApp);

function exitApp(){
	if (!exited) {
		exited = true;
		console.log('\n\033[31mQuitting noderestarter\033[0m');
		if (cprocess) cprocess.kill('SIGINT');
		setTimeout(process.exit, 500);
	}
}