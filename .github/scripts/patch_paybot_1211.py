from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def replace_checked(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"Missing expected source block: {label}")
    return text.replace(old, new)


# Build target and metadata
p = Path("gradle.properties")
s = read(str(p))
for old, new in {
    "mod_version = 5.4.3": "mod_version = 5.5.0-mc1.21.1-fullpatch",
    "minecraft_version = 1.20.1": "minecraft_version = 1.21.1",
    "architectury_version = 9.2.14": "architectury_version = 13.0.11",
    "fabric_version = 0.92.2+1.20.1": "fabric_version = 0.116.15+1.21.1",
    "fabric_loader_version = 0.15.11": "fabric_loader_version = 0.18.4",
    "enabled_platforms = fabric,forge": "enabled_platforms = fabric",
}.items():
    s = replace_checked(s, old, new, old)
write(str(p), s)

p = Path("settings.gradle")
s = read(str(p)).replace("include('forge')\n", "").replace("include('plugin')\n", "")
write(str(p), s)

p = Path("build.gradle")
s = read(str(p)).replace("options.release = 17", "options.release = 21")
write(str(p), s)

p = Path("fabric/build.gradle")
s = read(str(p))
s = replace_checked(
    s,
    'modImplementation include("dev.architectury:architectury-fabric:${rootProject.architectury_version}")',
    'modImplementation "dev.architectury:architectury-fabric:${rootProject.architectury_version}"',
    "external Architectury dependency",
)
write(str(p), s)

p = Path("fabric/src/main/resources/fabric.mod.json")
s = read(str(p))
s = replace_checked(
    s,
    '"fabricloader": ">=0.15.11",\n    "minecraft": ">=1.14.4"',
    '"fabricloader": ">=0.18.4",\n    "minecraft": "~1.21.1",\n    "architectury": ">=13.0.11",\n    "fabric-api": ">=0.116.15"',
    "Fabric dependency metadata",
)
write(str(p), s)


# ItemStack custom NBT -> Data Components (1.21.1)
p = Path("common/src/main/java/com/naptien/PayBotMod.java")
s = read(str(p))
s = replace_checked(
    s,
    """            if (!stack.hasTag()) continue;
            net.minecraft.nbt.CompoundTag nbt = stack.getTag();
            if (nbt != null && nbt.contains(\"paybot_invoice_id\")) {""",
    """            net.minecraft.world.item.component.CustomData customData =
                    stack.get(net.minecraft.core.component.DataComponents.CUSTOM_DATA);
            if (customData == null || customData.isEmpty()) continue;
            net.minecraft.nbt.CompoundTag nbt = customData.copyTag();
            if (nbt.contains(\"paybot_invoice_id\")) {""",
    "PayBot join QR cleanup custom data",
)
write(str(p), s)


# ResourceLocation constructors became factories in 1.21
p = Path("common/src/main/java/com/naptien/compat/McVersionHelper.java")
s = read(str(p))
s = replace_checked(
    s,
    "return new ResourceLocation(namespace, path);",
    "return ResourceLocation.fromNamespaceAndPath(namespace, path);",
    "ResourceLocation factory",
)
write(str(p), s)


