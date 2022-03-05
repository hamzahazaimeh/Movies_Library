'use strict'
const express = require("express");
const AllMovie = require("./MovieData/Data.json");
const app = express();

// Get axios so we can send HTTP request to an API 
const axios = require("axios");

//Read the .env file 
const dotenv = require("dotenv");

//start(configure) the .env 
dotenv.config();


//Variabels
const APIKEY = process.env.APIKEY;
const PORT = process.env.PORT;




app.listen(PORT, () => {
    console.log(`Start ON ${PORT} `);
    });



function MovieSpecific(id,title,poster_path,release_date,overview) {
this.id=id;
this.release_date = release_date;
this.title=title;
this.poster_path=poster_path;
this.overview=overview;    
}



app.get('/',homePageHandler);
app.get('/favorite',favoritePageHandler);
app.get('/trending', trendingPageHandler);
app.get('/search', searchPageHandler);

app.use('*',notFoundedHandler);
//Make my server use errorhandler function 
app.use(errorHandler);




function homePageHandler(req,res) {
    let result=[];
    AllMovie.data.forEach((value)=>{
        let oneMovie = new MovieSpecific(value.id ||"N/A",value.title || "N/A", value.release_date ||"N/A", value.poster_path || "N/A", value.overview || "N/A");
        result.push(oneMovie);

    }).catch(error => {
        errorHandler(error, req, res);
    });
   return res.status(200).json(result);
}




function favoritePageHandler(req,res) {

   return res.status(200).send("Welcome to Favorite Page");
}



function trendingPageHandler(req, res) {




    let result = [];
  // Axios will send an Http request and will return promise 
    // api response : is axios object and we need just data property from it 
     axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                let oneMovie = new MovieSpecific(value.id ||"N/A",value.title || "N/A", value.release_date ||"N/A", value.poster_path || "N/A", value.overview || "N/A");
                result.push(oneMovie);
            });
            return res.status(200).json(result);
        });
}








function searchPageHandler(req, res) {


    // link to query http://localhost:4000/search?Movie=Lord
    const search = req.query.Movie;
    let result = [];
     axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&language=en-US&query=${search}&page=2`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                let oneMovie = new MovieSpecific(value.id ||"N/A",value.title || "N/A", value.release_date ||"N/A", value.poster_path || "N/A", value.overview || "N/A");
                result.push(oneMovie);
            });
            return res.status(200).json(result);
        });


}







function errorHandler(error, req, res) {
    const err = {
        status: 500,
        message: error
    }
    return res.status(404).send(err);
}

function notFoundedHandler(req,res){
  return res.status(404).send("not Found");
}



