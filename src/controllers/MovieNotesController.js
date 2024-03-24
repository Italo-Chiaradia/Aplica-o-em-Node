const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class MovieNotesController {
  async create(request, response) {
    const {title, description, rating, tags} = request.body;
    const {user_id} = request.params;

    const checkIfUserExists = await knex("users").where({id:user_id}).first();

    if (!checkIfUserExists) {
      throw new AppError("Usuário não encontrado!");
    }

    const [note_id] = await knex("movie_notes").insert({
      title, 
      description,
      rating,
      user_id
    });

    const insertTags = tags.map(tag => {
      return {
        note_id,
        user_id,
        name: tag
      }
    })

    await knex("movie_tags").insert(insertTags);

    response.status(201).json();
  } 
  async show(request, response) {
    const {id} = request.params;

    const movie_note = await knex("movie_notes").where({id}).first();
    const movie_tags = await knex("movie_tags").where({note_id: id}).orderBy("name");

    response.json({
      ...movie_note, 
      movie_tags
    });
  }
  async delete(request, response) {
    const {id} = request.params;

    await knex("movie_notes").where({id}).delete();

    response.json();
  }
  async index(request, response) {
    const {title, user_id, tags} = request.query;
    let movie_notes;
    if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim());
      movie_notes = await knex("movie_tags")
        .select([
          "movie_notes.id",
          "movie_notes.title",
          "movie_notes.user_id"
        ])
        .where("movie_notes.user_id", user_id)
        .whereLike("movie_notes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("movie_notes", "movie_notes.id", "movie_tags.note_id")
        .orderBy("movie_notes.title");

    } else {
      movie_notes = await knex("movie_notes")
        .where({user_id})
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const userTags = await knex("movie_tags").where({user_id});
    const movieNotesWithTags = movie_notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id);
      return {
        ...note,
        tags: noteTags
      };
    })

    response.json(movieNotesWithTags);
  }
  async update(request, response) {
    const {title, description, rating} = request.body;
    const {id} = request.params;

    const movie_note = await knex("movie_notes").where({id}).first();
    if (!movie_note) {
      throw new AppError("Essa nota não existe!");
    }

    movie_note.title = title ?? movie_note.title;
    movie_note.description = description ?? movie_note.description;
    movie_note.rating = rating ?? movie_note.rating;

    await knex("movie_notes").where({id}).update({
      title: movie_note.title,
      description: movie_note.description,
      rating: movie_note.rating,
      updated_at: knex.fn.now()
    })
    response.json();
  }
}

module.exports = MovieNotesController;