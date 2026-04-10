CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    max_participants INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_events_max_participants_positive
        CHECK (max_participants IS NULL OR max_participants > 0)
    , INDEX idx_events_date_time (date, time)
    , INDEX idx_events_title (title)
    , INDEX idx_events_organizer (organizer)
    , INDEX idx_events_location (location)
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    full_name VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    roll_no VARCHAR(64) NULL,
    branch VARCHAR(128) NULL,
    year_of_study VARCHAR(32) NULL,
    phone VARCHAR(32) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_registrations_event
        FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT uq_event_registrations_event_email UNIQUE (event_id, email),
    INDEX idx_event_registrations_event_id (event_id),
    INDEX idx_event_registrations_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS Team (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(64) NOT NULL,
    url VARCHAR(1024) NULL,
    role ENUM('Head', 'Co-Head', 'Admin', 'Co-Admin', 'Core Team', 'Member') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_team_roll_no UNIQUE (roll_no),
    INDEX idx_team_role (role),
    INDEX idx_team_name (name)
);

CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    type ENUM('pdf', 'article', 'video', 'link', 'doc', 'other') NOT NULL,
    url VARCHAR(2048) NOT NULL,
    category VARCHAR(255) NULL,
    uploaded_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_resources_type (type),
    INDEX idx_resources_category (category),
    INDEX idx_resources_uploaded_by (uploaded_by),
    INDEX idx_resources_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS join_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    year VARCHAR(32) NULL,
    interest VARCHAR(255) NULL,
    message TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_join_applications_email (email),
    INDEX idx_join_applications_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_description TEXT NULL,
    full_description TEXT NULL,
    tech_stack TEXT NULL,
    github_url VARCHAR(2048) NULL,
    live_url VARCHAR(2048) NULL,
    image_url VARCHAR(2048) NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'active',
    current_lead VARCHAR(255) NULL,
    former_leads TEXT NULL,
    contributors TEXT NULL,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_projects_featured_order (featured, display_order),
    INDEX idx_projects_status (status)
);

CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(128) NOT NULL,
    team_domain VARCHAR(128) NULL,
    year VARCHAR(32) NULL,
    bio TEXT NULL,
    skills TEXT NULL,
    photo_url VARCHAR(2048) NULL,
    linkedin_url VARCHAR(2048) NULL,
    github_url VARCHAR(2048) NULL,
    email VARCHAR(255) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_team_members_active_order (active, display_order),
    INDEX idx_team_members_role (role)
);

CREATE TABLE IF NOT EXISTS former_leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NULL,
    tenure_start DATE NULL,
    tenure_end DATE NULL,
    handled_projects TEXT NULL,
    linkedin_url VARCHAR(2048) NULL,
    github_url VARCHAR(2048) NULL,
    photo_url VARCHAR(2048) NULL,
    short_note TEXT NULL,
    visible_on_site BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_former_leads_visible (visible_on_site),
    INDEX idx_former_leads_tenure_end (tenure_end)
);

CREATE TABLE IF NOT EXISTS website_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NULL,
    description TEXT NULL,
    date DATE NULL,
    venue VARCHAR(255) NULL,
    registration_link VARCHAR(2048) NULL,
    poster_image_url VARCHAR(2048) NULL,
    speakers TEXT NULL,
    organizers TEXT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'upcoming',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_website_events_featured_date (featured, date),
    INDEX idx_website_events_status (status)
);
