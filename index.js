const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const { COOKIE, X_IG_APP_ID, X_IG_WWW_CLAIM } = process.env;

const URL = 'https://i.instagram.com/api/v1/feed/saved/posts/?max_id=';
const HEADERS = {
  accept: '*/*',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
  'cache-control': 'no-cache',
  cookie: COOKIE,
  origin: 'https://www.instagram.com',
  pragma: 'no-cache',
  referer: 'https://www.instagram.com/',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'x-ig-app-id': X_IG_APP_ID,
  'x-ig-www-claim': X_IG_WWW_CLAIM,
};
const DIR = 'downloads';

const state = {
  posts: 0,
};

function callNext(max_id = '') {
  const url = `${URL}${max_id}`;

  axios
    .get(url, {
      headers: HEADERS,
    })
    .then(function (response) {
      handleResponse(response.data);
    })
    .catch(function (error) {
      console.error(error.message);
    });
}

function handleResponse(data) {
  const { next_max_id, items, num_results } = data;

  items.forEach((item) => {
    const mediaData = getMediaData(item.media);
    mediaData.forEach((media) => downloadMedia(media));
  });

  if (next_max_id) {
    state.posts += num_results;
    console.log(`${state.posts} posts parsed`);
    callNext(next_max_id);
  } else {
    console.log(
      `All posts parsed, please wait for media to finish downloading`
    );
  }
}

function getMediaData(media) {
  const { media_type, id, image_versions2, video_versions, carousel_media } =
    media;

  switch (media_type) {
    case 1:
      return [
        {
          name: `${id}.jpg`,
          url: image_versions2.candidates.sort((a, b) => b.width - a.width)[0]
            .url,
        },
      ];
    case 2:
      return [{ name: `${id}.mp4`, url: video_versions[0].url }];
    case 8:
      return carousel_media.map((slide) => getMediaData(slide)[0]);
    default:
      console.warn('New media type:', media_type);
  }
}

function downloadMedia({ name, url }) {
  axios({
    url,
    responseType: 'stream',
  })
    .then(
      (response) =>
        new Promise((resolve, reject) => {
          response.data
            .pipe(fs.createWriteStream(`${DIR}/${name}`))
            .on('finish', () => resolve())
            .on('error', (e) => reject(e));
        })
    )
    .catch((error) => console.error(error));
}

fs.mkdir(DIR, { recursive: true }, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log('Directory created successfully');
});

callNext();
