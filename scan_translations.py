import os
import re
import json

SCREENS_DIR = '/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens'
SQL_OUTPUT_FILE = '/Users/ravisvyas/Code/roundbuy-new/backend/migrations/2026-01-23-seed-mobile-translations.sql'

LANGUAGES = {
    'en': 'English',
    'hi': 'Hindi',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'sv': 'Swedish',
    'no': 'Norwegian',
    'is': 'Icelandic',
    'fi': 'Finnish',
    'pl': 'Polish',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'bg': 'Bulgarian',
    'ja': 'Japanese',
    'zh-CN': 'Chinese (Mandarin)',
    'zh-HK': 'Chinese (Cantonese)',
    'ko': 'Korean',
    'ar': 'Arabic',
    'it': 'Italian',
    'pt': 'Portuguese'
}

def scan_screens():
    # Regex to find t('key', 'default') or t("key", "default")
    key_pattern = re.compile(r"\bt\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)")
    # Also capture t('key') without default
    key_only_pattern = re.compile(r"\bt\(\s*['\"]([^'\"]+)['\"]\s*\)")
    
    screens_data = {}
    all_keys = {}
    
    for root, dirs, files in os.walk(SCREENS_DIR):
        for file in files:
            if file.endswith('Screen.js') or file.endswith('Screen.jsx'):
                path = os.path.join(root, file)
                rel_path = os.path.relpath(path, SCREENS_DIR)
                
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                matches_with_default = key_pattern.findall(content)
                matches_key_only = key_only_pattern.findall(content)
                
                screen_keys = []
                
                # Process matches with default
                for key, default_val in matches_with_default:
                    screen_keys.append(key)
                    if key not in all_keys:
                        all_keys[key] = default_val
                
                # Process matches without default (if not already found)
                for key in matches_key_only:
                    if key not in screen_keys: 
                        screen_keys.append(key)
                        if key not in all_keys:
                            all_keys[key] = key # Use key as default
                            
                screens_data[rel_path] = screen_keys
                
    return screens_data, all_keys

def get_category(key):
    if '.' in key:
        return key.split('.')[0]
    return 'common'

import time
from googletrans import Translator

def generate_sql(all_keys):
    # Export Keys to JSON for Node.js processing
    import json
    with open('extracted_keys.json', 'w', encoding='utf-8') as f:
        json.dump(all_keys, f, indent=2, sort_keys=True)
    print("Exported keys to extracted_keys.json")
    
    sql = "-- Seed keys (English only placeholders)\n"
    for key, default_text in sorted(all_keys.items()):
        category = get_category(key)
        safe_key = key.replace("'", "''")
        safe_text = default_text.replace("'", "''")
        sql += f"INSERT INTO translation_keys (key_name, category, default_text) VALUES ('{safe_key}', '{category}', '{safe_text}') ON DUPLICATE KEY UPDATE default_text = VALUES(default_text);\n"
        
    return sql

def generate_report(screens_data, all_keys):
    report = "# Translation Audit\n\n"
    report += f"Total Screens Found: {len(screens_data)}\n\n"
    
    screens_with_keys = 0
    
    for screen, keys in sorted(screens_data.items()):
        if keys:
            report += f"## {screen}\n"
            report += f"- **Keys Found**: {len(keys)}\n"
            unique_keys = sorted(list(set(keys)))
            for k in unique_keys:
                default_val = all_keys.get(k, "N/A")
                report += f"  - `{k}` -> \"{default_val}\"\n"
            report += "\n"
            screens_with_keys += 1
        else:
            report += f"## {screen}\n"
            report += "- No translation keys found.\n\n"
            
    report += "---\n\n"
    report += "## Summary\n"
    report += f"- Screens with translations: {screens_with_keys}/{len(screens_data)}\n"
    report += f"- Total unique keys used: {len(all_keys)}\n"
    
    return report

if __name__ == '__main__':
    screens_data, all_keys = scan_screens()
    
    # Generate Report
    report = generate_report(screens_data, all_keys)
    with open('MOBILE_APP_SCREENS_KEYS.md', 'w', encoding='utf-8') as f:
        f.write(report)
        
    # Generate SQL (Basic)
    sql = generate_sql(all_keys)
    with open(SQL_OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(sql)
        
    print(f"Report generated: MOBILE_APP_SCREENS_KEYS.md")
    print(f"SQL generated: {SQL_OUTPUT_FILE}")

