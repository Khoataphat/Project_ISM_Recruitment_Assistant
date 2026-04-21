import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
});

redis.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
});

redis.on("connect", () => {
    console.log("[Redis] Connected");
});

export const connectRedis = async () => {
    try {
        await redis.connect();
    } catch (err) {
        console.error("[Redis] Failed to connect:", (err as Error).message);
        process.exit(1);
    }
};

export const disconnectRedis = async () => {
    await redis.quit();
};

export default redis;
