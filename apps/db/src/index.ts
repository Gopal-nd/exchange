import { createClient } from 'redis';  
import { pgClient, type DbMessage } from './types';



// connect to timescaledb
pgClient.connect()
.then(() => console.log("Connected to TimescaleDB in db processor"))
.catch(err => console.error("Connection error in db processor", err));

async function main() {
    const redisClient = createClient();
    await redisClient.connect();
    console.log("connected to redis");

    while (true) {
        const response = await redisClient.rPop("db_processor" as string)
        if (!response) {

        }  else {
            const data: DbMessage = JSON.parse(response);
            if (data.type === "TRADE_ADDED") {
                console.log("adding data");
                console.log(data);
                const price = data.data.price;
                const timestamp = new Date(data.data.timestamp);
                const query = 'INSERT INTO tata_prices (time, price) VALUES ($1, $2)';
                // TODO: How to add volume?
                const values = [timestamp, price];
                await pgClient.query(query, values)
                .then(() => console.log("Data added to TimescaleDB"))
                .catch(err => console.error("Error adding data to TimescaleDB", err));
            }
        }
    }

}

main();