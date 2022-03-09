const fs = require("fs");

import { translate, transformStatValue } from "./translator";

const MAX_DEPTH = 6;

const STYLE = `body {
  font-family: "Helvetica Neue", Helvetica, Arial;
  margin: 0;
}

nav {
  flex: 0 0 100%;
  padding: 1em;
}

nav li {
  white-space: nowrap;
  margin-bottom: 0.25em;
}

main {
  flex: 1 1 auto;
  padding: 1em;
  align-self: center;
  border-left: 1px solid black;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

ul ul {
  padding-left: 2em;
}

li.stat {
  display: inline-block;
  width: 25%;
  min-width: 100px;
  max-width: 400px;
  height: 100px;
}

.sticky-header {
  position: sticky;
  background: white;
  border-bottom: 1px solid black;
  display: flex;
  align-items: center;
}

@media only screen and (min-width: 600px) {
    body {
display: flex;
    }
    
    nav {
      flex: 0 0 0;
      position: sticky;
      top: 0;
      align-self: flex-start;
      padding: 1em;
    }
}`;

const htmlDoc = (title, content, nav, { style = STYLE } = {}) => {
  return `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${style}</style>
  </head>
  <body>
  <nav>
  ${nav}
  </nav>
  <main>
  ${content}
  </main>
  </body>
</html>`;
};

const HEADER_HEIGHT = 50;

const objectNavHtml = (data, prevId) => {
  let html = "";

  html += `<ul>`;
  Object.entries(data).forEach(([key, value]) => {
    const isObject = typeof value === "object" && value !== null;
    const id = [prevId, key].join("_");

    if (isObject) {
      html += `<li><a href="#${id}">${translate(key)}</a></li>`;
      html += objectNavHtml(value, id);
    }
  });
  html += `</ul>`;

  return html;
};

const objectToHtml = (data, prevId, depth = 0) => {
  let html = "";

  html += `<ul>`;
  Object.entries(data).forEach(([key, value]) => {
    const isObject = typeof value === "object" && value !== null;
    const liClass = !isObject && "stat";
    const header = translate(key);
    const headerDepth = Math.min(MAX_DEPTH, depth + 2);
    const id = [prevId, key].join("_");

    html += `<li id="${id}" class="${liClass}">`;
    if (isObject) {
      html += `<h${headerDepth} class="sticky-header" style="top: ${
        depth * (HEADER_HEIGHT + 1)
      }; height: ${HEADER_HEIGHT}; z-index: ${
        1000 - depth * 100
      }">${header}</h${headerDepth}>`;
      html += objectToHtml(value, id, depth + 1);
    } else {
      html += `<h4>${header}</h4><p>${transformStatValue(key, value)}</p>`;
    }
    html += `</li>`;
  });
  html += `</ul>`;

  return html;
};

const tableCols = (object) => {
  const cols = [];
  Object.entries(object).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      const nestedCols = tableCols(value);

      if (nestedCols.length) {
        cols.push([key, nestedCols]);
      } else {
        cols.push(key);
      }
    }
  });
  return cols;
};

export const objectToTableHTML = (object) => {
  const cols = tableCols(object);

  console.log("COLS", JSON.stringify(cols));
};

export const dataToHtmlFile = (gamertag, data) => {
  const fileSafeGamertag = gamertag.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const fileName = `${fileSafeGamertag}.html`;
  const filePath = `${__dirname}/gamers/${fileName}`;

  let content = `<h1>${gamertag}</h1>`;
  content += objectToHtml(data);
  const nav = objectNavHtml(data);
  const html = htmlDoc(gamertag, content, nav);

  try {
    fs.writeFileSync(filePath, html);
    //file written successfully
    console.log("HTML file written successfully");
  } catch (err) {
    console.error(err);
  }
};
