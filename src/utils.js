const fs = require("fs");
const path = require("path");

const GAMER_DIR_NAME = "gamers";

const gamerDirectory = (gamertag) => {
  const fileSafeGamertag = gamertag.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  return path.join(__dirname, GAMER_DIR_NAME, fileSafeGamertag);
};

const writeFile = (dir, name, content) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, name);

  fs.writeFileSync(filePath, content);
  //file written successfully
  console.log("file written successfully");
};

const readFile = (dir, name, { encoding = "utf8" } = {}) => {
  const filePath = path.join(dir, name);

  if (!fs.existsSync(dir)) {
    return undefined;
  }

  return fs.readFileSync(filePath, encoding);
};

export const writeGamerFile = (gamertag, name, content) => {
  const dir = gamerDirectory(gamertag);
  writeFile(dir, name, content);
};

export const readGamerFile = (gamertag, name) => {
  const dir = gamerDirectory(gamertag);
  return readFile(dir, name);
};
