// import { Database } from 'bun:sqlite'

// const db = new Database(':memory:')

// db.query('CREATE TABLE USERS (id INTEGER PRIMARY KEY, name TEXT)').run()

// const insertUser = db.query('INSERT INTO USERS (name) VALUES ($name)')
// const insertUsers = db.transaction((users) => {
//     for (const name of users) {
//         insertUser.run(name)
//     }
// })
// insertUsers(['alice', 'bob', 'carol'])

// const c = db.query('SELECT * FROM USERS LIMIT 2')
// console.log(c)
// const f = c.all()
// console.log(f)

// const query = db.query(`select $message;`)
// query.get({ $message: 'Hello world' })

import { block_id_to_name } from './block_id_to_name'
import { block_name_to_menu } from './block_name_to_menu'
import { block_name_to_default_state_id } from './block_name_to_default_state_id'
import { blocks } from './blocks'
import { item_id_to_name } from './item_id_to_name'

export type BlockMenuName = keyof typeof DB.block_name_to_menu

export const DB = {
    block_id_to_name,
    block_name_to_menu,
    block_name_to_default_state_id,
    blocks,
    item_id_to_name,
}
