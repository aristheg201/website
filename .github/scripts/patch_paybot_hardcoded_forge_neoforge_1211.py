from pathlib import Path
import shutil
import textwrap


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(textwrap.dedent(text).lstrip("\n"), encoding="utf-8")


# Runs after patch_paybot_1211.py. That script changes only Minecraft 1.21.1 API
# calls. This script adds independent loader targets while preserving the old
# hardcoded messages, GUI text and denomination arrays.

p = Path("gradle.properties")
s = read(str(p))
s = s.replace(
    "mod_version = 5.5.0-mc1.21.1-fullpatch",
    "mod_version = 5.5.0-mc1.21.1-hardcoded-fix",
)
s = s.replace("enabled_platforms = fabric", "enabled_platforms = forge,neoforge")
lines: list[str] = []
neo_added = False
for line in s.splitlines():
    if line.startswith("forge_version"):
        lines.append("forge_version = 52.1.16")
        lines.append("neoforge_version = 21.1.244")
        neo_added = True
    else:
        lines.append(line)
if not neo_added:
    lines.extend(["forge_version = 52.1.16", "neoforge_version = 21.1.244"])
write(str(p), "\n".join(lines) + "\n")

write(
    "settings.gradle",
    """
    pluginManagement {
        repositories {
            maven { url = 'https://maven.architectury.dev/' }
            maven { url = 'https://maven.fabricmc.net/' }
            maven { url = 'https://maven.minecraftforge.net/' }
            maven { url = 'https://maven.neoforged.net/releases/' }
            gradlePluginPortal()
        }
    }

    rootProject.name = 'PayBot-Hardcoded-Fix'

    include('common')
    include('forge')
    include('neoforge')
    """,
)

p = Path("build.gradle")
s = read(str(p)).replace(
    "id 'com.github.johnrengelman.shadow' version '7.1.2' apply false",
    "id 'com.github.johnrengelman.shadow' version '8.1.1' apply false",
)
start = s.find("task copyToDone")
if start >= 0:
    s = s[:start].rstrip() + "\n"
write(str(p), s)

write(
    "common/build.gradle",
    """
    architectury {
        common rootProject.enabled_platforms.split(',')
    }

    dependencies {
        modApi "dev.architectury:architectury:${rootProject.architectury_version}"
        modCompileOnly "net.fabricmc:fabric-loader:${rootProject.fabric_loader_version}"

        api 'org.yaml:snakeyaml:2.2'
        api 'com.google.zxing:core:3.5.3'
        api 'com.google.zxing:javase:3.5.3'
        api 'org.nanohttpd:nanohttpd:2.3.1'
        api 'org.xerial:sqlite-jdbc:3.49.1.0'
        api 'com.mysql:mysql-connector-j:9.2.0'
        api 'com.zaxxer:HikariCP:5.1.0'
    }
    """,
)

# Forge target.
if Path("forge").exists():
    shutil.rmtree("forge")
