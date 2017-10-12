var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ShortUrl = new Schema({
  url: String,
  shorturl:String});
var ShortUrlModel = mongoose.model('shorturl', ShortUrl);
module.exports=ShortUrlModel;
