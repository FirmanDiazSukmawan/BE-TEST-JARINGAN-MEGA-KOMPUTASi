import multer from "multer";
// import path from "path";

const multerUpload = multer({
  storage: multer.diskStorage({
    // Uncomment dan sesuaikan jika kamu ingin menyimpan file secara fisik
    // destination: (req, file, cb) => {
    //   cb(null, "./public");
    // },
    // filename: (req, file, cb) => {
    //   const ext = path.extname(file.originalname);
    //   const fileName = `${Date.now()}${ext}`;
    //   cb(null, fileName);
    // },
  }),

  fileFilter: (req, file, cb) => {
    const fileSize = parseInt(req.headers["content-length"]);

    const maxSize = 2 * 1024 * 1024;
    if (fileSize > maxSize) {
      return cb({ message: "File size exceeds maximum image" }, false);
    }

    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb({ message: "file must be a .png .jpg or .jpeg" }, false);
    }
  },
});

const upload = (req, res, next) => {
  const multerFields = multerUpload.fields([{ name: "foto_product", maxCount: 1 }]);
  const multerHandler = multerFields;
 multerHandler(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: "Error uploading",
        err: err.message,
      });
    }
    next();
  });
};

export default upload;
