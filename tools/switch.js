const path = require('path');
const fs = require('fs');

let packages = {
    "com.sonosthesia.adaptivemidi" : "sonosthesia-unity-adaptivemidi",
    "com.sonosthesia.spawn" : "sonosthesia-unity-flow",
    "com.sonosthesia.midi" : "sonosthesia-unity-midi",
    "com.sonosthesia.spawn" : "sonosthesia-unity-spawn",
    "com.sonosthesia.vfx" : "sonosthesia-unity-vfx",
    "com.sonosthesia.link" : "sonosthesia-unity-link",
    "com.sonosthesia.flow" : "sonosthesia-unity-flow",
    "com.sonosthesia.utils" : "sonosthesia-unity-utils"
}

function switchToLocal(repository, package) {
    let repositoryPath = path.join(__dirname, "..", "..", repository)
    let packagePath = path.join(repositoryPath, package, "package.json")
    let unityPath = path.join(repositoryPath, "UnityProject", "Packages", "manifest.json")
    console.log("switchToLocal package " + packagePath + " unity " + unityPath)
    if (!fs.existsSync(packagePath) || !fs.existsSync(unityPath)) {
        console.log("bailing out...")
        return
    }
    let packageJSON = JSON.parse(fs.readFileSync(packagePath));
    let unityJSON = JSON.parse(fs.readFileSync(unityPath));
    for (const [dependency, version] of Object.entries(packageJSON.dependencies)) {
        if (!dependency.startsWith("com.sonosthesia")) {
            continue
        }
        console.log("processing " + dependency)
        unityJSON.dependencies[dependency] = "file:" + path.join(__dirname, "..", "..", packages[dependency], dependency)
    }
    console.log(unityJSON)
    fs.writeFileSync(unityPath, JSON.stringify(unityJSON, null, 2))
}

function run() {
    for (const [package, repository] of Object.entries(packages)) {
        switchToLocal(repository, package);
    }
}

run()
