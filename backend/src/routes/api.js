import express from "express";
import db from "../lib/db.js";
import { protectedRoute } from "../lib/protect.js";
import { areArraysEqual } from "../lib/utils.js";

const STATUS = {
    'to do': 'doing',
    'doing': 'done',
    'done': 'to do'
};

const router = express.Router();

// Cache simple pour GET /user
let usersCache = null;
let usersCacheTime = null;
const CACHE_TTL = 60000; // 1 minute

export const clearUsersCache = () => {
    usersCache = null;
    usersCacheTime = null;
};

// Fonction utilitaire pour forcer le format DATE de MySQL (YYYY-MM-DD)
const formatDateForMySQL = (dateInput) => {
    if (!dateInput) return null;
    if (typeof dateInput === 'string') {
        return dateInput.split('T')[0];
    }
    try {
        const d = new Date(dateInput);
        return d.toISOString().split('T')[0];
    } catch (e) {
        return null;
    }
};

// --- ROUTES TÂCHES ---

router.get("/task", protectedRoute, async (req, res) => {
    const user = req.user;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 5));
    const offset = (page - 1) * limit;

    const conditions = ['task_user.username = ?'];
    const params = [user.username];

    if (req.query.status) {
        conditions.push('task.status = ?');
        params.push(req.query.status);
    }
    if (req.query.priority) {
        conditions.push('task.priority = ?');
        params.push(req.query.priority);
    }
    if (req.query.folder_name) {
        conditions.push('task.folder_name = ?');
        params.push(req.query.folder_name);
    }
    if (req.query.group_id) {
        conditions.push('task.group_id = ?');
        params.push(parseInt(req.query.group_id));
    }

    const where = conditions.join(' AND ');

    try {
        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM task LEFT JOIN task_user ON task.id = task_user.task_id WHERE ${where}`,
            params
        );

        const [tasks] = await db.query(
            `SELECT task.id, task.title, task.description, task.status, task.deadline, task.priority, task.date, task.folder_name, task.group_id, task.carbon_impact, user_group.name AS group_name
             FROM task
             LEFT JOIN task_user ON task.id = task_user.task_id
             LEFT JOIN user_group ON task.group_id = user_group.id
             WHERE ${where}
             ORDER BY FIELD(task.status, 'to do', 'doing', 'done'), task.date DESC
             LIMIT ${limit} OFFSET ${offset}`,
            params
        );

        return res.status(200).json({
            data: tasks,
            total: Number(total),
            page,
            totalPages: Math.ceil(Number(total) / limit)
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return res.status(500).json({ error: error.message });
    }
});

router.post("/task", protectedRoute, async (req, res) => {
    const user = req.user;
    const { title, description, status, deadline, priority, folder_name, group_id, usernames, carbon_impact } = req.body;
    const folder_username = user.username;

    if (!title || !status) return res.status(400).json({ error: "Missing data" });

    const formattedDeadline = formatDateForMySQL(deadline);

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        if (folder_name) {
            const [folder] = await connection.execute("SELECT name FROM folder WHERE name = ? AND username = ?", [folder_name, folder_username]);
            if (folder.length === 0) return res.status(400).json({ error: `Folder ${folder_name} does not exist` });
        }

        const [taskResult] = await connection.execute(
            "INSERT INTO task (title, description, status, deadline, priority, folder_name, folder_username, group_id, carbon_impact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [title, description || null, status, formattedDeadline, priority || null, folder_name || null, folder_name ? folder_username : null, group_id || null, carbon_impact || 0]
        );
        const taskId = taskResult.insertId;

        const usersToAdd = new Set(usernames || []);
        usersToAdd.add(user.username);

        const taskUserValues = [...usersToAdd].map(u => [taskId, u]);
        await connection.query("INSERT INTO task_user (task_id, username) VALUES ?", [taskUserValues]);

        await connection.commit();
        return res.status(201).json({ message: "Task created successfully", id: taskId });
    } catch (error) {
        await connection.rollback();
        console.error("Error in post task:", error);
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

router.put("/task", protectedRoute, async (req, res) => {
    const user = req.user;
    const { id } = req.body;
    try {
        const [result] = await db.execute("SELECT status FROM task JOIN task_user ON task.id = task_user.task_id WHERE task.id = ? AND task_user.username = ?", [id, user.username]);
        if (result.length === 0) return res.status(400).json({ error: "Action not allowed" });

        const nextStatus = STATUS[result[0].status] || result[0].status;
        await db.execute("UPDATE task SET status = ? WHERE id = ?", [nextStatus, id]);
        return res.status(200).json({ id, status: nextStatus });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.put("/task/update", protectedRoute, async (req, res) => {
    const user = req.user;
    const { id, title, description, status, deadline, priority, folder_name, group_id, usernames, carbon_impact } = req.body.data;

    if (!id) return res.status(400).json({ error: "Missing id" });

    try {
        const [verifTask] = await db.execute("SELECT task.id, task.title, task.description, task.status, task.deadline, task.priority, task.folder_name, task.folder_username, task.group_id, task.carbon_impact FROM task JOIN task_user ON task.id = task_user.task_id WHERE task.id = ? AND task_user.username = ?", [id, user.username]);
        if (verifTask.length === 0) return res.status(400).json({ error: "Action not allowed" });
        const current = verifTask[0];

        const formattedDeadline = formatDateForMySQL(deadline) || formatDateForMySQL(current.deadline);

        await db.execute(
            "UPDATE task SET title = ?, description = ?, status = ?, deadline = ?, priority = ?, folder_name = ?, folder_username = ?, group_id = ?, carbon_impact = ? WHERE id = ?",
            [
                title || current.title,
                description || current.description,
                status || current.status,
                formattedDeadline,
                priority || current.priority,
                folder_name || null,
                folder_name ? user.username : null,
                group_id || null,
                carbon_impact !== undefined ? carbon_impact : current.carbon_impact,
                id
            ]
        );

        const usersToSet = new Set(usernames || []);
        usersToSet.add(user.username);
        await db.execute("DELETE FROM task_user WHERE task_id = ?", [id]);

        const taskUserValues = [...usersToSet].map(u => [id, u]);
        await db.query("INSERT INTO task_user (task_id, username) VALUES ?", [taskUserValues]);

        return res.status(200).json({ message: "Task updated successfully" });
    } catch (error) {
        console.error("Error in task update:", error);
        return res.status(500).json({ error: error.message });
    }
});

router.delete("/task", protectedRoute, async (req, res) => {
    const user = req.user;
    try {
        await db.execute(
            "DELETE FROM task WHERE id = ? AND id IN (SELECT task_id FROM task_user WHERE username = ?)",
            [req.body.id, user.username]
        );
        return res.status(200).json({ message: "Task deleted" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// --- ROUTES DOSSIERS ---

router.get("/folder", protectedRoute, async (req, res) => {
    try {
        const [folders] = await db.execute("SELECT name, date FROM folder WHERE username = ?", [req.user.username]);
        return res.status(200).json(folders);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post("/folder", protectedRoute, async (req, res) => {
    if (!req.body.name) return res.status(400).json({ error: "Missing name" });
    try {
        await db.execute("INSERT INTO folder (name, username) VALUES (?, ?)", [req.body.name, req.user.username]);
        return res.status(201).json({ message: "Folder created" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.put("/folder", protectedRoute, async (req, res) => {
    const user = req.user;
    const { folder_name, newFolder_name } = req.body.data;
    if (!folder_name || !newFolder_name) return res.status(400).json({ error: "Missing data" });

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [folder] = await connection.execute("SELECT name FROM folder WHERE name = ? AND username = ?", [folder_name, user.username]);
        if (folder.length === 0) return res.status(400).json({ error: "Folder not found" });

        await connection.execute("UPDATE folder SET name = ? WHERE name = ? AND username = ?", [newFolder_name, folder_name, user.username]);
        await connection.execute("UPDATE task SET folder_name = ?, folder_username = ? WHERE folder_name = ? AND (folder_username = ? OR folder_username IS NULL)", [newFolder_name, user.username, folder_name, user.username]);

        await connection.commit();
        return res.status(200).json({ message: "Folder renamed successfully" });
    } catch (error) {
        await connection.rollback();
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

router.delete("/folder", protectedRoute, async (req, res) => {
    const user = req.user;
    const { folder_name } = req.body;
    if (!folder_name) return res.status(400).json({ error: "Missing folder_name" });

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        await connection.execute("UPDATE task SET folder_name = NULL, folder_username = NULL WHERE folder_name = ? AND folder_username = ?", [folder_name, user.username]);
        await connection.execute("DELETE FROM folder WHERE name = ? AND username = ?", [folder_name, user.username]);

        await connection.commit();
        return res.status(200).json({ message: "Folder deleted successfully" });
    } catch (error) {
        await connection.rollback();
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// --- ROUTES GROUPES ---

router.get("/group", protectedRoute, async (req, res) => {
    try {
        const [groups] = await db.execute(
            "SELECT user_group.id, user_group.name, user_group.description, user_group.date, user_group.createdBy FROM user_group JOIN group_user ON user_group.id = group_user.group_id WHERE group_user.username = ?",
            [req.user.username]
        );
        return res.status(200).json(groups);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post("/group", protectedRoute, async (req, res) => {
    const user = req.user;
    const { name, description, usernames } = req.body;
    if (!name) return res.status(400).json({ error: "Missing name" });

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [result] = await connection.execute(
            "INSERT INTO user_group (name, description, createdBy) VALUES (?, ?, ?)",
            [name, description || null, user.username]
        );
        const groupId = result.insertId;

        const members = new Set(usernames || []);
        members.add(user.username);

        const groupUserValues = [...members].map(u => [u, groupId]);
        await connection.query("INSERT INTO group_user (username, group_id) VALUES ?", [groupUserValues]);

        await connection.commit();
        return res.status(201).json({ message: "Group created successfully", id: groupId });
    } catch (error) {
        await connection.rollback();
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

router.put("/group/update", protectedRoute, async (req, res) => {
    const user = req.user;
    const { id, name, description, usernames } = req.body;
    if (!id) return res.status(400).json({ error: "Missing id" });

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [group] = await connection.execute("SELECT id, name, description FROM user_group WHERE id = ? AND createdBy = ?", [id, user.username]);
        if (group.length === 0) return res.status(403).json({ error: "Action not allowed" });

        await connection.execute(
            "UPDATE user_group SET name = ?, description = ? WHERE id = ?",
            [name || group[0].name, description ?? group[0].description, id]
        );

        if (usernames) {
            const members = new Set(usernames);
            members.add(user.username);
            await connection.execute("DELETE FROM group_user WHERE group_id = ?", [id]);

            const groupUserValues = [...members].map(u => [u, id]);
            await connection.query("INSERT INTO group_user (username, group_id) VALUES ?", [groupUserValues]);
        }

        await connection.commit();
        return res.status(200).json({ message: "Group updated successfully" });
    } catch (error) {
        await connection.rollback();
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

router.delete("/group/quit", protectedRoute, async (req, res) => {
    const user = req.user;
    const { group_id } = req.body;
    if (!group_id) return res.status(400).json({ error: "Missing group_id" });

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        await connection.execute("DELETE FROM group_user WHERE username = ? AND group_id = ?", [user.username, group_id]);
        await connection.execute(
            "DELETE FROM task_user WHERE username = ? AND task_id IN (SELECT id FROM task WHERE group_id = ?)",
            [user.username, group_id]
        );
        await connection.commit();
        return res.status(200).json({ message: "Left group successfully" });
    } catch (error) {
        await connection.rollback();
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

router.delete("/group", protectedRoute, async (req, res) => {
    const user = req.user;
    const { group_id } = req.body;
    if (!group_id) return res.status(400).json({ error: "Missing group_id" });

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [group] = await connection.execute("SELECT id, name, description FROM user_group WHERE id = ? AND createdBy = ?", [group_id, user.username]);
        if (group.length === 0) return res.status(403).json({ error: "Action not allowed" });

        await connection.execute("DELETE FROM task WHERE group_id = ?", [group_id]);
        await connection.execute("DELETE FROM user_group WHERE id = ?", [group_id]);
        await connection.commit();
        return res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        await connection.rollback();
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// --- ROUTES UTILISATEURS & MESSAGES ---

router.get("/user", protectedRoute, async (req, res) => {
    try {
        if (usersCache && Date.now() - usersCacheTime < CACHE_TTL) {
            return res.status(200).json(usersCache);
        }
        const [users] = await db.execute("SELECT username FROM user");
        usersCache = users;
        usersCacheTime = Date.now();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get("/user/group/:group_id", protectedRoute, async (req, res) => {
    const { group_id } = req.params;
    try {
        const [groupUsers] = await db.execute("SELECT username FROM group_user WHERE group_id = ?", [group_id]);
        return res.status(200).json(groupUsers);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get("/message/:group_id", protectedRoute, async (req, res) => {
    const { group_id } = req.params;
    try {
        const [messages] = await db.execute("SELECT id, content, username, group_id, date FROM message WHERE group_id = ? ORDER BY date ASC", [group_id]);
        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// --- ROUTES ADMIN ---

router.get("/admin/users", protectedRoute, async (req, res) => {
    try {
        const [users] = await db.execute("SELECT username, email FROM user");
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.put("/admin/user", protectedRoute, async (req, res) => {
    const { oldUsername, newUsername, newEmail } = req.body;
    try {
        const connection = await db.getConnection();
        try {
            await connection.query("SET FOREIGN_KEY_CHECKS = 0");
            await connection.beginTransaction();
            await connection.execute("UPDATE user SET username = ?, email = ? WHERE username = ?", [newUsername, newEmail, oldUsername]);
            await connection.execute("UPDATE folder SET username = ? WHERE username = ?", [newUsername, oldUsername]);
            await connection.execute("UPDATE group_user SET username = ? WHERE username = ?", [newUsername, oldUsername]);
            await connection.execute("UPDATE task_user SET username = ? WHERE username = ?", [newUsername, oldUsername]);
            await connection.execute("UPDATE task SET folder_username = ? WHERE folder_username = ?", [newUsername, oldUsername]);
            await connection.execute("UPDATE message SET username = ? WHERE username = ?", [newUsername, oldUsername]);
            await connection.execute("UPDATE user_group SET createdBy = ? WHERE createdBy = ?", [newUsername, oldUsername]);
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            await connection.query("SET FOREIGN_KEY_CHECKS = 1");
            connection.release();
        }
        clearUsersCache();
        return res.status(200).json({ message: "Utilisateur mis à jour" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.delete("/admin/user", protectedRoute, async (req, res) => {
    const { username } = req.body;
    try {
        await db.execute("DELETE FROM user WHERE username = ?", [username]);
        clearUsersCache();
        return res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;