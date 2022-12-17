const path = require('path');
const fs = require('fs');
const parser = require('args-parser')
const { getPackages, repositoryForPackage } = require('./sonosthesia-packages')

// memoize
let dependencyCache = {}
function getDependencies(package) {
    if (package in dependencyCache) {
        return dependencyCache[package]
    }
    let repositoryPath = path.join(__dirname, "..", "..", repositoryForPackage(package))
    let packagePath = path.join(repositoryPath, package, "package.json")
    let dependencies = new Set()
    if (fs.existsSync(packagePath)) {
        let packageJSON = JSON.parse(fs.readFileSync(packagePath));
        for (const [dependency, version] of Object.entries(packageJSON.dependencies)) {
            if (!dependency.startsWith("com.sonosthesia")) {
                continue
            }
            dependencies.add(dependency)
            for (const child of getDependencies(dependency)) {
                dependencies.add(child)
            }
        }
    }
    dependencyCache[package] = Array.from(dependencies)
    return dependencyCache[package]
}

function linkPackage(package) {
    let repositoryPath = path.join(__dirname, "..", "..", repositoryForPackage(package))
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
        path.join(__dirname, "..", "..", repositoryForPackage(package), package)
    ).replaceAll(path.sep, "/"); 
    console.log(unityJSON)
    fs.writeFileSync(manifestPath, JSON.stringify(unityJSON, null, 2))
}

function packageDependencies(package) {
    let repositoryPath = path.join(__dirname, "..", "..", repositoryForPackage(package))
    let manifestPath = path.join(repositoryPath, "UnityProject", "Packages", "manifest.json")
    console.log("Switching to packageDependencies " + manifestPath)
    if (!fs.existsSync(manifestPath)) {
        console.log("bailing out...")
        return
    }
    let unityJSON = JSON.parse(fs.readFileSync(manifestPath));
    for (const dependency of getDependencies(package)) {
        if (!dependency.startsWith("com.sonosthesia")) {
            continue
        }
        console.log("processing " + dependency)
        delete unityJSON.dependencies[dependency]
    }
    console.log(unityJSON)
    fs.writeFileSync(manifestPath, JSON.stringify(unityJSON, null, 2))
}

function localDependencies(package) {
    let repositoryPath = path.join(__dirname, "..", "..", repositoryForPackage(package))
    let manifestPath = path.join(repositoryPath, "UnityProject", "Packages", "manifest.json")
    console.log("Switching to localDependencies " + manifestPath)
    if (!fs.existsSync(manifestPath)) {
        console.log("bailing out...")
        return
    }
    let unityJSON = JSON.parse(fs.readFileSync(manifestPath));
    for (const dependency of getDependencies(package)) {
        console.log("processing " + dependency)
        // tried to use path.posix.relative but things get messy
        unityJSON.dependencies[dependency] = "file:" + path.relative(
            path.join(repositoryPath, "UnityProject", "Packages"), 
            path.join(__dirname, "..", "..", repositoryForPackage(dependency), dependency)
        ).replaceAll(path.sep, "/"); 
    }
    console.log(unityJSON)
    fs.writeFileSync(manifestPath, JSON.stringify(unityJSON, null, 2))
}

function run() {
    let args = parser(process.argv)
    let packages = getPackages().packages
    for (const package of packages) {
        if (args.local) {
            localDependencies(package);
        } else if (args.package) {
            packageDependencies(package)
        } else if (args.link) {
            linkPackage(package)
        }
    }
}

run()
