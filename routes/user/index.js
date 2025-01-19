import { Router } from 'express';
import { updateCart,fetchCartItems,fetchTableData, saveOrder, getUserOrderDetails, postAddress, checkUserAddress } from '../../controller/user/index.js';
import Razorpay from "razorpay";
import crypto from "crypto";
const router = Router();

// Route for user registration
router.post('/cart', updateCart);

// Route for user login
router.get('/cart', fetchCartItems);

router.get("/fetch-products/:tableName", fetchTableData);

router.post("/payment/orderr", (req, res) => {
    try {
      const instance = new Razorpay({
        key_id: "rzp_test_lxRT5NF1Dopxfd",
        key_secret: "sEGonS41awMadqWt68JeOl4O",
      });
  
      const opts = {
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: "sample_receipt",
      };
  
      instance.orders.create(opts, (err, order) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Something went wrong" });
        } else {
          res.status(200).json({ data: order });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  });
  
  router.post("/payment/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;
      const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSign = crypto
        .createHmac("sha256", "sEGonS41awMadqWt68JeOl4O")
        .update(sign)
        .digest("hex");
  
      if (razorpay_signature === expectedSign) {
        return res.status(200).json({ message: "Payment verified successfully" });
      } else {
        return res.status(400).json({ message: "Invalid signature sent!" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error!" });
    }
  });


  router.post("/orders",saveOrder)
  router.get("/orders/:user_id",getUserOrderDetails)
  router.post("/address",postAddress)
  router.get("/address/:user_id",checkUserAddress)
export default router;