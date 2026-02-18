CREATE TYPE user_role AS ENUM ('admin', 'teacher');

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL
);

CREATE TABLE rooms (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    capacity        INTEGER,
    has_projector   BOOLEAN NOT NULL DEFAULT FALSE,
    has_computers   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE groups (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(255),
    course          INTEGER
);

CREATE TABLE disciplines (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL
);

CREATE TYPE weekday_enum AS ENUM ('1','2','3','4','5','6');

CREATE TABLE lessons (
    id              SERIAL PRIMARY KEY,
    group_id        INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    teacher_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id         INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    discipline_id   INTEGER REFERENCES disciplines(id) ON DELETE SET NULL,
    subject_raw     TEXT NOT NULL,
    weekday         weekday_enum NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL
);

CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE booking_requests (
    id              SERIAL PRIMARY KEY,
    teacher_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id         INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    group_id        INTEGER REFERENCES groups(id) ON DELETE SET NULL,
    discipline_id   INTEGER REFERENCES disciplines(id) ON DELETE SET NULL,
    subject         TEXT NOT NULL,
    start_datetime  TIMESTAMP NOT NULL,
    end_datetime    TIMESTAMP NOT NULL,
    status          booking_status NOT NULL DEFAULT 'pending',
    admin_comment   TEXT
);

CREATE TYPE constraint_type AS ENUM (
    'no_saturday',
    'no_friday',
    'no_morning',
    'no_after_17_25',
    'only_monday',
    'only_afternoon',
    'fixed_slot',
    'prefer_saturday',
    'prefer_monday'
);

CREATE TABLE teacher_constraints (
    id          SERIAL PRIMARY KEY,
    teacher_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        constraint_type NOT NULL,
    weekday     INTEGER,
    time        TIME,
    value_bool  BOOLEAN
);

CREATE INDEX idx_lessons_room_time
    ON lessons (room_id, weekday, start_time, end_time);

CREATE INDEX idx_booking_room_time
    ON booking_requests (room_id, start_datetime, end_datetime, status);
