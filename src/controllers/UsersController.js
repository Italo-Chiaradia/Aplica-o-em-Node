const {hash, compare} = require("bcryptjs");
const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite");

class UserController {
  async create(request, response) {
    const {name, email, password} = request.body;
    const database = await sqliteConnection();

    const checkIfUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

    if (checkIfUserExists) {
      throw new AppError("Usuário já existe!");
    }

    const hashedPassword = await hash(password, 8);

    await database.run(`
      INSERT INTO users 
      (name, email, password) 
      VALUES 
      (?, ?, ?)
    `, [name, email, hashedPassword]);

    response.status(201).json();
  }

  async update(request, response) {
    const {name, email, old_password, password} = request.body;
    const user_id = request.user.id;

    const database = await sqliteConnection();

    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id]);
    
    if (!user) {
      throw new AppError("Usuário não encontrado!");
    } 

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

    if (userWithUpdatedEmail && userWithUpdatedEmail.id != user.id) {
      throw new AppError("Este email já está em uso!");
    } 

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError("Você precisa informa a senha antiga!");
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);
      if (!checkOldPassword) {
        throw new AppError("Senha antiga nao confere!");
      }
      user.password = await hash(password, 8);
    }

    await database.run(`
      UPDATE users SET
      name = ?,
      email = ?,
      password = ?,
      updated_at = DATETIME('now')
      WHERE id = ?`, [user.name, user.email, user.password, user_id]);

    response.json();
  }
}

module.exports = UserController;