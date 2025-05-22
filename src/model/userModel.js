import db from "../config/db.js";


const getUsers = (data) => {
  let { searchBy, search, sortBy, sort, limit, offset } = data;

  const allowedSearchFields = ['username', 'email'];
  const allowedSortFields = ['username', 'email', 'created_at'];
  const allowedSortDirections = ['ASC', 'DESC'];

  if (!allowedSearchFields.includes(searchBy)) searchBy = 'username';
  if (!allowedSortFields.includes(sortBy)) sortBy = 'username';
  if (!allowedSortDirections.includes(sort.toUpperCase())) sort = 'ASC';
  else sort = sort.toUpperCase();

  return db.query(
    `SELECT * FROM "user"
     WHERE ${searchBy} ILIKE $1
     ORDER BY ${sortBy} ${sort}
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );
};



const countUsers = () => {
  return db.query("SELECT COUNT(*) AS total FROM user");
};

const getById = (user_id) => {
  return db.query(
    `SELECT * FROM "user" WHERE user_id = $1`,
    [user_id]
  );
};


const findUsersByEmail = (email) => {
  return new Promise((resolve, reject) =>
    db.query(
      `SELECT * FROM "user" WHERE email = $1`,
      [email],
      (err, res) => {
        if (!err) {
          resolve(res);
        } else {
          reject(err.message);
        }
      }
    )
  );
};


const createUsers = (data) => {
  const { username, email, password } = data;

  return new Promise((resolve, reject) =>
    db.query(
      `INSERT INTO "user" (username, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [username, email, password],
      (err, res) => {
        if (!err) {
          resolve(res.rows[0]);
        } else {
         
          reject(err.message);
        }
      }
    )
  );
};


const loginUsers = (email) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM "user" WHERE email = $1`,
      [email],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};


const updateUsers = (data, user_id) => {
  const { username, email } = data;

  return db.query(
    `UPDATE "user" SET username = $1, email = $2 WHERE user_id = $3 RETURNING *`,
    [username, email, user_id]
  );
};


const deleteUsers = (user_id) => {
  return db.query(
    `DELETE FROM "user" WHERE user_id = $1`,
    [user_id]
  );
};


export default  {
  getUsers,
  countUsers,
  getById,
  createUsers,
  updateUsers,
  loginUsers,
  deleteUsers,
  findUsersByEmail,
};