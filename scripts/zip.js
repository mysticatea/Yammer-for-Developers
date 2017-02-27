/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const fs = require("fs")
const archiver = require("archiver")

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

const output = fs.createWriteStream("y4d.zip")
const archive = archiver("zip", {store: true})

output.on("error", (err) => {
    throw err
})
archive.on("error", (err) => {
    throw err
})

archive.pipe(output)
archive.directory("y4d/")
archive.finalize()
