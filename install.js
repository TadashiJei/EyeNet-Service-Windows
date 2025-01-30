const readline = require('readline');
const Service = require('os-service');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function main() {
    try {
        console.log('EyeNet Agent Installation');
        console.log('------------------------');
        
        const serverkey = await question('Enter Server Key: ');
        const gateway = await question('Enter Gateway Address: ');

        // Create config directory if it doesn't exist
        const configDir = path.join(process.cwd(), 'config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir);
        }

        // Save configuration
        fs.writeFileSync(path.join(configDir, 'config.json'), JSON.stringify({
            serverkey: serverkey,
            gateway: gateway
        }, null, 2));

        console.log('\nRemoving previous EyeNet Agent service if exists...');
        try {
            await new Promise((resolve, reject) => {
                Service.remove('EyeNet Agent', (error) => {
                    if (error) {
                        // Ignore error if service doesn't exist
                        if (error.code !== 'ENOENT') {
                            reject(error);
                            return;
                        }
                    }
                    resolve();
                });
            });
        } catch (error) {
            console.log('Previous service removal failed:', error.message);
        }

        console.log('Installing EyeNet Agent service...');
        await new Promise((resolve, reject) => {
            Service.add('EyeNet Agent', {
                programPath: process.execPath,
                programArgs: ['main.js']
            }, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });

        console.log('Starting EyeNet Agent service...');
        const { exec } = require('child_process');
        await new Promise((resolve, reject) => {
            exec('net start "EyeNet Agent"', (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });

        console.log('\nInstallation completed successfully!');
    } catch (error) {
        console.error('\nError during installation:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Check if running with admin privileges
const { execSync } = require('child_process');
try {
    execSync('net session', { stdio: 'ignore' });
} catch (error) {
    console.error('This program must be run as Administrator.');
    console.error('Please right-click and select "Run as administrator"');
    process.exit(1);
}

main();
