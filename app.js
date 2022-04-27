const createError = require("http-errors"); // to handle the server errors
const express = require("express");
const path = require("path");  // to refer to local paths
const cookieParser = require("cookie-parser"); // to handle cookies
const session = require("express-session"); // to handle sessions using cookies
const bodyParser = require("body-parser"); // to handle HTML form input
const debug = require("debug")("personalapp:server"); 
const layouts = require("express-ejs-layouts");
const axios = require('axios')
const app = express();
const ShoppingList = require('./models/shopping');

// Connecting to the database
const mongoose = require('mongoose');
// const mongodb_URL = 'mongodb+srv://admin:12345@cluster0.gppo4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const mongodb_URI = process.env.mongodb_URI;
mongoose.connect(mongodb_URI, {useNewUrlParser: true, useUnifiedTopology:true});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log('we are connected!!!')});
// Here we specify that we will be using EJS as our view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(layouts);

// Here we process the requests so they are easy to handle
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

// Here we specify that static files will be in the public folder
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res, next) => {
    res.render("index");
  });


app.get("/shoppingList", 
async (req, res, next) => {
    let items = await ShoppingList.find({});
    res.locals.items = items;
    res.render("shoppingList");
});

app.get("/updateForm/:itemId", 
async (req, res, next) => {
    const id = req.params.itemId;
    let item = await ShoppingList.findOne({_id:id});
    app.locals.id = id;
    res.locals.name = item['name'];
    res.locals.price= item['price'];
    res.locals.date = item['date'];
    res.locals.category = item['category'];
    res.render("updateForm");
});

app.get("/shoppingList/delete/:itemId", 
async (req, res, next) => {
    try{
      const id = req.params.itemId;
      await ShoppingList.deleteOne({_id:id});
      res.redirect("/shoppingList")
    } catch(e){
      next(e)
    }
});




app.get("/addForms", (req, res, next) => {
    res.render("addForms");
  });

  app.post("/simpleForm", (req, res, next) => {
    try{
      const name = req.body.name;
      const price = req.body.price;
      const category = req.body.category;
      const date = req.body.date;
      let data = {name, price, category, date}
      let item = new ShoppingList(data)
      item.save();
    } catch(e) {
      next(e)
    }
  })

    app.post("/simpleForm/update", 
    async(req, res, next) => {
      try{
        await ShoppingList.deleteOne({_id:app.locals.id})
        const name = req.body.name;
        const price = req.body.price;
        const category = req.body.category;
        const date = req.body.date;
        let data = {name, price, category, date}
        let item = new ShoppingList(data)
        item.save();
        res.redirect("/shoppingList")
      } catch(e) {
        next(e)
      }
  })



// const port = "5000";
const port = process.env.PORT || "5000";
console.log('connecting on port '+port)
app.set("port", port);

// and now we startup the server listening on that port
const http = require("http");
const { application } = require("express");
const server = http.createServer(app);

server.listen(port);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

server.on("error", onError);

server.on("listening", onListening);

module.exports = app;