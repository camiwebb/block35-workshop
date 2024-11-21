const {
    client,
    createTables,
    createUser,
    createProduct,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorite,
    deleteFavorite,
  } = require("./db");
  
  const express = require("express");
  const app = express();
  
  app.use(express.json());
  app.use(require("morgan")("dev"));
  
  app.get("/api/users", async (req, res, next) => {
    try {
      res.send(await fetchUsers());
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/products", async (req, res, next) => {
    try {
      res.send(await fetchProducts());
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/users/:id/favorites", async (req, res, next) => {
    try {
      res.send(await fetchFavorite(req.params.id));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.post("/api/users/:id/favorites", async (req, res, next) => {
    try {
      res.status(201).send(
        await createFavorite({
          user_id: req.params.id,
          product_id: req.body.product_id,
        })
      );
    } catch (ex) {
      next(ex);
    }
  });
  
  app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
    try {
      await deleteFavorite({ user_id: req.params.userId, id: req.params.id });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  });
  
  const init = async () => {
    await client.connect();
    console.log("connected to database");
  
    await createTables();
    console.log("tables created");
  
    const [mary, jo, beth, amy, laptop, headphones, keyboard, monitor] =
      await Promise.all([
        createUser({ username: "mary", password: "password1" }),
        createUser({ username: "jo", password: "password2" }),
        createUser({ username: "beth", password: "password3" }),
        createUser({ username: "amy", password: "password4" }),
        createProduct({ name: "laptop" }),
        createProduct({ name: "headphones" }),
        createProduct({ name: "keyboard" }),
        createProduct({ name: "monitor" }),
      ]);
  
    const favorites = await Promise.all([
      createFavorite({ user_id: mary.id, product_id: headphones.id }),
      createFavorite({ user_id: mary.id, product_id: monitor.id }),
      createFavorite({ user_id: jo.id, product_id: laptop.id }),
      createFavorite({ user_id: jo.id, product_id: keyboard.id }),
      createFavorite({ user_id: jo.id, product_id: monitor.id }),
      createFavorite({ user_id: amy.id, product_id: laptop.id }),
      createFavorite({ user_id: amy.id, product_id: headphones.id }),
      createFavorite({ user_id: beth.id, product_id: keyboard.id }),
    ]);
  
    console.log("data seeded");
  
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
  };
  
  init();