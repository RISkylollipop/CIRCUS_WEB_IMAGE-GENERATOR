const app = require("../backend/server");

module.exports = (req, res) => {
  // Vercel invokes this function at /api/generateimage, while the shared
  // Express app keeps the local-development route at /generateimage.
  if (req.url?.startsWith("/api/")) {
    req.url = req.url.slice("/api".length) || "/";
  }

  return app(req, res);
};
