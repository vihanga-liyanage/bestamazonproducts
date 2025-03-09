-- Enable foreign keys
PRAGMA foreign_keys=ON;

-- Step 1: Create a new table with ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS reward_comments_new (
    id TEXT PRIMARY KEY,
    reward_request_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reward_request_id) REFERENCES reward_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Step 2: Copy data from old table to new table
INSERT INTO reward_comments_new (id, reward_request_id, user_id, comment, created_at)
SELECT id, reward_request_id, user_id, comment, created_at FROM reward_comments;

-- Step 3: Drop the old table
DROP TABLE reward_comments;

-- Step 4: Rename the new table to the original name
ALTER TABLE reward_comments_new RENAME TO reward_comments;
