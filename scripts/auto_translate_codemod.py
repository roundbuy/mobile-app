import os
import re
import sys

# Configuration
TARGET_DIR = '../src/screens'
# Only modify text that matches these rules to stay safe
SAFE_PROPS = ['title', 'placeholder', 'label', 'header', 'subtext', 'buttonText']

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    modified = False
    new_keys = []

    # 1. Add Import if not present
    if "useTranslation" not in content:
        # Try to find existing context import or add new one
        if "from '../../context/" in content:
             content = re.sub(r"(import .* from '\.\./\.\./context/.*';)", 
                              r"\1\nimport { useTranslation } from '../../context/TranslationContext';", 
                              content, count=1)
        else:
             # Add after last import
             content = re.sub(r"(import .* from .*;(\nimport .* from .*)*)", 
                              r"\1\nimport { useTranslation } from '../../context/TranslationContext';", 
                              content, count=1)
        modified = True

    # 2. Add Hook if not present
    # Look for component definition: const Func = (...) => {
    component_pattern = r"(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{)"
    if "useTranslation()" not in content:
        match = re.search(component_pattern, content)
        if match:
            # Check if we already have t defined?
            if "const { t }" not in content:
                content = content.replace(match.group(1), f"{match.group(1)}\n    const {{ t }} = useTranslation();")
                modified = True

    # 3. Replace JSX Text: <Text>Something</Text> -> <Text>{t('Something')}</Text>
    # Regex explanation:
    # <Text[^>]*> : Match opening Text tag with props
    # \s* : Optional whitespace
    # ([^<{]+) : Capture group 1 - the text content (no < or { allowed to avoid nested components or expressions)
    # \s* : Optional whitespace
    # </Text> : Closing tag
    
    def jsx_replacer(match):
        full_match = match.group(0)
        text_content = match.group(2).strip()
        
        # skip empty or purely numeric/symbol
        if not text_content or not re.search('[a-zA-Z]', text_content):
            return full_match
            
        # Record key
        new_keys.append(text_content)
        
        # Reconstruct
        # match.group(1) is opening tag
        # match.group(3) is closing tag
        return f"{match.group(1)}{{t('{text_content}')}}{match.group(3)}"

    # Identify Text/Button/Label components that contain text
    # We use a non-greedy matcher for the tag attributes
    content = re.sub(r"(<(?:Text|Title|Label|P|H1|H2|H3)[^>]*>)(\s*[^<{]+?\s*)(</(?:Text|Title|Label|P|H1|H2|H3)>)", jsx_replacer, content)

    # 4. Replace Props: placeholder="Something" -> placeholder={t('Something')}
    def prop_replacer(match):
        prop_name = match.group(1)
        prop_value = match.group(2)
        
        if not prop_value or not re.search('[a-zA-Z]', prop_value):
            return match.group(0)
            
        new_keys.append(prop_value)
        return f"{prop_name}={{t('{prop_value}')}}"

    for prop in SAFE_PROPS:
        # match prop="value"
        content = re.sub(f"({prop})=['\"]([^'\"]+)['\"]", prop_replacer, content)

    # 5. Replace Alert.alert()
    # Alert.alert('Title', 'Message') -> Alert.alert(t('Title'), t('Message'))
    def alert_replacer(match):
        args = match.group(1) # 'Title', 'Message', buttons...
        
        # This is a bit naive regex parsing for args, but works for simple string literals
        # We split by comma but need to be careful about commas inside strings...
        # For safety/POC, let's just handle specific simple cases or skip complex ones.
        
        # Simple case: Alert.alert('Title', 'Message')
        # We search for string literals
        
        def string_replacer(m):
            val = m.group(1)
            new_keys.append(val)
            return f"t('{val}')"
            
        new_args = re.sub(r"['\"]([^'\"]+)['\"]", string_replacer, args)
        return f"Alert.alert({new_args})"

    content = re.sub(r"Alert\.alert\(([^)]+)\)", alert_replacer, content)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modified: {file_path}")
        print(f"Keys found: {new_keys}")
        return new_keys
    else:
        print(f"No changes: {file_path}")
        return []

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target = sys.argv[1]
        process_file(target)
    else:
        print("Usage: python auto_translate_codemod.py <filepath>")
