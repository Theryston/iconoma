import { Router } from "express";

const apiRoutes: Router = Router();

apiRoutes.get("/", (req, res) => {
  res.json({ message: "Hello, world!!!", pwd: process.cwd() });
});

export default apiRoutes;
