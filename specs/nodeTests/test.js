/**
 * @jest-environment node
 */

const mongoose = require('mongoose');
const { findForId, updateReview, updateImage } = require('../../server/routeHandlers.js');
const Review = require('../../database/Reviews.js');
const { generateTestData } = require('./testData.js');
const { seedData, generateNumBetween, pickBiased, attractionIds } = require('../../database/seed.js');

const attractionId = '200'; // okay to use any id above 100 for testing
let statusCodes = [];
let docArrays = [];
const mockRes = {
  status: (code) => { statusCodes.unshift(code); },
  json: (docs) => { docArrays.push(docs); },
  send: (docs) => { docArrays.push(docs); },
  sendStatus: (code) => { statusCodes.unshift(code); },
};

describe('Server route handlers interact as expected with database', () => {
  beforeAll(() => {
    const testReviews = generateTestData(attractionId);
    return Review.create(testReviews);
  });

  afterAll(() => {
    Review.deleteMany({ attractionId })
      .then(() => {
        mongoose.connection.close();
        mongoose.connection.close();
      });
  });

  beforeEach(() => {
    statusCodes = [];
    docArrays = [];
  });

  test('findForId finds all reviews for a given attraction ID', (done) => {
    findForId({ params: { productId: attractionId } }, mockRes, (err, docs) => {
      expect(err).toBe(null);
      expect(docs.length).toEqual(5);
      expect(statusCodes[0]).toEqual(200);
      expect(docArrays[0].length).toBeGreaterThan(0);
      done();
    });
  });

  test('findForId sends a status code of 404 if an ID is not found', (done) => {
    findForId({ params: { productId: '300' } }, mockRes, (err, docs) => {
      expect(err).toBe('not found');
      expect(docs).toBe(undefined);
      expect(statusCodes[0]).toEqual(404);
      done();
    });
  });

  test('updateReview changes a single review\'s "helpful" property to true', (done) => {
    Review.find({ attractionId }, (err, docs) => {
      const reviewId = docs[0]._id;
      updateReview({ params: { reviewId } }, mockRes, (err) => {
        expect(err).toBe(null);
        expect(statusCodes[0]).toEqual(200);
        Review.findOne({ _id: reviewId }, (err, doc) => {
          expect(doc.helpful).toBe(true);
          done();
        });
      });
    });
  });

  test('updateReview sends a status code of 404 if an ID is not found', (done) => {
    updateReview({ params: { reviewId: '0' } }, mockRes, (err) => {
      expect(err).not.toBe(null);
      expect(statusCodes[0]).toEqual(404);
      done();
    });
  });

  test('updateImage changes a single image\'s "helpful" property to true', (done) => {
    Review.find({ attractionId }, (err, docs) => {
      const imageId = docs[0].uploadImages[0].get('id');
      updateImage({ params: { imageId } }, mockRes, (err) => {
        expect(err).toBe(null);
        expect(statusCodes[0]).toEqual(200);
        Review.findOne({ 'uploadImages.id': imageId }, (err, doc) => {
          expect(doc.uploadImages[0].get('helpful')).toBe(true);
          done();
        });
      });
    });
  });

  test('updateImage sends a status code of 404 if an ID is not found', (done) => {
    updateImage({ params: { imageId: '0' } }, mockRes, (err) => {
      expect(err).not.toBe(null);
      expect(statusCodes[0]).toEqual(404);
      done();
    });
  });
});

describe('Seed data has expected characteristics', () => {
  test('Attraction IDs generated should range from 001 to 100', () => {
    expect(attractionIds.length).toEqual(100);
    expect(attractionIds[0]).toEqual('001');
    expect(attractionIds[attractionIds.length - 1]).toEqual('100');
  });

  test('Function used for random data generation should simulate randomness', () => {
    const numbers = {};
    for (let i = 0; i < 100; i += 1) {
      const randNum = generateNumBetween(0, 10);
      if (randNum in numbers) {
        numbers[randNum] += 1;
      } else {
        numbers[randNum] = 1;
      }
    }
    const numsGenerated = Object.keys(numbers);
    for (let i = 0; i <= 10; i += 1) {
      expect(numsGenerated.indexOf(`${i}`)).toBeGreaterThan(-1);
    }
  });

  test('pickBiased function should weight results toward the first element passed in', () => {
    const numbers = {};
    for (let i = 0; i < 100; i += 1) {
      const biasedNum = pickBiased([0, 1, 2, 3]);
      if (biasedNum in numbers) {
        numbers[biasedNum] += 1;
      } else {
        numbers[biasedNum] = 1;
      }
    }
    expect(numbers[0]).toBeGreaterThan(25);
  });

  test('A review record generated should have expected properties', () => {
    const review = seedData[generateNumBetween(0, 200)];
    const reviewKeys = [
      'user',
      'uploadImages',
      'attractionId',
      'attractionName',
      'rating',
      'travelType',
      'expDate',
      'lang',
      'body',
      'title',
      'votes',
      'createdAt',
      'helpful',
    ];
    const userKeys = [
      'originCountry',
      'originRegion',
      'contributions',
      'name',
      'profileImage',
    ];
    const imageKeys = [
      'id',
      'helpful',
      'url',
      'username',
      'createdAt',
      'reviewTitle',
      'reviewRating',
    ];

    reviewKeys.forEach((key) => {
      expect(key in review).toEqual(true);
    });

    userKeys.forEach((key) => {
      expect(key in review.user).toEqual(true);
    });

    if (review.uploadImages.length > 0) {
      imageKeys.forEach((key) => {
        expect(key in review.uploadImages[0]).toEqual(true);
      });
    }

   });

});
