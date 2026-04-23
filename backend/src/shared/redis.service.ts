import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const REDIS_URL = process.env.REDIS_URL;

const redis = REDIS_URL 
    ? new Redis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true })
    : new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
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
