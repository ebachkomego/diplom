exports.up = async function(knex) {
  const hasUser = await knex('settings').where({ key: 'smtp_user' }).first();
  if (!hasUser) {
    await knex('settings').insert({ key: 'smtp_user', value: 'bgdfs0422@gmail.com' });
  }
  const hasPass = await knex('settings').where({ key: 'smtp_pass' }).first();
  if (!hasPass) {
    await knex('settings').insert({ key: 'smtp_pass', value: 'aatb akue uouh imme' });
  }
};

exports.down = function(knex) {
  return knex('settings').whereIn('key', ['smtp_user', 'smtp_pass']).delete();
};