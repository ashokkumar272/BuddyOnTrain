const express = require('express')
const dotenv = require('dotenv')
const path = require('path');
const cors = require('cors');
const trainRoute = require('./routes/findTrain');


dotenv.config()

const app = express()
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs')


app.get('/', (req, res)=>{
    res.render('index')
})

app.use('/api', trainRoute)

app.listen(4000, ()=>{
    console.log("server running")
})
