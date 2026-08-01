from pathlib import Path
import re, shutil, textwrap


def read(p): return Path(p).read_text(encoding='utf-8')
def write(p, s):
    q=Path(p); q.parent.mkdir(parents=True, exist_ok=True); q.write_text(textwrap.dedent(s).lstrip('\n'), encoding='utf-8')

def must_sub(pattern, repl, s, label, flags=0):
    out,n=re.subn(pattern,repl,s,count=1,flags=flags)
    if n!=1: raise SystemExit(f'{label}: expected 1 replacement, got {n}')
    return out

p=Path('gradle.properties'); s=read(p)
s=s.replace('mod_version = 5.5.0-mc1.21.1-fullpatch','mod_version = 5.5.0-mc1.21.1-hardcoded-fix')
s=s.replace('enabled_platforms = fabric','enabled_platforms = forge,neoforge')
lines=[]; added=False
for line in s.splitlines():
    if line.startswith('forge_version'):
        lines += ['forge_version = 52.1.16','neoforge_version = 21.1.244']; added=True
    else: lines.append(line)
if not added: lines += ['forge_version = 52.1.16','neoforge_version = 21.1.244']
write(p,'\n'.join(lines)+'\n')

write('settings.gradle', '''
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
include('common', 'forge', 'neoforge')
''')

p=Path('build.gradle'); s=read(p)
s=s.replace("id 'com.github.johnrengelman.shadow' version '7.1.2' apply false", "id 'com.github.johnrengelman.shadow' version '8.1.1' apply false")
idx=s.find('task copyToDone')
if idx>=0: s=s[:idx].rstrip()+'\n'
write(p,s)

write('common/build.gradle', '''
architectury {
    common rootProject.enabled_platforms.split(',')
}

dependencies {
    modCompileOnly "net.fabricmc:fabric-loader:${rootProject.fabric_loader_version}"
    api 'org.yaml:snakeyaml:2.2'
    api 'com.google.zxing:core:3.5.3'
    api 'com.google.zxing:javase:3.5.3'
    api 'org.nanohttpd:nanohttpd:2.3.1'
    api 'org.xerial:sqlite-jdbc:3.49.1.0'
    api 'com.mysql:mysql-connector-j:9.2.0'
    api 'com.zaxxer:HikariCP:5.1.0'
}
''')

write('common/src/main/java/com/naptien/compat/PayBotPlatform.java', '''
package com.naptien.compat;

import java.nio.file.Path;
import java.util.Objects;

public final class PayBotPlatform {
    private static Path gameFolder;
    private static Path configFolder;
    private static String loaderName = "Unknown";
    private static String modVersion = "5.5.0-mc1.21.1-hardcoded-fix";
    private PayBotPlatform() {}
    public static synchronized void configure(Path game, Path config, String loader, String version) {
        gameFolder = Objects.requireNonNull(game).toAbsolutePath().normalize();
        configFolder = Objects.requireNonNull(config).toAbsolutePath().normalize();
        loaderName = Objects.requireNonNullElse(loader, "Unknown");
        modVersion = Objects.requireNonNullElse(version, "5.5.0-mc1.21.1-hardcoded-fix");
    }
    public static Path gameFolder() { ensure(); return gameFolder; }
    public static Path configFolder() { ensure(); return configFolder; }
    public static String loaderName() { return loaderName; }
    public static String modVersion() { return modVersion; }
    private static void ensure() {
        if (gameFolder == null || configFolder == null) throw new IllegalStateException("PayBot platform is not configured");
    }
}
''')

