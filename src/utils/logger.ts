import { createLogger, format, transports } from 'winston';
import { StreamOptions } from 'morgan';

const { combine, timestamp, colorize, printf } = format;

const consoleLogFormat = combine(
	colorize(),
	timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	printf(({ level, message, timestamp }) => {
		return `[${timestamp}] ${level}: ${message}`;
	})
);

const logger = createLogger({
	level: 'info',
	format: consoleLogFormat,
	transports: [new transports.Console()]
});

// 👇 stream for morgan
const stream: StreamOptions = {
	write: (message) => logger.info(message.trim())
};

export { logger, stream };
