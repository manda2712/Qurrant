const express = require("express");
const router = express.Router();
const userService = require("./user.service");

// Perbaiki path middleware jika perlu
const adminAuthorization = require("../middleware/adminAuthorization");
const authorizeJWT = require("../middleware/authorizeJWT");

router.post("/", adminAuthorization, async (req, res) => {
    try {
        const userData = req.body;
        const newUser = await userService.createUser(userData);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get("/", adminAuthorization, async (req, res) => {
    try {
        const users = await userService.getAllUser();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:id", authorizeJWT, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get("/active/reading", adminAuthorization, async (req, res) => {
    try {
        const activeUsers = await userService.getActiveUsers();
        res.status(200).json(activeUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch("/:id", authorizeJWT, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const userData = req.body;
        const updatedUser = await userService.editUserById(userId, userData);

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        delete updatedUser.password;
        res.status(200).json({ data: updatedUser, message: "User updated successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete("/:id", adminAuthorization, async (req, res) => {
    try {
        const userId = Number(req.params.id);
        console.log("ID yang diterima untuk dihapus:", userId);

        if (isNaN(userId)) {
            return res.status(400).json({ message: "User ID tidak valid!" });
        }

        const deletedUser = await userService.deleteUserById(userId);

        if (!deletedUser) {
            console.log("User tidak ditemukan di database.");
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error saat menghapus user:", error.message);
        res.status(500).json({ message: "Terjadi kesalahan pada server!" });
    }
});



module.exports = router;