p=Path('common/src/main/java/com/naptien/PayBotMod.java'); s=read(p)
s=re.sub(r'^import dev\.architectury\..*\r?\n','',s,flags=re.M)
old_block=r'''    public static void init\(\) \{.*?(?=    /\*\* Version Minecraft server)'''
new_block='''    public static PayBotMod init(Path gameFolder, Path configFolder, String loaderName, String modVersion) {
        com.naptien.compat.PayBotPlatform.configure(gameFolder, configFolder, loaderName, modVersion);
        try {
            com.naptien.compat.LibraryDownloader.checkAndDownloadLibraries(configFolder.toFile());
        } catch (Exception ignored) {}
        INSTANCE = new PayBotMod();
        com.naptien.utils.MinecraftVersionDetector.init();
        LOGGER.info("[PayBot] Mod registered on {} — waiting for server start…", loaderName);
        return INSTANCE;
    }

    public boolean handleChat(ServerPlayer player, String text) {
        try {
            if (setupManager != null && setupManager.handleChat(player, text)) return true;
            if (ownerSessionManager != null && ownerSessionManager.handleChat(player, text)) return true;
            if (com.naptien.gui.GuiChatHandler.handle(player, text)) return true;
        } catch (Exception ignored) {}
        return false;
    }

    public static String getModVersion() {
        return com.naptien.compat.PayBotPlatform.modVersion();
    }

    public static String getLoaderVersion() {
        return com.naptien.compat.PayBotPlatform.loaderName();
    }
'''
s=must_sub(old_block,new_block,s,'PayBot init/events/version block',flags=re.S)
s=s.replace('Platform.getGameFolder()', 'com.naptien.compat.PayBotPlatform.gameFolder()')
s=s.replace('PayBot Fabric v" + getModVersion()', 'PayBot v" + getModVersion()')
s=s.replace('    private void onServerStop()', '    public void onServerStop()')
s=s.replace('    private void onPlayerJoin(ServerPlayer player)', '    public void onPlayerJoin(ServerPlayer player)')
s=s.replace('    private void onPlayerQuit(ServerPlayer player)', '    public void onPlayerQuit(ServerPlayer player)')
write(p,s)
if 'dev.architectury' in s or re.search(r'(?<!PayBot)Platform\.', s): raise SystemExit('Architectury reference remains in PayBotMod')

write('common/src/main/java/com/naptien/utils/MinecraftVersionDetector.java', '''
package com.naptien.utils;
import com.naptien.compat.PayBotPlatform;
import net.minecraft.SharedConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
public final class MinecraftVersionDetector {
    private static final Logger LOGGER = LoggerFactory.getLogger("PayBot-VersionDetector");
    private static String rawVersion = "1.21.1";
    private static int minorVersion = 21;
    private static int patchVersion = 1;
    private static boolean initialized;
    private MinecraftVersionDetector() {}
    public static synchronized void init() {
        if (initialized) return;
        initialized = true;
        try { rawVersion = SharedConstants.getCurrentVersion().getName(); } catch (Throwable ignored) {}
        parse(rawVersion);
        LOGGER.info("[PayBot] Phát hiện môi trường runtime: Minecraft {} (Loader: {})", rawVersion, PayBotPlatform.loaderName());
    }
    private static void parse(String v) {
        try {
            String[] p=v.replaceAll("[^0-9.]","").split("\\.");
            if (p.length>1) minorVersion=Integer.parseInt(p[1]);
            if (p.length>2) patchVersion=Integer.parseInt(p[2]);
        } catch (Throwable ignored) {}
    }
    public static String getRawVersion(){init();return rawVersion;}
    public static int getMinorVersion(){init();return minorVersion;}
    public static int getPatchVersion(){init();return patchVersion;}
    public static boolean isDataComponentsEra(){return true;}
    public static boolean isLegacyNbtEra(){return false;}
    public static String getLoaderName(){return PayBotPlatform.loaderName();}
}
''')

write('common/src/main/java/com/naptien/compat/McVersionHelper.java', '''
package com.naptien.compat;
import net.minecraft.SharedConstants;
import net.minecraft.resources.ResourceLocation;
public final class McVersionHelper {
    public static final String GROUP_1_20="1.20.x", GROUP_1_21="1.21.x", GROUP_26X="26.x+";
    private static final String DETECTED_VERSION=detectRawVersion();
    private McVersionHelper() {}
    public static String getMinecraftVersion(){return DETECTED_VERSION;}
    public static String getVersionGroup(){return DETECTED_VERSION.startsWith("1.20")?GROUP_1_20:DETECTED_VERSION.startsWith("1.21")?GROUP_1_21:GROUP_26X;}
    public static boolean isAtLeast(String v){return compare(DETECTED_VERSION,v)>=0;}
    public static boolean is1_20(){return GROUP_1_20.equals(getVersionGroup());}
    public static boolean is1_21(){return GROUP_1_21.equals(getVersionGroup());}
    public static ResourceLocation id(String ns,String path){return ResourceLocation.fromNamespaceAndPath(ns,path);}
    public static ResourceLocation paybot(String path){return id("paybot",path);}
    public static ResourceLocation mc(String path){return id("minecraft",path);}
    private static String detectRawVersion(){try{return SharedConstants.getCurrentVersion().getName();}catch(Throwable t){return "1.21.1";}}
    private static int compare(String a,String b){String[]x=a.split("\\."),y=b.split("\\.");for(int i=0;i<Math.max(x.length,y.length);i++){int m=i<x.length?n(x[i]):0,n=i<y.length?n(y[i]):0;if(m!=n)return Integer.compare(m,n);}return 0;}
    private static int n(String s){try{return Integer.parseInt(s.replaceAll("[^0-9]",""));}catch(Exception e){return 0;}}
}
''')
Path('common/src/main/java/com/naptien/compat/ServerStartedHandler.java').unlink(missing_ok=True)

