require("dotenv").config();
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);

const uuid = require("uuid");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const createTables = async () => {
  const SQL = /* sql */ `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;

    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(20) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE products(
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE favorites(
      id UUID PRIMARY KEY,
      product_id UUID REFERENCES products(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL
      CONSTRAINT user_product_unique UNIQUE(user_id, product_id)
    );
  `;
  await client.query(SQL);
};

const createUser = async ({ username, password }) => {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const SQL = /* sql */ `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
  `;

  const response = await client.query(SQL, [uuid.v4(), username, hashedPassword]);
  return response.rows[0];
};

const createProduct = async ({ name }) => {
  const SQL = /* sql */ `
    INSERT INTO products(id, name) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const fetchUsers = async () => {
  const SQL = /* sql */ `
    SELECT id, username FROM users
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async () => {
  const SQL = /* sql */ `
    SELECT * FROM products
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const createFavorite = async ({ user_id, product_id }) => {
  const SQL = /* sql */ `
    INSERT INTO favorites(id, user_id, product_id) VALUES ($1, $2, $3) RETURNING * 
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
  return response.rows[0];
};

const fetchFavorite = async (user_id) => {
  const SQL = /* sql */ `
    SELECT *
    FROM favorites
    WHERE user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

const deleteFavorite = async ({ id, user_id }) => {
  const SQL = /* sql */ `
    DELETE
    FROM favorites
    WHERE id = $1 AND user_id = $2
  `;
  await client.query(SQL, [id, user_id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorite,
  deleteFavorite,
};