const express = require("express");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const cors = require('cors')
const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/razorpay")
  .then(() => console.log("connection success"))
  .catch(() => console.log("hyy you are not connected with database"));

app.use(cors({
    origin: '*'
}))
app.use(express.json({ extended: false }));

const OrderSchema = mongoose.Schema({
  isPaid: Boolean,
  amount: Number,
  razorpays: {
    orderId: String,
    paymentId: String,
    signature: String,
  },
});

const Order = mongoose.model("order", OrderSchema);


// app.get('/hello',(req,res)=>{
//     res.send({
//         message:"hello"
//     })
// })
app.get("/get-razorpay-key", (req, res) => {
  res.send({ key: "rzp_test_T3F98GFGRoY4cR" });
});

app.post("/create-order", async (req, res) => {
  try {
    var instance = new Razorpay({
      key_id: "rzp_test_T3F98GFGRoY4cR",
      key_secret: "ZcRC2KVPPVsP1dWRhkrmaPxj",
    });

    var options = {
      amount:req.body.amount, // amount in the smallest currency unit
      currency: "INR",
      // receipt: "order_rcptid_11",
    };
    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send("some error occured");
    res.send(order);
  } catch (error) {
    console.log(error);
  }
});

app.post("/pay-order", async (req, res) => {
  try {
    const { amount, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      req.body;

    const newOrder = Order({
      isPaid: true,
      amount: amount/100,
      razorpays: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      },
    });
    await newOrder.save();
    res.send({
      message: "payment was success",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get('/list-orders',async(req,res)=>{
    const orders = await Order.find()
    res.send(orders)
})
app.listen(5000, () => {
  console.log("listen in 5000 port ");
});
