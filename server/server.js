const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

let movies = [
  {
    id: 1,
    title: "Venom",
    genre: "Action / Sci-Fi",
    year: 2018,
    status: "Watched",
    rating: 10
  },
  {
    id: 2,
    title: "Venom: Let There Be Carnage",
    genre: "Action / Sci-Fi",
    year: 2021,
    status: "Watched",
    rating: 10
  },
  {
    id: 3,
    title: "Venom: The Last Dance",
    genre: "Action / Sci-Fi",
    year: 2024,
    status: "Watched",
    rating: 8
  },
  {
    id: 4,
    title: "Fast & Furious 7",
    genre: "Action",
    year: 2015,
    status: "Watched",
    rating: 8
  },
  {
    id: 5,
    title: "Gran Turismo",
    genre: "Action / Sport",
    year: 2023,
    status: "Watched",
    rating: 9
  }
];

let nextId = 6;

// GET /api/movies
// Supports filtering with ?genre=... and/or ?status=...
app.get("/api/movies", (req, res) => {
  const { genre, status } = req.query;
  let result = [...movies];

  if (genre) {
    result = result.filter((movie) =>
      movie.genre.toLowerCase().includes(String(genre).toLowerCase())
    );
  }

  if (status) {
    result = result.filter(
      (movie) => movie.status.toLowerCase() === String(status).toLowerCase()
    );
  }

  res.status(200).json(result);
});

// GET /api/movies/:id
app.get("/api/movies/:id", (req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find((item) => item.id === id);

  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }

  res.status(200).json(movie);
});

// POST /api/movies
app.post("/api/movies", (req, res) => {
  const { title, genre, year, status, rating } = req.body;

  if (!title || !genre || !year || !status) {
    return res.status(400).json({
      message: "title, genre, year and status are required"
    });
  }

  const numericYear = Number(year);
  const numericRating = rating === undefined || rating === "" ? null : Number(rating);

  if (!Number.isInteger(numericYear) || numericYear < 1888 || numericYear > 2100) {
    return res.status(400).json({
      message: "year must be a valid year"
    });
  }

  if (numericRating !== null && (!Number.isFinite(numericRating) || numericRating < 0 || numericRating > 10)) {
    return res.status(400).json({
      message: "rating must be between 0 and 10"
    });
  }

  if (!["Watched", "Want to Watch"].includes(status)) {
    return res.status(400).json({
      message: "status must be Watched or Want to Watch"
    });
  }

  const movie = {
    id: nextId++,
    title: String(title).trim(),
    genre: String(genre).trim(),
    year: numericYear,
    status,
    rating: numericRating
  };

  movies.push(movie);
  res.status(201).json(movie);
});

// PATCH /api/movies/:id
app.patch("/api/movies/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = movies.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  const current = movies[index];
  const { title, genre, year, status, rating } = req.body;

  if (title !== undefined && !String(title).trim()) {
    return res.status(400).json({ message: "title cannot be empty" });
  }

  if (year !== undefined) {
    const numericYear = Number(year);
    if (!Number.isInteger(numericYear) || numericYear < 1888 || numericYear > 2100) {
      return res.status(400).json({ message: "year must be a valid year" });
    }
  }

  if (status !== undefined && !["Watched", "Want to Watch"].includes(status)) {
    return res.status(400).json({
      message: "status must be Watched or Want to Watch"
    });
  }

  if (rating !== undefined && rating !== null && rating !== "") {
    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 0 || numericRating > 10) {
      return res.status(400).json({
        message: "rating must be between 0 and 10"
      });
    }
  }

  movies[index] = {
    ...current,
    ...(title !== undefined ? { title: String(title).trim() } : {}),
    ...(genre !== undefined ? { genre: String(genre).trim() } : {}),
    ...(year !== undefined ? { year: Number(year) } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(rating !== undefined ? { rating: rating === "" ? null : Number(rating) } : {})
  };

  res.status(200).json(movies[index]);
});

// DELETE /api/movies/:id
app.delete("/api/movies/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = movies.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  movies.splice(index, 1);
  res.status(204).send();
});

// Fallback for frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Movie Watchlist running at http://localhost:${PORT}`);
});
