let redisClient = null;

const createClient = () => {
  try {
    const { createClient } = require("redis");
    const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

    redisClient = createClient({ url: redisUrl });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err?.message || err);
    });

    return redisClient;
  } catch (error) {
    console.warn("Redis package not installed. Redis caching disabled.", error.message);
    return null;
  }
};

const connectRedis = async () => {
  if (!redisClient) redisClient = createClient();
  if (!redisClient) return;

  try {
    await redisClient.connect();
    console.log("✅ Redis client connected");
  } catch (err) {
    console.error("Redis connection failed:", err.message);
  }
};

module.exports = {
  get client() {
    if (!redisClient) redisClient = createClient();
    return redisClient;
  },
  connectRedis,
};