import { pgClient } from "./types";

async function refreshViews() {
    pgClient.connect()
    .then(() => console.log("Connected to TimescaleDB in db processor"))
    .catch(err => console.error("Connection error in db processor", err));

    await pgClient.query('REFRESH MATERIALIZED VIEW klines_1m');
    await pgClient.query('REFRESH MATERIALIZED VIEW klines_1h');
    await pgClient.query('REFRESH MATERIALIZED VIEW klines_1w');

    console.log("Materialized views refreshed successfully");
}

refreshViews().catch(console.error);

setInterval(() => {
    refreshViews()
}, 1000 * 10);