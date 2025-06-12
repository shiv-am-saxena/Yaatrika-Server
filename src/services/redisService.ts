import Redis from 'ioredis';

const redisClient: Redis = new Redis({
	host: 'redis-15768.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
	port: 15768,
	username: 'default',
	password: '3plT3be3pdJ2zwMs0HzCv2X7B2oBzofF'
});
redisClient.on('connect', () => {
	console.log('Connected to Redis');
});
redisClient.on('error', (err: any) => {
	console.log('Error in Redis Connection', err);
});

export default redisClient;
