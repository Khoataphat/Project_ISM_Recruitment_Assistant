import "reflect-metadata";
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { UserRoute } from './modules/user/user.route';

const app = express();
const port = 3000;

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

const userRoute = new UserRoute();
app.use('/users', userRoute.router);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});