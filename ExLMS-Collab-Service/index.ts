import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Hocuspocus } from '@hocuspocus/server';
import { Redis } from '@hocuspocus/extension-redis';
import { Logger } from '@hocuspocus/extension-logger';
import { Database } from '@hocuspocus/extension-database';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root (one level up from this service)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to local .env

const PORT = process.env.COLLAB_SERVICE_PORT || process.env.PORT || '1234';

// Sử dụng biến môi trường từ Docker Compose hoặc .env
const CORE_BACKEND_URL = process.env.CORE_BACKEND_INTERNAL_URL || 'http://lms-backend:8081/api/v1';

console.log(`[System] Backend URL set to: ${CORE_BACKEND_URL}`);
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

const server = new Hocuspocus({
  name: 'exlms-collab',

  extensions: [
    new Logger(),

    new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
    }),

    new Database({
      // Persistence: Sync dữ liệu sang Spring Boot
      store: async ({ documentName, document }) => {
        const collabId = documentName;
        // Chuyển đổi nội dung Tiptap sang JSON string để MySQL lưu trữ
        const documentData = JSON.stringify(document.getMap('content').toJSON());

        try {
          await axios.post(`${CORE_BACKEND_URL}/collabs/internal/${collabId}/sync`, {
            documentData: documentData
          });
          console.log(`[Sync] Document ${collabId} stored successfully.`);
        } catch (error: any) {
          console.error(`[Sync Error] Failed to store ${collabId}:`, error.message);
        }
      },

      fetch: async ({ documentName }) => {
        try {
          // Fetch dữ liệu khởi tạo nếu cần
          const response = await axios.get(`${CORE_BACKEND_URL}/collabs/${documentName}`);
          return null;
        } catch (error) {
          return null;
        }
      }
    }),
  ],

  // Xác thực người dùng
  onAuthenticate: async (data: any) => {
    const { token, documentName, connection } = data; // Lấy connection từ data

    if (!token) {
      throw new Error('Unauthorized');
    }

    try {
      const response = await axios.get(`${CORE_BACKEND_URL}/collabs/${documentName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const collab = response.data as any;

      // ĐÚNG: Gán readOnly trực tiếp cho đối tượng connection của người dùng này
      if (collab.status === 'CLOSED') {
        connection.readOnly = true;
      }

      // Track activity (Fire and forget)
      axios.post(`${CORE_BACKEND_URL}/collabs/${documentName}/track`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch((err: any) => console.error('Participant tracking error', err.message));

      return {
        user: { id: collab.userId },
      };
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      console.error(`[onAuthenticate] Auth failed for doc "${documentName}":`, {
        status,
        message,
        url: `${CORE_BACKEND_URL}/collabs/${documentName}`
      });
      throw new Error(`Authentication failed: ${message}`);
    }
  },
});

// Khởi chạy server trên cổng chỉ định, lắng nghe trên 0.0.0.0 để Docker/Nginx có thể truy cập
server.listen(Number(PORT), '0.0.0.0').then(() => {
  console.log(`🚀 ExLMS Collab Microservice (v2.x) listening on port ${PORT}`);
});