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

export const processData = (data, { last = 99999, exclusions = [] } = {}) => {
  const { matches } = data;

  return matches.reduce((pd, match) => {
    const { map: mapName, mode: modeName } = match;

    const modes = pd.modes || {};
    const maps = pd.maps || {};

    let overall = pd.overall;
    let mode = modes[modeName];
    let map = maps[mapName];
    let modeMap = mode?.[mapName];
    let mapMode = map?.[modeName];

    const gameCount = (overall?.games || 0) + 1;
    const modeGameCount = (mode?.games || 0) + 1;
    const mapGameCount = (map?.games || 0) + 1;
    const modeMapGameCount = (modeMap?.games || 0) + 1;
    const mapModeGameCount = (mapMode?.games || 0) + 1;

    if (gameCount <= last) {
      overall = mergeMatchStats(overall, match);
    }
    if (modeGameCount <= last) {
      mode = mergeMatchStats(mode, match);
    }
    if (mapGameCount <= last) {
      map = mergeMatchStats(map, match);
    }
    if (modeMapGameCount <= last) {
      modeMap = mergeMatchStats(modeMap, match);
    }
    if (mapModeGameCount <= last) {
      mapMode = mergeMatchStats(mapMode, match);
    }

    mode.percentPlayed = modeGameCount / gameCount;
    map.percentPlayed = mapGameCount / gameCount;
    modeMap.percentPlayed = modeMapGameCount / gameCount;
    mapMode.percentPlayed = mapModeGameCount / gameCount;

    exclusions.forEach((exclusion) => {
      delete overall[exclusion];
      delete mode[exclusion];
      delete map[exclusion];
      delete modeMap[exclusion];
      delete mapMode[exclusion];
    });

    return {
      overall,
      modes: {
        ...modes,
        [modeName]: {
          ...mode,
          [mapName]: modeMap,
        },
      },
      maps: {
        ...maps,
        [mapName]: {
          ...map,
          [modeName]: mapMode,
        },
      },
    };
  }, {});

  // return {
  //   ...data,
  //   processedData,
  // };
};
