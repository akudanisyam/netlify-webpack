const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * Membuat konfigurasi webpack secara otomatis berdasarkan struktur folder
 * @param {Object} options - Opsi konfigurasi
 * @param {string} [options.baseDirPages='./src/pages'] - Direktori dasar untuk halaman
 * @param {string[]} [options.jsExtensions=['.js']] - Ekstensi file JavaScript yang valid
 * @param {string[]} [options.htmlExtensions=['.html']] - Ekstensi file HTML yang valid
 * @param {string[]} [options.exclude=[]] - Folder yang akan dikecualikan
 * @returns {Object} Objek berisi entry points dan plugin HTML
 */
const createWebpackConfig = (options = {}) => {
    // Destructuring options dengan nilai default
    const {
        baseDirPages = './src/pages',
        jsExtensions = ['.js'],
        htmlExtensions = ['.html'],
        exclude = []
    } = options;

    const entry = {};
    const htmlPlugins = [];

    /**
     * Membuat entry point untuk webpack
     * @param {string} name - Nama entry point
     * @param {string} relativePath - Path relatif file
     */
    const createEntryPoint = (name, relativePath) => {
        entry[name] = './' + path.posix.join(baseDirPages.replace(/^\.\//, ''), relativePath).replace(/\\/g, '/');
    };

    /**
     * Membuat plugin HTML untuk webpack
     * @param {string} name - Nama file HTML
     * @param {string} relativePath - Path relatif file HTML
     */
    const createHtmlPlugin = (name, relativePath) => {
        htmlPlugins.push(new HtmlWebpackPlugin({
            template: './' + path.posix.join(baseDirPages.replace(/^\.\//, ''), relativePath).replace(/\\/g, '/'),
            filename: `${name}.html`,
            chunks: [name],
        }));
    };

    /**
     * Memproses file individual
     * @param {string} relativePath - Path relatif file
     * @param {string} ext - Ekstensi file
     */
    const processFile = (relativePath, ext) => {
        const name = path.basename(relativePath, ext);
        if (jsExtensions.includes(ext)) createEntryPoint(name, relativePath);
        if (htmlExtensions.includes(ext)) createHtmlPlugin(name, relativePath);
    };

    /**
     * Membaca direktori secara rekursif
     * @param {string} dir - Direktori yang akan dibaca
     */
    const readDirRecursively = (dir) => {
        fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
            const fullPath = path.join(dir, dirent.name);
            const relativePath = path.relative(baseDirPages, fullPath);

            if (dirent.isDirectory() && !exclude.includes(dirent.name)) {
                readDirRecursively(fullPath);
            } else if (dirent.isFile()) {
                processFile(relativePath, path.extname(dirent.name));
            }
        });
    };

    try {
        // Mulai membaca direktori dari baseDirPages
        readDirRecursively(baseDirPages);
    } catch (error) {
        console.error('Error saat membaca direktori:', error);
    }

    // Mengembalikan objek berisi entry points dan plugin HTML
    return { entry, htmlPlugins };
};

module.exports = createWebpackConfig;