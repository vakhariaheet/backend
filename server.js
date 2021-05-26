//* Pakages import
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const XLSX = require("xlsx");

require("dotenv").config();
//* Modals
const Dealer = require("./Modals/Dealer.modal");
const Order = require("./Modals/Order.modal");
//*Utils
const sendEmail = require("./Routes/sendEmail");
const allDealers = require('./Routes/allDealers.routes');
const updateDealers = require('./Routes/updateDealers.routes');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const dealersR = [];
app.post("/upload", async (req, res) => {
  const { binaryString } = req.body;
  const workbook = XLSX.read(binaryString, { type: "binary" });
  const json = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  );
  const orders = [];
  const dealerOrder = {};
  json.map((dat) => {
    const orderProperty = [
      "Order No",
      "Doc. No",
      "Tran. Date",
      "Tran. Time",
      "TTNO",
      "Material",
      "Material Name",
      "Bill Qty",
      "Unit",
      "Bill Amt",
      "Db/Cr",
      "Doc Type",
      "Plant",
      "CCA",
      "Sold to Party",
      "Ship to Party",
      "Name",
      "No",
    ];
    const order = {};
    orderProperty.map((orderName) => {
      order[orderName] = dat[orderName];
    });

    dealersR.push({
      id: dat.Code,
      name: dat.Name_1,
      email: "heet1476@gmail.com"
    });
    orders.push(order);
  });

   Order.insertMany(orders);
    //  Dealer.insertMany(dealersR.filter(v => v.id && v.name));
  const dealers = await Dealer.find();
  dealers.map(async (dealer,i) => {
    
    const dOrder = orders.filter(order => {
      if (order["Ship to Party"] == dealer.id)
      return order["Ship to Party"] == dealer.id
    });
    
       dealerOrder[dealer.name] = dOrder.map((order) => {
         return {
           TTNO: order.TTNO,
           "Tran. Date": order["Tran. Date"],
           Name: order.Name,
           "Bill Qty": order["Bill Qty"],
            email:dealer.email
         };
       });
    
   
  });
  
  res.json({ dealerOrder});
});
app.get("/dealers", allDealers)
app.post("/dealers/update", updateDealers)
app.get("/dealers/:id",async (req,res) => {
  const { id } = req.params;
  const dealer = await Dealer.find({ id });
  res.json(dealer[0]);
})
app.delete("/dealers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Dealer.findByIdAndRemove(id);
    res.sendStatus(200)
  } catch (error) {
    console.log(error);
    res.sendStatus(500)
  }
 
  
})
const port = 5000 || process.env.PORT;
app.listen(port, () => {
  console.log("listening on port " + port);
});