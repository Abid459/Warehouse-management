const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express()
// const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


app.get('/', (req,res)=>{
    res.send('This is Backend server')
})










const uri = `mongodb+srv://Abid:${process.env.DB_USER_PASSWORD}@cluster0.zhnwx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('client',client)

async function run(){
    try{
        await client.connect();
        const database = client.db('db_wareHouse');
        const productsCollection = database.collection('productsCollection')


        // Load products
        app.get('/products', async(req,res)=>{
            const query = {}
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray();
            res.send(products);
        })

        //count products
        app.get('/countProducts',async(req,res)=>{
            const count = await productsCollection.countDocuments();
            // const count = await productsCollection.countDocuments();
            res.send({count})
        })


        //get price of all products
        app.get('/allPrice',async(req,res)=>{
            const price = await productsCollection.distinct('price',{})
            res.send(price)
        })



        //Low stock products
        app.get('/lowStock',async(req,res)=>{
            const query = { quantity : { $lt: 10  } };
            const cursor = productsCollection.find(query)
            const lowStock = await cursor.toArray();
            res.send(lowStock)
        })
    }
    catch(error){
        console.log(error)
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);











app.listen(port,()=>{
    console.log("Lisitening to port ",port)
})