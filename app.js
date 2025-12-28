import fastify from "fastify";
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";
import { Liquid } from "liquidjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsPath = path.join(__dirname, "views");

const staticsPath = path.join(__dirname, "statics");
const publicPath = path.join(__dirname, "public");

function buildClientsideAssets() {
  // copy files from staticsPath to publicPath, make publicPath if it doesn't exist yet
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath);
  }

  fs.cpSync(path.join(staticsPath, "css"), path.join(publicPath, "css"), {
    recursive: true,
  });

  execSync(
    "npx tailwindcss -i ./statics/css/style.css -o ./public/css/style.css"
  );

  // build js bundle with webpack
  const compiler = webpack({
    entry: path.join(staticsPath, "js", "main.js"),
    mode: "production",
    output: {
      path: path.join(publicPath, "js"),
      filename: "main.js",
    },
    resolve: {
      alias: {
        fs: false,
        path: false,
      },
      modules: [path.join(staticsPath, "js"), "node_modules"],
    },
  });
  compiler.run();
}

const routePrefix = process.env.WEEKNOTES_ROUTE_PREFIX;

buildClientsideAssets();

function getRoutePath(path = "") {
  const basePath = routePrefix ? `/${routePrefix}` : "/";
  if (!path) {
    return basePath;
  }
  return routePrefix ? `/${routePrefix}/${path}` : `/${path}`;
}

const app = fastify({
  routerOptions: {
    ignoreTrailingSlash: true,
  },
});

app.register(fastifyStatic, {
  root: publicPath,
  prefix: getRoutePath(),
});

app.register(fastifyView, {
  engine: {
    liquid: new Liquid({
      root: viewsPath,
      extname: ".liquid",
    }),
  },
});

app.register(fastifyFormbody);

app.get(getRoutePath(), (req, reply) => {
  // TODO: Replace mock data with content from database
  let links = {
    create: [
      { id: "1", description: "Foobar (create)", url: "https://example.com" },
    ],
    consume: [
      { id: "2", description: "Foobar (consume)", url: "https://example.com" },
    ],
  };

  return reply.view("./views/index.liquid", {
    links,
    routePrefix,
  });
});

app.get(getRoutePath("links"), (req, reply) => {
  // get all links
});

app.post(getRoutePath("create"), (req, reply) => {
  // Create a new link
  const { type, url, description } = req.body;

  reply.redirect(getRoutePath());
});

app.post(getRoutePath("delete"), (req, reply) => {
  // Delete a link
});

app.post(getRoutePath("delete-all"), (req, reply) => {
  // Delete all links
});

app.listen({ port: 3007, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running on ${address}/${routePrefix}`);
});
