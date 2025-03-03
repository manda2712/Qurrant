const jwt = require("jsonwebtoken");

const authorizationAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization; // Perbaikan di sini

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token tidak diberikan atau salah format" });
    }

    try {
        const token = authHeader.split(" ")[1]; // Ambil token setelah "Bearer "
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded Token:", decoded);

        if (decoded.role !== "Admin") { // Pastikan perbandingan role case-insensitive
            return res.status(403).json({ message: "Tidak dapat diotorisasi, bukan admin" });
        }

        req.user = decoded; // Simpan decoded token ke req.user untuk digunakan di endpoint lain
        next();
    } catch (error) {
        console.error("Authorization error:", error.message);
        return res.status(401).json({ message: "Token tidak valid atau expired" });
    }
};

module.exports = authorizationAdmin;
