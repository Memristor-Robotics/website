const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
const yaml = require('yamljs');
const config = require('./config');


let translation = null;
config.year = (new Date()).getFullYear();
config.t = () => {
    return (val) => {
        return translation[val] !== undefined ? translation[val] : val;
    };
};

function discoverLanguages() {
    let lanuageFiles = fs.readdirSync('./translations/');
    return lanuageFiles.map(x => x.split('.')[0])
}

function renderFile() {
    let mustacheContent = fs.readFileSync('public/index.mustache').toString();

    // Load languages in config
    config['languages'] = [];
    for (let language of discoverLanguages()) {
        config['languages'].push({
            'code': language,
            'code_up': language.toUpperCase(),
            'file': language === config['default_language'] ? 'index.html' : language + '.html',
        });
    }

    for (let language of discoverLanguages()) {
        config['language'] = config['languages'].find(x => x.code === language);

        let outputFilepath = path.join('./public/', config['language']['file']);
        let translationFilename = path.join('./translations/', language + '.yml');
        translation = yaml.load(translationFilename);

        let html = Mustache.to_html(mustacheContent, config);
        fs.writeFileSync(outputFilepath, html);
    }
}


function main() {
    renderFile();
}

main();
