import { pgClient } from "./types";

async function initializeDB() {
    try {
        await pgClient.connect();

        await pgClient.query(`
            CREATE EXTENSION IF NOT EXISTS timescaledb;
        `);

        await pgClient.query(`
            DROP TABLE IF EXISTS tata_prices CASCADE;

            CREATE TABLE tata_prices(
                time TIMESTAMPTZ NOT NULL,
                price DOUBLE PRECISION,
                volume DOUBLE PRECISION,
                currency_code VARCHAR(10)
            );

            SELECT create_hypertable('tata_prices', 'time', if_not_exists => TRUE);
        `);

        await pgClient.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1m
            WITH (timescaledb.continuous) AS
            SELECT
                time_bucket('1 minute', time) AS bucket,
                first(price, time) AS open,
                max(price) AS high,
                min(price) AS low,
                last(price, time) AS close,
                sum(volume) AS volume,
                currency_code
            FROM tata_prices
            GROUP BY bucket, currency_code;
        `);

        await pgClient.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1h
            WITH (timescaledb.continuous) AS
            SELECT
                time_bucket('1 hour', time) AS bucket,
                first(price, time) AS open,
                max(price) AS high,
                min(price) AS low,
                last(price, time) AS close,
                sum(volume) AS volume,
                currency_code
            FROM tata_prices
            GROUP BY bucket, currency_code;
        `);

        await pgClient.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1w
            WITH (timescaledb.continuous) AS
            SELECT
                time_bucket('1 week', time) AS bucket,
                first(price, time) AS open,
                max(price) AS high,
                min(price) AS low,
                last(price, time) AS close,
                sum(volume) AS volume,
                currency_code
            FROM tata_prices
            GROUP BY bucket, currency_code;
        `);

        console.log("Database initialized successfully");

    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        await pgClient.end();
    }
}

initializeDB();