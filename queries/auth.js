// userQueries.js

export const checkUserByEmail = (email) => {
    return `SELECT * FROM users WHERE email = '${email}'`;
  };
  
  export const insertUser = (name, email, hashedPassword, role) => {
    return `
      INSERT INTO users (name, email, password, role_id, created_at, updated_at) 
      VALUES ('${name}', '${email}', '${hashedPassword}', '${role}', CAST(NOW() AS DATETIME), CAST(NOW() AS DATETIME))
    `;
  };
  