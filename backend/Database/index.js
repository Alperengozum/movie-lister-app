const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const Movie = require("./Models/Movie")

const server = express();
server.use(express.json());
server.use(cors());
server.use(morgan("dev"));

mongoose.connect("mongodb://localhost/movie", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  console.log("Database'e erişim sağlandı.");
}).catch(() => {
  console.log("Database'e bağlanırken bir hata oldu, çözer misin acep?");
})

server.get("/movie/movie/:id", (req, res) => {
    const movieID = req.params.id;

    if (movieID) {
      Movie.findOne({id: movieID}).then((e) => {
        if (e) {
          res.json(e)
        } else {
          res.status(400).json({message: "This ID is not valid ID"})
        }
      })

    } else {
      res.status(400).json({message: "Movie id cannot be null"})
    }
  }
)

server.get("/movie/movies", (req, res) => {
  Movie.find({}, {}, (error, movies) => {
    if (error) {
      res.status(400).json({
        message: "Error happened when gettin Movies"
      })
    } else {
      res.json({movies})
    }
  })
})

server.post("/movie/create/", (req, res) => {
  const movie = req.body;
  if (movie.id != null && movie.releaseYear != null && movie.movieName != null && movie.type != null) {
    Movie.findOne({movieName: movie.movieName},{},(error,movieR)=> {
      if (movieR) {
        res.status(400).json({message: "This movie is already exist."})
      } else {Movie.findOne({id:movie.id},{}, (error,movieR)=> {
        if (movieR) {
          console.log(movieR)
          /* bu error u kullanma! */
          /* Bu id database de var bundan dolayı yeni bir id ataması yapabiliriz */
            console.log("Id is not well")
        } else {
          const newMovie = new Movie();
          newMovie.id= movie.id;
          newMovie.releaseYear = movie.releaseYear;
          newMovie.movieName = movie.movieName;
          newMovie.type=movie.type;
          if (movie.details){
            newMovie.details=movie.details}
          if (movie.rate) {
            newMovie.rate=movie.rate
          }else {newMovie.rate=0}
          newMovie.save().then((r)=> {
            console.log(r);
            res.json({message:"New movie added"})
          }).catch(error => {
            console.log(error);
            res.json({message:"It seems movie model is not right"})
          })
        }
      })

      }
    })
    }
   else {
    res.status(400).json({
      message: "ID, Release Year , Movie Name , Movie Type cannot be null"
    })

  }

})


server.patch("/movie/rate/", (req, res) => {
    /* gelecek olan veri örneği {id:33 , rate:0-5} */
    const detail = req.body;
    if (detail.id != null && detail.rate != null) {
      console.log(typeof detail.id)
      if (typeof detail.id === "number" && typeof detail.rate === "number"){
        if (detail.rate <= 5 && detail.rate >= 0) {
          Movie.findOneAndUpdate({id: detail.id}, {rate: detail.rate}, (error, doc) => {
            if (error) {
              res.status(500).json({
                message: "Some problem happened when Machine is trying to set new Rate value"
              })
            }else {
              res.json({message: "Successful"})
            }
          })
        } else {
          res.status(402).json({
            message: "Rate cannot be higher than 5 or lower than 0"
          })
        }
      } else {
        res.status(401).json({
          message: "ID and Rate must be number"
        })
      }
    } else {
      res.status(400).json({
        message: "ID and Rate cannot be null"
      })
    }

  }
)


server.listen(8000, () => {
  console.log("Server is started rn!")
})