require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fetch = require("node-fetch")
const user = require("./schema/user");
const dao = require("./schema/dao");
const Vote = require("./schema/votes");
const app = express();
const PORT = process.env.PORT || 4001;


app.use(cors());
app.use(bodyParser.json());


app.get("/dao/info/:address", async (req, res) => {
    try{    
        const address = req.params.address
        const dao_ = await dao.findOne({ address })
        if(dao_){
            return res.json({ data: dao_ })
        }
    }catch(e){
        console.error(e)
    }
    return res.json({ data: {} })
})
app.post("/dao/:address/add", async (req, res) => {
    const address = req.params.address
    const invoiceId = req.body.invoiceId
    const title = req.body.title
    const desc = req.body.desc
    const txData = req.body.txData
    const owner = req.body.owner
    if(address && invoiceId && title && desc && txData && owner){
        const objx = {}
        objx[invoiceId] = [title, desc, txData, owner]
        await dao.updateOne({ address },{ $push: { proposals : objx } })
        await new Vote({ invoiceId, users: [owner] }).save()
        return res.json({ success: true })
    }
    res.json({ success: false })
})

app.post("/vote/:invoiceId/add", async (req, res) => {
    const invoiceId = req.params.invoiceId
    const address = req.body.address
    if(invoiceId){
      await Vote.updateOne({
        invoiceId
      },{ $push: { users: address } })
      return res.json({ success: true }) 
    }
    res.json({ success: false })
})

app.get("/vote/:invoiceId", async (req, res) => {
    const invoiceId = req.params.invoiceId
    if(invoiceId){ 
        const data = await Vote.findOne({ invoiceId })
        if(data){
            return res.json({ data })
        }
    }
    res.json({ data: { invoiceId, users: [] } })
})

app.post("/dao/create", async (req, res) => {
  try {
    const users = req.body.users;
    const address = req.body.address;
    const cid = req.body.cid;
    if (users && address && cid) {
      const bulkWrite = [];
      const nd = await new dao({ address, users, cid }).save();
      console.log(nd)
      for (let u of users) {
        bulkWrite.push({
          updateOne: {
            filter: { address: u },
            update: { $push: { daolist: address } },
            upsert: true,
          },
        });
      }
      await user.bulkWrite(bulkWrite);
      return res.json({ success: true });
    }
  } catch (e) {
    console.error(e);
  }

  res.json({ success: false });
});

app.get("/user/:address", async (req, res) => {
  try {
    const address = req.params.address;
    if (address) {
      const user_ = await user.findOne({ address });
      if (user_) {
        const daolist = []
        for(let d of user_.daolist){
            const dao_data = await dao.findOne({ address: d })
            const extras = await(await fetch(`https://${dao_data.cid}.ipfs.cf-ipfs.com`)).json()
            console.log(extras)
            
            daolist.push({ ...extras, ...dao_data.toJSON()  })
        }
        
        return res.json({ data: { daolist } });
      }
    }
    res.json({ data: { daolist: [] } });
  } catch (e) {
    console.error(e);
  }
});

app.listen(PORT, () => {
  mongoose.connect(process.env.MONOG_URI);
  console.log(`API started on ${PORT}`);
});