def loader_build(kind):
    cap='Forge' if kind=='forge' else 'NeoForge'
    dep=(f'forge "net.minecraftforge:forge:${{rootProject.minecraft_version}}-${{rootProject.forge_version}}"' if kind=='forge' else f'neoForge "net.neoforged:neoforge:${{rootProject.neoforge_version}}"')
    dev='developmentForge' if kind=='forge' else 'developmentNeoForge'
    transform='transformProductionForge' if kind=='forge' else 'transformProductionNeoForge'
    setup='forge()' if kind=='forge' else 'neoForge()'
    meta='META-INF/mods.toml' if kind=='forge' else 'META-INF/neoforge.mods.toml'
    return f'''\nplugins {{ id 'com.github.johnrengelman.shadow' version '8.1.1' }}
base {{ archivesName = "PayBot-Mod-{cap}-Hardcoded" }}
architectury {{ platformSetupLoomIde(); {setup} }}
configurations {{ common; shadowCommon; shade; compileClasspath.extendsFrom common; runtimeClasspath.extendsFrom common; {dev}.extendsFrom common }}
dependencies {{
    {dep}
    common(project(path: ":common", configuration: "namedElements")) {{ transitive = false }}
    shadowCommon(project(path: ":common", configuration: "{transform}")) {{ transitive = false }}
    implementation 'org.yaml:snakeyaml:2.2'; shade 'org.yaml:snakeyaml:2.2'
    implementation 'com.google.zxing:core:3.5.3'; shade 'com.google.zxing:core:3.5.3'
    implementation 'com.google.zxing:javase:3.5.3'; shade('com.google.zxing:javase:3.5.3') {{ transitive=false }}
    implementation 'org.nanohttpd:nanohttpd:2.3.1'; shade 'org.nanohttpd:nanohttpd:2.3.1'
    implementation('org.xerial:sqlite-jdbc:3.49.1.0') {{ transitive=false }}; shade('org.xerial:sqlite-jdbc:3.49.1.0') {{ transitive=false }}
    implementation('com.mysql:mysql-connector-j:9.2.0') {{ transitive=false }}; shade('com.mysql:mysql-connector-j:9.2.0') {{ transitive=false }}
    implementation('com.zaxxer:HikariCP:5.1.0') {{ transitive=false }}; shade('com.zaxxer:HikariCP:5.1.0') {{ transitive=false }}
}}
processResources {{ inputs.property "version", project.version; filesMatching("{meta}") {{ expand "version": project.version }} }}
shadowJar {{ exclude "architectury.common.json"; exclude "META-INF/*.SF", "META-INF/*.RSA", "META-INF/*.DSA"; mergeServiceFiles(); configurations=[project.configurations.shadowCommon,project.configurations.shade]; archiveClassifier="dev-shadow" }}
remapJar {{ input.set shadowJar.archiveFile; dependsOn shadowJar; archiveClassifier=null }}
jar {{ archiveClassifier="dev" }}
'''

for d in ('forge','neoforge'):
    if Path(d).exists(): shutil.rmtree(d)
    write(f'{d}/gradle.properties',f'architectury.platform={d}\nloom.platform={d}\n')
    write(f'{d}/build.gradle',loader_build(d))

