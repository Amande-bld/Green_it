import express from "express";
import bcrypt from "bcrypt";
import db from "../lib/db.js";
import { generateToken } from "../lib/utils.js";
import { protectedRoute } from "../lib/protect.js";
import { clearUsersCache } from "../routes/api.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const router = express.Router();

const isProduction = process.env.NODE_ENV === 'production';

router.post('/signup', async(req, res)=>{
    const {username, email, password} = req.body;
    if (!username || !email || !password) return res.status(400).json({error: "All fields are required"});
    if (!EMAIL_REGEX.test(email)) return res.status(400).json({error: "Invalid email format"});
    if (password.length < 6) return res.status(400).json({error: "Password must be at least 6 characters"});

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute("INSERT INTO user (username, email, password) VALUES (?, ?, ?)", [username, email.toLowerCase(), hashedPassword]);
        clearUsersCache();

        const token = generateToken(username);
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });
        return res.status(201).json({message: "User created successfully", user: {username, email: email.toLowerCase()}});
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes('email')) return res.status(400).json({error: "Email already in use"});
            return res.status(400).json({error: "Username already taken"});
        }
        console.log("Error in signup: ", error);
        return res.status(500).json({error: "Internal error"});
    }
});

router.post('/login', async(req, res)=>{
    const {email, password} = req.body;
    if (!email || !password) return res.status(400).json({error: "All fields are required"});
    try {
        const [rows] = await db.execute("SELECT username, email, password, is_admin FROM user WHERE email = ?", [email.toLowerCase()]);
        const user = rows[0];
        if (!user) return res.status(400).json({error: "Invalid credentials"});

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(400).json({error: "Invalid credentials"});

        const token = generateToken(user.username);
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });
        return res.status(200).json({message: "Logged in successfully", user: {username: user.username, email: user.email, is_admin: user.is_admin}});
    } catch (error) {
        console.error("Error in login: ", error);
        return res.status(500).json({ error: "Internal error"});
    }
});

router.post('/logout', protectedRoute, async(req, res)=>{
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        return res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.error("Error in logout: ", error);
        return res.status(500).json({ error: "Internal error" });
    }
});

router.put('/update', protectedRoute, async(req, res)=>{
    const user = req.user;
    const {username} = req.body;
    if (!username) return res.status(400).json({error: "Missing data"});
    if (username === user.username) return res.status(400).json({error: "No modification"});

    try {
        const [result] = await db.execute("SELECT username FROM user WHERE username = ?", [username]);
        if (result.length) return res.status(400).json({error: "Username already taken"});

        const old = user.username;
        const connection = await db.getConnection();
        try {
            await connection.query("SET FOREIGN_KEY_CHECKS = 0");
            await connection.beginTransaction();
            await connection.execute("UPDATE user SET username = ? WHERE username = ?", [username, old]);
            await connection.execute("UPDATE folder SET username = ? WHERE username = ?", [username, old]);
            await connection.execute("UPDATE group_user SET username = ? WHERE username = ?", [username, old]);
            await connection.execute("UPDATE task_user SET username = ? WHERE username = ?", [username, old]);
            await connection.execute("UPDATE task SET folder_username = ? WHERE folder_username = ?", [username, old]);
            await connection.execute("UPDATE message SET username = ? WHERE username = ?", [username, old]);
            await connection.execute("UPDATE user_group SET createdBy = ? WHERE createdBy = ?", [username, old]);
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            await connection.query("SET FOREIGN_KEY_CHECKS = 1");
            connection.release();
        }

        clearUsersCache();

        const [rows] = await db.execute("SELECT username, email, is_admin FROM user WHERE username = ?", [username]);
        const token = generateToken(username);
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });

        return res.status(200).json({message: "Username updated", user: rows[0]});
    } catch (error) {
        console.error("Error in update: ", error);
        return res.status(500).json({ error: "Internal error" });
    }
});

router.delete('/delete', protectedRoute, async(req, res)=>{
    try {
        await db.execute("DELETE FROM user WHERE username = ?", [req.user.username]);
        clearUsersCache();
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });
        return res.status(200).json({message: "Account deleted successfully"});
    } catch (error) {
        console.error("Error in delete account: ", error);
        return res.status(500).json({ error: "Internal error" });
    }
});

router.get('/check', protectedRoute, async(req, res)=>{
    try {
        const [rows] = await db.execute("SELECT username, email, is_admin FROM user WHERE username = ?", [req.user.username]);
        if (!rows[0]) return res.status(401).json({error: "User not found"});
        return res.status(200).json(rows[0]);
    } catch (error) {
        return res.status(500).json({error: "Internal error"});
    }
});

export default router;