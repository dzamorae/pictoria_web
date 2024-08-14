const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function openDb() {
  return open({
    filename: path.join(__dirname, './database.db'),
    driver: sqlite3.Database
  });
}

module.exports = openDb;
