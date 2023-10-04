const WebSocket = require('ws');
const { verifyToken } = require('./lib/auth');

class LOL {
    constructor({ API_KEY, API_SECRET }) {
        this.apiKey = API_KEY;
        this.apiSecret = API_SECRET;
        this.socket = new WebSocket(`ws://localhost:3000/${API_KEY}`);
        this.socket.onopen = (data) => {
            // get the token from the callback
            this.token = data.token;

            // verify the token
            const userId = verifyToken(this.token, API_SECRET);

            // if the token is invalid, close the connection
            if (!userId) {
                this.socket.close();
            }

        };

        this.channels = {};

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { type, channel, content } = data;
            if (type === 'message') {
                if (this.channels[channel]) {
                    this.channels[channel].forEach((callback) => {
                        callback(content);
                    });
                }
            }
        };
    }

    subscribe(channel) {
        const channelKey = `${this.apiKey}-${channel}`;

        // Check if the channel is already subscribed
        if (!this.channels[channelKey]) {
            this.channels[channelKey] = [];
        } else {
            // If already subscribed, return the existing subscription
            return {
                bind: (type, callback) => {
                    this.channels[channelKey].push((message) => {
                        if (message.emit_type === type) {
                            callback(message.data);
                        }
                    });
                }
            };
        }

        // Send a subscribe message to the server
        const data = {
            type: 'subscribe',
            channel: channelKey,
            secret: this.apiSecret,
            token: this.token
        };

        // Error handling for socket connection status
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.error('Socket connection is not open. Cannot send subscribe message.');
        }

        // Return the subscription object with bind method
        return {
            bind: (type, callback) => {
                this.channels[channelKey].push((message) => {
                    if (message.emit_type === type) {
                        callback(message.data);
                    }
                });
            }
        };
    }


    trigger(channel, type, message) {
        const isClient = channel.startsWith('client-');
        // first subscribe to the channel
        this.subscribe(channel);
        if (isClient) {
            const data = {
                type: 'client-publish',
                emit_type: type,
                channel: `${this.apiKey}-${channel}`,
                content: message,
                secret: this.apiSecret,
                sender: this.userID,
                token: this.token
            };

            this.socket.send(JSON.stringify(data));
        } else if (!isClient) {
            const data = {
                type: 'publish',
                emit_type: type,
                channel: `${this.apiKey}-${channel}`,
                content: message,
                secret: this.apiSecret,
                sender: this.userID,
                token: this.token
            };

            this.socket.send(JSON.stringify(data));
        }

    }

}

module.exports = LOL;
