process.chdir(__dirname);

const url = require('url');
const path = require('path');
const os = require('os');
const si = require('systeminformation');
const fs = require("fs");
const request = require('request');
const service = require("os-service");

// Handle service installation/removal
if (process.argv[2] === '--add') {
    service.add('EyeNet Protocol', {
        programPath: process.execPath,
        programArgs: ['run']
    }, function(error) {
        if (error) {
            console.error('Failed to install service:', error.message);
            process.exit(1);
        }
        console.log('Service installed successfully');
        
        // Open the EyeNet dashboard
        require('child_process').exec('start https://eyenet.hacktivators.com');
        
        process.exit(0);
    });
    return;
} else if (process.argv[2] === '--remove') {
    service.remove('EyeNet Protocol', function(error) {
        if (error) {
            console.error('Failed to remove service:', error.message);
            process.exit(1);
        }
        console.log('Service removed successfully');
        process.exit(0);
    });
    return;
} else if (process.argv[2] === '--dashboard') {
    require('child_process').exec('start https://eyenet.hacktivators.com');
    process.exit(0);
} else if (process.argv[2] !== 'run') {
    console.error('Invalid command. Use --add to install service, --remove to uninstall service, or --dashboard to open the web interface');
    process.exit(1);
}

// Load configuration
let config;
try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'config.json')));
} catch (error) {
    console.error('Failed to load configuration:', error.message);
    process.exit(1);
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, 'eyenet-agent.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}`;
    console.log(logMessage);
    logStream.write(logMessage + '\n');
}

service.run(function() {
    log("EyeNet Agent service stopped");
    service.stop(0);
});

log("EyeNet Agent service started");

function intervalFunc() {

    async function firstNetworkPass() {
        const ifaces = await si.networkInterfaces();

        for (let iface of ifaces) {
            const contents = await si.networkStats(iface.iface);
        }

    }


    async function collectAndReport() {
        var post_data = "";

        const allData = await si.getAllData();
        const processes = await si.processes();
        const networkInterfaceDefault = await si.networkInterfaceDefault();
        const ifaces = await si.networkInterfaces();

        var networkStats = [];

        for (let iface of ifaces) {
            const contents = await si.networkStats(iface.iface);
            networkStats.push(contents);
        }


        // agent_version #OK
        agent_version = "2.0.0";
        post_data = post_data + "{agent_version}" + agent_version + "{/agent_version}";

        // serverkey
        serverkey = config.serverkey;
        post_data = post_data + "{serverkey}" + serverkey + "{/serverkey}";

        // gateway
        gateway = config.gateway;
        post_data = post_data + "{gateway}" + gateway + "{/gateway}";

        // time #TBD
        time = new Date();
        post_data = post_data + "{time}" + time + "{/time}";

        // uptime #OK
        uptime = si.time().uptime;
        post_data = post_data + "{uptime}" + uptime + "{/uptime}";

        // hostname #OK
        hostname = allData.os.hostname;
        post_data = post_data + "{hostname}" + hostname + "{/hostname}";

        // kernel #OK
        kernel = allData.os.kernel;
        post_data = post_data + "{kernel}" + kernel + "{/kernel}";

        // os #OK
        os_name = allData.os.distro;
        post_data = post_data + "{os}" + os_name + "{/os}";

        // os_arch #OK
        os_arch = allData.os.arch;
        post_data = post_data + "{os_arch}" + os_arch + "{/os_arch}";

        // cpu_model #OK
        cpu_model = allData.cpu.manufacturer + " " + allData.cpu.brand + " " + allData.cpu.speed + "GHz";
        post_data = post_data + "{cpu_model}" + cpu_model + "{/cpu_model}";

        // cpu_cores #OK
        cpu_cores = allData.cpu.cores;
        post_data = post_data + "{cpu_cores}" + cpu_cores + "{/cpu_cores}";

        // cpu_speed #OK
        cpu_speed = allData.cpu.speed;
        post_data = post_data + "{cpu_speed}" + cpu_speed + "{/cpu_speed}";

        // ram_total #OK
        ram_total = allData.mem.total;
        post_data = post_data + "{ram_total}" + ram_total + "{/ram_total}";

        // ram_free #OK
        ram_free = allData.mem.free;
        post_data = post_data + "{ram_free}" + ram_free + "{/ram_free}";

        // ram_caches #NOT_IN_WIN
        ram_caches = allData.mem.buffcache;
        post_data = post_data + "{ram_caches}" + ram_caches + "{/ram_caches}";

        // ram_buffers #NOT_IN_WIN
        ram_buffers = allData.mem.buffcache;
        post_data = post_data + "{ram_buffers}" + ram_buffers + "{/ram_buffers}";

        // ram_usage #OK
        ram_usage = allData.mem.used;
        post_data = post_data + "{ram_usage}" + ram_usage + "{/ram_usage}";

        // swap_total #OK
        swap_total = allData.mem.swaptotal;
        post_data = post_data + "{swap_total}" + swap_total + "{/swap_total}";

        // swap_free #OK
        swap_free = allData.mem.swapfree;
        post_data = post_data + "{swap_free}" + swap_free + "{/swap_free}";

        // swap_usage #OK
        swap_usage = allData.mem.swapused;
        post_data = post_data + "{swap_usage}" + swap_usage + "{/swap_usage}";

        // cpu_load
        cpu_load = JSON.stringify(allData.currentLoad);
        post_data = post_data + "{cpu_load}" + cpu_load + "{/cpu_load}";

        // net_interfaces
        net_interfaces = JSON.stringify(allData.net);
        post_data = post_data + "{net_interfaces}" + net_interfaces + "{/net_interfaces}";

        // net_stats
        net_stats = JSON.stringify(networkStats);
        post_data = post_data + "{net_stats}" + net_stats + "{/net_stats}";

        // default_interface
        default_interface = networkInterfaceDefault;
        post_data = post_data + "{default_interface}" + default_interface + "{/default_interface}";

        // processes
        processes_post = JSON.stringify(processes);
        post_data = post_data + "{processes}" + processes_post + "{/processes}";

        // ping_latency
        ping_latency = allData.inetLatency;
        post_data = post_data + "{ping_latency}" + ping_latency + "{/ping_latency}";

        // disks
        disk_layout = JSON.stringify(allData.diskLayout);
        post_data = post_data + "{disk_layout}" + disk_layout + "{/disk_layout}";

        // filesystems
        filesystems = JSON.stringify(allData.fsSize);
        post_data = post_data + "{filesystems}" + filesystems + "{/filesystems}";

        // network_connections
        network_connections = JSON.stringify(allData.networkConnections);
        post_data = post_data + "{network_connections}" + network_connections + "{/network_connections}";

        // system
        system = JSON.stringify(allData.system);
        post_data = post_data + "{system}" + system + "{/system}";

        // bios
        bios = JSON.stringify(allData.bios);
        post_data = post_data + "{bios}" + bios + "{/bios}";

        // baseboard
        baseboard = JSON.stringify(allData.baseboard);
        post_data = post_data + "{baseboard}" + baseboard + "{/baseboard}";


        if(gateway != "") {
            request.post(gateway).form({data: post_data})
        }

        //console.log(allData);
        //console.log(networkStats);
        //console.log(processes);
        //console.log(post_data);
    }

    // get networking data
    firstNetworkPass();

    // wait 1 second and run the main reporting function
    setTimeout(collectAndReport, 1000);



}

// run every 60 seconds
setInterval(intervalFunc, 60000);
