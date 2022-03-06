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

app.put("/updateMovie/:id",updateMovie);
app.delete("/delete/:id",deleteMovie);
app.get("/getMovie/:id",getMovie);



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



///////// Task 14 - End point to update delete and get movie 


function updateMovie (req, res) {
    //get id from body
    const id = req.params.id;
    //get the data from body
    const new_movie = req.body;
    //statment for database 
    const sqlstatment = `UPDATE NewMovie SET title=$1, release_date=$2, poster_Path=$3, overview=$4, comment=$5 WHERE id=$6 RETURNING *;`;
      const values = [new_movie.title,new_movie.release_date,new_movie.poster_path,new_movie.overview,new_movie.comment,id];
      client.query(sqlstatment, values).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    })
  
  };
  


  function deleteMovie (req, res)  {
       //get id from body
    const id = req.params.id;
  //statment for database
    const sqlstatment = `DELETE FROM NewMovie WHERE id=$1;`
    const values = [id];
    client.query(sqlstatment, values).then(() => {
      return res.status(204).json({})
  }).catch(error => {
      errorHandler(error, req, res);
  })
  };
  

  
  function getMovie (req, res) {
       //get id from body
    let id = req.params.id;
      //statment for database
    const sqlstatment = `SELECT * FROM NewMovie WHERE id=$1;`;
    const values = [id];
  
    client.query(sqlstatment, values).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res)
    })
  };
  




function notFoundedHandler(req,res){
    return res.status(404).send("not Found");
  }



function errorHandler(error, req, res) {
    const err = {
        status: 500,
        message: error
    }
    return res.status(404).send(err);
}



client.connect()
.then(() =>{
    app.listen(PORT, () => {
        console.log(`Start ON ${PORT} `);
        });
});

