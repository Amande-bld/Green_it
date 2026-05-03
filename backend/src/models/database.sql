CREATE TABLE user (
    username VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE folder (
    name VARCHAR(100),
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(50) NOT NULL,
    PRIMARY KEY (name, username),
    FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE user_group (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdBy VARCHAR(50) NOT NULL,
    FOREIGN KEY (createdBy) REFERENCES user(username) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE group_user (
    username VARCHAR(50),
    group_id INT,
    PRIMARY KEY (username, group_id),
    FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (group_id) REFERENCES user_group(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE task (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    deadline DATE,
    priority VARCHAR(20),
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    folder_name VARCHAR(100) NULL,
    folder_username VARCHAR(50) NULL,
    group_id INT,
    carbon_impact INT DEFAULT 0,
    FOREIGN KEY (folder_name, folder_username) REFERENCES folder(name, username) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (group_id) REFERENCES user_group(id) ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE task_user (
    username VARCHAR(50),
    task_id INT,
    PRIMARY KEY (username, task_id),
    FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    username VARCHAR(50) NOT NULL,
    group_id INT NOT NULL,
    FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (group_id) REFERENCES user_group(id) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE INDEX idx_task_user_username ON task_user(username);
CREATE INDEX idx_task_user_task_id ON task_user(task_id);
CREATE INDEX idx_task_group_id ON task(group_id);
CREATE INDEX idx_task_folder ON task(folder_name, folder_username);
CREATE INDEX idx_group_user_username ON group_user(username);
CREATE INDEX idx_group_user_group_id ON group_user(group_id);
CREATE INDEX idx_message_group_id ON message(group_id);
CREATE INDEX idx_group_created_by ON user_group(createdBy);