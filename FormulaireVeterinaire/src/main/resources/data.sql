-- Create the user table if it does not exist
CREATE TABLE IF NOT EXISTS "users" (
                                      id BIGSERIAL PRIMARY KEY,
                                      nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    num_veterinaire VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL,
    is_first_login BOOLEAN NOT NULL
    );

-- Insert initial data into the user table
INSERT INTO "users" (email, password, nom, prenom, num_veterinaire, is_admin, is_first_login)
SELECT 'admin@example.com', '$2a$12$Gc3wvZUBgr5AYKpU2Y7.teXzKKvoAu04LzpDecze8iNQCkhcANy5a', 'Admin', 'User', 'ADMIN123', true, false
    WHERE NOT EXISTS (
    SELECT 1 FROM "users" WHERE email = 'admin@example.com'
);