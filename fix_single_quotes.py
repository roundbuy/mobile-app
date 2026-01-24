import os
import re

files_to_fix = [
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/resolution-center/DisputeCategoryScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/disputes/DisputeDetailScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/support/CreateTicketScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/wallet/WalletWithdrawalScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/advertisements/AdCreationSuccessScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/dispute-flow/DisputeFormScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/dispute-flow/ReviewEligibility2Screen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/dispute-flow/ReviewEligibility1Screen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/dispute-flow/UploadEvidenceScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/user-account/privacy-account/PrivacyEmailVerificationScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/user-account/personal-information/PersonalInformationScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/my-support/AppealStatusScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/my-support/DeletedAdsScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/my-support/CreateTicketScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/my-support/SupportTicketListScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/issues/CreateIssueScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/issues/IssueDetailScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/issues/IssueDisputeBuyerReasonsScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/issues/IssueDisputeSellerReasonsScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/issues/IssueDisputeFormScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/issues/IssueDisputeEligibilityScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/notifications/NotificationCenterScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/pickups/PickUpPaymentScreen.js",
    "/Users/ravisvyas/Code/roundbuy-new/mobile-app/src/screens/pickups/UnpaidPickUpFeesScreen.js"
]

def fix_line(line):
    # Regex to find t('... <something with '> ...')
    # We look for t(' then capture until ') but only if it contains ' inside.
    # Actually, a broken line usually has t('... ' ...) then the closing ' comes later or never properly closed for parser.
    # The grep only showed lines with: t('... ' ...)
    
    # We want to replace t('...') to t("...") if ' is inside.
    # Pattern: t\(' (content) '\)
    # But content contains '.
    
    # Simple strategy: find `t('` start, find the next `')` or `')}` or `')` which might be closing.
    # But because of the syntax error, the parser usually fails on the middle quote.
    # However, for a regex on the string content:
    # We can assume the calls are single line for now as per grep output.
    
    matches = re.finditer(r"t\('([^)]+)'\)", line)
    new_line = line
    
    # This regex `t\('([^\)]+)'\)` is greedy inside but specific to `t(...)`.
    # It might fail if the string has `)` inside. `t('text with )')` -> works.
    
    # Better: Identify `t('` indices.
    
    pattern = re.compile(r"t\('((?:[^']|'[^,)]+)+)'\)")
    # This tries to match `t('` start, then (anything not quote OR quote followed by not-comma-paragraph-end) end with `')`
    
    # Let's try a simpler approach since we know we want to swap outer quotes to double if inner has single.
    
    def replacement(m):
        content = m.group(1)
        if "'" in content:
            # Escape existing double quotes
            content = content.replace('"', '\\"')
            return f't("{content}")'
        return m.group(0)

    # Regex: Match t('...') where ... can contain anything except the closing quote sequence that denotes end.
    # But wait, `t(' don't ')` -> the regex engine sees `t(' don'` and stops?
    # No, we want to match the whole `t(...)`.
    # Actually, the syntax error implies the line is `t('don't')`.
    # So we can match `t\((['"])(.*?)\1\)` but we need to handle the case where the quote is inside.
    
    # We'll validly assume that `t()` calls are generally well formed in intent, just using wrong quotes.
    # We search for `t('` and corresponding `')` or `')}` or whatever closes it.
    
    # Let's just blindly replace `t('` with `t("` and `')` with `")` IF there's an apostrophe inside?
    # No, that's dangerous.
    
    # Let's try matching `t\('` ... `'\)`
    # Since these form syntax errors, they might effectively be `t('text'text')` ?? No.
    # `t('It's raining')` -> The JS string is `'It'`, then `s raining')` follows.
    
    # So we look for `t\('` ... `'\)` where the LAST `'` is the closing one.
    # And there is a `'` in between.
    
    # Since we operate on single lines (mostly), we can find `t('` and the last `')` on the line?
    # Or just `\)` if it's the end of `t(...)`.
    
    # Robust: `t\('` followed by content, followed by `'\)`.
    # If the content contains `'`, we switch outer to `"`.
    
    # We need to be careful about multiple `t()` on the same line.
    
    return re.sub(r"t\('([^)]+)'\)", replacement, line)

# The above regex `t\('([^)]+)'\)` is naive. It captures `It's raining` from `t('It's raining')`.
# Because `[^)]+` consumes quotes.
# So `t('It's raining')` -> matches `It's raining`.
# Group 1 = "It's raining".
# `replacement` function sees single quote in "It's raining".
# Returns `t("It's raining")`.
# This seems correct for `t('It's raining')`.

# What about `t('hello')`?
# Group 1 = "hello". No single quote. Returns original.

# What about `t('hello', { param: 'val' })`?
# Regex `[^)]+` matches `'hello', { param: 'val' }`.
# Group 1 has single quotes.
# Replacement -> `t("hello', { param: 'val' }")` -> BROKEN.
# We shouldn't match arguments.
# `t('key')` usually has just one string argument in these error files (based on grep output).

# Let's refine:
# If there is a comma, we might be cautious.
# BUT, most errors are `t('text')`.
# If `t('text', ...)` exists, the first arg is the key.
# If key has apostrophe? `t('User's profile', ...)` -> error.
# So we only want to fix the string argument.

# Regex: `t\('((?:[^',]|'[^,]*')*)'(?:,|\))`
# This is getting complicated.

# Let's target lines specifically from the Grep output.
# Grep output showed simple cases like `<Text>{t('It's raining')}</Text>`.
# So `t\('([^',)]+)'\)` might only catch strings without commas.
# `t('It's raining')` -> match.
# `t('Hello', { ... })` -> `Hello', { ... }` contains comma, so `[^',)]+` fails?
# `)` terminates.

# Let's use: `r"t\('([^)]*?)'\)"` (lazy match)
# `t('It's raining')` -> matches 'It's raining'.
# `t('A'), t('B')` -> `t('A')` matches.
# `t('A', 'B')` -> matches `'A', 'B'`.
# If match contains comma, skip? Or careful?
# None of the grep outputs showed commas. They were simple text messages.

# EXCEPT: `t('handlePolicyPress('license')` in LicenseAgreement (already fixed).
# The list seems to only contain simple messages.

regex = re.compile(r"t\('([^)]*?)'\)")

updated_files = 0

for file_path in files_to_fix:
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}, not found.")
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    modified = False
    new_lines = []
    
    for line in lines:
        # Check if line has our pattern
        if "t('" in line:
            # Apply fix
            def replace_match(m):
                content = m.group(1)
                # Check for single quote inside content
                if "'" in content:
                    # Escape existing double quotes if any
                    safe_content = content.replace('"', '\\"')
                    return f't("{safe_content}")'
                return m.group(0)
            
            new_line = regex.sub(replace_match, line)
            if new_line != line:
                modified = True
                line = new_line
        new_lines.append(line)
        
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Fixed {file_path}")
        updated_files += 1
    else:
        print(f"No changes for {file_path}")

print(f"Total files updated: {updated_files}")
