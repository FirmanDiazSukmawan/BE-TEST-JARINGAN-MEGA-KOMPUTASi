import cloudinary from "../config/cloudinary.js";
import userModel from "../model/orderModel.js";

const { countOrders, createOrders, getById, deleteOrders, getOrders, getOrdersByUserId, updateOrders} = userModel;


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
    const user_id = req.params.user_id;
    try {
      const result = await getOrdersByUserId(user_id);
      res.status(200).json({ data: result.rows });
      // console.log(result);
    } catch (err) {
      res.status(400).json({
        error: err.message,
        message: "error finding Order",
      });
    }
  },

  createOrder: async (req, res) => {
   try {
      let productImages;


      if (req.files.foto_product && req.files.foto_product[0]) {
        productImages = await cloudinary.uploader.upload(
          req.files.foto_product[0].path,
          {
            folder: "foto_product",
            resource_type: "image",
          }
        );
      } else {
        return res.status(400).json({ message: "U need upload image" });
      }


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
        !recipe.foto_product ||!recipe.user_id
      ) {
        return res.status(400).json({ message: "U need fill all fields" });
      }
      let orderData = await createOrders(recipe);
      
      res.status(200).json({
        message: "create order succesfully",
        data: orderData,
        
      });

    } catch (err) {
      console.error("Error creating order:", err);
      res.status(400).json({
        err: err.message,
        message: "error create order",
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