const { get } = require('../src');

module.exports = get(({ ok }) => ok({ msg: 'it works'}));
