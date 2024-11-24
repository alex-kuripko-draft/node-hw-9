import express from 'express';
import bodyParser from 'body-parser';
import { sequelize } from './models/index.js';
import userRoutes from './routes/user.js';
import 'dotenv/config';

const app = express();

app.use(bodyParser.json());

app.use('/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await sequelize.authenticate();
    console.log('Database connected!');
});