# GUI item names/lore -> Data Components
p = Path("common/src/main/java/com/naptien/compat/VanillaGuiBackend.java")
s = read(str(p))
s = s.replace("import net.minecraft.nbt.CompoundTag;\n", "")
s = s.replace("import net.minecraft.nbt.ListTag;\n", "")
s = s.replace("import net.minecraft.nbt.StringTag;\n", "")
s = s.replace(
    "import net.minecraft.world.item.Items;\n",
    "import net.minecraft.world.item.Items;\nimport net.minecraft.core.component.DataComponents;\nimport net.minecraft.world.item.component.ItemLore;\n",
)
s = replace_checked(
    s,
    """        ItemStack stack = item.copy();
        CompoundTag tag = stack.getOrCreateTag();
        CompoundTag displayTag = new CompoundTag();

        if (name != null && !name.isEmpty()) {
            displayTag.putString(\"Name\", Component.Serializer.toJson(Component.literal(name)));
        }

        if (lore != null && !lore.isEmpty()) {
            ListTag loreTag = new ListTag();
            for (String line : lore) {
                loreTag.add(StringTag.valueOf(Component.Serializer.toJson(Component.literal(line))));
            }
            displayTag.put(\"Lore\", loreTag);
        }

        tag.put(\"display\", displayTag);""",
    """        ItemStack stack = item.copy();

        if (name != null && !name.isEmpty()) {
            stack.set(DataComponents.CUSTOM_NAME, Component.literal(name));
        }

        if (lore != null && !lore.isEmpty()) {
            stack.set(DataComponents.LORE,
                    new ItemLore(lore.stream().map(Component::literal).toList()));
        }""",
    "Vanilla GUI item components",
)
s = replace_checked(
    s,
    """        ItemStack glass = new ItemStack(Items.GRAY_STAINED_GLASS_PANE);
        CompoundTag tag = glass.getOrCreateTag();
        CompoundTag displayTag = new CompoundTag();
        displayTag.putString(\"Name\", Component.Serializer.toJson(Component.literal(\" \")));
        tag.put(\"display\", displayTag);""",
    """        ItemStack glass = new ItemStack(Items.GRAY_STAINED_GLASS_PANE);
        glass.set(DataComponents.CUSTOM_NAME, Component.literal(\" \"));""",
    "Vanilla GUI filler component",
)
write(str(p), s)


# QR map IDs, custom data, names and lore -> 1.21.1 Data Components
p = Path("common/src/main/java/com/naptien/managers/QRMapManager.java")
s = read(str(p))
s = s.replace("import net.minecraft.nbt.ListTag;\n", "")
s = s.replace("import net.minecraft.nbt.StringTag;\n", "")
s = s.replace(
    "import net.minecraft.nbt.CompoundTag;\n",
    "import net.minecraft.nbt.CompoundTag;\nimport net.minecraft.core.component.DataComponents;\nimport net.minecraft.world.item.component.CustomData;\nimport net.minecraft.world.item.component.ItemLore;\nimport net.minecraft.world.level.saveddata.maps.MapId;\n",
)
s = replace_checked(
    s,
    """        Integer mapIdInt = MapItem.getMapId(mapItem);
        if (mapIdInt == null) return;

        MapItemSavedData state = MapItem.getSavedData(mapIdInt, world);""",
    """        MapId mapId = mapItem.get(DataComponents.MAP_ID);
        if (mapId == null) return;
        int mapIdInt = mapId.id();

        MapItemSavedData state = MapItem.getSavedData(mapId, world);""",
    "MapId component",
)
s = replace_checked(
    s,
    """        CompoundTag tag = mapItem.getOrCreateTag();
        tag.putString(\"paybot_invoice_id\", invoiceId);

        ListTag loreTag = new ListTag();
        loreTag.add(StringTag.valueOf(Component.Serializer.toJson(Component.literal(\"§7Ngân hàng  : §f\" + (bankName.isEmpty() ? \"?\" : bankName)))));
        loreTag.add(StringTag.valueOf(Component.Serializer.toJson(Component.literal(\"§7Số TK      : §e\" + (bankAcct.isEmpty() ? \"?\" : bankAcct)))));
        loreTag.add(StringTag.valueOf(Component.Serializer.toJson(Component.literal(\"§7Tên TK     : §f\" + (acctName.isEmpty() ? \"?\" : acctName)))));
        loreTag.add(StringTag.valueOf(Component.Serializer.toJson(Component.literal(\"§7Số tiền    : §a\" + PayBotMod.formatVnd(amount) + \" VND\"))));
        loreTag.add(StringTag.valueOf(Component.Serializer.toJson(Component.literal(\"§7Nội dung CK: §e§l\" + invoiceId))));
        loreTag.add(StringTag.valueOf(Component.Serializer.toJson(Component.literal(\"§c§oQR tự xóa sau 30 phút.\"))));

        CompoundTag displayTag = new CompoundTag();
        displayTag.put(\"Lore\", loreTag);
        displayTag.putString(\"Name\", Component.Serializer.toJson(Component.literal(\"§6✦ §aQR Nạp §e\" + PayBotMod.formatVnd(amount) + \" VND §6✦\")));
        tag.put(\"display\", displayTag);""",
    """        CustomData.update(DataComponents.CUSTOM_DATA, mapItem,
                tag -> tag.putString(\"paybot_invoice_id\", invoiceId));

        List<Component> itemLore = List.of(
                Component.literal(\"§7Ngân hàng  : §f\" + (bankName.isEmpty() ? \"?\" : bankName)),
                Component.literal(\"§7Số TK      : §e\" + (bankAcct.isEmpty() ? \"?\" : bankAcct)),
                Component.literal(\"§7Tên TK     : §f\" + (acctName.isEmpty() ? \"?\" : acctName)),
                Component.literal(\"§7Số tiền    : §a\" + PayBotMod.formatVnd(amount) + \" VND\"),
                Component.literal(\"§7Nội dung CK: §e§l\" + invoiceId),
                Component.literal(\"§c§oQR tự xóa sau 30 phút.\")
        );
        mapItem.set(DataComponents.LORE, new ItemLore(itemLore));
        mapItem.set(DataComponents.CUSTOM_NAME,
                Component.literal(\"§6✦ §aQR Nạp §e\" + PayBotMod.formatVnd(amount) + \" VND §6✦\"));""",
    "QR map item metadata components",
)
s = replace_checked(
    s,
    """            if (stack.getItem() == Items.FILLED_MAP && stack.hasTag()) {
                CompoundTag tag = stack.getTag();
                if (tag != null && invoiceId.equals(tag.getString(\"paybot_invoice_id\"))) {""",
    """            if (stack.getItem() == Items.FILLED_MAP) {
                CustomData customData = stack.get(DataComponents.CUSTOM_DATA);
                CompoundTag tag = customData == null ? null : customData.copyTag();
                if (tag != null && invoiceId.equals(tag.getString(\"paybot_invoice_id\"))) {""",
    "QR map expiry custom data",
)
write(str(p), s)


