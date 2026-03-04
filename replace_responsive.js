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

                        const replacements = [
                            ['px-8 ', 'px-4 sm:px-8 '],
                            ['px-8"', 'px-4 sm:px-8"'],
                            ['p-8 ', 'p-4 sm:p-8 '],
                            ['p-8"', 'p-4 sm:p-8"']
                        ];

                        replacements.forEach(([from, to]) => {
                            if (content.includes(from)) {
                                content = content.split(from).join(to);
                                changed = true;
                            }
                        });

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

const targetDirs = [
    path.join(__dirname, 'client/app/(dashboard)'),
    path.join(__dirname, 'client/app/(public)'),
    path.join(__dirname, 'client/components')
];

targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        walk(dir, function (err) {
            if (err) throw err;
            console.log('Done walking ' + dir);
        });
    }
});
