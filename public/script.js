const form = document.getElementById("movie-form");
const movieList = document.getElementById("movie-list");
const emptyState = document.getElementById("empty-state");
const formMessage = document.getElementById("form-message");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-btn");
const cancelEditButton = document.getElementById("cancel-edit");

const movieId = document.getElementById("movie-id");
const titleInput = document.getElementById("title");
const genreInput = document.getElementById("genre");
const yearInput = document.getElementById("year");
const statusInput = document.getElementById("status");
const ratingInput = document.getElementById("rating");

const filterGenre = document.getElementById("filter-genre");
const filterStatus = document.getElementById("filter-status");

async function loadMovies() {
  const params = new URLSearchParams();

  if (filterGenre.value) {
    params.set("genre", filterGenre.value);
  }

  if (filterStatus.value) {
    params.set("status", filterStatus.value);
  }

  const query = params.toString();
  const response = await fetch(`/api/movies${query ? `?${query}` : ""}`);

  if (!response.ok) {
    throw new Error("Unable to load movies");
  }

  const movies = await response.json();
  renderMovies(movies);
}

function renderMovies(movies) {
  movieList.innerHTML = "";
  emptyState.classList.toggle("hidden", movies.length !== 0);

  movies.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "movie-card";

    const ratingText = movie.rating === null ? "No rating" : `⭐ ${movie.rating}/10`;

    card.innerHTML = `
      <div>
        <span class="movie-number">#${movie.id}</span>
        <h3>${escapeHtml(movie.title)}</h3>
        <div class="meta">${escapeHtml(movie.genre)} • ${movie.year}</div>
        <div class="badges">
          <span class="badge ${movie.status === "Watched" ? "watched" : ""}">
            ${movie.status === "Watched" ? "✓" : "○"} ${movie.status}
          </span>
          <span class="badge">${escapeHtml(ratingText)}</span>
        </div>
      </div>

      <div class="card-actions">
        <button class="btn btn-edit" onclick="startEdit(${movie.id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteMovie(${movie.id})">Delete</button>
      </div>
    `;

    movieList.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const payload = {
    title: titleInput.value.trim(),
    genre: genreInput.value,
    year: Number(yearInput.value),
    status: statusInput.value,
    rating: ratingInput.value === "" ? null : Number(ratingInput.value)
  };

  const id = movieId.value;
  const isEditing = Boolean(id);

  try {
    const response = await fetch(isEditing ? `/api/movies/${id}` : "/api/movies", {
      method: isEditing ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = response.status === 204 ? null : await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Request failed");
    }

    formMessage.textContent = isEditing
      ? "Movie updated successfully."
      : "Movie added successfully.";

    resetForm();
    await loadMovies();
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.style.color = "#ff8991";
  }
});

async function startEdit(id) {
  try {
    const response = await fetch(`/api/movies/${id}`);

    if (!response.ok) {
      throw new Error("Movie not found");
    }

    const movie = await response.json();

    movieId.value = movie.id;
    titleInput.value = movie.title;
    genreInput.value = movie.genre;
    yearInput.value = movie.year;
    statusInput.value = movie.status;
    ratingInput.value = movie.rating ?? "";

    formTitle.textContent = "Edit Movie";
    submitButton.textContent = "Save Changes";
    cancelEditButton.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    alert(error.message);
  }
}

async function deleteMovie(id) {
  if (!confirm("Delete this movie?")) {
    return;
  }

  try {
    const response = await fetch(`/api/movies/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Delete failed");
    }

    await loadMovies();
  } catch (error) {
    alert(error.message);
  }
}

function resetForm() {
  form.reset();
  movieId.value = "";
  statusInput.value = "Watched";
  formTitle.textContent = "Add a Movie";
  submitButton.textContent = "+ Add Movie";
  cancelEditButton.classList.add("hidden");
}

cancelEditButton.addEventListener("click", () => {
  resetForm();
  formMessage.textContent = "";
  formMessage.style.color = "";
});

filterGenre.addEventListener("change", loadMovies);
filterStatus.addEventListener("change", loadMovies);

loadMovies().catch((error) => {
  movieList.innerHTML = `<p class="empty">Unable to connect to the server.</p>`;
  console.error(error);
});
