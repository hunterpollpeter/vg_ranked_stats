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
  draws: 0,
  games: 0,
  longestStreak: 0,
};
const LOSS_STRING = "loss";
const WIN_STRING = "win";
const DRAW_STRING = "tie";
const MIN_DURATION = 180000; // 3 minutes

const bestMatchStats = (prev, match) => {
  prev ||= {};

  const { playerStats } = match;
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
    percentTimeMoving: percentTimeMovingRaw,
  } = playerStats;

  // calculated
  // const timeMovingSeconds = timePlayedSeconds * (percentTimeMoving / 100);
  const timePlayedMinutes = timePlayedSeconds / 60;
  const eliminations = kills + assists;
  const percentTimeMoving = percentTimeMovingRaw / 100;
  // const timeMovingSeconds = timePlayedSeconds * percentTimeMoving;

  // ratios/percentages
  const kdRatio = kills / (deaths || 1);
  const edRatio = eliminations / (deaths || 1);
  const accuracy = shotsLanded / (shotsFired || 1);
  const headshotPercentage = headshots / (kills || 1);

  // per minute
  const scorePerMinute = score / timePlayedMinutes;
  const killsPerMinute = kills / timePlayedMinutes;
  const assistsPerMinute = assists / timePlayedMinutes;
  const deathsPerMinute = deaths / timePlayedMinutes;
  const elimsPerMinute = eliminations / timePlayedMinutes;
  const damageDonePerMinute = damageDone / timePlayedMinutes;
  const damageTakenPerMinute = damageTaken / timePlayedMinutes;
  const shotsFiredPerMinute = shotsFired / timePlayedMinutes;
  const headshotsPerMinute = headshots / timePlayedMinutes;

  // per life
  const scorePerLife = score / deaths;
  const killsPerLife = kills / deaths;
  const assistsPerLife = assists / deaths;
  const elimsPerLife = eliminations / deaths;
  const damageDonePerLife = damageDone / deaths;
  const damageTakenPerLife = damageTaken / deaths;
  const shotsFiredPerLife = shotsFired / deaths;
  const headshotsPerLife = headshots / deaths;

  // bests
  const bestEliminations = Math.max(prev.eliminations || 0, eliminations);
  const bestKills = Math.max(prev.kills || 0, kills);
  const bestDeaths = Math.min(prev.deaths || 9999, deaths);
  const bestAssists = Math.max(prev.assists || 0, assists);
  const bestHeadshots = Math.max(prev.headshots || 0, headshots);
  const bestDamageDone = Math.max(prev.damageDone || 0, damageDone);
  const bestDamageTaken = Math.min(prev.damageTaken || 9999, damageTaken);
  const bestShotsLanded = Math.max(prev.shotsLanded || 0, shotsLanded);
  const bestShotsFired = Math.max(prev.shotsFired || 0, shotsFired);
  const bestScore = Math.max(prev.score || 0, score);
  const bestSuicides = Math.min(prev.suicides || 9999, suicides);
  const bestExecutions = Math.max(prev.executions || 0, executions);
  const bestLongestStreak = Math.max(prev.longestStreak || 0, longestStreak);
  const bestKdRatio = Math.max(prev.kdRatio || 0, kdRatio);
  const bestEdRatio = Math.max(prev.edRatio || 0, edRatio);
  const bestAccuracy = Math.max(prev.accuracy || 0, accuracy);
  const bestHeadshotPercentage = Math.max(
    prev.headshotPercentage || 0,
    headshotPercentage
  );
  const bestScorePerMinute = Math.max(prev.scorePerMinute || 0, scorePerMinute);
  const bestKillsPerMinute = Math.max(prev.killsPerMinute || 0, killsPerMinute);
  const bestAssistsPerMinute = Math.max(
    prev.assistsPerMinute || 0,
    assistsPerMinute
  );
  const bestDeathsPerMinute = Math.min(
    prev.deathsPerMinute || 9999,
    deathsPerMinute
  );
  const bestElimsPerMinute = Math.max(prev.elimsPerMinute || 0, elimsPerMinute);
  const bestDamageDonePerMinute = Math.max(
    prev.damageDonePerMinute || 0,
    damageDonePerMinute
  );
  const bestDamageTakenPerMinute = Math.min(
    prev.damageTakenPerMinute || 9999,
    damageTakenPerMinute
  );
  const bestShotsFiredPerMinute = Math.max(
    prev.shotsFiredPerMinute || 0,
    shotsFiredPerMinute
  );
  const bestHeadshotsPerMinute = Math.max(
    prev.headshotsPerMinute || 0,
    headshotsPerMinute
  );
  const bestPercentTimeMoving = Math.max(
    prev.percentTimeMoving || 0,
    percentTimeMoving
  );
  const bestScorePerLife = Math.max(prev.scorePerLife || 0, scorePerLife);
  const bestKillsPerLife = Math.max(prev.killsPerLife || 0, killsPerLife);
  const bestAssistsPerLife = Math.max(prev.assistsPerLife || 0, assistsPerLife);
  const bestElimsPerLife = Math.max(prev.elimsPerLife || 0, elimsPerLife);
  const bestDamageDonePerLife = Math.max(
    prev.damageDonePerLife || 0,
    damageDonePerLife
  );
  const bestDamageTakenPerLife = Math.min(
    prev.damageTakenPerLife || 9999,
    damageTakenPerLife
  );
  const bestShotsFiredPerLife = Math.max(
    prev.shotsFiredPerLife || 0,
    shotsFiredPerLife
  );
  const bestHeadshotsPerLife = Math.max(
    prev.headshotsPerLife || 0,
    headshotsPerLife
  );

  return {
    ...prev,
    eliminations: bestEliminations,
    kills: bestKills,
    deaths: bestDeaths,
    assists: bestAssists,
    headshots: bestHeadshots,
    damageDone: bestDamageDone,
    damageTaken: bestDamageTaken,
    shotsLanded: bestShotsLanded,
    shotsFired: bestShotsFired,
    score: bestScore,
    suicides: bestSuicides,
    executions: bestExecutions,
    // timeMovingSeconds: bestTimeMovingSeconds,
    percentTimeMoving: bestPercentTimeMoving,
    longestStreak: bestLongestStreak,
    // longestTimePlayedSeconds,
    // shortestTimePlayedSeconds,
    // ratios/percentages
    kdRatio: bestKdRatio,
    edRatio: bestEdRatio,
    accuracy: bestAccuracy,
    headshotPercentage: bestHeadshotPercentage,
    // per minute
    scorePerMinute: bestScorePerMinute,
    killsPerMinute: bestKillsPerMinute,
    assistsPerMinute: bestAssistsPerMinute,
    deathsPerMinute: bestDeathsPerMinute,
    elimsPerMinute: bestElimsPerMinute,
    damageDonePerMinute: bestDamageDonePerMinute,
    damageTakenPerMinute: bestDamageTakenPerMinute,
    shotsFiredPerMinute: bestShotsFiredPerMinute,
    headshotsPerMinute: bestHeadshotsPerMinute,
    // per life
    scorePerLife: bestScorePerLife,
    killsPerLife: bestKillsPerLife,
    assistsPerLife: bestAssistsPerLife,
    elimsPerLife: bestElimsPerLife,
    damageDonePerLife: bestDamageDonePerLife,
    damageTakenPerLife: bestDamageTakenPerLife,
    shotsFiredPerLife: bestShotsFiredPerLife,
    headshotsPerLife: bestHeadshotsPerLife,
  };
};

