// File: lol.js
const WebSocket = require('ws');
const fs = require('fs');

class LOL {
    constructor({ ApiKey, ApiSecret }, options = {}) {
        this.apiKey = ApiKey;
        this.apiSecret = ApiSecret;

        // Include API key and secret as headers when creating the WebSocket connection
        this.ws = new WebSocket(`wss://ws.lolcorp.co.uk:1876?apikey=${ApiKey}&apisecret=${ApiSecret}`);

        this.channels = {};

        this.ws.onopen = () => {
            console.log('Connected to WebSocket server');
            // No need to call authenticate here since the server receives the headers
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.ws.onclose = () => {
            this.logError('Disconnected from WebSocket server');
        };

        this.ws.onerror = (error) => {
            this.logError(`WebSocket error: ${error.message}`);
        };

        this.setupLogging();
    }

    setupLogging() {
        this.errorLogStream = fs.createWriteStream('LOLSocket_Errors.log', { flags: 'a' });
    }

    logError(message) {
        const timestamp = new Date().toISOString();
        this.errorLogStream.write(`[${timestamp}] ${message}\n`);
    }

    subscribe(channel) {
        this.channels[channel] = true;  // Use channel directly without appending API key
        this.ws.send(JSON.stringify({ type: 'subscribe', channel }));
    }

    unsubscribe(channel) {
        delete this.channels[channel];
        this.ws.send(JSON.stringify({ type: 'unsubscribe', channel }));
    }

    trigger(channel, event, data) {
        this.ws.send(JSON.stringify({ type: 'publish', channel, namespace: event, content: data }));
    }

    privateTrigger(channel, namespace, uid, data){
        this.ws.send(JSON.stringify({ type: 'private', channel, namespace, user_id: uid, content: data }));
    }

    handleMessage(data) {
        // Handle different message types from the server
        switch (data.type) {
            case 'message':
                // Handle incoming messages
                console.log('Received message:', data);
                break;
            // Add other cases as needed
        }
    }
}

module.exports = LOL;
