const {Router} = require("express");
const MovieTagsController = require("../controllers/MovieTagsController");
const movieTagsRouter = Router();
const movieTagsController = new MovieTagsController();

movieTagsRouter.get("/:user_id", movieTagsController.index);


module.exports = movieTagsRouter;