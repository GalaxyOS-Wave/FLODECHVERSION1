const Razorpay = require('razorpay');
require('dotenv').config();
async function run() {
  try {
    const key_id_env = process.env.RAZORPAY_KEY_ID;
    const key_secret_env = process.env.RAZORPAY_KEY_SECRET;
    console.log("Testing with env:", key_id_env, key_secret_env);
    
    const rzp = new Razorpay({ key_id: key_id_env, key_secret: key_secret_env });
    const plans = await rzp.plans.all();
    console.log("Success with env! Plans:", plans.items?.length);
  } catch(e) {
    console.error("Error with env:");
		console.dir(e, {depth: null});
  }

  try {
    const key_id_manual = "rzp_live_SzvcnAdl6AWvOC";
    const key_secret_manual = "An7oPR1pGSdZJr20Qtijf6Jy";
    console.log("Testing with manual:", key_id_manual, key_secret_manual);
    
    const rzp2 = new Razorpay({ key_id: key_id_manual, key_secret: key_secret_manual });
    const plans2 = await rzp2.plans.all();
    console.log("Success with manual! Plans:", plans2.items?.length);
  } catch(e) {
    console.error("Error with manual:");
		console.dir(e, {depth: null});

  }
}
run();