const combineMatchStats = (prev, match) => {
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
    percentTimeMoving: percentTimeMovingRaw,
  } = playerStats;

  // calculated
  const percentTimeMoving = percentTimeMovingRaw / 100;
  const timeMovingSeconds = timePlayedSeconds * percentTimeMoving;
  const eliminations = kills + assists;
  const win = +(result === WIN_STRING);
  const loss = +(result === LOSS_STRING);
  const draw = +(result === DRAW_STRING);

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
  const totalDraws = prev.draws + draw;
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

  // per life
  const scorePerLife = totalScore / totalDeaths;
  const killsPerLife = totalKills / totalDeaths;
  const assistsPerLife = totalAssists / totalDeaths;
  const elimsPerLife = totalEliminations / totalDeaths;
  const damageDonePerLife = totalDamageDone / totalDeaths;
  const damageTakenPerLife = totalDamageTaken / totalDeaths;
  const shotsFiredPerLife = totalShotsFired / totalDeaths;
  const headshotsPerLife = totalHeadshots / totalDeaths;

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
    draws: totalDraws,
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
    // per life,
    scorePerLife,
    killsPerLife,
    assistsPerLife,
    elimsPerLife,
    damageDonePerLife,
    damageTakenPerLife,
    shotsFiredPerLife,
    headshotsPerLife,
  };
};

const mergeMatchStats = (prev, match, { best = false } = {}) => {
  if (best) {
    return bestMatchStats(prev, match);
  }

  return combineMatchStats(prev, match);
};

export const processData = (
  data,
  { last = 99999, exclusions = [], best = false } = {}
) => {
  const { matches } = data;

  return matches.reduce((pd, match) => {
    const { map: mapName, mode: modeName, duration } = match;

    // skip match if less than minimum duration
    if (duration < MIN_DURATION) {
      return pd;
    }

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
      overall = mergeMatchStats(overall, match, { best });
    }
    if (modeGameCount <= last) {
      mode = mergeMatchStats(mode, match, { best });
    }
    if (mapGameCount <= last) {
      map = mergeMatchStats(map, match, { best });
    }
    if (modeMapGameCount <= last) {
      modeMap = mergeMatchStats(modeMap, match, { best });
    }
    if (mapModeGameCount <= last) {
      mapMode = mergeMatchStats(mapMode, match, { best });
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
