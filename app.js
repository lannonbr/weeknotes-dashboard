import fastify from "fastify";
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";

import { Liquid } from "liquidjs";
import webpack from "webpack";
import { JSONFilePreset } from "lowdb/node";

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import childProcess from "node:child_process";
import { randomUUID } from "node:crypto";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsPath = path.join(__dirname, "views");

const staticsPath = path.join(__dirname, "statics");
const publicPath = path.join(__dirname, "public");

const db = await JSONFilePreset(path.join(__dirname, "data", "data.json"), {
  create: [],
  consume: [],
});

function buildClientsideAssets() {
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath);
  }

  childProcess.execSync(
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
  const links = db.data;

  return reply.view("./views/index.liquid", {
    links,
    routePrefix,
  });
});

app.get(getRoutePath("links"), (req, reply) => {
  const links = db.data;

  return reply.send(links);
});

app.post(getRoutePath("create"), async (req, reply) => {
  const { type, url, description } = req.body;

  const uuid = randomUUID();

  db.data[type].push({
    id: uuid,
    url,
    description,
  });
  await db.write();

  reply.redirect(getRoutePath());
});

app.post(getRoutePath("delete"), async (req, reply) => {
  console.log(req.body.id);
  let inCreateIdx = db.data.create.findIndex(({ id }) => req.body.id === id);
  console.log({ inCreateIdx });
  if (inCreateIdx !== -1) {
    db.data.create.splice(inCreateIdx, 1);

    await db.write();
    return reply.send({ message: "link deleted" });
  }

  let inConsumeIdx = db.data.consume.findIndex(({ id }) => req.body.id === id);
  console.log({ inConsumeIdx });
  if (inConsumeIdx !== -1) {
    db.data.consume.splice(inConsumeIdx, 1);
    await db.write();
    return reply.send({ message: "link deleted" });
  }
});

app.post(getRoutePath("delete-all"), async (req, reply) => {
  db.data.create = [];
  db.data.consume = [];
  await db.write();
  return reply.send({ message: "Successfully deleted all posts" });
});

app.listen({ port: 3007, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running on ${address}/${routePrefix}`);
});
