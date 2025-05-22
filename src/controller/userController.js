import { generateToken, refreshToken } from "../helper/jwt.js";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";
import userModel from "../model/userModel.js";

const { countUsers, getUsers, getById, createUsers, loginUsers, updateUsers, deleteUsers,findUsersByEmail} = userModel;


const userController = {
  getUser: async (req, res) => {
    let { searchBy, search, sortBy, sort, limit, offset, page } = req.query;
    let data = {
      page: page || 1,
      searchBy: searchBy || "username",
      search: search || "",
      sortBy: sortBy || "user_id",
      sort: sort || "ASC",
      limit: limit || 100,
      offset: (page - 1) * limit || 0,
    };

    try {
      const {
        rows: [count],
      } = await countUsers();
      const totalData = parseInt(count?.total);
      const totalPage = Math.ceil(totalData / data?.limit);
     
      const pagination = {
        currentPage: data?.page,
        limit: data?.limit,
        totalData: totalData,
        totalPage: totalPage,
      };
      let results = await getUsers(data);
      res.status(200).json({
        message: "users get all by query",
        pagination: pagination,
        data: results?.rows,
      });
    } catch (err) {
      res.status(400).json({
        error: err.message,
        message: "users not found",
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const users_id = req.params.user_id;
      
      const result = await getById(users_id);
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

  createUser: async (req, res) => {
    try {
      const { username, email, password, confirmPassword } = req.body;


      let { rowCount } = await findUsersByEmail(email);

     
      if (rowCount) {
        return res
          .status(400)
          .json({ message: "email already in use,please use another email" });
      }
      if (password !== confirmPassword)
        return res
          .status(401)
          .json({ message: "passsword and confirm password do not match" });

          
      const passwordHash = bcrypt.hashSync(password, 10);

      const user = {
        username,
        email,
        password: passwordHash,
      };
      const workerData = await createUsers(user);
      // console.log("User data:", workerData);
      res.status(200).json({
        message: "users has been created successfully",
        data: workerData,
      });
    } catch (err) {
      res.status(400).json({
        message: "Error creating Worker",
        err: err.message,
      });
    }
  },

  loginUser: async (req, res) => {
    const { email, password } = req.body;

    try {
      const result = await loginUsers(email);
       

      if (result.rowCount > 0) {
        const passwordHash = result.rows[0].password;
        const PasswordValid = await bcrypt.compare(password, passwordHash);
        const user = result.rows[0];

        // console.log(result);

        if (PasswordValid) {
          const token = await generateToken({
            users: user,
          });

          return res.status(200).json({
            message: "Login successful",
            token: token,
            data: user,
          });
        } else {
          res.status(400).json({ message: "Invalid password " });
        }
      } else {
        res.status(400).json({ message: "Invalid Email " });
      }
    } catch (error) {
      res
        .status(400)
        .json({ error, message: "An error occurred during login" });
    }
  },

  updateUser: async (req, res) => {
    try {

      const users_id = req.params.user_id;

      const result = await getById(Number(users_id));
      const user = result.rows[0];
    
      const data = {
        username: req.body.username || user.username,
        email: req.body.email || user.email,
        
      };

      await updateUsers(data, Number(users_id));

      res.status(200).json({
        message: "Update Successfull",
      });
    } catch (error) {
      res.status(400).json({
        message: "Update Error",
        error: error.message,
      });
    }
  },


  deleteUser: async (req, res) => {
    try {
      
      const users_id = req.params.user_id;
      
      const result = await deleteUsers(users_id);
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

export default userController;