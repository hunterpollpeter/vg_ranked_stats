#! /usr/bin/env node

import yargs from "yargs";
import * as CoDAPI from "call-of-duty-api";

import { dataToHtmlFile, objectToTableHTML } from "./htmlGenerator";

const fs = require("fs");

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
const BASE_STATS = {
  // totals
  eliminations: 0,
  kills: 0,
  deaths: 0,
  assists: 0,
  headshots: 0,
  damageDone: 0,
  damageTaken: 0,
  shotsLanded: 0,
  shotsFired: 0,
  timePlayedSeconds: 0,
  score: 0,
  suicides: 0,
  executions: 0,
  timeMovingSeconds: 0,
  wins: 0,
  losses: 0,
  games: 0,
  longestStreak: 0,
};
const LOSS_STRING = "loss";
const WIN_STRING = "win";
const RECENT_GAME_COUNT = 5;

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

const mergeMatchStats = (prev, match) => {
  prev ||= BASE_STATS;

  const { playerStats, result } = match;
  const {
    kills,
    deaths,
    assists,
    headshots,
    damageDone,
    damageTaken,
    shotsLanded,
    shotsFired,
    longestStreak,
    timePlayed: timePlayedSeconds,
    score,
    suicides,
    executions,
    percentTimeMoving,
  } = playerStats;

  // calculated
  const timeMovingSeconds = timePlayedSeconds * (percentTimeMoving / 100);
  const eliminations = kills + assists;
  const win = +(result === WIN_STRING);
  const loss = +(result === LOSS_STRING);

  // totals
  const totalEliminations = prev.eliminations + eliminations;
  const totalKills = prev.kills + kills;
  const totalDeaths = prev.deaths + deaths;
  const totalAssists = prev.assists + assists;
  const totalHeadshots = prev.headshots + headshots;
  const totalDamageDone = prev.damageDone + damageDone;
  const totalDamageTaken = prev.damageTaken + damageTaken;
  const totalShotsLanded = prev.shotsLanded + shotsLanded;
  const totalShotsFired = prev.shotsFired + shotsFired;
  const totalTimePlayedSeconds = prev.timePlayedSeconds + timePlayedSeconds;
  const totalTimePlayedMinutes = totalTimePlayedSeconds / 60;
  const totalScore = prev.score + score;
  const totalSuicides = prev.suicides + suicides;
  const totalExecutions = prev.executions + executions;
  const totalTimeMovingSeconds = prev.timeMovingSeconds + timeMovingSeconds;
  const totalPercentTimeMoving =
    totalTimeMovingSeconds / totalTimePlayedSeconds;
  const totalWins = prev.wins + win;
  const totalLosses = prev.losses + loss;
  const totalGames = prev.games + 1;
  const totalLongestStreak = Math.max(prev.longestStreak, longestStreak);

  // ratios/percentages
  const kdRatio = totalKills / (totalDeaths || 1);
  const edRatio = totalEliminations / (totalDeaths || 1);
  const wlRatio = totalWins / totalLosses;
  const accuracy = totalShotsLanded / (totalShotsFired || 1);
  const headshotPercentage = totalHeadshots / (totalKills || 1);

  // per minute
  const scorePerMinute = totalScore / totalTimePlayedMinutes;
  const killsPerMinute = totalKills / totalTimePlayedMinutes;
  const assistsPerMinute = totalAssists / totalTimePlayedMinutes;
  const deathsPerMinute = totalDeaths / totalTimePlayedMinutes;
  const elimsPerMinute = totalEliminations / totalTimePlayedMinutes;
  const damageDonePerMinute = totalDamageDone / totalTimePlayedMinutes;
  const damageTakenPerMinute = totalDamageTaken / totalTimePlayedMinutes;
  const shotsFiredPerMinute = totalShotsFired / totalTimePlayedMinutes;
  const headshotsPerMinute = totalHeadshots / totalTimePlayedMinutes;

  // per game
  const scorePerGame = totalScore / totalGames;
  const killsPerGame = totalKills / totalGames;
  const assistsPerGame = totalAssists / totalGames;
  const deathPerGame = totalDeaths / totalGames;
  const elimsPerGame = totalEliminations / totalGames;
  const damageDonePerGame = totalDamageDone / totalGames;
  const damageTakenPerGame = totalDamageTaken / totalGames;
  const shotsFiredPerGame = totalShotsFired / totalGames;
  const headshotsPerGame = totalHeadshots / totalGames;

  return {
    ...prev,
    // totals
    eliminations: totalEliminations,
    kills: totalKills,
    deaths: totalDeaths,
    assists: totalAssists,
    headshots: totalHeadshots,
    damageDone: totalDamageDone,
    damageTaken: totalDamageTaken,
    shotsLanded: totalShotsLanded,
    shotsFired: totalShotsFired,
    timePlayedSeconds: totalTimePlayedSeconds,
    score: totalScore,
    suicides: totalSuicides,
    executions: totalExecutions,
    timeMovingSeconds: totalTimeMovingSeconds,
    percentTimeMoving: totalPercentTimeMoving,
    wins: totalWins,
    losses: totalLosses,
    games: totalGames,
    longestStreak: totalLongestStreak,
    // ratios/percentages
    kdRatio,
    edRatio,
    wlRatio,
    accuracy,
    headshotPercentage,
    // per minute
    scorePerMinute,
    killsPerMinute,
    assistsPerMinute,
    deathsPerMinute,
    elimsPerMinute,
    damageDonePerMinute,
    damageTakenPerMinute,
    shotsFiredPerMinute,
    headshotsPerMinute,
    // per game
    scorePerGame,
    killsPerGame,
    assistsPerGame,
    deathPerGame,
    elimsPerGame,
    damageDonePerGame,
    damageTakenPerGame,
    shotsFiredPerGame,
    headshotsPerGame,
  };
};

