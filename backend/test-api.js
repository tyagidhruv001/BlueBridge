const http = require('http');

const data = JSON.stringify({
    customerId: 'TEST1234',
    customerName: 'Testy',
    workerId: 'WORKER999',
    workerName: 'Bob',
    serviceType: 'Mechanic',
    price: 50,
    status: 'pending'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/jobs',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
