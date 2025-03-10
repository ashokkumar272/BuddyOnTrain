const express = require('express')
const dotenv = require('dotenv')
const path = require('path');
const cors = require('cors');
const trainRoute = require('./routes/findTrainRoute');
const connectToDB = require('./config/db')

dotenv.config()
connectToDB()
const PORT = process.env.PORT || 5000;

const app = express()
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs')


app.get('/', (req, res)=>{
    res.send("server running")
})

app.use('/api', trainRoute)

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

