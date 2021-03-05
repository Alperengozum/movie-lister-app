const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const Movie = require("./Models/Movie");
const moment = require("moment");

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
      Movie.findOne({id: movieID})
        .then((e) => {
          if (e) {
            res
              .json(e)
          } else {
            res
              .status(400)
              .json({message: "This ID is not valid ID"})
          }
        })

    } else {
      res
        .status(400)
        .json({message: "Movie id cannot be null"})
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

server.post("/movie/create/", async (req, res) => {
  const movie = req.body;
  try {
    if (movie.releaseYear != null && movie.movieName != null && movie.type != null) {
      await Movie.findOne({movieName: movie.movieName}, {}, async (error, movieR) => {
        if (movieR) {
          res.status(400).json({message: "This movie is already exist."})
        } else {
          await Movie.findOne({id: movie.id});
          const newMovie = new Movie();
          await newMovie.id = Movie.count({}) + 1;
          if (!(movie.releaseYear > 1900 && movie.releaseYear < moment().add({year: 3}).year())) {
            throw new Error("Invalid release year");
          }
          console.log(newMovie.id)
          newMovie.releaseYear = movie.releaseYear;
          newMovie.movieName = movie.movieName;
          newMovie.type = movie.type;
          if (movie.details) {
            newMovie.details = movie.details
          }
          if (movie.rate) {
            newMovie.rate = movie.rate
          } else {
            newMovie.rate = 0
          }
          await newMovie
            .save()
            .then((r) => {
              console.log(r);
              res
                .json({message: "New movie added"})
            })


        }
      })
    } else {
      res.status(400).json({
        message: "ID, Release Year , Movie Name , Movie Type cannot be null"
      })

    }
  } catch (e) {
    res.status(403).json({
      message: e
    })
  }

})


server.patch("/movie/rate/", (req, res) => {
    /* gelecek olan veri örneği {id:33 , rate:0-5} */
    const detail = req.body;
    if (detail.id != null && detail.rate != null) {
      console.log(typeof detail.id)
      if (typeof detail.id === "number" && typeof detail.rate === "number") {
        if (detail.rate <= 5 && detail.rate >= 0) {
          Movie.findOneAndUpdate({id: detail.id}, {rate: detail.rate}, (error, doc) => {
            if (error) {
              res.status(500).json({
                message: "Some problem happened when Machine is trying to set new Rate value"
              })
            } else {
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