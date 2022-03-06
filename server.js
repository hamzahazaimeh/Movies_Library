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
const DATABASE_URL = process.env.DATABASE_URL;

//
const pg = require("pg");

const client = new pg.Client(DATABASE_URL)






function MovieSpecific(id,title,poster_path,release_date,overview) {
this.id=id;
this.release_date = release_date;
this.title=title;
this.poster_path=poster_path;
this.overview=overview;    
}

app.use(express.json());

app.get('/',homePageHandler);
app.get('/favorite',favoritePageHandler);
app.get('/trending', trendingPageHandler);
app.get('/search', searchPageHandler);
app.post('/addMovie',addMovieHandler);
app.get('/getMovies',getMoviesHandler)





//Make my server use errorhandler function 
app.use(errorHandler);

app.use('*',notFoundedHandler);






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




function addMovieHandler(req, res) {
   // console.log(req.body);
  
    const new_movie = req.body;
    const sql = `INSERT INTO NewMovie(release_date,title,poster_path,overview,my_comment) VALUES($1,$2,$3,$4,$5) RETURNING * `;
 
    const values = [new_movie.release_date, new_movie.title, new_movie.poster_path, new_movie.overview,new_movie.my_comment];
    client.query(sql, values).then((result) => {
        res.status(201).json(result.rows);
    }).catch(error => {
        errorHandler(error, req, res);
    });
    
}



function getMoviesHandler(req,res) {
    const sql = `SELECT * FROM NewMovie `;
    client.query(sql).then((result) => {
        res.status(201).json(result.rows);
    }).catch(error => {
        errorHandler(error, req, res);
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



client.connect()
.then(() =>{
    app.listen(PORT, () => {
        console.log(`Start ON ${PORT} `);
        });
});

