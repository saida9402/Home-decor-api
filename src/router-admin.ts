import express from "express";
const routerAdmin = express.Router();
import sellerController from "./controllers/seller.controller";
import productController from "./controllers/product.controller";
import makeUploader from "./libs/utils/uploader";
// import makeUploader, { uploadProductImage } from "./libs/utils/uploader";

/** Restaurant */
routerAdmin.get("/", sellerController.goHome);
routerAdmin
  .get("/login", sellerController.getLogin)
  .post("/login", sellerController.processLogin);
routerAdmin
  .get("/signup", sellerController.getSignup)
  .post(
    "/signup",
    makeUploader("members").single("memberImage"),
    sellerController.processSignup
  );
routerAdmin.get("/logout", sellerController.logout);
routerAdmin.get("/check-me", sellerController.checkAuthSessions);

/** Product */
routerAdmin.get(
  "/product/all",
  sellerController.verifySeller,
  productController.getAllProducts
);
routerAdmin.post(
  "/product/create",
  sellerController.verifySeller,
  makeUploader("products").array("productImages", 5),
  // uploadProductImage.single("productImage"),
  productController.createNewProduct
);
routerAdmin.post(
  "/product/:id",
  sellerController.verifySeller,
  productController.updateChosenProduct
);
/** User */

routerAdmin.get(
  "/user/all",
  sellerController.verifySeller,
  sellerController.getUsers
);

routerAdmin.post(
  "/user/edit",
  sellerController.verifySeller,
  sellerController.updateChosenUser
);

export default routerAdmin;
