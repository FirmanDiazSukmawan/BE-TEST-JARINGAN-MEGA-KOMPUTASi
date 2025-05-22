import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const caPath = join(__dirname, "ca.pem");
const ca = fs.readFileSync(caPath, "utf-8");



const db = new pg.Pool({
  host: process.env.HOST,
  port: process.env.PORT,
  database: process.env.DB,
  user: process.env.USER,
  password: process.env.PASSWORD,
  // connectionString: 'postgres://avnadmin:AVNS_gPAKVpfW9BNHQq9D3ah@freedb-firman670676-8efd.c.aivencloud.com:28333/defaultdb?sslmode=require',
 ssl: {
    rejectUnauthorized: true,
    ca,
    // minVersion: "TLSv1.2",
  },
});

db.connect((err) => {
  if (err) {
    console.log(" Gagal terhubung ke database:", err);
  } else {
    console.log(" Berhasil terhubung ke database PostgreSQL");
  }
});

export default db;
