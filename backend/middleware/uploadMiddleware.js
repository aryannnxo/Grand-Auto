// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename(req, file, cb) {
//     cb(
//       null,
//       `${req.user._id}${path.extname(file.originalname)}`
//     );
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = /jpg|jpeg|png/;
//   const ext = allowed.test(path.extname(file.originalname).toLowerCase());
//   if (ext) cb(null, true);
//   else cb(new Error("Images only"));
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;




const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpg|jpeg|png|webp|pdf/;
  const allowedMimetypes = /image\/jpe?g|image\/png|image\/webp|application\/pdf/;

  const extOk = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedMimetypes.test(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    console.warn(`File rejected: ${file.originalname} (${file.mimetype})`);
    cb(new Error("Only image files allowed (jpg, jpeg, png, webp)"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
