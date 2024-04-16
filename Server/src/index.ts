import Express from 'express';
import { createServer, Server } from 'http'; // Import Server from http
import WebSocket, { WebSocketServer } from 'ws';
import cors from 'cors';
import logger from 'morgan';
import dotenv from 'dotenv';

import { Db } from './database/dbConnection.js';
import Routes from './routes/index.js';
import { SocketHandler } from './sockets/Sockets.js';
import fileUpload from 'express-fileupload';

dotenv.config();

const PORT = process.env.PORT || 3000;

export const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  BD_DATABASE_NAME,
  SECRET_CLIENT_ID,
  SECRET_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
} = process.env;

export class Application {
  private app: Express.Application;
  private httpServer: Server;
  private wsServer: WebSocket.Server;

  public constructor() {
    this.app = Express();
    this.httpServer = createServer(this.app);
    this.wsServer = new WebSocketServer({ server: this.httpServer });

    this.initializeApp();
    this.initializeRoutes();
  }

  private initializeApp = () => {
    this.app.disable('x-powered-by');
    this.app.use(
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
      }),
    );
    this.app.use(logger('dev'));
    this.app.use(Express.json());
    this.app.use(fileUpload());
  };

  private initializeRoutes = () => {
    this.app.use('/', Routes);
  };

  public handle = async () => {
    const isDbUp = await Db.getInstance().isConnectionAlive();

    if (!isDbUp) {
      console.log('Database connection failed');
      console.log('Trying to reconnect every 5 seconds...');
      setTimeout(() => this.handle(), 5000);
      return;
    }

    SocketHandler.handleConnections(this.wsServer);

    this.httpServer.listen(PORT, () => {
      console.log(`Server listening to ${PORT} port 🚀`);
    });
  };
}

new Application().handle();
