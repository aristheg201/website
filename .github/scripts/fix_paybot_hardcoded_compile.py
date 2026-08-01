from pathlib import Path
import re


def replace_required(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"{label}: expected source expression not found in {path}")
    file.write_text(text.replace(old, new), encoding="utf-8")


# Java string literals need two backslashes to represent the regex \.
for source in (
    "common/src/main/java/com/naptien/utils/MinecraftVersionDetector.java",
    "common/src/main/java/com/naptien/compat/McVersionHelper.java",
):
    file = Path(source)
    text = file.read_text(encoding="utf-8")
    text = text.replace('split("\\.")', 'split("\\\\.")')
    file.write_text(text, encoding="utf-8")

# Component.literal returns MutableComponent; ItemLore requires List<Component>.
replace_required(
    "common/src/main/java/com/naptien/compat/VanillaGuiBackend.java",
    "new ItemLore(lore.stream().map(Component::literal).toList())",
    "new ItemLore(lore.stream().map(line -> (Component) Component.literal(line)).toList())",
    "Minecraft 1.21.1 ItemLore generic fix",
)

# Forge and NeoForge each transform a full Minecraft 1.21.1 classpath. The old
# 1 GB limit is insufficient for the NeoForge transform after Forge is prepared.
properties = Path("gradle.properties")
text = properties.read_text(encoding="utf-8")
text, count = re.subn(
    r"^org\.gradle\.jvmargs=.*$",
    "org.gradle.jvmargs=-Xmx5G -XX:MaxMetaspaceSize=1G -Dfile.encoding=UTF-8",
    text,
    count=1,
    flags=re.MULTILINE,
)
if count != 1:
    text += "\norg.gradle.jvmargs=-Xmx5G -XX:MaxMetaspaceSize=1G -Dfile.encoding=UTF-8\n"
text = re.sub(r"^org\.gradle\.workers\.max=.*$", "org.gradle.workers.max=2", text, flags=re.MULTILINE)
text = re.sub(r"^org\.gradle\.parallel=.*$", "org.gradle.parallel=false", text, flags=re.MULTILINE)
properties.write_text(text, encoding="utf-8")

print("Applied Forge/NeoForge compile and memory compatibility fixes")
