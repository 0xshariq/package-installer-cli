import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/database.js';
import userRoutes from './routes/user.routes.js';

dotenv.config({ path: '.env' });  // Create a .env file in the root directory and add your MongoDB URI

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

app.use(express.json());
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Basic Express JavaScript!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 