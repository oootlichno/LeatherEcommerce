exports.seed = function (knex) {
  return knex('categories')
    .del()
    .then(function () {
      return knex('categories').insert([
        { id: 1, name: 'Leather', description: 'Different types of leather materials.' },
        { id: 2, name: 'Hand Tools', description: 'Tools for leather crafting.' },
        { id: 3, name: 'Molds', description: 'Molds used for shaping leather.' },
      ]);
    });
};