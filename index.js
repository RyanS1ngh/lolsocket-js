const WebSocket = require('ws');
const { verifyToken } = require('./lib/auth');

class LOL {
    constructor({ API_KEY, API_SECRET, TLS }) {
        this.apiKey = API_KEY;
        this.apiSecret = API_SECRET;
        if(TLS) {
            const url = `wss:///ws.lolcorp.co.uk:4000/${API_KEY}`;
            this.socket = new WebSocket(url);
        } else {
            const url = `ws:///ws.lolcorp.co.uk:3000/${API_KEY}`;
            this.socket = new WebSocket(url);
        }

        // if socket failed then try again 
        this.socket.onerror = (error) => {
            console.log('disconnected')
        }

        this.socket.onopen = () => {
            console.log('connected')

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

            // if token then verify iitZz
            if (type === 'token') {
                this.token = data.token;
                // verify the token
                const userId = verifyToken(this.token, API_SECRET);
                this.userID = userId;
                // if the token is invalid, close the connection
                if (!userId) {
                    this.socket.close();
                }
            }
        };
    }

    subscribe(channel) {
        const channelKey = `${this.apiKey}-${channel}`;
        // send a subscribe message to the server
        const data = {
            type: 'subscribe',
            channel: channel,
            secret: this.apiSecret,
            token: this.token
        };
        this.socket.send(JSON.stringify(data));
    
        // Initialize the channels object if not already initialized
        if (!this.channels[channelKey]) {
            this.channels[channelKey] = [];
        }
    
        return {
            bind: (type, callback) => {
                this.channels[channelKey].push({
                    type: type,
                    callback: callback
                });
    
                // Inside the bind function, handle incoming messages based on type
                this.socket.onmessage = (event) => {
                    const parsedMessage = JSON.parse(event.data);
                    const messageType = parsedMessage.emit_type;
                    const messageData = parsedMessage.content;
    
                    this.channels[channelKey].forEach(subscription => {
                        if (subscription.type === messageType) {
                            subscription.callback(messageData);
                        }
                    });
                };
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
                channel: channel,
                content: message,
                secret: this.apiSecret,
                userId: this.userID,
                token: this.token
            };

            this.socket.send(JSON.stringify(data));
        } else if (!isClient) {
            const data = {
                type: 'publish',
                emit_type: type,
                channel: channel,
                content: message,
                secret: this.apiSecret,
                userId: this.userID,
                token: this.token
            };

            this.socket.send(JSON.stringify(data));
        }

    }

    p2pTrigger(channel, type, message, to) {
        // first subscribe to the channel
        this.subscribe(channel);
            const data = {
                type: 'publish-to-userId',
                emit_type: type,
                channel: channel,
                content: message,
                secret: this.apiSecret,
                uer_id: to,
                token: this.token
            };

            this.socket.send(JSON.stringify(data));
    }
 }


module.exports = LOL;
