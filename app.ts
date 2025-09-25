import express, { Application } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import filesRouter from './routes/files';
import resourcesRouter from './routes/resources';
import authRouter from './routes/auth';

const app: Application = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/files', filesRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/auth', authRouter);

export default app;
