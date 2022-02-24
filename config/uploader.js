const multer = require("multer");
const fs = require("fs");

module.exports = {
    uploader: (directory, fileNamePrefix) => {
        // men define lokasi penyimpanan file
        let defaultDir = './public';

        // diskStorage = proses menyimpan data pada dir public
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                // penentuan alamat directory
                const pathDir = directory ? defaultDir + directory : defaultDir

                // melakukan pengecekan pathDir
                if (fs.existsSync(pathDir)) {
                    // jika pathDir ada, maka directory tersebut akan digunakan untuk menyimpan file
                    console.log(`Directory ${pathDir} exist ✅`);
                    cb(null, pathDir);
                } else {
                    // jika pathDir tidak ada, maka directory akan dibuat
                    fs.mkdir(pathDir, { recursive: true }, (err) => cb(err, pathDir))
                    console.log(`Success create directory ${pathDir} ✅`);
                }
            },
            filename: (req, file, cb) => {
                console.log("isi data file", file)
                // membaca tipe data
                let ext = file.originalname.split('.');
                console.log("extension", ext)

                // buat nama file yang baru
                let fileName = fileNamePrefix + Date.now() + '.' + ext[ext.length -1];
                console.log("new file name", fileName)

                // eksekusi membuat nama file baru
                cb(null, fileName);
            }
        });

        // membuat fungsi untuk filter tipe data

        const fileFilter = (req, file, cb) => {
            // extension file yang diperbolehkan untuk disimpan
            const extFilter = /\.(jpg|png|gif|webp)/

            if (!file.originalname.toLowerCase().match(extFilter)) {
                return cb(new Error("your filr typr are denied ❌"), false)
            }
            cb(null, true)
        }
        return multer({storage, fileFilter});
    }
}