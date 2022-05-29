import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
const App = () => {
  const [loading, seLoading] = useState(false);
  const [orderAmount, setOrderAmount] = useState(0);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data } = await axios.get("http://127.0.0.1:5000/list-orders");
    setOrders(data);
  };

  // const fetchdata = async()=>{
  //  try {
  //   const res = await axios.get('http://127.0.0.1:5000/hello')
  //   console.log(res);
  //  } catch (error) {
  //    console.log(error);
  //  }
  // }
  useEffect(() => {
     fetchOrders();
   // fetchdata()
  }, []);

  const loadRazorpay = ()=>{
    const script = document.createElement('script')
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onerror = ()=>{
      alert('razorpay payment failed')
    }
    script.onload = async()=>{
      try {
        const result = await axios.post('http://127.0.0.1:5000/create-order',{
          amount:orderAmount + '00',
        })
        const {amount,id:order_id,currency} = result.data
        const{data:{key:razorpayKey}} = await axios.get('http://127.0.0.1:5000/get-razorpay-key')

        const options  = {
          key:razorpayKey,
          amount:amount.toString(),
          currency:currency,
          description:"example transaction",
          order_id:order_id,
          handler: async function (response) {
            const result = await axios.post('http://127.0.0.1:5000/pay-order', {
              amount: amount,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            alert(result.data.msg);
            fetchOrders();
          },
          prefill: {
            name: 'example name',
            email: 'email@example.com',
            contact: '111111',
          },
          notes: {
            address: 'example address',
          },
          theme: {
            color: '#80c0f0',
          },
        }
        seLoading(false)
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (error) {
        console.log(error);
        seLoading(false)
      }
    }
    document.body.appendChild(script)
  }
  return (
    <div className="App">
      <h1>Razorpay example React & Node Js</h1>
      <hr />
      <h3>Pay Order</h3>
      <input
        type="number"
        placeholder="INR"
        value={orderAmount}
        onChange={(e) => setOrderAmount(e.target.value)}
      />
      <button disabled={loading} onClick={loadRazorpay}>Razorpay</button>
      {
        loading && <div>Loading...</div>
      }
    </div>
  );
};

export default App;
