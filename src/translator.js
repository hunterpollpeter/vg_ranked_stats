const TRANSLATIONS = {
  koth: "Hardpoint",
  sd: "Search and Destroy",
  kdRatio: "Kill/Death Ratio",
  edRatio: "Elim/Death Ratio",
  wlRatio: "Win/Loss Ratio",
  ddDtRatio: "Damage Done/Taken Ratio",
  mp_gavutu2: "Gavutu",
  mp_tuscan: "Tuscan",
  mp_bocage_2: "Bocage",
  mp_berlin_01: "Berlin",
  mp_elalamein: "Desert Seige",
  timePlayedSeconds: "Time Played",
  timeMovingSeconds: "Time Moving",
};

const friendlyPercentage = (value) => {
  value = value * 100;
  value = Number(value).toFixed(2);
  return `${value}%`;
};

const friendlyPercentageChange = (value) => {
  if (!value) {
    value = 0;
  }

  value = value * 100;
  value = Number(value).toFixed(2);
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value}%`;
};

const friendlyDecimal = (value) => Number(value).toFixed(2);

const friendlySeconds = (seconds) => {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);

  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
};

const TRANSFORMATIONS = {
  accuracy: friendlyPercentage,
  percentTimeMoving: friendlyPercentage,
  headshotPercentage: friendlyPercentage,
  percentPlayed: friendlyPercentage,
  percentChange: friendlyPercentageChange,
  timePlayedSeconds: friendlySeconds,
  timeMovingSeconds: friendlySeconds,
  kdRatio: friendlyDecimal,
  edRatio: friendlyDecimal,
  wlRatio: friendlyDecimal,
  ddDtRatio: friendlyDecimal,
  scorePerMinute: friendlyDecimal,
  killsPerMinute: friendlyDecimal,
  assistsPerMinute: friendlyDecimal,
  deathsPerMinute: friendlyDecimal,
  elimsPerMinute: friendlyDecimal,
  damageDonePerMinute: friendlyDecimal,
  damageTakenPerMinute: friendlyDecimal,
  shotsFiredPerMinute: friendlyDecimal,
  headshotsPerMinute: friendlyDecimal,
  scorePerGame: friendlyDecimal,
  killsPerGame: friendlyDecimal,
  assistsPerGame: friendlyDecimal,
  deathsPerGame: friendlyDecimal,
  elimsPerGame: friendlyDecimal,
  damageDonePerGame: friendlyDecimal,
  damageTakenPerGame: friendlyDecimal,
  shotsFiredPerGame: friendlyDecimal,
  headshotsPerGame: friendlyDecimal,
  scorePerLife: friendlyDecimal,
  killsPerLife: friendlyDecimal,
  assistsPerLife: friendlyDecimal,
  elimsPerLife: friendlyDecimal,
  damageDonePerLife: friendlyDecimal,
  damageTakenPerLife: friendlyDecimal,
  shotsFiredPerLife: friendlyDecimal,
  headshotsPerLife: friendlyDecimal,
  rating: friendlyDecimal,
};

export const translate = (input) => {
  let translation = TRANSLATIONS[input];

  translation ||= input
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/^./, (match) => match.toUpperCase())
    .trim();

  return translation;
};

export const transformStatValue = (name, value) => {
  const transformation = TRANSFORMATIONS[name] || ((x) => x);

  return transformation(value);
};
