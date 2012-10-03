
exports.decodeLEU = function (buf) {
  var res = 0;
  for (var i = 0; i < buf.length; i++)
    res += Math.pow(256, i) * buf[i];
  return res;
};

exports.decodeLES = function (buf) {
  var val = exports.decodeLEU(buf);
  if ((buf[buf.length - 1] & 0x80) == 0x80)
    val -= Math.pow(256, buf.length);
  return val;
};

exports.decodeBEU = function (buf) {
  var res = 0;
  for (var i = 0; i < buf.length; i++)
    res += Math.pow(256, buf.length - i - 1) * buf[i];
  return res;
};

exports.decodeBES = function (buf) {
  var val = exports.decodeBEU(buf);
  if ((buf[0] & 0x80) == 0x80)
    val -= Math.pow(256, buf.length);
  return val;
};

exports.encodeLEU = function () {

};

exports.encodeLES = function () {

};

exports.encodeBEU = function () {

};

exports.encodeBES = function () {

};
