import { translate, transformStatValue } from "./translator";
import { writeGamerFile } from "./utils";

const MAX_DEPTH = 6;

const STYLE = `body {
  font-family: "Helvetica Neue", Helvetica, Arial;
  margin: 0;
}

#title {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid black;
}

nav#top {
  border-bottom: 1px solid black;
  padding: 20px;
}

nav#top span, nav#top a {
  margin-right: 10px;
}

nav#top span.active {
  font-weight: bold;
}

nav#side {
  flex: 0 0 100%;
  padding: 20px;
}

nav#side li {
  white-space: nowrap;
  margin-bottom: 5px;
}

section#content {
  flex: 1 1 auto;
  padding: 20px;
  align-self: center;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

ul ul {
  padding-left: 20px;
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
    main {
      display: flex;
    }
    
    nav#side {
      flex: 0 0 0;
      position: sticky;
      top: 0;
      align-self: flex-start;
      padding: 20px;
    }

    section#content {
      border-left: 1px solid black;
    }
}

.percent-change {
  cursor: help;
}

.percent-change-zero {
  color: gray;
}

.percent-change-positive {
  color: green;
}

.percent-change-negative {
  color: red;
}
`;

const htmlDoc = (title, content, { sideNav, topNav, style = STYLE } = {}) => {
  return `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${style}</style>
  </head>
  <body>
  <h1 id="title">${title}</h1>
  ${
    topNav &&
    `
    <nav id="top">
      ${topNav}
    </nav>
  `
  }
    <main>
      ${
        sideNav &&
        `
        <nav id="side">
          ${sideNav}
        </nav>
      `
      }
      <section id="content">
        ${content}
      </section>
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

const objectToHtml = (
  data,
  { comparedTo, prevId = undefined, depth = 0 } = {}
) => {
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
      html += objectToHtml(value, {
        comparedTo: comparedTo?.[key],
        prevId: id,
        depth: depth + 1,
      });
    } else {
      const percentChange = comparedTo?.[key]?.percentChange;

      let stat = transformStatValue(key, value);

      if (percentChange !== undefined) {
        let percentChangeClass = "zero";
        percentChangeClass =
          percentChange > 0 ? "positive" : percentChangeClass;
        percentChangeClass =
          percentChange < 0 ? "negative" : percentChangeClass;

        stat += ` <small title="Percent change from overall." class="percent-change percent-change-${percentChangeClass}">${transformStatValue(
          "percentChange",
          percentChange
        )}</small>`;
      }

      html += `<h4>${header}</h4><p>${stat}</p>`;
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

const topNavToHtml = (linkedTo, current) => {
  return linkedTo
    .map(({ href, text }) => {
      const friendlyText = translate(text);

      if (text === current) {
        return `<span class="active">${friendlyText}</span>`;
      } else {
        return `<a href="${href}">${friendlyText}</a>`;
      }
    })
    .join("");
};

export const dataToHtmlFile = (
  gamertag,
  name,
  data,
  { linkedTo = [], comparedTo } = {}
) => {
  const content = objectToHtml(data, { comparedTo });
  const sideNav = objectNavHtml(data);
  const topNav = topNavToHtml(linkedTo, name, gamertag);
  const html = htmlDoc(gamertag, content, { sideNav, topNav });

  writeGamerFile(gamertag, `${name}.html`, html);
};
