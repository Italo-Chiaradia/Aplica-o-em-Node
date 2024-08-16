const moment = require('moment-timezone');
exports.up = knex => knex.schema.createTable("movie_notes", (table) => {
  table.increments("id");

  table.text("title").notNullable();
  table.text("description").notNullable();

  table.integer("rating").notNullable().unsigned().checkIn([1,2,3,4,5]);
  table.integer("user_id").references("id").inTable("users");

  const now = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
  table.timestamp("created_at").defaultTo(now);
  table.timestamp("updated_at").defaultTo(now);
});

exports.down = knex => knex.schema.dropTable("movie_notes");
