import config from '@colyseus/tools';
import { monitor } from '@colyseus/monitor';
import { playground } from '@colyseus/playground';

import { MyRoom } from './rooms/MyRoom';

export default config({
    initializeGameServer: (gameServer) => {
        gameServer.define('my_room', MyRoom);
    },

    initializeExpress: (app) => {
        app.get('/hello_world', (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        if (process.env.NODE_ENV !== 'production') {
            app.use('/', playground());
        }

        app.use('/monitor', monitor());
    },

    beforeListen: () => { },
});
