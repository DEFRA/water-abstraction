const { isDateWithinAbstractionPeriod } = require('./return-date-helpers');
const { returns: { lines: { getRequiredLines } } } = require('@envage/water-abstraction-helpers');

/**
 * Creates lines array from data
 * @return {Object}
 * @return {Array}
 */
const createLines = (data) => {
  const { lines = [], startDate, endDate, frequency } = data;
  if (lines.length) {
    return lines;
  }
  return getRequiredLines(startDate, endDate, frequency);
};

/**
 * Gets default quantity.  If within abstraction period, this is 0, otherwise null
 * @param {Object} line - return line
 * @param {Object} abstractionPeriod - return options containing abs period data
 * @return {Number|null}
 */
const getDefaultQuantity = (line, abstractionPeriod) => {
  return isDateWithinAbstractionPeriod(line.endDate, abstractionPeriod) ? 0 : null;
};

const createLine = (row, quantity, endReading, includeReadings) => {
  const line = {
    ...row,
    quantity
  };
  return includeReadings ? { ...line, endReading } : line;
};

const getReadingKey = line => `${line.startDate}_${line.endDate}`;

const mapMeterLinesToVolumes = (startReading, readings, lines, multiplier, includeReadings = false) => {
  const result = lines.reduce((acc, line) => {
    const reading = readings[getReadingKey(line)];

    let quantity = null;
    if (reading !== null) {
      quantity = multiplier * (reading - acc.lastMeterReading);
      acc.lastMeterReading = reading;
    }

    // Create line with volume and optionally meter reading
    const newLine = createLine(line, quantity, reading, includeReadings);
    acc.lines.push(newLine);

    return acc;
  }, { lines: [], lastMeterReading: startReading });

  return result.lines;
};

/**
 * Gets total abstracted quantity
 * @param  {Array} lines - return lines
 * @return {Number|null}
 */
const getReturnTotal = (lines) => {
  if (!lines) {
    return null;
  }
  const filteredLines = lines.filter(line => line.quantity !== null);
  return filteredLines.length === 0 ? null : filteredLines.reduce((acc, line) => {
    return acc + parseFloat(line.quantity);
  }, 0);
};

exports.createLines = createLines;
exports.getDefaultQuantity = getDefaultQuantity;
exports.mapMeterLinesToVolumes = mapMeterLinesToVolumes;
exports.getReturnTotal = getReturnTotal;
