# noderestarter
Restart your Node.js app on crashes or edits


##Installation


`npm install noderestarter -g`


Make sure to add the `-g` or else it won't work. This lets you call noderestarter without the path.


##Usage


Assuming you installed it globally (`npm install noderestarter -g`) you can type `noderestarter` + options + the app file you want to run + any arguments you want to send your app. Make sure the app you're running and its arguments come after the noderestarter options.


`noderestarter [restart] [watch] yourapp.js [your app args]`


###Example:


`noderestarter restart watch app.js -debug`


###Options:

`restart` will restart the app if it crashes. If it crashes again within 5 seconds, it stops trying until you edit the file or restart noderestarter


`watch` will restart the app if the app you passed in is changed (Note: This does not watch any directories, only that one file)


