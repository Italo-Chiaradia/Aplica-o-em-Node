const {Router} = require("express");
const UsersController = require("../controllers/UsersController");
const userRoutes = Router();
const usersController = new UsersController();

userRoutes.post("/", usersController.create);
userRoutes.put("/:user_id", usersController.update)

module.exports = userRoutes;