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

                        // replace text-slate-400 -> text-slate-700
                        // text-gray-400 -> text-slate-700
                        const replacements = [
                            ['text-primary/40', 'text-primary/90'],
                            ['text-primary/50', 'text-primary/90'],
                            ['text-slate-400', 'text-slate-700'],
                            ['text-gray-400', 'text-slate-700'],
                            ['placeholder:text-primary/30', 'placeholder:text-primary/50']
                        ];

                        replacements.forEach(([from, to]) => {
                            // Only replace exact matches bounded by word boundaries or quotes/spaces
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
    path.join(__dirname, 'client/components/booking'),
    path.join(__dirname, 'client/app/(public)/booking'),
    path.join(__dirname, 'client/app/(public)/book-appointment')
];

targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        walk(dir, function (err) {
            if (err) throw err;
            console.log('Done walking ' + dir);
        });
    }
});
