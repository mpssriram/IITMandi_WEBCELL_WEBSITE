import re

path = r'c:\python_practice\Webdev\frontend\src\lib\api.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Revert AdminProject
admin_project_pattern = r'(export type AdminProject = \{[\s\S]*?)time\?: string \| null;\n    organizer\?: string \| null;\n    max_participants\?: number \| null;\n    (featured: boolean;)'
content = re.sub(admin_project_pattern, r'\1\2', content)

# 2. Update PublicEvent
public_event_pattern = r'(export type PublicEvent = \{[\s\S]*?)(featured: boolean;)'
def add_props(match):
    if 'time?:' in match.group(0):
        return match.group(0)
    return f"{match.group(1)}time?: string | null;\n    organizer?: string | null;\n    max_participants?: number | null;\n    {match.group(2)}"

content = re.sub(public_event_pattern, add_props, content, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated api.ts")
