CREATE TABLE board_profiles (
  id VARCHAR(60) NOT NULL,
  version INT NOT NULL,
  display_name VARCHAR(180) NOT NULL,
  notice TEXT NOT NULL,
  logic_voltage NUMERIC(3,1) NOT NULL,
  PRIMARY KEY(id, version)
);
CREATE TABLE board_pins (
  board_profile_id VARCHAR(60) NOT NULL,
  board_profile_version INT NOT NULL,
  gpio INT NOT NULL,
  label VARCHAR(40) NOT NULL,
  capabilities JSONB NOT NULL,
  input_only BOOLEAN NOT NULL DEFAULT FALSE,
  reserved BOOLEAN NOT NULL DEFAULT FALSE,
  warning TEXT,
  PRIMARY KEY(board_profile_id, board_profile_version, gpio),
  FOREIGN KEY(board_profile_id, board_profile_version) REFERENCES board_profiles(id, version)
);
CREATE TABLE module_specs (
  module_id VARCHAR(40) PRIMARY KEY REFERENCES modules(id),
  required_capability VARCHAR(30) NOT NULL,
  suggested_pins JSONB NOT NULL
);
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  current_revision INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE project_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  revision_no INT NOT NULL,
  code TEXT NOT NULL,
  circuit JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, revision_no)
);
CREATE INDEX idx_projects_owner_updated ON projects(owner_user_id, updated_at DESC);

INSERT INTO board_profiles VALUES ('esp32-wroom32-demo',1,'ESP32-WROOM-32 DEMO','DEMO PROFILE — VERIFY AGAINST PHYSICAL HARDWARE',3.3);
INSERT INTO board_pins(board_profile_id,board_profile_version,gpio,label,capabilities,input_only,reserved,warning) VALUES
('esp32-wroom32-demo',1,18,'GPIO18','["digital-in","digital-out","pwm"]',false,false,null),
('esp32-wroom32-demo',1,21,'GPIO21 / SDA','["digital-in","digital-out","i2c-sda"]',false,false,null),
('esp32-wroom32-demo',1,22,'GPIO22 / SCL','["digital-in","digital-out","i2c-scl"]',false,false,null),
('esp32-wroom32-demo',1,23,'GPIO23','["digital-in","digital-out","pwm"]',false,false,null),
('esp32-wroom32-demo',1,25,'GPIO25','["digital-in","digital-out","pwm","adc"]',false,false,null),
('esp32-wroom32-demo',1,26,'GPIO26','["digital-in","digital-out","pwm","adc"]',false,false,null),
('esp32-wroom32-demo',1,34,'GPIO34','["digital-in","adc"]',true,false,'GPIO34 chỉ là đầu vào và không có pull-up nội.'),
('esp32-wroom32-demo',1,35,'GPIO35','["digital-in","adc"]',true,false,'GPIO35 chỉ là đầu vào và không có pull-up nội.');
INSERT INTO module_specs VALUES
('led','digital-out','[23,25,26]'),('button','digital-in','[18,23]'),('pot','adc','[34,35]'),('ldr','adc','[35,34]'),
('buzzer','digital-out','[26,25,23]'),('servo','pwm','[25,26,23]'),('bh1750','i2c-sda','[21]');
