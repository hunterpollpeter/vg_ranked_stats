const COMPARISION_EXCLUSIONS = ["percentPlayed"];

const transformPercent = (percent) => percent * 100;

const comparePercent = (reference, subject) => {
  const transformedReference = transformPercent(reference);
  const transformedSubject = transformPercent(subject);

  return (transformedSubject - transformedReference) / transformedSubject;
};

const compareRatio = (reference, subject) => {
  return (subject - reference) / subject;
};

const compareIncrement = (reference, subject) => {
  return reference / (reference - subject) - 1;
};

const compareValue = (reference, subject) => {
  return subject / reference - 1;
};

const COMPARISONS = {
  eliminations: compareIncrement,
  kills: compareIncrement,
  deaths: compareIncrement,
  assists: compareIncrement,
  headshots: compareIncrement,
  damageDone: compareIncrement,
  damageTaken: compareIncrement,
  shotsLanded: compareIncrement,
  shotsFired: compareIncrement,
  timePlayedSeconds: compareIncrement,
  score: compareIncrement,
  suicides: compareIncrement,
  executions: compareIncrement,
  timeMovingSeconds: compareIncrement,
  wins: compareIncrement,
  losses: compareIncrement,
  games: compareIncrement,
  longestStreak: compareIncrement,
  scorePerMinute: compareValue,
  killsPerMinute: compareValue,
  assistsPerMinute: compareValue,
  deathsPerMinute: compareValue,
  elimsPerMinute: compareValue,
  damageDonePerMinute: compareValue,
  damageTakenPerMinute: compareValue,
  shotsFiredPerMinute: compareValue,
  headshotsPerMinute: compareValue,
  scorePerGame: compareValue,
  killsPerGame: compareValue,
  assistsPerGame: compareValue,
  deathPerGame: compareValue,
  elimsPerGame: compareValue,
  damageDonePerGame: compareValue,
  damageTakenPerGame: compareValue,
  shotsFiredPerGame: compareValue,
  headshotsPerGame: compareValue,
  scorePerLife: compareValue,
  killsPerLife: compareValue,
  assistsPerLife: compareValue,
  elimsPerLife: compareValue,
  damageDonePerLife: compareValue,
  damageTakenPerLife: compareValue,
  shotsFiredPerLife: compareValue,
  headshotsPerLife: compareValue,
  kdRatio: compareRatio,
  edRatio: compareRatio,
  wlRatio: compareRatio,
  accuracy: comparePercent,
  percentTimeMoving: comparePercent,
  headshotPercentage: comparePercent,
  percentPlayed: comparePercent,
};

// const transformProcessedValue = (name, value) => {
//   const transformation = TRANSFORMATIONS[name] || ((x) => x);

//   return transformation(value);
// };

const compareProcessedValues = (name, reference, subject) => {
  const comparison = COMPARISONS[name];

  if (!comparison) {
    return;
  }

  let percentChange = comparison(reference, subject);
  if (percentChange === NaN) {
    percentChange = 0;
  }

  return {
    percentChange,
  };
};

export const compareProcessedData = (reference, subject) => {
  return Object.entries(reference).reduce(
    (comparison, [key, referenceValue]) => {
      const isExcluded = COMPARISION_EXCLUSIONS.includes(key);

      if (isExcluded) return comparison;

      const subjectValue = subject[key];
      const isObject =
        typeof referenceValue === "object" && referenceValue !== null;

      if (isObject) {
        comparison[key] = compareProcessedData(referenceValue, subjectValue);
      } else {
        comparison[key] = compareProcessedValues(
          key,
          referenceValue,
          subjectValue
        );
      }

      return comparison;
    },
    {}
  );
};
