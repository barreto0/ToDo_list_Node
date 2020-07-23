//Usamos o EJS (Embedded JavaScript templating) para poder manipular objetos html,
//dessa forma podemos reutilizar um mesmo arquivo html como se fosse um template,
//assim não precisamos criar vários documentos html que diferem muito pouco entre si.

//Uma boa prática é utilizar o "let" para declararmos variáveis pois, dentro do escopo de:
//uma função: var, let e const são locais;
//fora de uma função: var, let e const são globais;
//dentro de um bloco de código i.e if/else, for/while: var é GLOBAL, let e const são locais.

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); //para poder carregar os aquivos estaticos do site, i.e css, plain javascript
app.set("view engine","ejs");

mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser:true, useUnifiedTopology:true})
.then(() => console.log('DB Connected!'))
.catch(err => {
console.log("DB Connection Error: "+err.message);
});//especifica a porta por onde acessaremos o nosso banco de dados
// se o banco de dados especificado (carsDB) não existe ele cria um novo com esse nome

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name field missing!"]
    }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todo list!"
});

const item2 = new Item({
    name: "Hit de + to add a new item to your list"
});

const item3 = new Item({
    name: "<-- Click the checkbox to cross-out an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name field missing!"]
    },
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

let dia = date.getDay();

app.get("/", function(req, res){

    let dia = date.getDay();

    Item.find(function(err, items){
        if(items.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err.message);
                }else{
                    console.log("Default data inserted, no errors!");
                }
            });
            res.redirect("/");
        }else{
            if(err){
                console.log(err.message);
            }else{
                res.render("list",{ //o valor chave é o nome da variável a ser modificada no .ejs
                    title: dia,  
                    newListItems: items
                });
            }
        }
    });
});

app.post("/",function(req,res){

    const itemName = req.body.newItem;
    const listName = req.body.botaoLista; //name button submit

    const item = new Item({
        name: itemName
    });

    if(listName === dia){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err,result){
            if(err){
                console.log(err.message);
            }else{
            result.items.push(item);
            result.save();
            res.redirect("/"+listName);
            }
        });
    }
});

app.post("/delete", function(req,res){
    const checkboxItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === dia){
        Item.findByIdAndDelete(checkboxItemId, function(err){
            if(err){
                console.log(err.message);
            }else{
                console.log("Item removed with no errors!");
            }
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkboxItemId}}}, function(err, result){
            if(err){
                console.log(err.message);
            }else{
                res.redirect("/"+listName);
            }
        });//The $pull operator removes from an existing array 
           //all instances of a value or values that match a specified condition.
    }
});

app.get("/:customListName", function(req,res){

    const listName = _.capitalize(req.params.customListName); //primeira letra sempre maiúscula, assim qualquer url digita resultará na mesma lista

    List.findOne({name: listName}, function(err, result){
        if(err){
            console.log(err.message);
        }else{
            if(!result){
                //cria uma nova lista
                const list = new List({
                    name: listName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+listName);
            }else{
                //mostra uma lista já existente
                res.render("list", {title: result.name, newListItems: result.items});
            }
        }
    });
});

app.get("/about",function(req,res){
    res.render("about");
});

const port = process.env.PORT || 3000;

app.listen(port, function(){
    console.log("Servidor iniciou na porta: " + port);
}); 