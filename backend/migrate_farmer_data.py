import sqlite3

def migrate():
    conn = sqlite3.connect('farmer_app.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Disable foreign keys temporarily
    cursor.execute('PRAGMA foreign_keys=OFF;')
    
    # Rename old table
    cursor.execute('ALTER TABLE farmer_data RENAME TO old_farmer_data;')
    
    # Create new table matching models.py
    cursor.execute('''
        CREATE TABLE farmer_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            
            -- Basic Profile
            age INTEGER,
            gender TEXT,
            education TEXT,
            experience INTEGER,
            income REAL,
            household_size INTEGER,
            
            -- Land & Crop
            land_area REAL,
            land_ownership TEXT,
            crops TEXT,
            soil_type TEXT,
            irrigation_source TEXT,
            water_availability TEXT,
            season TEXT,
            yield_history TEXT,
            market_linkage TEXT,
            
            -- Technology Usage (JSON array)
            technologies_used TEXT,
            other_technology TEXT,
            
            -- Scheme Awareness (JSON array)
            schemes_aware TEXT,
            other_scheme TEXT,
            
            -- Financial Behaviour
            has_loan INTEGER,
            has_insurance INTEGER,
            savings_habit TEXT,
            risk_level TEXT,
            
            -- Tech Attitude (1-5 scale)
            openness INTEGER,
            trust INTEGER,
            peer_influence INTEGER,
            govt_influence INTEGER,

            -- TN Region Details
            block TEXT,
            taluk TEXT,
            village TEXT,
            agro_climatic_zone TEXT,

            -- Water & Energy
            borewell_depth INTEGER,
            water_scarcity_months INTEGER,
            three_phase_power INTEGER,
            power_hours_per_day INTEGER,

            -- Social & Category
            physically_challenged INTEGER,
            farmer_category TEXT,
            farmer_smart_card INTEGER,

            -- Literacy & Language
            read_tamil INTEGER,
            read_english INTEGER,
            voice_guidance_pref INTEGER,

            -- Market & Training
            selling_uzhavar_sandhai INTEGER,
            using_enam INTEGER,
            market_type TEXT,
            attended_training INTEGER,
            met_vao_aeo INTEGER,
            visited_tnau_farm INTEGER,

            -- Digital Usage
            using_uzhavan_app INTEGER,
            watch_agri_youtube INTEGER,
            in_whatsapp_groups INTEGER,

            -- Specific Scheme Awareness (Flags)
            amma_two_wheeler_aware INTEGER,
            tn_micro_irrigation_aware INTEGER,
            tn_free_electricity_aware INTEGER,
            kalaignar_scheme_aware INTEGER,
            tn_soil_health_aware INTEGER,
            tn_farm_mechanization_aware INTEGER,
            
            -- Other Details (Custom entries)
            other_education TEXT,
            other_crops TEXT,
            other_soil_type TEXT,
            other_irrigation_source TEXT,
            other_water_availability TEXT,
            other_yield_history TEXT,
            other_savings_habit TEXT,
            other_risk_level TEXT,
            other_agro_climatic_zone TEXT,
            other_farmer_category TEXT,
            other_market_type TEXT,
            other_gender TEXT,
            other_land_ownership TEXT,
            
            -- ML Results
            adoption_score REAL,
            adoption_category TEXT,
            segmentation_cluster TEXT,

            -- Extended Financial & Risk Behaviour
            loan_source TEXT,
            repay_on_time INTEGER,
            crop_loss_earlier INTEGER,
            farming_only_income INTEGER,
            other_income_sources INTEGER,
            save_after_harvest INTEGER,
            saving_location TEXT,
            invested_equipment INTEGER,
            digital_payment_usage INTEGER,
            check_market_price INTEGER,
            risk_try_new_methods INTEGER,
            risk_afraid_loss INTEGER,
            risk_follow_neighbors INTEGER,
            enrolled_pmfby INTEGER,
            
            -- Insurance Details
            insuranceEnrolled TEXT,
            insuranceScheme TEXT,
            insuranceClaim TEXT,
            insuredLandPercent TEXT,
            farmingRisk TEXT,
            
            -- Water Irrigation Module
            irrig_method TEXT,
            irrig_source TEXT,
            irrig_availability TEXT,
            irrig_frequency TEXT,
            irrig_drainage TEXT,
            irrig_land_level TEXT,
            irrig_moisture TEXT,
            irrig_crop_age INTEGER,
            irrig_system_cond TEXT,
            irrig_storage TEXT,
            irrig_timing TEXT,
            irrig_rainfall_dep TEXT,
            
            -- Other Water Irrigation Details
            other_irrig_method TEXT,
            other_irrig_source TEXT,
            other_irrig_availability TEXT,
            other_irrig_frequency TEXT,
            other_irrig_drainage TEXT,
            other_irrig_land_level TEXT,
            other_irrig_moisture TEXT,
            other_irrig_system_cond TEXT,
            other_irrig_storage TEXT,
            other_irrig_timing TEXT,
            other_irrig_rainfall_dep TEXT,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')
    
    # Get old columns
    cursor.execute('PRAGMA table_info(old_farmer_data)')
    old_columns = [row['name'] for row in cursor.fetchall()]
    
    # Get new columns
    cursor.execute('PRAGMA table_info(farmer_data)')
    new_columns = [row['name'] for row in cursor.fetchall()]
    
    # Find common columns to preserve data securely
    common_cols = [c for c in old_columns if c in new_columns]
    
    if common_cols:
        cols_str = ', '.join(common_cols)
        cursor.execute(f'''
            INSERT INTO farmer_data ({cols_str})
            SELECT {cols_str} FROM old_farmer_data
        ''')
        
    cursor.execute('DROP TABLE old_farmer_data;')
    
    conn.commit()
    conn.close()
    print("Migration of farmer_data complete.")

if __name__ == '__main__':
    migrate()
