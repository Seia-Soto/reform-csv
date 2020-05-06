const fs = require('fs')
const readline = require('readline')
const path = require('path')
const knex = require('knex')

const pkg = require(path.join(__dirname, 'package.json'))

console.log(`${pkg.name}@v${pkg.version}`)

const cwd = process.cwd()
const argv = process.argv.slice(2)

const input = {
  path: path.join(cwd, argv[0] || '')
}
const output = {
  path: path.join(cwd, argv[1] || argv[0] + '.db')
}

input.stream = fs.createReadStream(input.path)

console.log('INPUT: ' + input.path)
console.log('OUTPUT: ' + output.path)

const isIOpathValid =
  (fs.existsSync(input.path) && !fs.lstatSync(input.path).isDirectory()) &&
  (!fs.existsSync(output.path) || fs.lstatSync(output.path).isDirectory())

if (!isIOpathValid) {
  throw new Error('ERROR: Input file is not exists or output is path already exists.')
}

const reformFn = async () => {
  const interface = readline.createInterface({
    input: input.stream,
    crlfDelay: Infinity
  })
  const database = knex({
    client: 'sqlite3',
    connection: {
      filename: output.path
    }
  })
  const keys = []
  let line = 0

  for await (const chunk of interface) {
    const data = chunk.split(',')

    if (!line) {
      for (let i = 0, l = data.length; i < l; i++) {
        keys.push(data[i] || `undef_${i}`)
      }

      if (!await database.schema.hasTable('data')) {
        await database.schema.createTable('data', table => {
          table.increments()

          for (let i = 0, l = keys.length; i < l; i++) {
            table.string(keys[i], 16384)
          }

          return table
        })
      }
    } else {
      const dataset = {}

      for (let i = 0, l = keys.length; i < l; i++) {
        dataset[keys[i]] = data[i] || ''
      }

      await database('data')
        .insert(dataset)
    }

    line += 1
  }
}

reformFn()
  .then(() => {
    console.log('INFO: inserted all data')

    process.exit(0)
  })
