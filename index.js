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
        if (!this.channels[channelKey]) {
            this.channels[channelKey] = [];
        }

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

    trigger(channel, type,  message) {
        const isClient = channel.startsWith('client-');
        // first subscribe to the channel
        this.subscribe(channel);
        if(isClient){
            const data = {
                type: 'client-publish',
                emit_type: type,
                channel: `${this.apiKey}-${channel}`,
                content: message,
                secret: this.apiSecret,
                token: this.token
            };
            
            this.socket.send(JSON.stringify(data));
        }else if(!isClient){
            const data = {
                type: 'publish',
                emit_type: type,
                channel: `${this.apiKey}-${channel}`,
                content: message,
                secret: this.apiSecret,
                token: this.token
            };

            this.socket.send(JSON.stringify(data));
        }

    }

}

module.exports = LOL;
