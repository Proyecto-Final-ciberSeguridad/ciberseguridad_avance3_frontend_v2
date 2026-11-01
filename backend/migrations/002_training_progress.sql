CREATE TABLE IF NOT EXISTS training_progress (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id SMALLINT NOT NULL CHECK (module_id BETWEEN 1 AND 4),
    resource_key VARCHAR(80) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, module_id, resource_key)
);

CREATE INDEX IF NOT EXISTS idx_training_progress_user ON training_progress(user_id);

CREATE TABLE IF NOT EXISTS evaluation_results (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id SMALLINT NOT NULL CHECK (module_id BETWEEN 1 AND 4),
    score SMALLINT NOT NULL CHECK (score >= 0),
    total SMALLINT NOT NULL CHECK (total > 0),
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluation_results_user_module
    ON evaluation_results(user_id, module_id, created_at DESC);