write("forge/gradle.properties", "architectury.platform=forge\nloom.platform=forge\n")
write(
    "forge/build.gradle",
    """
    plugins {
        id 'com.github.johnrengelman.shadow' version '8.1.1'
    }

    base {
        archivesName = "PayBot-Mod-Forge-Hardcoded"
    }

    architectury {
        platformSetupLoomIde()
        forge()
    }

    configurations {
        common
        shadowCommon
        shade
        compileClasspath.extendsFrom common
        runtimeClasspath.extendsFrom common
        developmentForge.extendsFrom common
    }

    dependencies {
        forge "net.minecraftforge:forge:${rootProject.minecraft_version}-${rootProject.forge_version}"
        modImplementation include("dev.architectury:architectury-forge:${rootProject.architectury_version}")

        common(project(path: ":common", configuration: "namedElements")) { transitive = false }
        shadowCommon(project(path: ":common", configuration: "transformProductionForge")) { transitive = false }

        implementation 'org.yaml:snakeyaml:2.2'
        implementation 'com.google.zxing:core:3.5.3'
        implementation 'com.google.zxing:javase:3.5.3'
        implementation 'org.nanohttpd:nanohttpd:2.3.1'
        implementation('org.xerial:sqlite-jdbc:3.49.1.0') { transitive = false }
        implementation('com.mysql:mysql-connector-j:9.2.0') { transitive = false }
        implementation('com.zaxxer:HikariCP:5.1.0') { transitive = false }

        shade 'org.yaml:snakeyaml:2.2'
        shade 'com.google.zxing:core:3.5.3'
        shade('com.google.zxing:javase:3.5.3') { transitive = false }
        shade 'org.nanohttpd:nanohttpd:2.3.1'
        shade('org.xerial:sqlite-jdbc:3.49.1.0') { transitive = false }
        shade('com.mysql:mysql-connector-j:9.2.0') { transitive = false }
        shade('com.zaxxer:HikariCP:5.1.0') { transitive = false }
    }

    processResources {
        inputs.property "version", project.version
        filesMatching("META-INF/mods.toml") {
            expand "version": project.version
        }
    }

    shadowJar {
        exclude "architectury.common.json"
        exclude "META-INF/*.SF", "META-INF/*.RSA", "META-INF/*.DSA"
        mergeServiceFiles()
        configurations = [project.configurations.shadowCommon, project.configurations.shade]
        archiveClassifier = "dev-shadow"
    }

    remapJar {
        input.set shadowJar.archiveFile
        dependsOn shadowJar
        archiveClassifier = null
    }

    jar {
        archiveClassifier = "dev"
    }
    """,
)
write(
    "forge/src/main/java/com/naptien/forge/PayBotForgeInit.java",
    """
    package com.naptien.forge;

    import com.naptien.PayBotMod;
    import net.minecraftforge.fml.common.Mod;

    @Mod("paybot")
    public final class PayBotForgeInit {
        public PayBotForgeInit() {
            ForgeDependencyValidator.validate();
            PayBotMod.init();
        }
    }
    """,
)
write(
    "forge/src/main/java/com/naptien/forge/ForgeDependencyValidator.java",
    """
    package com.naptien.forge;

    import com.naptien.compat.DependencyChecker;

    public final class ForgeDependencyValidator {
        private ForgeDependencyValidator() {}

        public static void validate() {
            boolean hasClass = DependencyChecker.isClassPresent("dev.architectury.platform.Platform");
            if (!hasClass) {
                throw new IllegalStateException(
                    "[PayBot Forge] Missing required Architectury API 13.x dependency."
                );
            }
        }
    }
    """,
)
write(
    "forge/src/main/resources/META-INF/mods.toml",
    """
    modLoader="javafml"
    loaderVersion="[52,)"
    license="MIT"

    [[mods]]
    modId="paybot"
    version="${version}"
    displayName="PayBot"
    authors="TheRealShiroz"
    description='''PayBot hardcoded compatibility build for Minecraft 1.21.1 Forge.'''

    [[dependencies.paybot]]
    modId="forge"
    mandatory=true
    versionRange="[52.1.0,)"
    ordering="NONE"
    side="BOTH"

    [[dependencies.paybot]]
    modId="minecraft"
    mandatory=true
    versionRange="[1.21.1,1.21.2)"
    ordering="NONE"
    side="BOTH"

    [[dependencies.paybot]]
    modId="architectury"
    mandatory=true
    versionRange="[13.0.11,)"
    ordering="AFTER"
    side="BOTH"
    """,
)

# NeoForge target. Kept independent because Forge and NeoForge no longer share a
# drop-in loader artifact on Minecraft 1.21.1.
if Path("neoforge").exists():
    shutil.rmtree("neoforge")
