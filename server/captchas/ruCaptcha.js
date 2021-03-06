/* eslint-disable no-await-in-loop */
const axios = require('axios');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const solveRecaptchaV2 = async ({ ruCaptchaApiKey, googleKey, url }) => {
  const balanceRes = await axios.get(
    `https://rucaptcha.com/res.php?key=${ruCaptchaApiKey}&action=getbalance`,
  );
  const balance = balanceRes.data;

  if (balance === 'ERROR_WRONG_USER_KEY') {
    return balance;
  }

  if (balance <= 0) {
    return 'ERROR_ZERO_BALANCE';
  }

  await sleep(5000);

  const requestUrl = `http://rucaptcha.com/in.php?key=${ruCaptchaApiKey}&method=userrecaptcha&googlekey=${googleKey}&pageurl=${url}&soft_id=2694`;
  const response = await axios.post(requestUrl);

  const captchaIDres = response.data;
  if (captchaIDres === 'ERROR_WRONG_USER_KEY') {
    return captchaIDres;
  }
  const captchaID = captchaIDres.split('|')[1]; // remove 'OK|'

  await sleep(5000);

  const requestTokenUrl = `http://rucaptcha.com/res.php?key=${ruCaptchaApiKey}&action=get&id=${captchaID}&soft_id=2694`;
  const res2 = await axios.get(requestTokenUrl);
  let token = res2.data;
  while (token === 'CAPCHA_NOT_READY') {
    await sleep(5000);
    const res3 = await axios.get(requestTokenUrl);
    token = res3.data;
  }

  const [, result] = token.split('|'); // remove 'OK|'
  return result || token;
};

module.exports = solveRecaptchaV2;
