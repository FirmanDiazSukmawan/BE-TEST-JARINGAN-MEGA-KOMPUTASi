import cloudinary from "../config/cloudinary.js";
import userModel from "../model/orderModel.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const { countOrders, createOrders, getById, deleteOrders, getOrders, getOrdersByUserId, updateOrders,countOrdersByUserId} = userModel;


const orderController = {
  getOrder: async (req, res) => {
    let { searchBy, search, sortBy, sort, limit, offset, page } = req.query;
    let data = {
      page: page || 1,
      searchBy: searchBy || "name_product",
      search: search || "",
      sortBy: sortBy || "order_id",
      sort: sort || "ASC",
      limit: limit || 100,
      offset: (page - 1) * limit || 0,
    };
   

    try {
      const {
        rows: [count],
      } = await countOrders();
      

      const totalData = parseInt(count?.total);
      const totalPage = Math.ceil(totalData / data?.limit);
     
     
      const pagination = {
        currentPage: data?.page,
        limit: data?.limit,
        totalData: totalData,
        totalPage: totalPage,
      };
      let results = await getOrders(data);
      res.status(200).json({
        message: "orders get all by query",
        pagination: pagination,
        data: results?.rows,
      });
    } catch (err) {
      res.status(400).json({
        error: err.message,
        message: "orders not found",
      });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const orders_id = req.params.order_id;
      
      const result = await getById(orders_id);
      res.json({
        data: result.rows,
        message: "get data successfully",
      });
    } catch (err) {
      res.json({
        error: err.message,
        message: "error getting worker",
      });
    }
  },

  getByUserId: async (req, res) => {
  const user_id = parseInt(req.params.user_id);
  let { searchBy, search, sortBy, sort, limit, page } = req.query;

  if (isNaN(user_id)) {
    return res.status(400).json({ message: "Invalid user_id" });
  }

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const offset = (page - 1) * limit;

  searchBy = searchBy || "name_product";
  search = search || "";
  sortBy = sortBy || "order_id";
  sort = (sort || "ASC").toUpperCase();

  try {
  
    const { rows: [count] } = await countOrdersByUserId(user_id, searchBy, search);

    const totalData = parseInt(count?.total) || 0;
    const totalPage = Math.ceil(totalData / limit);

    const pagination = {
      currentPage: page,
      limit: limit,
      totalData: totalData,
      totalPage: totalPage,
    };

   
    const results = await getOrdersByUserId(user_id, { searchBy, search, sortBy, sort, limit, offset });

    res.status(200).json({
      message: "orders get by user with query",
      pagination,
      data: results.rows,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
      message: "error finding orders",
    });
  }
},




createOrder: async (req, res) => {
  try {
    if (!req.files.foto_product || !req.files.foto_product[0]) {
      return res.status(400).json({ message: "You need to upload an image" });
    }

    const originalPath = req.files.foto_product[0].path;
    const compressedPath = path.join(
      path.dirname(originalPath),
      "compressed_" + path.parse(req.files.foto_product[0].filename).name + ".webp"
    );

    
    await sharp(originalPath)
      .resize({ width: 800 })
      .webp({ quality: 70 })
      .toFile(compressedPath);

    
    const productImages = await cloudinary.uploader.upload(compressedPath, {
      folder: "foto_product",
      resource_type: "image",
    });

    
    fs.unlinkSync(originalPath);
    fs.unlinkSync(compressedPath);

    let recipe = {
      name_product: req.body.name_product,
      qty: req.body.qty,
      berat: req.body.berat,
      description: req.body.description,
      foto_product: productImages.secure_url,
      user_id: req.body.user_id,
    };

    if (
      !recipe.name_product ||
      !recipe.qty ||
      !recipe.berat ||
      !recipe.description ||
      !recipe.foto_product ||
      !recipe.user_id
    ) {
      return res.status(400).json({ message: "You need to fill all fields" });
    }

    let orderData = await createOrders(recipe);

    res.status(200).json({
      message: "Create order successfully",
      data: orderData,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      err: err.message,
      message: "Error creating order",
    });
  }
},



 updateOrder: async (req, res) => {
  try {
    let order_id = req.params.order_id;

    
    let order = await getById(Number(order_id));
    if (order.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    let data = order.rows[0];

   
    let imageUrl = data.foto_product;

   
    if (req.files && req.files.foto_product && req.files.foto_product[0]) {
      const uploaded = await cloudinary.uploader.upload(
        req.files.foto_product[0].path,
        {
          folder: "foto_product",
          resource_type: "image",
        }
      );
      imageUrl = uploaded.secure_url;
    }

    let orderData = {
      name_product: req.body.name_product || data.name_product,
      qty: req.body.qty || data.qty,
      berat: req.body.berat || data.berat,
      description: req.body.description || data.description,
      foto_product: imageUrl,
    };

    await updateOrders(orderData, Number(order_id));

    res.status(200).json({
      message: "Order updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
      message: "Error updating order",
    });
  }
},



  deleteOrder: async (req, res) => {
    try {
      
      const order_id = req.params.order_id;
      
      const result = await deleteOrders(order_id);
      const data = await cloudinary.uploader.destroy(result);
      res.json({
        message: "delete data sucessfully",
        data: `id ${data} has been deleted`,
      });
    } catch (err) {
      res.json({
        error: err.message,
        message: "error deleting data",
      });
    }
  },
};

export default orderController;