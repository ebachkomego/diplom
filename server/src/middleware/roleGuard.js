// Middleware проверки ролей — разграничение доступа по ролям пользователей

// Принимает список разрешённых ролей и проверяет, имеет ли текущий пользователь доступ
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    // Проверяем, что пользователь прошёл аутентификацию
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация.' });
    }

    // Администратор имеет доступ ко всему
    if (req.user.role === 'администратор') {
      return next();
    }

    // Проверяем, входит ли роль пользователя в список разрешённых
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Доступ запрещён. Недостаточно прав для выполнения данного действия.',
        required_roles: allowedRoles,
        current_role: req.user.role
      });
    }

    next();
  };
};

module.exports = roleGuard;
