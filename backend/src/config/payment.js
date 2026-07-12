import config from "./environment.js";

export const paymentConfig = {
  stripe: {
    secretKey: config.stripe.secretKey,
    webhookSecret: config.stripe.webhookSecret,
  },
};

export default paymentConfig;