# Fireworks NBT -> FIREWORKS data component
p = Path("common/src/main/java/com/naptien/managers/RewardEffectManager.java")
s = read(str(p))
s = s.replace("import net.minecraft.nbt.CompoundTag;\n", "")
s = s.replace("import net.minecraft.nbt.ListTag;\n", "")
s = s.replace(
    "import net.minecraft.world.entity.projectile.FireworkRocketEntity;\n",
    "import net.minecraft.world.entity.projectile.FireworkRocketEntity;\n"
    "import net.minecraft.core.component.DataComponents;\n"
    "import net.minecraft.world.item.component.FireworkExplosion;\n"
    "import net.minecraft.world.item.component.Fireworks;\n"
    "import it.unimi.dsi.fastutil.ints.IntArrayList;\n",
)
s = s.replace(
    "import java.util.concurrent.ThreadLocalRandom;\n",
    "import java.util.List;\nimport java.util.concurrent.ThreadLocalRandom;\n",
)
s = replace_checked(
    s,
    """        ItemStack rocket = new ItemStack(Items.FIREWORK_ROCKET);
        CompoundTag fwTag = rocket.getOrCreateTagElement(\"Fireworks\");
        fwTag.putByte(\"Flight\", (byte) (amount >= 100_000 ? 2 : 1));

        ListTag explosions = new ListTag();
        CompoundTag expTag = new CompoundTag();
        expTag.putByte(\"Type\", (byte) (amount >= 100_000 ? 1 : 4));
        expTag.putIntArray(\"Colors\", new int[]{c1, c2});
        expTag.putIntArray(\"FadeColors\", new int[]{0xFFFFFF});
        expTag.putBoolean(\"Trail\", true);
        expTag.putBoolean(\"Flicker\", amount >= 100_000);
        explosions.add(expTag);

        fwTag.put(\"Explosions\", explosions);""",
    """        ItemStack rocket = new ItemStack(Items.FIREWORK_ROCKET);
        FireworkExplosion.Shape shape = amount >= 100_000
                ? FireworkExplosion.Shape.LARGE_BALL
                : FireworkExplosion.Shape.BURST;
        FireworkExplosion explosion = new FireworkExplosion(
                shape,
                new IntArrayList(new int[]{c1, c2}),
                new IntArrayList(new int[]{0xFFFFFF}),
                true,
                amount >= 100_000
        );
        rocket.set(DataComponents.FIREWORKS,
                new Fireworks(amount >= 100_000 ? 2 : 1, List.of(explosion)));""",
    "Fireworks data component",
)
write(str(p), s)

print("Applied PayBot Fabric 1.21.1 full source patch")
