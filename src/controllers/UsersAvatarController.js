const knex = require("../database/knex");
const DiskStorage = require("../providers/DiskStorage");
const AppError = require("../utils/AppError");

class UsersAvatarController { 
  async update(request, response) {
    // Pega id do usuario e filename do arquivo passado
    const user_id = request.user.id;
    const avatarFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    // busca usuário no bd e verifica se ele existe
    const user = await knex("users").where({id: user_id}).first();

    if (!user) {
      throw new AppError("Somente usuários autenticados podem mudar o avatar", 401);
    }

    // se usuario ja tem uma foto entao ela e deletada
    if (user.avatar) {
      await diskStorage.deleteFile(user.avatar);
    }

    // armazena foto do usuario no uploads folder e atualiza campo avatar
    const filename = await diskStorage.saveFile(avatarFilename);
    user.avatar = filename;

    await knex("users").update(user).where({id: user_id});

    return response.json(user);
  }
}

module.exports = UsersAvatarController;