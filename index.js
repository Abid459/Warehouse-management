const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express()
// const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('This is Backend server')
})










const uri = `mongodb+srv://Abid:${process.env.DB_USER_PASSWORD}@cluster0.zhnwx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('client', client)

async function run() {
    try {
        await client.connect();
        const database = client.db('db_wareHouse');
        const productsCollection = database.collection('productsCollection')


        // Load products
        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray();
            res.send(products);
        })

        //count products
        app.get('/countProducts', async (req, res) => {
            const count = await productsCollection.countDocuments();
            // const count = await productsCollection.countDocuments();
            res.send({ count })
        })


        //get price of all products
        app.get('/allPrice', async (req, res) => {
            const price = await productsCollection.distinct('price', {})
            res.send(price)
        })



        //Low stock products
        app.get('/lowStock', async (req, res) => {
            const query = { quantity: { $lt: 10 } };
            const cursor = productsCollection.find(query)
            const lowStock = await cursor.toArray();
            res.send(lowStock)
        })


        // delete product
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = productsCollection.deleteOne(query)
            res.send(result);
        })

        //update quantity
        app.put('/productQuantitty/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updatedQuantity = req.body
            console.log(updatedQuantity)
            const updateddoc = {
                $set: {
                    quantity: updatedQuantity.quantity,
                    sold: updatedQuantity.sold
                }
            }
            const result = await productsCollection.updateOne(filter, updateddoc)
            res.send(result)
        })

        //Add (post) a item
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct)
            res.send(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);











app.listen(port, () => {
    console.log("Lisitening to port ", port)
})