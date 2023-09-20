const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const app = express();
const pg = require("pg");
const client = new pg.Client("postgres://localhost/cowboys_db");

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());



app.get("/api/cowboys", async (req, res, next) => {
    try{
        const SQL = `
            SELECT *
            FROM cowboys
        `;
        const response = await client.query(SQL);
        res.send(response.rows);

    } catch (error) {
        next(error);
    }
})

app.get("/api/cowboys/:id", async (req, res, next) => {
    try{
        const SQL = `
            SELECT *
            FROM cowboys
            WHERE id = $1
        `;
        const response = await client.query(SQL, [req.params.id]);

        if(response.rows.length === 0) {
            throw new Error("ID does not exist")
        }

        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.delete("/api/cowboys/:id", async (req, res, next) => {
    try{
        const SQL = `
            DELETE
            FROM cowboys
            WHERE id=$1
        `; 
        const response = await client.query(SQL, [req.params.id]);
        res.send(response.rows)

    } catch (error) {
        next(error);
    }
});

app.post("/api/cowboys", async (req, res, next) => {
    try{
        const SQL = `
            INSERT INTO cowboys(name, position, number)
            VALUES($1, $2, $3)
            RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.position, req.body.number]);
        res.send(response.rows)
        
    } catch (error) {
        next(error);
    }
});

app.put("/api/cowboys/:id", async (req, res, next) => {
    try{
        const SQL = `
            UPDATE cowboys
            SET name = $1, position = $2, number = $3
            WHERE id = $4
            RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.position, req.body.number, req.params.id]);
        res.send(response.rows)
    } catch (error) {
        next(error);
    }
})

app.use("*", (req, res, next) => {
    res.status(404).send("invalid route")
});

app.use((err, req, res, next) => {
    console.log("error handler");
    res.status(500).send(err.message)
});

app

const setup = async() => {
    await client.connect();
    console.log("connected to DB")

    const SQL = `
        DROP TABLE IF EXISTS cowboys;
        CREATE TABLE cowboys(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            position VARCHAR(100),
            number INT
        );
        INSERT INTO cowboys (name, position, number) VALUES ('dak prescott', 'qb', 4);
        INSERT INTO cowboys (name, position, number) VALUES ('tony pollard', 'rb', 20);
        INSERT INTO cowboys (name, position, number) VALUES ('trevon diggs', 'cb', 7);
        INSERT INTO cowboys (name, position, number) VALUES ('micah parsons', 'lb', 11);

    `;



    await client.query(SQL);
    console.log("table seeded")
    
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`listening on ${port}`);
    })
}
setup()