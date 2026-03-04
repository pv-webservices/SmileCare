const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdir(dir, function (err, list) {
        if (err) return callback(err);
        let pending = list.length;
        if (!pending) return callback(null);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err) {
                        if (!--pending) callback(null);
                    });
                } else {
                    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                        let content = fs.readFileSync(file, 'utf8');
                        let changed = false;
                        if (content.includes('font-black')) {
                            content = content.replace(/font-black/g, 'font-bold');
                            changed = true;
                        }
                        if (content.includes('font-extrabold')) {
                            content = content.replace(/font-extrabold/g, 'font-bold');
                            changed = true;
                        }
                        if (changed) {
                            fs.writeFileSync(file, content, 'utf8');
                            console.log('Updated', file);
                        }
                    }
                    if (!--pending) callback(null);
                }
            });
        });
    });
}

walk(path.join(__dirname, 'client'), function (err) {
    if (err) throw err;
    console.log('Done');
});