const processData = (data) => {
  const { matches } = data;
  const recentCounts = {};
  const recents = {};

  const processedData = matches.reduce((pd, match) => {
    const { map: mapName, mode: modeName } = match;

    const modes = pd.modes || {};
    const mode = modes[modeName] || {};

    const maps = pd.maps || {};
    const map = maps[mapName] || {};

    recentCounts.overall = ++recentCounts.overall || 1;
    recentCounts[modeName] = ++recentCounts[modeName] || 1;
    recentCounts[mapName] = ++recentCounts[mapName] || 1;

    // get overall recent games stats
    if (recentCounts.overall <= RECENT_GAME_COUNT) {
      recents.overall = mergeMatchStats(recents.overall, match);
    }
    // get mode recent game stats
    if (recentCounts[modeName] <= RECENT_GAME_COUNT) {
      recents[modeName] = mergeMatchStats(recents[modeName], match);
    }
    // get map recent game stats
    if (recentCounts[mapName] <= RECENT_GAME_COUNT) {
      recents[mapName] = mergeMatchStats(recents[mapName], match);
    }

    const newOverall = mergeMatchStats(pd.overall, match);
    const newModeOverall = mergeMatchStats(mode.overall, match);
    const newMapOverall = mergeMatchStats(map.overall, match);
    const newModeMapOverall = mergeMatchStats(mode[mapName], match);
    const newMapModeOverall = mergeMatchStats(map[modeName], match);

    const gameCount = newOverall.games;
    const modeGameCount = newModeOverall.games;
    const mapGameCount = newMapOverall.games;
    const modeMapGameCount = newModeMapOverall.games;
    const mapModeGameCount = newMapModeOverall.games;

    newModeOverall.percentPlayed = modeGameCount / gameCount;
    newMapOverall.percentPlayed = mapGameCount / gameCount;
    newModeMapOverall.percentPlayed = modeMapGameCount / gameCount;
    newMapModeOverall.percentPlayed = mapModeGameCount / gameCount;

    return {
      ...pd,
      overall: newOverall,
      recent: recents.overall,
      modes: {
        ...modes,
        [modeName]: {
          ...mode,
          overall: newModeOverall,
          recent: recents[modeName],
          [mapName]: newModeMapOverall,
        },
      },
      maps: {
        ...maps,
        [mapName]: {
          ...map,
          overall: newMapOverall,
          recent: recents[mapName],
          [modeName]: newMapModeOverall,
        },
      },
    };
  }, {});

  return {
    ...data,
    processedData,
  };
};

const getData = async (gamertag, { update = false, process = false } = {}) => {
  // get all matches after 02/17/2022 (ranked play launch)
  const fileSafeGamertag = gamertag.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const fileName = `${fileSafeGamertag}.json`;
  const filePath = `${__dirname}/gamers/${fileName}`;

  let existingData;
  try {
    const existingDataRaw = fs.readFileSync(filePath, "utf8");
    existingData = JSON.parse(existingDataRaw);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    console.log(`No existing data for ${gamertag}, run with --update.`);
  }

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

      // // only get recent matches that have started after the last saved match ended
      // recentMatches = recentMatches.filter(
      //   (recentMatch) => lastMatchEndMs < recentMatch.utcStartSeconds * 1000
      // );

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
    data = processData(data);

    try {
      fs.writeFileSync(filePath, JSON.stringify(data));
      //file written successfully
      console.log("file written successfully");
    } catch (err) {
      console.error(err);
    }
  }

  return data;
};

getData(gamertag, { update, process }).then((data) => {
  const { matches, processedData } = data;
  console.log("Total matches:", matches.length);

  dataToHtmlFile(gamertag, processedData);

  objectToTableHTML(processedData);
});
