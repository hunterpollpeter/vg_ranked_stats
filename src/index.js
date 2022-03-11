#! /usr/bin/env node

import yargs from "yargs";
import * as CoDAPI from "call-of-duty-api";

import { dataToHtmlFile } from "./htmlGenerator";
import { processData } from "./processor";
import { compareProcessedData } from "./comparator";
import { readGamerFile, writeGamerFile } from "./utils";

const ACT_SSO_COOKIE =
  "MzU4NzA4Njg0NDMxNzIyNzI3ODoxNjQ3NzA1NzA0MDE5OjVkZGM3YjA4NTQ1NmU2YmNmYmRhNWQwMWJlMmQ0NDNh";
const SND_PLAYLIST_NAME = "PLAYLIST/CDL_SD_NAME";
const HP_PLAYLIST_NAME = "PLAYLIST/CDL_KOTH_NAME";
const CTRL_PLAYLIST_NAME = "PLAYLIST/CDL_CONTROL";
const RANKED_PLAYLIST_NAMES = [
  SND_PLAYLIST_NAME,
  HP_PLAYLIST_NAME,
  CTRL_PLAYLIST_NAME,
];
const RANKED_RELEASE_MS = 1645056000000;
const DEFAULT_DATA = {
  matches: [],
  lastMatchEndMs: RANKED_RELEASE_MS,
};
const BIG_DATE_MS = 9999999999999;

const usage = "\nUsage: vg-ranked-stats <activision_id>";
const options = yargs
  .usage(usage)
  .help(true)
  .option("u", {
    alias: "update",
    default: false,
    describe: "Update a gamer fetching the latest data.",
    type: "boolean",
  })
  .option("p", {
    alias: "process",
    default: false,
    describe: "Process a gamer's data.",
    type: "boolean",
  }).argv;
const gamertag = options._[0];
const update = options.u || options.update;
const process = options.p || options.process;

CoDAPI.login(ACT_SSO_COOKIE);

console.log(`Getting ranked matches for ${gamertag}!`);

const fetchRankedMatches = async (
  gamertag,
  { start = 0, end = 0, platform = CoDAPI.platforms.Activision } = {}
) => {
  console.log("[fetchRankedMatches]", { gamertag, start, end, platform });

  const uriSafeGamertag = encodeURIComponent(gamertag);

  const response = await CoDAPI.Vanguard.combatHistoryWithDate(
    uriSafeGamertag,
    start,
    end,
    platform
  );
  const { status, data } = response;

  if (status !== "success") {
    console.log("Status not success", response);
  }

  const { matches } = data;

  const rankedMatches =
    matches?.filter(({ playlistName }) =>
      RANKED_PLAYLIST_NAMES.includes(playlistName)
    ) || [];

  return rankedMatches;
};

const getData = async (gamertag, { update = false, process = false } = {}) => {
  // get all matches after 02/17/2022 (ranked play launch)
  const existingDataRaw = readGamerFile(gamertag, "data.json");
  const existingData = existingDataRaw && JSON.parse(existingDataRaw);

  let data = existingData || DEFAULT_DATA;
  const { matches, lastMatchEndMs } = data;

  if (update) {
    let allRecentMatches = [];
    let reachedEnd = false;
    let oldestRecentMatchStartMs = BIG_DATE_MS;

    do {
      let recentMatches = await fetchRankedMatches(gamertag, {
        start: lastMatchEndMs + 1000,
        end: oldestRecentMatchStartMs,
      });

      const oldestRecentMatch = recentMatches[recentMatches.length - 1];
      oldestRecentMatchStartMs =
        oldestRecentMatch && oldestRecentMatch.utcStartSeconds * 1000;

      reachedEnd =
        !recentMatches.length || lastMatchEndMs > oldestRecentMatchStartMs;

      allRecentMatches = [...allRecentMatches, ...recentMatches];
    } while (!reachedEnd);

    const newMatches = [...allRecentMatches, ...matches];
    // update the lastMatchEndMs in the data so we don't go past this point when updating
    const newLastMatchEndMs = newMatches[0].utcEndSeconds * 1000;

    data = {
      ...data,
      matches: newMatches,
      lastMatchEndMs: newLastMatchEndMs,
    };
  }

  if (update || process) {
    const overall = processData(data);
    const recent = processData(data, {
      last: 5,
      exclusions: ["percentPlayed"],
    });

    data = {
      ...data,
      processedData: {
        overall,
        recent,
      },
      comparedProcessedData: {
        overall: {
          recent: compareProcessedData(overall, recent),
        },
      },
    };

    writeGamerFile(gamertag, "data.json", JSON.stringify(data));
  }

  return data;
};

getData(gamertag, { update, process }).then((data) => {
  const { processedData, comparedProcessedData } = data;
  const { overall, recent } = processedData;
  const linkedTo = [
    { href: "overall.html", text: "overall" },
    { href: "recent.html", text: "recent" },
  ];

  dataToHtmlFile(gamertag, "overall", overall, {
    linkedTo,
  });
  dataToHtmlFile(gamertag, "recent", recent, {
    linkedTo,
    comparedTo: comparedProcessedData.overall.recent,
  });
});
