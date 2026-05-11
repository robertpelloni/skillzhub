import Redis from 'ioredis'

// Simple Token Bucket Rate Limiter using Redis
let redisClient: Redis | null = null;

function getRedisClient() {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            retryStrategy: () => null
        });
        redisClient.on('error', () => {}); // silence errors during build
    }
    return redisClient;
}

export async function rateLimit(identifier: string, limit: number, windowSec: number): Promise<boolean> {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
       return true; // Bypass rate limit locally or in test
    }

    try {
        const client = getRedisClient();
        const key = `ratelimit:${identifier}`;

        const current = await client.get(key);

        if (current && parseInt(current, 10) >= limit) {
            return false; // Rate limit exceeded
        }

        const multi = client.multi();
        multi.incr(key);
        if (!current) {
            multi.expire(key, windowSec);
        }
        await multi.exec();

        return true;
    } catch (error) {
        // Fail open if Redis is down
        return true;
    }
}
