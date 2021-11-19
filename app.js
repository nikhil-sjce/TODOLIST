//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-nikhil:nikhil123@cluster0.t34iz.mongodb.net/todolistDB",{useNewUrlParser : true});

// MONGOOSE SCHEMA
const itemSchema = {
  name : String
};
// MONGOOSE MODEL
const Item = mongoose.model("item",itemSchema);
//Default items
const item1 = new Item({
  name : "Welcme to the todo list!"
});
const item2 = new Item({
  name : "Hit the + button add a new item."
});
const item3 = new Item({
  name : "<- Hit this to delete an item."
});
const defaultItems =  [item1,item2,item3];

// LISTSCHEMA
const listSchema = {
  name : String,
  items : [itemSchema]
}
//List Schema MODEL
const List = mongoose.model("list", listSchema);

app.get("/", function(req, res) {

 Item.find({},function(error,foundItems){
   //console.log(foundItems);
   if(foundItems.length===0){
     // INSERTING MANY IN mongoose
     Item.insertMany(defaultItems,function(err){
       if(err){
         console.log(e);
       }else{
         console.log("Successfully saved default Items!!");
       }
     });
     res.redirect("/");
   }
   else{
     res.render("list",{listTitle: "Today", newListItems: foundItems});
   }

 })



});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listType = req.body.list;
  const newitem = new Item({
    name : itemName
  });
  if(listType === "Today"){
    // MONGOOSE SHORTCUT
    newitem.save();
    res.redirect("/");
  }else{
    List.findOne({name : listType} , function(err,foundList){
      foundList.items.push(newitem);
      foundList.save();
      res.redirect("/" + listType);
    });
  }

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully Deleted!!!");
          res.redirect("/");
      }
      else{
        console.log(err);
      }
    });
  }else{
    List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : checkedItemId}}}, function(err, foundlist){
      if(!err){
        console.log("Successfully deleted Item from list!!!");
      }
      res.redirect("/" + listName);
    });
  }


});


//app.get("/work", function(req,res){
//  res.render("list", {listTitle: "Work List", newListItems: workItems});
//});

//app.get("/about", function(req, res){
//  res.render("about");
//});
//Express Routing parameters
app.get("/:newParameterName", function(req,res){
  const newListName = _.capitalize(req.params.newParameterName);
  //console.log(newListName);
  //findOne returns an object
  List.findOne( {name : newListName} , function(err,foundList){
    if(!err){
        if(!foundList){
          //console.log("Doesnt Exist!!");
          // Create a new list
          const list = new List({
            name : newListName,
            items : defaultItems
          });
          list.save();
          res.redirect("/" + newListName);
        }else{
          //console.log("Already Exists!!");
          //Show an existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items} );
        }
    }else{
      console.log(err);
    }
  });
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully!!!");
});
