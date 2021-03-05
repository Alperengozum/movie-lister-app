import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/movie"
})

export const getMovie = (movie) => api.get("/movie/" + movie)
export const getMovies = () => api.get("/movies")
export const createMovie = (movieName, rate, releaseYear, type, details) => api.post("/create/", {
  movieName,
  rate,
  releaseYear,
  type,
  details:details //if key and value parameter name is same, dont use samename:samename
})
export const changeRate = (id, newRate) => api.patch("/rate/", {id: id, rate: newRate})


const apis = {
  getMovie,
  getMovies,
  createMovie,
  changeRate

}

export default apis