import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const db = new pg.Pool({
  host: process.env.HOST,
  port: process.env.PORT,
  database: process.env.DB,
  user: process.env.USER,
  password: process.env.PASSWORD,
});

db.connect((err) => {
  if (err) {
    console.log(" Gagal terhubung ke database:", err);
  } else {
    console.log(" Berhasil terhubung ke database PostgreSQL");
  }
});

export default db;
