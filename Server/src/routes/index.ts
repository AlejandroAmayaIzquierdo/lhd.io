import express from 'express';
import userRoute from './user/user.js';
import storageRoute from './storage.js';
import roomRoute from './room/room.js';

const Routes = express.Router();

Routes.use('/user', userRoute);
Routes.use('/storage', storageRoute);
Routes.use('/rooms', roomRoute);

export default Routes;
