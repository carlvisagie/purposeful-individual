#!/usr/bin/env python3
"""
Generate Drizzle ORM PostgreSQL schema from production database
Enterprise-grade: Uses production as single source of truth
"""

import psycopg2
import sys

# Production database connection
DB_CONFIG = {
    "host": "dpg-d4qiaj49c44c73bdha6g-a.oregon-postgres.render.com",
    "database": "purposeful",
    "user": "purposeful_user",
    "password": "LvaCLffMdE3LZebssz5kWfCGHTUyHrmZ",
    "sslmode": "require"
}

# PostgreSQL to Drizzle type mapping
TYPE_MAP = {
    "integer": "integer",
    "bigint": "bigint",
    "smallint": "smallint",
    "serial": "serial",
    "bigserial": "bigserial",
    "character varying": "varchar",
    "varchar": "varchar",
    "text": "text",
    "boolean": "boolean",
    "timestamp without time zone": "timestamp",
    "timestamp with time zone": "timestamp",
    "date": "date",
    "time": "time",
    "json": "json",
    "jsonb": "jsonb",
    "uuid": "uuid",
    "real": "real",
    "double precision": "doublePrecision",
    "numeric": "numeric",
    "decimal": "numeric",
}

def snake_to_camel(snake_str):
    """Convert snake_case to camelCase"""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def get_drizzle_type(pg_type, char_max_length):
    """Map PostgreSQL type to Drizzle type"""
    base_type = TYPE_MAP.get(pg_type, "text")
    
    if base_type == "varchar" and char_max_length:
        return f'varchar("{{}}", {{{{ length: {int(char_max_length)} }}}})'  
    elif base_type in ["integer", "bigint", "smallint", "serial", "bigserial"]:
        return f'{base_type}("{{}}")'
    elif base_type == "timestamp":
        return f'timestamp("{{}}")'
    else:
        return f'{base_type}("{{}}")'

def generate_schema():
    """Generate Drizzle schema from production database"""
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Get all tables
        cur.execute("""
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        """)
        
        all_tables = [row[0] for row in cur.fetchall()]
        
        # Filter out camelCase duplicates - keep only snake_case versions
        tables = []
        seen_camel = set()
        for table in all_tables:
            camel_name = snake_to_camel(table)
            if camel_name not in seen_camel:
                # Prefer snake_case tables
                if '_' in table:
                    tables.append(table)
                    seen_camel.add(camel_name)
                elif camel_name not in [snake_to_camel(t) for t in all_tables if '_' in t]:
                    # Only add camelCase if no snake_case equivalent exists
                    tables.append(table)
                    seen_camel.add(camel_name)
        
        print(f"Found {len(all_tables)} tables, using {len(tables)} after deduplication", file=sys.stderr)
        
        # Generate schema file
        output = []
        output.append('import { pgTable, serial, integer, bigint, varchar, text, boolean, timestamp, json, jsonb, uuid, real, doublePrecision, numeric, date, time, bigserial, smallint } from "drizzle-orm/pg-core";')
        output.append('')
        
        for table_name in tables:
            # Get columns for this table
            cur.execute("""
                SELECT 
                    column_name,
                    data_type,
                    character_maximum_length,
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' 
                    AND table_name = %s
                ORDER BY ordinal_position
            """, (table_name,))
            
            columns = cur.fetchall()
            
            # Generate camelCase export name
            export_name = snake_to_camel(table_name)
            
            output.append(f'export const {export_name} = pgTable("{table_name}", {{')
            
            for col_name, data_type, char_max_len, is_nullable, col_default in columns:
                camel_col = snake_to_camel(col_name)
                drizzle_type = get_drizzle_type(data_type, char_max_len)
                
                # Build column definition
                col_def = f'  {camel_col}: {drizzle_type.format(col_name)}'
                
                # Add primary key
                if col_default and 'nextval' in str(col_default):
                    col_def += '.primaryKey()'
                
                # Add default
                if col_default and 'now()' in str(col_default):
                    col_def += '.defaultNow()'
                elif col_default and 'nextval' not in str(col_default):
                    # Handle other defaults
                    try:
                        if 'true' in str(col_default):
                            col_def += '.default(true)'
                        elif 'false' in str(col_default):
                            col_def += '.default(false)'
                        elif data_type in ['integer', 'bigint', 'smallint']:
                            default_val = str(col_default).split('::')[0].strip("'")
                            col_def += f'.default({default_val})'
                    except:
                        pass
                
                # Add not null
                if is_nullable == 'NO':
                    col_def += '.notNull()'
                
                col_def += ','
                output.append(col_def)
            
            output.append('});')
            output.append('')
        
        # Write to file
        schema_content = '\n'.join(output)
        with open('drizzle/schema-postgresql.ts', 'w') as f:
            f.write(schema_content)
        
        print(f"✅ Generated schema with {len(tables)} tables", file=sys.stderr)
        print(f"📝 Written to drizzle/schema-postgresql.ts", file=sys.stderr)
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    generate_schema()