write("neoforge/gradle.properties", "architectury.platform=neoforge\nloom.platform=neoforge\n")
write(
    "neoforge/build.gradle",
    """
    plugins {
        id 'com.github.johnrengelman.shadow' version '8.1.1'
    }

    base {
        archivesName = "PayBot-Mod-NeoForge-Hardcoded"
    }

    architectury {
        platformSetupLoomIde()
        neoForge()
    }

    configurations {
        common
        shadowCommon
        shade
        compileClasspath.extendsFrom common
        runtimeClasspath.extendsFrom common
        developmentNeoForge.extendsFrom common
    }

    dependencies {
        neoForge "net.neoforged:neoforge:${rootProject.neoforge_version}"
        modImplementation include("dev.architectury:architectury-neoforge:${rootProject.architectury_version}")

        common(project(path: ":common", configuration: "namedElements")) { transitive = false }
        shadowCommon(project(path: ":common", configuration: "transformProductionNeoForge")) { transitive = false }

        implementation 'org.yaml:snakeyaml:2.2'
        implementation 'com.google.zxing:core:3.5.3'
        implementation 'com.google.zxing:javase:3.5.3'
        implementation 'org.nanohttpd:nanohttpd:2.3.1'
        implementation('org.xerial:sqlite-jdbc:3.49.1.0') { transitive = false }
        implementation('com.mysql:mysql-connector-j:9.2.0') { transitive = false }
        implementation('com.zaxxer:HikariCP:5.1.0') { transitive = false }

        shade 'org.yaml:snakeyaml:2.2'
        shade 'com.google.zxing:core:3.5.3'
        shade('com.google.zxing:javase:3.5.3') { transitive = false }
        shade 'org.nanohttpd:nanohttpd:2.3.1'
        shade('org.xerial:sqlite-jdbc:3.49.1.0') { transitive = false }
        shade('com.mysql:mysql-connector-j:9.2.0') { transitive = false }
        shade('com.zaxxer:HikariCP:5.1.0') { transitive = false }
    }

    processResources {
        inputs.property "version", project.version
        filesMatching("META-INF/neoforge.mods.toml") {
            expand "version": project.version
        }
    }

    shadowJar {
        exclude "architectury.common.json"
        exclude "META-INF/*.SF", "META-INF/*.RSA", "META-INF/*.DSA"
        mergeServiceFiles()
        configurations = [project.configurations.shadowCommon, project.configurations.shade]
        archiveClassifier = "dev-shadow"
    }

    remapJar {
        input.set shadowJar.archiveFile
        dependsOn shadowJar
        archiveClassifier = null
    }

    jar {
        archiveClassifier = "dev"
    }
    """,
)
write(
    "neoforge/src/main/java/com/naptien/neoforge/PayBotNeoForgeInit.java",
    """
    package com.naptien.neoforge;

    import com.naptien.PayBotMod;
    import net.neoforged.fml.common.Mod;

    @Mod("paybot")
    public final class PayBotNeoForgeInit {
        public PayBotNeoForgeInit() {
            NeoForgeDependencyValidator.validate();
            PayBotMod.init();
        }
    }
    """,
)
write(
    "neoforge/src/main/java/com/naptien/neoforge/NeoForgeDependencyValidator.java",
    """
    package com.naptien.neoforge;

    import com.naptien.compat.DependencyChecker;

    public final class NeoForgeDependencyValidator {
        private NeoForgeDependencyValidator() {}

        public static void validate() {
            boolean hasClass = DependencyChecker.isClassPresent("dev.architectury.platform.Platform");
            if (!hasClass) {
                throw new IllegalStateException(
                    "[PayBot NeoForge] Missing required Architectury API 13.x dependency."
                );
            }
        }
    }
    """,
)
write(
    "neoforge/src/main/resources/META-INF/neoforge.mods.toml",
    """
    modLoader="javafml"
    loaderVersion="[1,)"
    license="MIT"

    [[mods]]
    modId="paybot"
    version="${version}"
    displayName="PayBot"
    authors="TheRealShiroz"
    description='''PayBot hardcoded compatibility build for Minecraft 1.21.1 NeoForge.'''

    [[dependencies.paybot]]
    modId="neoforge"
    type="required"
    versionRange="[21.1.0,)"
    ordering="NONE"
    side="BOTH"

    [[dependencies.paybot]]
    modId="minecraft"
    type="required"
    versionRange="[1.21.1,1.21.2)"
    ordering="NONE"
    side="BOTH"

    [[dependencies.paybot]]
    modId="architectury"
    type="required"
    versionRange="[13.0.11,)"
    ordering="AFTER"
    side="BOTH"
    """,
)

p = Path("common/src/main/java/com/naptien/PayBotMod.java")
s = read(str(p)).replace(
    "5.5.0-mc1.21.1-fullpatch",
    "5.5.0-mc1.21.1-hardcoded-fix",
)
s = s.replace("PayBot Fabric v", "PayBot v")
write(str(p), s)

# Request constraints: no messages.yml and no dynamic denomination system.
if Path("common/src/main/resources/messages.yml").exists():
    raise SystemExit("messages.yml must not exist in the hardcoded build")
gui = read("common/src/main/java/com/naptien/gui/GuiUtil.java")
if "DENOMS" not in gui or "10000" not in gui or "1000000" not in gui:
    raise SystemExit("Hardcoded denomination array was not preserved")

print("Prepared independent Forge and NeoForge 1.21.1 hardcoded-fix projects")
