const fs = require('fs');
const path = require('path');
const prettyjson = require('prettyjson');

function getPackages() {
    let raw = fs.readFileSync(path.join(__dirname, "sonosthesia-packages.json"))
    let info = JSON.parse(raw)
    console.log("Loaded sonosthesia packages : \n" + prettyjson.render(info));
    return info
}

function repositoryForPackage(package) {
    if (!package.startsWith("com.sonosthesia.")) {
        throw new Error("unexpected package format")
    }
    let name = package.split(".")[2]
    return "sonosthesia-unity-" + name

}

module.exports = {
    getPackages : getPackages,
    repositoryForPackage : repositoryForPackage
}