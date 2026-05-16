// Миграция — исправление статуса активности пользователей

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Активируем всех пользователей
  await knex('users').update({ is_active: true });
  
  // Проверяем что у всех пользователей is_active = true
  const users = await knex('users').select('id', 'username', 'is_active');
  console.log('Users after fix:', users);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // При откате ничего не делаем — не хотим деактивировать пользователей обратно
};
