-- Table : users
CREATE TABLE IF NOT EXISTS users (
   IDusers INT AUTO_INCREMENT,
   name VARCHAR(255) NOT NULL,
   email VARCHAR(255) NOT NULL,
   passwordHash VARCHAR(255) NOT NULL,
   createdAt DATETIME NOT NULL,
   updatedAt DATETIME NOT NULL,
   PRIMARY KEY(IDusers),
   UNIQUE(email)
);

-- Table : resources
CREATE TABLE IF NOT EXISTS resources (
   IDresources INT AUTO_INCREMENT,
   title VARCHAR(50) NOT NULL,
   description VARCHAR(50),
   IDusers INT,
   IDowner INT NOT NULL,
   updatedAt DATETIME NOT NULL,
   createdAt DATETIME NOT NULL,
   PRIMARY KEY(IDresources)
);

-- Table : file_versions
CREATE TABLE IF NOT EXISTS file_versions (
   IDFileVersions VARCHAR(50),
   uploadAt DATETIME,
   IDfile INT,
   versionNumber INT NOT NULL,
   filepath VARCHAR(255),
   PRIMARY KEY(IDFileVersions)
);

-- Table : message (avec 'read' renommé en 'isRead')
CREATE TABLE IF NOT EXISTS message (
   IDmessage INT AUTO_INCREMENT,
   content VARCHAR(50) NOT NULL,
   isRead BOOLEAN NOT NULL,
   createdAt DATETIME NOT NULL,
   IDusers INT NOT NULL,
   PRIMARY KEY(IDmessage),
   FOREIGN KEY(IDusers) REFERENCES users(IDusers)
);

-- Table : file
CREATE TABLE IF NOT EXISTS file (
   IDfile INT AUTO_INCREMENT,
   nameFile VARCHAR(255) NOT NULL,
   typeFile VARCHAR(100),
   createdAt DATE,
   IDusers INT,
   filepath VARCHAR(255),
   IDFileVersions VARCHAR(50) NOT NULL,
   IDusers_1 INT NOT NULL,
   isPublic BOOLEAN DEFAULT FALSE,
   PRIMARY KEY(IDfile),
   FOREIGN KEY(IDFileVersions) REFERENCES file_versions(IDFileVersions),
   FOREIGN KEY(IDusers_1) REFERENCES users(IDusers)
);

-- Index pour les performances sur isPublic
CREATE INDEX idx_file_isPublic ON file(isPublic);
CREATE INDEX idx_file_user_public ON file(IDusers, isPublic);

-- Table : resource_share
CREATE TABLE IF NOT EXISTS resource_share (
   IDresources_1 INT,
   IDusers_1 INT,
   permission VARCHAR(50) NOT NULL,
   createdAt DATETIME NOT NULL,
   IDresources INT,
   IDusers INT,
   PRIMARY KEY(IDresources_1, IDusers_1),
   FOREIGN KEY(IDresources_1) REFERENCES resources(IDresources),
   FOREIGN KEY(IDusers_1) REFERENCES users(IDusers)
);
CREATE TABLE IF NOT EXISTS resources(
   IDresources INT AUTO_INCREMENT,
   title VARCHAR(50) NOT NULL,
   description VARCHAR(50),
   IDusers INT,
   IDowner INT NOT NULL,
   updatedAt DATETIME NOT NULL,
   createdAt DATETIME NOT NULL,
   PRIMARY KEY(IDresources)
);

CREATE TABLE IF NOT EXISTS users(
   IDusers INT AUTO_INCREMENT,
   name VARCHAR(255) NOT NULL,
   email VARCHAR(255) NOT NULL,
   passwordHash VARCHAR(255) NOT NULL,
   createdAt DATETIME NOT NULL,
   updatedAt DATETIME NOT NULL,
   PRIMARY KEY(IDusers),
   UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS file_versions(
   IDFileVersions VARCHAR(50),
   uploadAt DATETIME,
   IDfile INT,
   versionNumber INT NOT NULL,
   filepath VARCHAR(255),
   PRIMARY KEY(IDFileVersions)
);

CREATE TABLE IF NOT EXISTS message(
   IDmessage INT AUTO_INCREMENT,
   content VARCHAR(50) NOT NULL,
   isRead BOOLEAN NOT NULL,
   createdAt DATETIME NOT NULL,
   IDusers INT NOT NULL,
   PRIMARY KEY(IDmessage),
   FOREIGN KEY(IDusers) REFERENCES users(IDusers)
);

CREATE TABLE IF NOT EXISTS file(
   IDfile INT AUTO_INCREMENT,
   nameFile VARCHAR(255) NOT NULL,
   typeFile VARCHAR(100),
   createdAt DATE,
   IDusers INT,
   filepath VARCHAR(255),
   IDFileVersions VARCHAR(50) NOT NULL,
   IDusers_1 INT NOT NULL,
   isPublic BOOLEAN DEFAULT FALSE,
   PRIMARY KEY(IDfile),
   FOREIGN KEY(IDFileVersions) REFERENCES file_versions(IDFileVersions),
   FOREIGN KEY(IDusers_1) REFERENCES users(IDusers)
);

-- Index pour les performances sur isPublic
CREATE INDEX idx_file_isPublic ON file(isPublic);
CREATE INDEX idx_file_user_public ON file(IDusers, isPublic);

CREATE TABLE IF NOT EXISTS resource_share(
   IDresources_1 INT,
   IDusers_1 INT,
   permission VARCHAR(50) NOT NULL,
   createdAt DATETIME NOT NULL,
   IDresources INT,
   IDusers INT,
   PRIMARY KEY(IDresources_1, IDusers_1),
   FOREIGN KEY(IDresources_1) REFERENCES resources(IDresources),
   FOREIGN KEY(IDusers_1) REFERENCES users(IDusers)
);
