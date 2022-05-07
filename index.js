const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express()
// const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('This is Backend server')
})


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decode) => {
        if (error) {
            return res.status(403).send({ message: 'Access Forbiden' })
        }
        req.decoded = decode;
        next();
    })
    console.log('Inside verify jwt', authHeader)
}







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


        //load my product
        app.get('/products/myProducts/:email', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.params.email;
            if (email === decodedEmail) {
                const query = { userEmail: email }
                const cursor = productsCollection.find(query)
                const products = await cursor.toArray();
                res.send(products);
            }
            else{
                res.status(403).send({message:'forbidden access'})
            }
        })

        //jwt
        app.post('/login', (req, res) => {
            const user = req.body
            console.log('jwt email', user)
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '4d'
            });
            res.send(accessToken)
        });

        //load six product
        app.get('/productsSix', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query)
            const products = await cursor.limit(6).toArray();
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


        //Restock
        app.put('/productRestock/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updatedQuantity = req.body
            console.log(updatedQuantity)
            const updateddoc = {
                $set: {
                    quantity: updatedQuantity.quantity,
                }
            }
            const result = await productsCollection.updateOne(filter, updateddoc)
            res.send(result)
        })

        //Update info
        app.put('/updateInfo/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updatedInfo = req.body
            console.log(updatedInfo)
            const options = { upsert: true }
            const updateddoc = {
                $set: {
                    price: updatedInfo.buyingPrice,
                    SellPrice: updatedInfo.sellingPrice,
                    supplier: {
                        name: updatedInfo.supplierName,
                        email: updatedInfo.supplierEmail,
                        phone: updatedInfo.supplierPhone
                    }
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