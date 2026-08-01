from pathlib import Path


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

print("Applied Forge/NeoForge compile compatibility fixes")
