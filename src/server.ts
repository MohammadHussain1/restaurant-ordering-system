import 'dotenv/config';
import App from './app';
import { createServer } from 'http';
import { initializeSocketIO } from './sockets';

const PORT = parseInt(process.env.PORT || '3000');

const app = new App();
const httpServer = createServer(app.app);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);

async function startServer() {
  try {
    await app.initialize();
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  try {
    // Close database connection
    await (require('./database/datasource').AppDataSource).destroy();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});