import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'greenAlytics_gps',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Initialize database tables
 */
export async function initDatabase() {
  const client = await pool.connect();
  
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        nID SERIAL PRIMARY KEY,
        strUser VARCHAR(50) UNIQUE NOT NULL,
        strPassword VARCHAR(255) NOT NULL,
        strName VARCHAR(100),
        strTel VARCHAR(20),
        strCompany VARCHAR(200),
        strAddress VARCHAR(255),
        strEmail VARCHAR(100),
        strRemark TEXT,
        nLimitSubUser INTEGER DEFAULT 0,
        nLimitCar INTEGER DEFAULT 100,
        nTimeout BIGINT DEFAULT 0,
        nServerTime BIGINT,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add role column if it doesn't exist (migration)
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='role'
        ) THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        END IF;
      END $$;
    `);

    // Devices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        nID SERIAL PRIMARY KEY,
        strTEID VARCHAR(50) UNIQUE NOT NULL,
        strCarNum VARCHAR(100),
        strTESim VARCHAR(20),
        nTEType VARCHAR(20),
        strGroupName VARCHAR(200),
        strOwnerName VARCHAR(100),
        strOwnerTel VARCHAR(20),
        strOwnerAddress VARCHAR(255),
        strRemark TEXT,
        strIconID VARCHAR(10),
        nFuelBoxSize VARCHAR(10),
        nMileageInit VARCHAR(20),
        nInterval VARCHAR(10),
        nOverSpeed VARCHAR(10),
        nSMSNoticeState VARCHAR(5),
        strSMSNoticeTel1 VARCHAR(20),
        strSMSNoticeTel2 VARCHAR(20),
        strSMSNoticeTel3 VARCHAR(20),
        strNoticeEmail1 VARCHAR(100),
        strNoticeEmail2 VARCHAR(100),
        strNoticeEmail3 VARCHAR(100),
        strPassword VARCHAR(50),
        nCreateTime BIGINT,
        nSwitchType VARCHAR(5),
        strInfo TEXT,
        strOpenID VARCHAR(100),
        strDeviceID VARCHAR(50),
        nLimitTime BIGINT,
        strProvinceID VARCHAR(20),
        strCityID VARCHAR(20),
        strFactoryID VARCHAR(50),
        strDeviceModel VARCHAR(50),
        strPlateColorID VARCHAR(20),
        strPlateNum VARCHAR(50),
        user_id INTEGER REFERENCES users(nID),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on strTEID for fast lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_devices_strTEID ON devices(strTEID)
    `);

    // Locations table (stores all GPS positions)
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        nID SERIAL PRIMARY KEY,
        strTEID VARCHAR(50) NOT NULL,
        nTime BIGINT NOT NULL,
        dbLon DOUBLE PRECISION,
        dbLat DOUBLE PRECISION,
        nDirection INTEGER,
        nSpeed INTEGER,
        nGSMSignal INTEGER,
        nGPSSignal INTEGER,
        nFuel INTEGER,
        nMileage BIGINT,
        nTemp INTEGER,
        nCarState BIGINT,
        nTEState BIGINT,
        nAlarmState BIGINT,
        strOther TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for efficient queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_locations_strTEID ON locations(strTEID)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_locations_nTime ON locations(nTime)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_locations_device_time ON locations(strTEID, nTime DESC)
    `);

    // Latest locations view (stores only the most recent position per device)
    await client.query(`
      CREATE TABLE IF NOT EXISTS latest_locations (
        strTEID VARCHAR(50) PRIMARY KEY,
        nTime BIGINT NOT NULL,
        dbLon DOUBLE PRECISION,
        dbLat DOUBLE PRECISION,
        nDirection INTEGER,
        nSpeed INTEGER,
        nGSMSignal INTEGER,
        nGPSSignal INTEGER,
        nFuel INTEGER,
        nMileage BIGINT,
        nTemp INTEGER,
        nCarState BIGINT,
        nTEState BIGINT,
        nAlarmState BIGINT,
        strOther TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
