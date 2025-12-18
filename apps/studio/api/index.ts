import { Router } from "express";
import { getPwd } from "./utils";

const apiRoutes: Router = Router();

apiRoutes.get("/pwd", async (req, res) => {
  res.json({ pwd: getPwd() });
});

apiRoutes.get("/commit/changes", async (req, res) => {
  res.json({ changes: [] });
});

export default apiRoutes;
