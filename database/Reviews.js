const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/reviews', { useNewUrlParser: true });
mongoose.Promise = global.Promise;

const reviewSchema = mongoose.Schema({
  attractionId: String,
  rating: Number,
  travelType: String,
  expDate: Date,
  lang: String,
  body: String,
  title: String,
  votes: Number,
  createdAt: Date,
  helpful: Boolean,
  user: {
    originCountry: String,
    originRegion: String,
    contributions: Number,
    name: String,
    profileImage: String,
  },
  uploadImages: [Map],
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
