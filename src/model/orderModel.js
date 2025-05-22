import db from "../config/db.js";


const getOrders = (data) => {
  let { searchBy, search, sortBy, sort, limit, offset } = data;

  const allowedSearchFields = ['name_product'];
  const allowedSortFields = ['order_id','name_product', 'qty',"berat",'created_at'];
  const allowedSortDirections = ['ASC', 'DESC'];

  if (!allowedSearchFields.includes(searchBy)) searchBy = 'name_product';
  if (!allowedSortFields.includes(sortBy)) sortBy = 'name_product';
  if (!allowedSortDirections.includes(sort.toUpperCase())) sort = 'ASC';

  return db.query(
    `SELECT * FROM "order"
     WHERE ${searchBy} ILIKE $1
     ORDER BY ${sortBy} ${sort}
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );
};


const countOrders = () => {
  return db.query(`SELECT COUNT(*) AS total FROM "order"`);
};


const getById = (order_id) => {
  return db.query(
    `SELECT * FROM "order" WHERE order_id = $1`,
    [order_id]
  );
};



const createOrders = (data) => {
  const {
    name_product,
    qty,
    berat,
    description,
    foto_product,
    user_id,
  } = data;

  return new Promise((resolve, reject) =>
    db.query(
      `INSERT INTO "order" (name_product, qty, berat, description, foto_product, user_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name_product, qty, berat, description, foto_product, user_id],
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


const getOrdersByUserId = (users_id) => {
  return db.query(` 
    SELECT 
    order.*, 
    user.username AS buyerName,
    user.image AS imageProfile, 
    TO_CHAR(order.created_at, 'DD-MM-YYYY HH24:MI:SS') AS created_at
FROM 
    order
LEFT JOIN 
    user
ON 
    order.user_id = user.user_id
WHERE 
    user.user_id = ${users_id};
`);
};


const updateOrders = (data, order_id) => {
   const { name_product, qty, berat,description,foto_product } = data;

  return db.query(
    `UPDATE "order" SET name_product = $1, qty = $2, berat = $3,description = $4,foto_product =$5   WHERE order_id = $6 RETURNING *`,
    [name_product, qty, berat,description,foto_product, order_id]
  );
};


const deleteOrders = (order_id) => {
  return db.query(
    `DELETE FROM "order" WHERE order_id = $1`,
    [order_id]
  );
};


export default  {
  getOrders,
  countOrders,
  getById,
  createOrders,
  updateOrders,
  deleteOrders,
getOrdersByUserId
};