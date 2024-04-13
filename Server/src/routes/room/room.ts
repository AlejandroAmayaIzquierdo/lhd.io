import { Db } from '@/database/dbConnection.js';
import express from 'express';

const roomRoute = express.Router();

roomRoute.get('/', async (req, res) => {
  try {
    const rooms = (await Db.getInstance().query(
      'SELECT * FROM rooms',
    )) as Api.Room[];

    if (rooms.length < 0) throw new Error('No rooms founded');

    return res.status(200).send({ status: 1, result: rooms });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: 0, error });
  }
});

export default roomRoute;
