const path = require('path');
const fs = require('fs');
const parser = require('args-parser')

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

function linkPackage(repository, package) {
    let repositoryPath = path.join(__dirname, "..", "..", repository)
    let packagePath = path.join(repositoryPath, package, "package.json")
    let manifestPath = path.join(repositoryPath, "UnityProject", "Packages", "manifest.json")
    console.log("linkPackage " + packagePath + " unity " + manifestPath)
    if (!fs.existsSync(packagePath) || !fs.existsSync(manifestPath)) {
        console.log("bailing out...")
        return
    }
    let unityJSON = JSON.parse(fs.readFileSync(manifestPath));
    unityJSON.dependencies[package] = "file:" + path.relative(
        path.join(repositoryPath, "UnityProject", "Packages"), 
        path.join(__dirname, "..", "..", repository, package)
    ).replaceAll(path.sep, "/"); 
    console.log(unityJSON)
    fs.writeFileSync(manifestPath, JSON.stringify(unityJSON, null, 2))
}

function packageDependencies(repository, package) {
    let repositoryPath = path.join(__dirname, "..", "..", repository)
    let packagePath = path.join(repositoryPath, package, "package.json")
    let manifestPath = path.join(repositoryPath, "UnityProject", "Packages", "manifest.json")
    console.log("packageDependencies " + packagePath + " unity " + manifestPath)
    if (!fs.existsSync(packagePath) || !fs.existsSync(manifestPath)) {
        console.log("bailing out...")
        return
    }
    let packageJSON = JSON.parse(fs.readFileSync(packagePath));
    let unityJSON = JSON.parse(fs.readFileSync(manifestPath));
    for (const [dependency, version] of Object.entries(packageJSON.dependencies)) {
        if (!dependency.startsWith("com.sonosthesia")) {
            continue
        }
        console.log("processing " + dependency)
        delete unityJSON.dependencies[dependency]
    }
    console.log(unityJSON)
    fs.writeFileSync(manifestPath, JSON.stringify(unityJSON, null, 2))
}

function localDependencies(repository, package) {
    let repositoryPath = path.join(__dirname, "..", "..", repository)
    let packagePath = path.join(repositoryPath, package, "package.json")
    let manifestPath = path.join(repositoryPath, "UnityProject", "Packages", "manifest.json")
    console.log("localDependencies " + packagePath + " unity " + manifestPath)
    if (!fs.existsSync(packagePath) || !fs.existsSync(manifestPath)) {
        console.log("bailing out...")
        return
    }
    let packageJSON = JSON.parse(fs.readFileSync(packagePath));
    let unityJSON = JSON.parse(fs.readFileSync(manifestPath));
    for (const [dependency, version] of Object.entries(packageJSON.dependencies)) {
        if (!dependency.startsWith("com.sonosthesia")) {
            continue
        }
        console.log("processing " + dependency)
        // tried to use path.posix.relative but things get messy
        unityJSON.dependencies[dependency] = "file:" + path.relative(
            path.join(repositoryPath, "UnityProject", "Packages"), 
            path.join(__dirname, "..", "..", packages[dependency], dependency)
        ).replaceAll(path.sep, "/"); 
    }
    console.log(unityJSON)
    fs.writeFileSync(manifestPath, JSON.stringify(unityJSON, null, 2))
}

function run() {
    let args = parser(process.argv)
    for (const [package, repository] of Object.entries(packages)) {
        if (args.local) {
            localDependencies(repository, package);
        } else if (args.package) {
            packageDependencies(repository, package)
        } else if (args.link) {
            linkPackage(repository, package)
        }
    }
}

run()
