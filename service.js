process.chdir(__dirname);

var fs = require ("fs");
var service = require ("os-service");
const path = require('path');

function usage () {
	console.log ("usage: node service --add");
	console.log ("       node service --remove");
	console.log ("       node service --run");
	process.exit (-1);
}

if (process.argv[2] == "--add") {
	var serverkey = process.argv[3];
	var gateway = process.argv[4];

	var options = {
        name: "EyeNet Agent",
        nodePath: path.join(__dirname, "nodejs", "node.exe"),
        programPath: path.join(__dirname, "main.js"),
		programArgs: [process.argv[3], process.argv[4]]


	};

	service.add ("EyeNet Agent", options, function(error) {
		if (error)
			console.trace(error);
	});

	fs.writeFileSync('config.json', JSON.stringify({
        serverkey: serverkey,
        gateway: gateway
    }));

} else if (process.argv[2] == "--remove") {

	service.remove ("EyeNet Agent", function(error) {
		if (error)
			console.trace(error);
	});


} else {
	usage ();
}
