//Usamos o EJS (Embedded JavaScript templating) para poder manipular objetos html,
//dessa forma podemos reutilizar um mesmo arquivo html como se fosse um template,
//assim não precisamos criar vários documentos html que diferem muito pouco entre si.

//Uma boa prática é utilizar o "let" para declararmos variáveis pois, dentro do escopo de:
//uma função: var, let e const são locais;
//fora de uma função: var, let e const são globais;
//dentro de um bloco de código i.e if/else, for/while: var é GLOBAL, let e const são locais.

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); //para poder carregar os aquivos estaticos do site, i.e css, plain javascript
app.set("view engine","ejs");

let newListItems = ["Cluster with tacometer for the clio","Coilover suspension","Refurbish the 14'"];
let workListItems = [];

app.get("/", function(req, res){
   
    let dia = date.getDay();

    res.render("list",{ //o valor chave é o nome da variável a ser modificada no .ejs
        title: dia,  
        newListItems: newListItems
    });

});

app.post("/",function(req,res){
    let newListItem = req.body.newItem;
   
    if(req.body.botaoLista === "Trabalho"){
        workListItems.push(newListItem);
        res.redirect("/work");
    }else{
        newListItems.push(newListItem);
        res.redirect("/");
    }
    
});

app.get("/work",function(req,res){
    res.render("list", {
        title: "Trabalho",
        newListItems: workListItems
    });
});

app.get("/about",function(req,res){
    res.render("about");
});

const port = process.env.PORT || 3000;

app.listen(port, function(){
    console.log("Servidor iniciou na porta: " + port);
}); 