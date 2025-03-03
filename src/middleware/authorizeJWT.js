const jwt = require("jsonwebtoken");

// const jwt = require("jsonwebtoken");

// function authorizeJWT(req, res, next) {
//     const authHeader = req.header("Authorization");

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({ message: "Token tidak tersedia atau format salah!" });
//     }

//     const token = authHeader.split(" ")[1]; // Ambil hanya tokennya
//     console.log("Token yang diterima:", token);

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = {
//             id: Number(decoded.userId), // Gunakan userId yang benar dari token
//             role: decoded.role
//         };
//         console.log("Decoded JWT:", req.user);
//         next();
//     } catch (error) {
//         console.error("JWT Error:", error);
//         res.status(403).json({ message: "Token tidak valid!" });
//     }
// }


function authorizeJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token tidak diberikan!" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Debugging
        req.user = decoded; // Pastikan req.user diisi
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token tidak valid!" });
    }
}


module.exports = authorizeJWT;
