import os
import re
import subprocess

def get_js_files():
    try:
        # Find all .js files in src/screens
        output = subprocess.check_output(['find', 'src/screens', '-name', '*.js'], encoding='utf-8')
        return [f for f in output.split('\n') if f.strip()]
    except Exception as e:
        print(f"Error finding files: {e}")
        return []

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex target: t('text'moretext')
    # Use 3 groups matches: start t(' , part1, part2 (after ' but before closing '), closing ')
    # constraint: part1 and part2 should not contain commas to avoid matching multiple arguments like t('key', 'val')
    # and should not contain parens to avoid function calls etc.
    # We essentially look for: t(' [no ',]* ' [no ',]* ')
    
    regex = re.compile(r"t\('([^',]*)'([^',]*)'\)")
    
    def replacer(m):
        # m.group(1) is before apostrophe
        # m.group(2) is after apostrophe
        # Reconstruct with double quotes: t("... ' ...")
        p1 = m.group(1)
        p2 = m.group(2)
        # Escape any existing double quotes in the content
        full_content = f"{p1}'{p2}".replace('"', '\\"')
        return f't("{full_content}")'

    new_content = regex.sub(replacer, content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed quote syntax in: {file_path}")
        return True
    return False

files = get_js_files()
count = 0
for file_path in files:
    if fix_file(file_path):
        count += 1

print(f"Total files fixed: {count}")
