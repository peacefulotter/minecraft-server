import { Database } from 'bun:sqlite'

const db = new Database(':memory:')

db.query('CREATE TABLE USERS (id INTEGER PRIMARY KEY, name TEXT)').run()

const insertUser = db.query('INSERT INTO USERS (name) VALUES ($name)')
const insertUsers = db.transaction((users) => {
    for (const name of users) {
        insertUser.run(name)
    }
})
insertUsers(['alice', 'bob', 'carol'])

const c = db.query('SELECT * FROM USERS LIMIT 2')
console.log(c)
const f = c.all()
console.log(f)

// const query = db.query(`select $message;`);
// query.get({ $message: "Hello world" });
