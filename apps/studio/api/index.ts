import { Router } from "express";

const apiRoutes: Router = Router();

apiRoutes.get("/", (req, res) => {
  res.json({ message: "Hello, world!!!" });
});

export default apiRoutes;
