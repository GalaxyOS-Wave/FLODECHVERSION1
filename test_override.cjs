const Razorpay = require('razorpay');
require('dotenv').config({ override: true });
async function run() {
  try {
    const key_id_env = process.env.RAZORPAY_KEY_ID;
    const key_secret_env = process.env.RAZORPAY_KEY_SECRET;
    console.log("Testing with override:", key_id_env, key_secret_env);
  } catch(e) {}
}
run();
