const TRANSLATIONS = {
  koth: "Hardpoint",
  sd: "Search and Destroy",
  kdRatio: "Kill/Death Ratio",
  edRatio: "Elim/Death Ratio",
  wlRatio: "Win/Loss Ratio",
  mp_gavutu2: "Gavutu",
  mp_tuscan: "Tuscan",
  mp_bocage_2: "Bocage",
  mp_berlin_01: "Berlin",
  mp_elalamein: "Desert Seige",
};

const friendlyPercentage = (value) => {
  value = value * 100;
  value = Number(value).toFixed(2);
  return `${value}%`;
};

const friendlyDecimal = (value) => Number(value).toFixed(2);

const TRANSFORMATIONS = {
  accuracy: friendlyPercentage,
  percentTimeMoving: friendlyPercentage,
  headshotPercentage: friendlyPercentage,
  percentPlayed: friendlyPercentage,
  timeMovingSeconds: friendlyDecimal,
  kdRatio: friendlyDecimal,
  edRatio: friendlyDecimal,
  wlRatio: friendlyDecimal,
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
  deathPerGame: friendlyDecimal,
  elimsPerGame: friendlyDecimal,
  damageDonePerGame: friendlyDecimal,
  damageTakenPerGame: friendlyDecimal,
  shotsFiredPerGame: friendlyDecimal,
  headshotsPerGame: friendlyDecimal,
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
