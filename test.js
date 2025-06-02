const bcrypt = require("bcrypt");
async function hashPassword(password) {
  const saltRounds = 10;
  console.log(await bcrypt.hash(password, saltRounds));
}

// console.log(await hashPassword("123"));

hashPassword("123");