write('forge/src/main/java/com/naptien/forge/PayBotForgeInit.java', '''
package com.naptien.forge;
import com.naptien.PayBotMod;
import com.naptien.commands.CommandRegistry;
import java.nio.file.Path;
import net.minecraft.server.level.ServerPlayer;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.event.RegisterCommandsEvent;
import net.minecraftforge.event.ServerChatEvent;
import net.minecraftforge.event.entity.player.PlayerEvent;
import net.minecraftforge.event.server.ServerStartedEvent;
import net.minecraftforge.event.server.ServerStoppingEvent;
import net.minecraftforge.fml.common.Mod;
@Mod("paybot")
public final class PayBotForgeInit {
    private final PayBotMod mod;
    public PayBotForgeInit() {
        Path game=Path.of("").toAbsolutePath().normalize();
        mod=PayBotMod.init(game,game.resolve("config"),"Forge","5.5.0-mc1.21.1-hardcoded-fix");
        MinecraftForge.EVENT_BUS.addListener(this::serverStarted);
        MinecraftForge.EVENT_BUS.addListener(this::serverStopping);
        MinecraftForge.EVENT_BUS.addListener(this::registerCommands);
        MinecraftForge.EVENT_BUS.addListener(this::playerLogin);
        MinecraftForge.EVENT_BUS.addListener(this::playerLogout);
        MinecraftForge.EVENT_BUS.addListener(this::serverChat);
    }
    private void serverStarted(ServerStartedEvent e){mod.onServerStart(e.getServer());}
    private void serverStopping(ServerStoppingEvent e){mod.onServerStop();}
    private void registerCommands(RegisterCommandsEvent e){CommandRegistry.registerAll(e.getDispatcher());}
    private void playerLogin(PlayerEvent.PlayerLoggedInEvent e){if(e.getEntity() instanceof ServerPlayer p)mod.onPlayerJoin(p);}
    private void playerLogout(PlayerEvent.PlayerLoggedOutEvent e){if(e.getEntity() instanceof ServerPlayer p)mod.onPlayerQuit(p);}
    private void serverChat(ServerChatEvent e){if(mod.handleChat(e.getPlayer(),e.getRawText()))e.setCanceled(true);}
}
''')
write('forge/src/main/resources/META-INF/mods.toml', '''
modLoader="javafml"
loaderVersion="[52,)"
license="MIT"
[[mods]]
modId="paybot"
version="${version}"
displayName="PayBot"
authors="TheRealShiroz"
description="PayBot hardcoded compatibility fix for Minecraft 1.21.1 Forge."
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
''')

write('neoforge/src/main/java/com/naptien/neoforge/PayBotNeoForgeInit.java', '''
package com.naptien.neoforge;
import com.naptien.PayBotMod;
import com.naptien.commands.CommandRegistry;
import java.nio.file.Path;
import net.minecraft.server.level.ServerPlayer;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.RegisterCommandsEvent;
import net.neoforged.neoforge.event.ServerChatEvent;
import net.neoforged.neoforge.event.entity.player.PlayerEvent;
import net.neoforged.neoforge.event.server.ServerStartedEvent;
import net.neoforged.neoforge.event.server.ServerStoppingEvent;
import net.neoforged.fml.common.Mod;
@Mod("paybot")
public final class PayBotNeoForgeInit {
    private final PayBotMod mod;
    public PayBotNeoForgeInit() {
        Path game=Path.of("").toAbsolutePath().normalize();
        mod=PayBotMod.init(game,game.resolve("config"),"NeoForge","5.5.0-mc1.21.1-hardcoded-fix");
        NeoForge.EVENT_BUS.addListener(this::serverStarted);
        NeoForge.EVENT_BUS.addListener(this::serverStopping);
        NeoForge.EVENT_BUS.addListener(this::registerCommands);
        NeoForge.EVENT_BUS.addListener(this::playerLogin);
        NeoForge.EVENT_BUS.addListener(this::playerLogout);
        NeoForge.EVENT_BUS.addListener(this::serverChat);
    }
    private void serverStarted(ServerStartedEvent e){mod.onServerStart(e.getServer());}
    private void serverStopping(ServerStoppingEvent e){mod.onServerStop();}
    private void registerCommands(RegisterCommandsEvent e){CommandRegistry.registerAll(e.getDispatcher());}
    private void playerLogin(PlayerEvent.PlayerLoggedInEvent e){if(e.getEntity() instanceof ServerPlayer p)mod.onPlayerJoin(p);}
    private void playerLogout(PlayerEvent.PlayerLoggedOutEvent e){if(e.getEntity() instanceof ServerPlayer p)mod.onPlayerQuit(p);}
    private void serverChat(ServerChatEvent e){if(mod.handleChat(e.getPlayer(),e.getRawText()))e.setCanceled(true);}
}
''')
write('neoforge/src/main/resources/META-INF/neoforge.mods.toml', '''
modLoader="javafml"
loaderVersion="[1,)"
license="MIT"
[[mods]]
modId="paybot"
version="${version}"
displayName="PayBot"
authors="TheRealShiroz"
description="PayBot hardcoded compatibility fix for Minecraft 1.21.1 NeoForge."
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
''')

for root,dirs,files in __import__('os').walk('common/src/main'):
    for f in files:
        p=Path(root)/f
        if p.suffix in ('.java','.json','.yml') and 'dev.architectury' in read(p): raise SystemExit(f'Architectury remains: {p}')
if Path('common/src/main/resources/messages.yml').exists(): raise SystemExit('messages.yml must not exist')
gui=read('common/src/main/java/com/naptien/gui/GuiUtil.java')
if not all(x in gui for x in ('DENOMS','10_000','1_000_000')): raise SystemExit('hardcoded DENOMS not preserved')
print('Prepared Forge/NeoForge 1.21.1 compatibility builds without Architectury runtime')
