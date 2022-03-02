'use strict'
const express = require("express");
const AllMovie = require("./MovieData/Data.json");
const app = express();

app.listen(4000, () => {
    console.log(" Start ");
    });


function MovieSpecific(title,poster_path,overview) {
this.title=title;
this.poster_path=poster_path;
this.overview=overview;    
}


app.get('/',homePageHandler);
app.get('/favorite',favoritePageHandler);


function homePageHandler(req,res) {
    let result=[];
    AllMovie.data.forEach((value)=>{
        let oneMovie=new MovieSpecific(value.title,value.poster_path,value.overview);
        result.push(oneMovie);

    });
   return res.status(200).json(result);
}


function favoritePageHandler(req,res) {

   return res.status(200).send("Welcome to Favorite Page");
}



