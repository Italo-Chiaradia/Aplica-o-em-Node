const {Router} = require("express");
const MovieNotesController = require("../controllers/MovieNotesController");
const movieNotesRouter = Router();
const movieNotesController = new MovieNotesController();

const ensureAuthenticated = require("../middleware/ensureAuthenticated");

movieNotesRouter.post("/", ensureAuthenticated, movieNotesController.create);
movieNotesRouter.get("/:id", ensureAuthenticated, movieNotesController.show);
movieNotesRouter.delete("/:id", ensureAuthenticated, movieNotesController.delete);
movieNotesRouter.get("/", ensureAuthenticated, movieNotesController.index);
movieNotesRouter.put("/:id", ensureAuthenticated, movieNotesController.update);

module.exports = movieNotesRouter;