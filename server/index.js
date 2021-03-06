const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const { findForId, updateReview, updateImage } = require('./routeHandlers.js');

const port = 3004;
const publicDir = path.resolve(__dirname, '..', 'client', 'public');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/:productId/reviewsModule', express.static(publicDir));

app.get('/:productId/api/reviews', findForId);
app.patch('/:productId/api/reviews/:reviewId', updateReview);
app.patch('/:productId/api/reviews/:reviewId/:imageId', updateImage);

app.listen(port, () => {
  console.log(`good to go on port ${port}`);
});
